// Supabase Edge Function: telegram-bot
// Deploy: supabase functions deploy telegram-bot --no-verify-jwt
//
// 1. Register webhook with Telegram (secret_token is REQUIRED):
//    POST https://api.telegram.org/bot<TOKEN>/setWebhook
//    Body: {
//      "url": "https://<project>.supabase.co/functions/v1/telegram-bot",
//      "secret_token": "<same value as TELEGRAM_WEBHOOK_SECRET>",
//      "allowed_updates": ["message", "callback_query"]
//    }
//
// 2. Required secrets (supabase secrets set ...):
//    TELEGRAM_BOT_TOKEN          — from @BotFather
//    ADMIN_TELEGRAM_IDS          — optional, comma-separated admin ids (defaults in _shared/telegram.ts)
//    TELEGRAM_WEBHOOK_SECRET     — random string, must match setWebhook secret_token
//    MINI_APP_URL                — deployed mini app URL

import {
  botLang,
  createServiceClient,
  escapeHtml,
  getAdminIds,
  isAdminId,
  mapLinks,
  notifyCustomerStatus,
  secretsMatch,
  sendLocation,
  sendMessage,
  shortId,
  tgCall,
} from '../_shared/telegram.ts'

interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
}

interface TelegramMessage {
  message_id: number
  from?: TelegramUser
  chat: { id: number; type: string }
  text?: string
  location?: { latitude: number; longitude: number; horizontal_accuracy?: number }
}

interface TelegramUpdate {
  update_id: number
  message?: TelegramMessage
  callback_query?: {
    id: string
    from: TelegramUser
    data?: string
    message?: TelegramMessage
  }
}

const MANAGER_PHONE = '+998 90 799 29 29'
const LOCATION_WINDOW_MS = 2 * 60 * 60 * 1000

async function handleStart(botToken: string, msg: TelegramMessage, miniAppUrl?: string) {
  const firstName = escapeHtml(msg.from?.first_name ?? 'Mehmon')
  const lang = botLang(msg.from?.language_code ?? 'uz')

  const greeting = lang === 'uz'
    ? `🍽 <b>Eski Shahar'ga xush kelibsiz!</b>

Hurmatli <b>${firstName}</b>, sizni qabul qilishdan mamnunmiz!

🏠 Bizda:
• 🍲 An'anaviy o'zbek taomlari
• 🫖 Choy va shirinliklar
• 🥗 Yangi salatlar
• 🍢 Mazali kaboblar

📍 <b>Manzil:</b> Toshkent shahri, Shayxontohur tumani, Chorsu bozori
📞 <b>Telefon:</b> ${MANAGER_PHONE}

Menyuni ko'rish va buyurtma berish uchun quyidagi tugmani bosing! 👇`
    : `🍽 <b>Добро пожаловать в Eski Shahar!</b>

Уважаемый <b>${firstName}</b>, мы рады приветствовать вас!

🏠 У нас:
• 🍲 Традиционные узбекские блюда
• 🫖 Чай и сладости
• 🥗 Свежие салаты
• 🍢 Вкусные шашлыки

📍 <b>Адрес:</b> г. Ташкент, Шайхантахурский район, рынок Чорсу
📞 <b>Телефон:</b> ${MANAGER_PHONE}

Нажмите кнопку ниже, чтобы посмотреть меню и сделать заказ! 👇`

  const inline_keyboard = [
    ...(miniAppUrl
      ? [[{ text: lang === 'uz' ? '🍽 Menyuni ochish' : '🍽 Открыть меню', web_app: { url: miniAppUrl } }]]
      : []),
    ...(miniAppUrl && isAdminId(msg.from?.id)
      ? [[{ text: lang === 'uz' ? '⚙️ Admin panel' : '⚙️ Админ-панель', web_app: { url: `${miniAppUrl}/admin` } }]]
      : []),
  ]

  await sendMessage(botToken, msg.chat.id, greeting, inline_keyboard.length ? { reply_markup: { inline_keyboard } } : undefined)
}

