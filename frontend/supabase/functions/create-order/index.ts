// Supabase Edge Function: create-order
// Deploy: supabase functions deploy create-order
//
// Secure order creation with server-side validation
// This replaces direct client-side order creation to prevent price manipulation

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

interface OrderItem {
  product_id: string
  quantity: number
}

interface OrderRequest {
  items: OrderItem[]
  telegram_user_id?: number
  telegram_username?: string
  customer_name: string
  customer_phone: string
  delivery_address?: string
  comment?: string
}

// HTML escape to prevent XSS
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

// Validate phone number format
function validatePhone(phone: string): boolean {
  // Accepts: +998901234567, 998901234567, 901234567, etc.
  const cleaned = phone.replace(/[\s\-\(\)]/g, '')
  return /^[\+]?[0-9]{9,15}$/.test(cleaned)
}

// Rate limiting: Check recent orders from same user
async function checkRateLimit(
  supabase: any,
  telegramUserId?: number,
): Promise<boolean> {
  if (!telegramUserId) return true // Allow if no telegram ID

  const oneHourAgo = new Date(Date.now() - 3600000).toISOString()

  const { data, error } = await supabase
    .from('orders')
    .select('id')
    .eq('telegram_user_id', telegramUserId)
    .gte('created_at', oneHourAgo)

  if (error) {
    console.error('[RateLimit] Check failed:', error)
    return true // Allow on error (fail open)
  }

  // Max 5 orders per hour per user
  return (data?.length ?? 0) < 5
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    // Validate environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse request
    const body: OrderRequest = await req.json()

    // Validate required fields
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return new Response(JSON.stringify({ error: 'Items are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!body.customer_name?.trim() || !body.customer_phone?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Name and phone are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // Validate input lengths
    if (body.customer_name.length > 100) {
      return new Response(JSON.stringify({ error: 'Name too long (max 100)' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (body.customer_phone.length > 20) {
      return new Response(
        JSON.stringify({ error: 'Phone too long (max 20)' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    if (body.delivery_address && body.delivery_address.length > 500) {
      return new Response(
        JSON.stringify({ error: 'Address too long (max 500)' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    if (body.comment && body.comment.length > 1000) {
      return new Response(
        JSON.stringify({ error: 'Comment too long (max 1000)' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // Validate phone format
    if (!validatePhone(body.customer_phone)) {
      return new Response(
        JSON.stringify({ error: 'Invalid phone number format' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // Check rate limit
    const rateLimitOk = await checkRateLimit(supabase, body.telegram_user_id)
    if (!rateLimitOk) {
      return new Response(
        JSON.stringify({
          error: 'Too many orders. Please wait before creating another order.',
        }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // Validate items and calculate total from database prices
    const productIds = body.items.map((item) => item.product_id)
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, name_uz, name_ru, name_en, price')
      .in('id', productIds)

    if (productsError) {
      throw new Error(`Failed to fetch products: ${productsError.message}`)
    }

    if (!products || products.length !== productIds.length) {
      return new Response(
        JSON.stringify({ error: 'Some products not found' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // Build product map
    const productMap = new Map(products.map((p) => [p.id, p]))

    // Validate each item and calculate real total
    let calculatedTotal = 0
    const validatedItems = []

    for (const item of body.items) {
      const product = productMap.get(item.product_id)
      if (!product) {
        return new Response(
          JSON.stringify({ error: `Product ${item.product_id} not found` }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        )
      }

      // Validate quantity
      if (item.quantity < 1 || item.quantity > 100) {
        return new Response(
          JSON.stringify({ error: 'Invalid quantity (1-100)' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        )
      }

      // Calculate price from database (not from client!)
      const itemTotal = product.price * item.quantity
      calculatedTotal += itemTotal

      validatedItems.push({
        product_id: item.product_id,
        name: product.name || product.name_uz || product.name_ru || product.name_en,
        quantity: item.quantity,
        price: product.price, // Use database price
      })
    }

    // Sanitize text inputs (but NOT phone - it breaks lookup)
    const sanitizedName = escapeHtml(body.customer_name.trim())
    const sanitizedPhone = body.customer_phone.trim().replace(/[\s\-\(\)]/g, '') // Normalize phone, don't escape
    const sanitizedAddress = body.delivery_address
      ? escapeHtml(body.delivery_address.trim())
      : null
    const sanitizedComment = body.comment
      ? escapeHtml(body.comment.trim())
      : null

    // Upsert profile by phone number
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(
          {
            phone: sanitizedPhone,
            first_name: sanitizedName,
            telegram_id: body.telegram_user_id ?? null,
            username: body.telegram_username ?? null,
          },
          { onConflict: 'phone' }
        )
      
      if (profileError) {
        console.error('[CreateOrder] Failed to upsert profile:', profileError)
        // Don't fail the order if profile creation fails
      }
    } catch (profileErr) {
      console.error('[CreateOrder] Profile upsert error:', profileErr)
    }

    // Create order with validated data
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: null,
        items: validatedItems,
        total: calculatedTotal, // Server-calculated total
        status: 'pending',
        telegram_user_id: body.telegram_user_id ?? null,
        telegram_username: body.telegram_username ?? null,
        customer_name: sanitizedName,
        customer_phone: sanitizedPhone,
        delivery_address: sanitizedAddress,
        comment: sanitizedComment,
      })
      .select('*')
      .single()

    if (orderError) {
      throw new Error(`Failed to create order: ${orderError.message}`)
    }

    // Notify admin via telegram-bot function
    try {
      const notifyUrl = `${supabaseUrl}/functions/v1/telegram-bot/notify-order`
      await fetch(notifyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          id: order.id,
          total: order.total,
          customer_name: order.customer_name,
          customer_phone: order.customer_phone,
          delivery_address: order.delivery_address,
          comment: order.comment,
          telegram_username: order.telegram_username,
          telegram_user_id: order.telegram_user_id ?? null,
          lang_code: 'ru',
          items: validatedItems,
        }),
      })
    } catch (notifyError) {
      console.error('[CreateOrder] Failed to notify admin:', notifyError)
      // Don't fail the order if notification fails
    }

    // Return created order
    return new Response(JSON.stringify({ order }), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('[CreateOrder] Error:', error)

    // Don't expose internal errors to client
    return new Response(
      JSON.stringify({
        error: 'Failed to create order. Please try again.',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
