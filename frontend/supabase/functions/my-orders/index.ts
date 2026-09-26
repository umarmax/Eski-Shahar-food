// Supabase Edge Function: my-orders
// Deploy: supabase functions deploy my-orders
//
// Returns orders for the caller without exposing the orders table publicly:
// - Inside Telegram: { init_data } → all orders of the signed Telegram user
// - Outside Telegram: { order_id, phone } → that single order if both match

import {
  corsHeaders,
  createServiceClient,
  jsonResponse,
  validateTelegramInitData,
} from '../_shared/telegram.ts'

const ORDER_COLUMNS =
  'id, items, total, status, customer_name, delivery_address, delivery_lat, delivery_lng, created_at'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  try {
    const body = await req.json()
    const supabase = createServiceClient()

    if (body.init_data) {
      const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')
      if (!botToken) return jsonResponse({ error: 'Not configured' }, 503)

      let tgUser
      try {
        tgUser = await validateTelegramInitData(body.init_data, botToken)
      } catch {
        return jsonResponse({ error: 'Invalid initData' }, 401)
      }

      const { data, error } = await supabase
        .from('orders')
        .select(ORDER_COLUMNS)
        .eq('telegram_user_id', tgUser.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      return jsonResponse({ orders: data ?? [] })
    }

    const orderId = String(body.order_id ?? '').trim().replace(/^#|^№/, '').toLowerCase()
    const phone = String(body.phone ?? '').replace(/[\s\-\(\)]/g, '')

    if (!/^[0-9a-f]{8}([0-9a-f-]{28})?$/.test(orderId) || !/^\+?[0-9]{9,15}$/.test(phone)) {
      return jsonResponse({ error: 'Order ID and phone are required' }, 400)
    }

    // Short IDs (first 8 hex chars) are matched via a UUID range scan.
    let query = supabase.from('orders').select(`${ORDER_COLUMNS}, customer_phone`)
    if (orderId.length === 8) {
      query = query
        .gte('id', `${orderId}-0000-0000-0000-000000000000`)
        .lte('id', `${orderId}-ffff-ffff-ffff-ffffffffffff`)
    } else {
      query = query.eq('id', orderId)
    }

    const { data, error } = await query.limit(5)
    if (error) throw error

    // Compare last 9 digits so +998 / 998 / local formats all match
    const tail = phone.slice(-9)
    const orders = (data ?? [])
      .filter((o) => (o.customer_phone ?? '').replace(/\D/g, '').slice(-9) === tail)
      .map(({ customer_phone: _omit, ...rest }) => rest)

    return jsonResponse({ orders })
  } catch (error) {
    console.error('[MyOrders] Error:', error)
    return jsonResponse({ error: 'Lookup failed' }, 500)
  }
})
