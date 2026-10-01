// Supabase Edge Function: reviews
// Deploy: supabase functions deploy reviews
//
// Body: { action: 'list' }                                   → { reviews, average, count }
//       { action: 'create', init_data, rating, text?, order_id? } → { review }
//
// Only Telegram users (signed initData) can post. Every new review is sent to
// the admins with a "hide" button handled by telegram-bot.

import {
  corsHeaders,
  createServiceClient,
  escapeHtml,
  getAdminIds,
  jsonResponse,
  sendMessage,
  validateTelegramInitData,
} from '../_shared/telegram.ts'

const MAX_PER_DAY = 3
const PUBLIC_COLUMNS = 'id, author_name, rating, text, created_at'

function authorName(user: { first_name?: string; last_name?: string }): string {
  const first = (user.first_name ?? '').trim() || 'Mehmon'
  const lastInitial = user.last_name?.trim()?.[0]
  return lastInitial ? `${first} ${lastInitial}.` : first
}

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

    if (body.action === 'list') {
      const [{ data: reviews, error }, { data: stats }] = await Promise.all([
        supabase
          .from('reviews')
          .select(PUBLIC_COLUMNS)
          .eq('is_published', true)
          .order('created_at', { ascending: false })
          .limit(30),
        supabase.from('reviews').select('rating').eq('is_published', true).limit(5000),
      ])
      if (error) throw error
      const ratings = (stats ?? []).map((r) => r.rating as number)
      const average = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0
      return jsonResponse({ reviews: reviews ?? [], average, count: ratings.length })
    }

    if (body.action === 'create') {
      const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')
      if (!botToken) return jsonResponse({ error: 'Not configured' }, 503)

      let user
      try {
        user = await validateTelegramInitData(String(body.init_data ?? ''), botToken)
      } catch {
        return jsonResponse({ error: 'Open the app inside Telegram to leave a review' }, 401)
      }

      const rating = Number(body.rating)
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return jsonResponse({ error: 'Rating must be 1-5' }, 400)
      }
      const text = typeof body.text === 'string' ? body.text.trim().slice(0, 1000) || null : null
      const orderId = typeof body.order_id === 'string' && /^[0-9a-f-]{36}$/.test(body.order_id)
        ? body.order_id
        : null

      const dayAgo = new Date(Date.now() - 86400000).toISOString()
      const { count } = await supabase
        .from('reviews')
        .select('id', { count: 'exact', head: true })
        .eq('telegram_user_id', user.id)
        .gte('created_at', dayAgo)
      if ((count ?? 0) >= MAX_PER_DAY) {
        return jsonResponse({ error: 'Too many reviews today' }, 429)
      }

      const { data: review, error } = await supabase
        .from('reviews')
        .insert({
          telegram_user_id: user.id,
          author_name: authorName(user),
          rating,
          text,
          order_id: orderId,
        })
        .select(PUBLIC_COLUMNS)
        .single()
      if (error) throw error

      const stars = '⭐'.repeat(rating) + '☆'.repeat(5 - rating)
      const msg = [
        `📝 <b>Yangi sharh</b> ${stars}`,
        `👤 ${escapeHtml(review.author_name)}${user.username ? ` (@${escapeHtml(user.username)})` : ''}`,
        text ? `\n${escapeHtml(text)}` : null,
      ].filter(Boolean).join('\n')

      for (const adminId of getAdminIds()) {
        try {
          await sendMessage(botToken, adminId, msg, {
            reply_markup: {
              inline_keyboard: [[{ text: '🙈 Yashirish', callback_data: `hide_review:${review.id}` }]],
            },
          })
        } catch (e) {
          console.error(`[Reviews] Admin ${adminId} notify failed:`, e)
        }
      }

      return jsonResponse({ review }, 201)
    }

    return jsonResponse({ error: 'Unknown action' }, 400)
  } catch (e) {
    console.error('[Reviews] Error:', e)
    return jsonResponse({ error: 'Request failed' }, 500)
  }
})
