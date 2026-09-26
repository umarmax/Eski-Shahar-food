// Supabase Edge Function: telegram-auth
// Deploy: supabase functions deploy telegram-auth
//
// Validates Telegram initData and upserts the user's profile.

import {
  corsHeaders,
  createServiceClient,
  jsonResponse,
  validateTelegramInitData,
} from '../_shared/telegram.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { initData } = await req.json()
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')

    if (!botToken || !initData) {
      return jsonResponse({ error: 'Missing credentials' }, 400)
    }

    let tgUser
    try {
      tgUser = await validateTelegramInitData(initData, botToken)
    } catch {
      return jsonResponse({ error: 'Invalid initData' }, 401)
    }

    const supabase = createServiceClient()
    const { data: profile, error } = await supabase
      .from('profiles')
      .upsert(
        {
          telegram_id: tgUser.id,
          first_name: tgUser.first_name ?? '',
          last_name: tgUser.last_name ?? null,
          username: tgUser.username ?? null,
          photo_url: tgUser.photo_url ?? null,
        },
        { onConflict: 'telegram_id' },
      )
      .select('id, telegram_id, first_name, last_name, username, photo_url, phone')
      .single()

    if (error) {
      console.error('[TelegramAuth] Profile upsert failed:', error.message)
      return jsonResponse({ error: 'Profile error' }, 500)
    }

    return jsonResponse({ user: profile })
  } catch (error) {
    console.error('[TelegramAuth] Error:', error)
    return jsonResponse({ error: 'Auth failed' }, 500)
  }
})
