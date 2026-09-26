// Supabase Edge Function: create-order
// Deploy: supabase functions deploy create-order
//
// Secure order creation with server-side validation:
// - prices are recalculated from the database
// - Telegram identity is taken only from signed initData, never from the body
// - admin + customer notifications are sent directly from here

import {
  botLang,
  corsHeaders,
  createServiceClient,
  jsonResponse,
  notifyAdminsNewOrder,
  sendOrderConfirmationToCustomer,
  validateTelegramInitData,
  type NotifyOrder,
  type TelegramInitUser,
} from '../_shared/telegram.ts'

interface OrderItem {
  product_id: string
  quantity: number
}

interface OrderRequest {
  items: OrderItem[]
  init_data?: string
  lang?: string
  customer_name: string
  customer_phone: string
  delivery_address?: string
  delivery_location?: { lat: number; lng: number; accuracy?: number | null }
  location_via_chat?: boolean
  comment?: string
}

const MAX_ORDERS_PER_HOUR = 5

function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '')
  return /^[\+]?[0-9]{9,15}$/.test(cleaned)
}

function isValidLocation(loc: OrderRequest['delivery_location']): loc is { lat: number; lng: number; accuracy?: number | null } {
  if (!loc) return false
  const { lat, lng, accuracy } = loc
  if (typeof lat !== 'number' || typeof lng !== 'number') return false
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return false
  if (accuracy != null && (typeof accuracy !== 'number' || accuracy < 0)) return false
  return true
}

// deno-lint-ignore no-explicit-any
async function isRateLimited(supabase: any, column: string, value: string | number): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 3600000).toISOString()
  const { count, error } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq(column, value)
    .gte('created_at', oneHourAgo)

  if (error) {
    console.error('[RateLimit] Check failed:', error)
    return false
  }
  return (count ?? 0) >= MAX_ORDERS_PER_HOUR
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  try {
    const supabase = createServiceClient()
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')

    const body: OrderRequest = await req.json()

    // ── Validate input ──
    if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 50) {
      return jsonResponse({ error: 'Items are required' }, 400)
    }
    if (!body.customer_name?.trim() || !body.customer_phone?.trim()) {
      return jsonResponse({ error: 'Name and phone are required' }, 400)
    }
    if (body.customer_name.length > 100) {
      return jsonResponse({ error: 'Name too long (max 100)' }, 400)
    }
    if (body.customer_phone.length > 20 || !validatePhone(body.customer_phone)) {
      return jsonResponse({ error: 'Invalid phone number format' }, 400)
    }
    if (body.delivery_address && body.delivery_address.length > 500) {
      return jsonResponse({ error: 'Address too long (max 500)' }, 400)
    }
    if (body.comment && body.comment.length > 1000) {
      return jsonResponse({ error: 'Comment too long (max 1000)' }, 400)
    }
    if (body.delivery_location && !isValidLocation(body.delivery_location)) {
      return jsonResponse({ error: 'Invalid location' }, 400)
    }

    // ── Telegram identity (signed initData only) ──
    let tgUser: TelegramInitUser | null = null
    if (body.init_data && botToken) {
      try {
        tgUser = await validateTelegramInitData(body.init_data, botToken)
      } catch (e) {
        console.warn('[CreateOrder] initData rejected:', String(e))
      }
    }

    const location = isValidLocation(body.delivery_location) ? body.delivery_location : null
    const address = body.delivery_address?.trim() || null
    const locationViaChat = Boolean(body.location_via_chat && tgUser && !location)

    // Location OR address is required (or a chat location request from a verified Telegram user)
    if (!location && !address && !locationViaChat) {
      return jsonResponse({ error: 'Delivery location or address is required' }, 400)
    }

    const phone = body.customer_phone.trim().replace(/[\s\-\(\)]/g, '')

    // ── Rate limit ──
    const limited = tgUser
      ? await isRateLimited(supabase, 'telegram_user_id', tgUser.id)
      : await isRateLimited(supabase, 'customer_phone', phone)
    if (limited) {
      return jsonResponse({ error: 'Too many orders. Please wait before creating another order.' }, 429)
    }

    // ── Validate items against DB prices ──
    const productIds = [...new Set(body.items.map((item) => item.product_id))]
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, name_uz, name_ru, name_en, price')
      .in('id', productIds)

    if (productsError) throw new Error(`Failed to fetch products: ${productsError.message}`)
    if (!products || products.length !== productIds.length) {
      return jsonResponse({ error: 'Some products not found' }, 400)
    }

    const productMap = new Map(products.map((p) => [p.id, p]))
    const lang = botLang(body.lang ?? tgUser?.language_code)
    let calculatedTotal = 0
    const validatedItems = []

    for (const item of body.items) {
      const product = productMap.get(item.product_id)!
      if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 100) {
        return jsonResponse({ error: 'Invalid quantity (1-100)' }, 400)
      }
      calculatedTotal += product.price * item.quantity
      validatedItems.push({
        product_id: item.product_id,
        name: (lang === 'uz' ? product.name_uz : product.name_ru) || product.name,
        quantity: item.quantity,
        price: product.price,
      })
    }

    const customerName = body.customer_name.trim()

    // ── Upsert profile (best effort) ──
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(
        {
          phone,
          first_name: customerName,
          telegram_id: tgUser?.id ?? null,
          username: tgUser?.username ?? null,
        },
        { onConflict: 'phone' },
      )
    if (profileError) console.error('[CreateOrder] Profile upsert failed:', profileError.message)

    // ── Create order (values stored raw; escaping happens at render time) ──
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: null,
        items: validatedItems,
        total: calculatedTotal,
        status: 'pending',
        telegram_user_id: tgUser?.id ?? null,
        telegram_username: tgUser?.username ?? null,
        customer_name: customerName,
        customer_phone: phone,
        delivery_address: address,
        comment: body.comment?.trim() || null,
        delivery_lat: location?.lat ?? null,
        delivery_lng: location?.lng ?? null,
        location_accuracy: location?.accuracy ?? null,
        location_source: location ? 'app' : null,
        location_requested_at: locationViaChat ? new Date().toISOString() : null,
        lang,
      })
      .select('*')
      .single()

    if (orderError) throw new Error(`Failed to create order: ${orderError.message}`)

    // ── Notifications (never fail the order) ──
    if (botToken) {
      const notifyOrder: NotifyOrder = { ...order, items: validatedItems }
      await notifyAdminsNewOrder(botToken, notifyOrder)
      try {
        await sendOrderConfirmationToCustomer(botToken, notifyOrder)
      } catch (e) {
        console.error('[CreateOrder] Customer notify failed:', e)
      }
    }

    return jsonResponse({
      order: {
        id: order.id,
        total: order.total,
        status: order.status,
        location_requested: locationViaChat,
      },
    }, 201)
  } catch (error) {
    console.error('[CreateOrder] Error:', error)
    return jsonResponse({ error: 'Failed to create order. Please try again.' }, 500)
  }
})