// deno-lint-ignore no-explicit-any
async function handleLocation(botToken: string, supabase: any, msg: TelegramMessage) {
  const from = msg.from
  const loc = msg.location
  if (!from || !loc || msg.chat.type !== 'private') return

  const since = new Date(Date.now() - LOCATION_WINDOW_MS).toISOString()
  const { data: order } = await supabase
    .from('orders')
    .select('id, lang, customer_name, customer_phone')
    .eq('telegram_user_id', from.id)
    .is('delivery_lat', null)
    .gte('location_requested_at', since)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const lang = botLang(order?.lang ?? from.language_code)

  if (!order) {
    await sendMessage(
      botToken,
      msg.chat.id,
      lang === 'uz'
        ? "🤔 Joylashuv kutilayotgan faol buyurtma topilmadi. Buyurtma berish uchun menyuni oching."
        : '🤔 Не нашли активный заказ, ожидающий геолокацию. Откройте меню, чтобы сделать заказ.',
      { reply_markup: { remove_keyboard: true } },
    )
    return
  }

  const accuracy = loc.horizontal_accuracy ?? null
  const { error } = await supabase
    .from('orders')
    .update({
      delivery_lat: loc.latitude,
      delivery_lng: loc.longitude,
      location_accuracy: accuracy,
      location_source: 'bot',
    })
    .eq('id', order.id)

  if (error) {
    console.error('[Location] Update failed:', error.message)
    await sendMessage(
      botToken,
      msg.chat.id,
      lang === 'uz' ? "⚠️ Xatolik yuz berdi, qayta urinib ko'ring." : '⚠️ Произошла ошибка, попробуйте ещё раз.',
    )
    return
  }

  await sendMessage(
    botToken,
    msg.chat.id,
    lang === 'uz'
      ? `✅ Joylashuv qabul qilindi (buyurtma #${shortId(order.id)}). Rahmat!`
      : `✅ Геолокация получена (заказ #${shortId(order.id)}). Спасибо!`,
    { reply_markup: { remove_keyboard: true } },
  )

  const who = [order.customer_name, order.customer_phone].filter(Boolean).map((s: string) => escapeHtml(s)).join(', ')
  for (const adminId of getAdminIds()) {
    try {
      const sent = await sendMessage(
        botToken,
        adminId,
        `📍 <b>#${shortId(order.id)} uchun joylashuv</b>${who ? `
👤 ${who}` : ''}
🗺 ${mapLinks(loc.latitude, loc.longitude)}`,
      )
      await sendLocation(botToken, adminId, loc.latitude, loc.longitude, {
        horizontal_accuracy: accuracy ?? undefined,
        reply_parameters: sent?.result?.message_id
          ? { message_id: sent.result.message_id, allow_sending_without_reply: true }
          : undefined,
      })
    } catch (e) {
      console.error(`[Location] Admin ${adminId} notify failed:`, e)
    }
  }
}

async function handleOrderCallback(
  botToken: string,
  // deno-lint-ignore no-explicit-any
  supabase: any,
  cb: NonNullable<TelegramUpdate['callback_query']>,
) {
  const isAdmin = isAdminId(cb.from.id)
  if (!isAdmin) {
    await tgCall(botToken, 'answerCallbackQuery', { callback_query_id: cb.id, text: '⛔' })
    return
  }

  const [action, orderId] = (cb.data ?? '').split(':')
  const newStatus = action === 'confirm_order' ? 'confirmed' : 'cancelled'

  const { data: order, error } = await supabase
    .from('orders')
    .update({ status: newStatus })
    .eq('id', orderId)
    .eq('status', 'pending')
    .select('id, telegram_user_id, lang')
    .maybeSingle()

  if (error || !order) {
    await tgCall(botToken, 'answerCallbackQuery', {
      callback_query_id: cb.id,
      text: 'Buyurtma allaqachon qayta ishlangan',
    })
  } else {
    await tgCall(botToken, 'answerCallbackQuery', {
      callback_query_id: cb.id,
      text: newStatus === 'confirmed' ? '✅ Buyurtma tasdiqlandi' : '❌ Buyurtma bekor qilindi',
    })
    if (order.telegram_user_id) {
      try {
        await notifyCustomerStatus(botToken, order.telegram_user_id, order.id, newStatus, order.lang)
      } catch (e) {
        console.error('[Callback] Customer status notify failed:', e)
      }
    }
  }

  if (cb.message) {
    await tgCall(botToken, 'editMessageReplyMarkup', {
      chat_id: cb.message.chat.id,
      message_id: cb.message.message_id,
      reply_markup: { inline_keyboard: [] },
    })
  }
}

Deno.serve(async (req) => {
  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')
  const miniAppUrl = Deno.env.get('MINI_APP_URL')
  const webhookSecret = Deno.env.get('TELEGRAM_WEBHOOK_SECRET')

  if (!botToken || !webhookSecret) {
    console.error('[TelegramBot] Missing TELEGRAM_BOT_TOKEN / TELEGRAM_WEBHOOK_SECRET')
    return new Response('Service unavailable', { status: 503 })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  // Only Telegram knows the secret token set via setWebhook
  if (!secretsMatch(req.headers.get('X-Telegram-Bot-Api-Secret-Token'), webhookSecret)) {
    return new Response('Unauthorized', { status: 401 })
  }

  let update: TelegramUpdate
  try {
    update = await req.json()
  } catch {
    return new Response('Bad request', { status: 400 })
  }

  try {
    const supabase = createServiceClient()

    if (update.message?.text?.startsWith('/start')) {
      await handleStart(botToken, update.message, miniAppUrl)
    } else if (update.message?.location) {
      await handleLocation(botToken, supabase, update.message)
    } else if (
      update.callback_query?.data?.startsWith('confirm_order:') ||
      update.callback_query?.data?.startsWith('cancel_order:')
    ) {
      await handleOrderCallback(botToken, supabase, update.callback_query)
    }
  } catch (e) {
    // Always 200 so Telegram doesn't retry the same update forever
    console.error('[TelegramBot] Handler error:', e)
  }

  return new Response('ok')
})
