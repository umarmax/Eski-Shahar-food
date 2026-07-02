// Supabase Edge Function: telegram-bot
// Deploy: supabase functions deploy telegram-bot
//
// 1. Register webhook with Telegram:
//    POST https://api.telegram.org/bot<TOKEN>/setWebhook
//    Body: { 
//      "url": "https://<project>.supabase.co/functions/v1/telegram-bot",
//      "secret_token": "your-random-secret-string"
//    }
//
// 2. Required env vars in Supabase Dashboard → Settings → Edge Functions:
//    TELEGRAM_BOT_TOKEN          — from @BotFather
//    TELEGRAM_ADMIN_CHAT_ID      — your personal Telegram chat ID (get from @userinfobot)
//    MINI_APP_URL                — your deployed mini app URL (e.g. https://choyxona.vercel.app)
//    TELEGRAM_WEBHOOK_SECRET     — random string for webhook validation (optional but recommended)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const TELEGRAM_API = 'https://api.telegram.org'

interface TelegramUpdate {
  update_id: number
  message?: TelegramMessage
  callback_query?: TelegramCallbackQuery
}

interface TelegramMessage {
  message_id: number
  from?: TelegramUser
  chat: TelegramChat
  text?: string
}

interface TelegramCallbackQuery {
  id: string
  from: TelegramUser
  data?: string
  message?: TelegramMessage
}

interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
}

interface TelegramChat {
  id: number
  type: string
}

// HTML escape to prevent XSS in Telegram messages
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

// Rate limiting for notification endpoint
const notificationRateLimit = new Map<string, number[]>()

function checkNotificationRateLimit(orderId: string): boolean {
  const now = Date.now()
  const timestamps = notificationRateLimit.get(orderId) || []
  
  // Remove timestamps older than 1 minute
  const recentTimestamps = timestamps.filter(t => now - t < 60000)
  
  // Max 3 notifications per order per minute
  if (recentTimestamps.length >= 3) {
    return false
  }
  
  recentTimestamps.push(now)
  notificationRateLimit.set(orderId, recentTimestamps)
  
  // Cleanup old entries (keep last 1000)
  if (notificationRateLimit.size > 1000) {
    const oldestKey = notificationRateLimit.keys().next().value
    notificationRateLimit.delete(oldestKey)
  }
  
  return true
}

async function sendMessage(
  botToken: string,
  chatId: number | string,
  text: string,
  extra?: Record<string, unknown>,
) {
  const res = await fetch(`${TELEGRAM_API}/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', ...extra }),
  })
  return res.json()
}

async function answerCallbackQuery(
  botToken: string,
  callbackQueryId: string,
  text?: string,
) {
  await fetch(`${TELEGRAM_API}/bot${botToken}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: callbackQueryId, text }),
  })
}

/**
 * Notify admin about a new order.
 * Called from create-order Edge Function after successful order creation
 */
async function notifyAdminNewOrder(
  botToken: string,
  adminChatId: string,
  order: {
    id: string
    total: number
    customer_name: string | null
    customer_phone: string | null
    delivery_address: string | null
    comment: string | null
    telegram_username: string | null
    items: Array<{ name: string; quantity: number; price: number }>
  },
) {
  // Sanitize all user inputs to prevent XSS
  const safeName = order.customer_name ? escapeHtml(order.customer_name) : '—'
  const safePhone = order.customer_phone ? escapeHtml(order.customer_phone) : null
  const safeAddress = order.delivery_address ? escapeHtml(order.delivery_address) : null
  const safeComment = order.comment ? escapeHtml(order.comment) : null
  const safeUsername = order.telegram_username ? escapeHtml(order.telegram_username) : null

  // Limit comment length for Telegram (max 4096 chars per message)
  const truncatedComment = safeComment && safeComment.length > 200 
    ? safeComment.slice(0, 200) + '...' 
    : safeComment

  const itemLines = order.items
    .map(
      (i) =>
        `  • ${escapeHtml(i.name)} × ${i.quantity} шт — ${(i.price * i.quantity).toLocaleString('ru')} сум`,
    )
    .join('\n')

  const text = [
    `🍽 <b>Yangi buyurtma #${order.id.slice(0, 8)}</b>`,
    '',
    `💰 <b>Jami:</b> ${order.total.toLocaleString('ru')} so'm`,
    '',
    `👤 <b>Mijoz:</b> ${safeName}`,
    safePhone ? `📞 <b>Telefon:</b> ${safePhone}` : null,
    safeAddress ? `📍 <b>Manzil:</b> ${safeAddress}` : null,
    safeUsername ? `✈️ <b>Telegram:</b> @${safeUsername}` : null,
    truncatedComment ? `💬 <b>Izoh:</b> ${truncatedComment}` : null,
    '',
    `<b>Buyurtma tarkibi:</b>`,
    itemLines,
  ]
    .filter((l) => l !== null)
    .join('\n')

  await sendMessage(botToken, adminChatId, text, {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '✅ Tasdiqlash',
            callback_data: `confirm_order:${order.id}`,
          },
          {
            text: '❌ Bekor qilish',
            callback_data: `cancel_order:${order.id}`,
          },
        ],
      ],
    },
  })
}

/**
 * Send order confirmation to customer via Telegram
 */
async function sendOrderConfirmationToCustomer(
  botToken: string,
  telegramUserId: number,
  order: {
    id: string
    total: number
    customer_name: string | null
    items: Array<{ name: string; quantity: number; price: number }>
  },
  langCode: string = 'ru',
) {
  const safeName = order.customer_name ? escapeHtml(order.customer_name) : ''
  const orderId = order.id.slice(0, 8)
  
  const itemLines = order.items
    .map(
      (i) =>
        `  • ${escapeHtml(i.name)} × ${i.quantity} — ${(i.price * i.quantity).toLocaleString('ru')} сум`,
    )
    .join('\n')

  let text: string
  let btnTrack: string

  if (langCode.startsWith('uz')) {
    text = [
      `✅ <b>Buyurtmangiz qabul qilindi!</b>`,
      '',
      `📋 <b>Buyurtma №:</b> ${orderId}`,
      safeName ? `👤 <b>Mijoz:</b> ${safeName}` : null,
      '',
      `<b>Tarkibi:</b>`,
      itemLines,
      '',
      `💰 <b>Jami:</b> ${order.total.toLocaleString('ru')} so'm`,
      '',
      `⏳ Buyurtmangiz tayyorlanmoqda. Tez orada siz bilan bog'lanamiz!`,
    ].filter(l => l !== null).join('\n')
    btnTrack = '📦 Buyurtmani kuzatish'
  } else {
    // Russian (default for all non-Uzbek users)
    text = [
      `✅ <b>Ваш заказ принят!</b>`,
      '',
      `📋 <b>Заказ №:</b> ${orderId}`,
      safeName ? `👤 <b>Клиент:</b> ${safeName}` : null,
      '',
      `<b>Состав:</b>`,
      itemLines,
      '',
      `💰 <b>Итого:</b> ${order.total.toLocaleString('ru')} сум`,
      '',
      `⏳ Ваш заказ готовится. Мы скоро свяжемся с вами!`,
    ].filter(l => l !== null).join('\n')
    btnTrack = '📦 Отследить заказ'
  }

  const miniAppUrl = Deno.env.get('MINI_APP_URL')
  
  await sendMessage(botToken, telegramUserId, text, {
    parse_mode: 'HTML',
    reply_markup: miniAppUrl ? {
      inline_keyboard: [
        [
          {
            text: btnTrack,
            web_app: { url: `${miniAppUrl}/profile` },
          },
        ],
      ],
    } : undefined,
  })
}

Deno.serve(async (req) => {
  // Validate required environment variables
  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')
  const adminChatId = Deno.env.get('TELEGRAM_ADMIN_CHAT_ID')
  const miniAppUrl = Deno.env.get('MINI_APP_URL')
  const webhookSecret = Deno.env.get('TELEGRAM_WEBHOOK_SECRET')

  if (!botToken || !adminChatId) {
    console.error('[TelegramBot] Missing required environment variables')
    return new Response('Service unavailable', { status: 503 })
  }

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const url = new URL(req.url)

  // ── Internal endpoint: POST /functions/v1/telegram-bot/notify-order ──
  if (url.pathname.endsWith('/notify-order') && req.method === 'POST') {
    try {
      const order = await req.json()

      // Validate order data
      if (!order?.id || !order?.items || !Array.isArray(order.items)) {
        return new Response(JSON.stringify({ error: 'Invalid order data' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Check rate limit
      if (!checkNotificationRateLimit(order.id)) {
        console.warn(`[NotifyOrder] Rate limit exceeded for order ${order.id}`)
        return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Notify admin
      await notifyAdminNewOrder(botToken, adminChatId, order)
      
      // Send confirmation to customer if telegram_user_id is provided
      if (order.telegram_user_id) {
        try {
          await sendOrderConfirmationToCustomer(
            botToken,
            order.telegram_user_id,
            order,
            order.lang_code || 'ru'
          )
          console.log(`[NotifyOrder] Sent confirmation to customer ${order.telegram_user_id}`)
        } catch (customerErr) {
          console.error('[NotifyOrder] Failed to notify customer:', customerErr)
          // Don't fail the whole request if customer notification fails
        }
      }
      
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } catch (err) {
      console.error('[NotifyOrder] Error:', err)
      return new Response(JSON.stringify({ error: 'Notification failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  }

  // ── Telegram webhook ──
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  void webhookSecret // suppress unused warning

  let update: TelegramUpdate
  try {
    update = await req.json()
  } catch {
    return new Response('Bad request', { status: 400 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // ── Handle /start command ──
  if (update.message?.text?.startsWith('/start')) {
    const chat = update.message.chat
    const firstName = escapeHtml(update.message.from?.first_name ?? 'Mehmon')
    const langCode = update.message.from?.language_code ?? 'uz'

    const MANAGER_USERNAME = 'eskishahar_admin'
    const MANAGER_PHONE = '+998 90 123 45 67'

    let greeting: string
    let btnMenu: string
    let btnContact: string

    if (langCode.startsWith('uz')) {
      greeting = `🍵 <b>Eski Shahar Choyxonasiga xush kelibsiz!</b> 🍵\n\nHurmatli <b>${firstName}</b>, sizni qabul qilishdan mamnunmiz!\n\n🏠 Bizning choyxonada:\n• 🍲 An'anaviy o'zbek taomlari\n• 🫖 Choy va shirinliklar\n• 🥗 Yangi salatlar\n• 🍢 Mazali kaboblar\n\n📍 <b>Manzil:</b> Toshkent, Eski Shahar ko'chasi\n📞 <b>Telefon:</b> ${MANAGER_PHONE}\n\nMenyuni ko'rish va buyurtma berish uchun quyidagi tugmani bosing! 👇`
      btnMenu = '🍽 Menyuni ochish'
      btnContact = '📞 Bog\'lanish'
    } else {
      // Russian (default for all non-Uzbek users)
      greeting = `🍵 <b>Добро пожаловать в Eski Shahar Choyxona!</b> 🍵\n\nУважаемый <b>${firstName}</b>, мы рады приветствовать вас!\n\n🏠 В нашей чайхане:\n• 🍲 Традиционные узбекские блюда\n• 🫖 Чай и сладости\n• 🥗 Свежие салаты\n• 🍢 Вкусные шашлыки\n\n📍 <b>Адрес:</b> Ташкент, улица Эски Шахар\n📞 <b>Телефон:</b> ${MANAGER_PHONE}\n\nНажмите кнопку ниже, чтобы посмотреть меню и сделать заказ! 👇`
      btnMenu = '🍽 Открыть меню'
      btnContact = '📞 Связаться'
    }

    await sendMessage(
      botToken,
      chat.id,
      greeting,
      miniAppUrl
        ? {
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: btnMenu,
                    web_app: { url: miniAppUrl },
                  },
                ],
                [
                  {
                    text: btnContact,
                    url: `https://t.me/${MANAGER_USERNAME}`,
                  },
                ],
              ],
            },
          }
        : { parse_mode: 'HTML' },
    )
    return new Response('ok')
  }

  // ── Handle admin inline button callbacks (confirm/cancel order) ──
  if (update.callback_query) {
    const { id: cbId, data } = update.callback_query

    if (data?.startsWith('confirm_order:') || data?.startsWith('cancel_order:')) {
      const [action, orderId] = data.split(':')
      const newStatus = action === 'confirm_order' ? 'confirmed' : 'cancelled'

      await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      await answerCallbackQuery(
        botToken,
        cbId,
        newStatus === 'confirmed' ? '✅ Buyurtma tasdiqlandi' : '❌ Buyurtma bekor qilindi',
      )

      // Edit the admin message to remove buttons
      if (update.callback_query.message) {
        await fetch(`${TELEGRAM_API}/bot${botToken}/editMessageReplyMarkup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: update.callback_query.message.chat.id,
            message_id: update.callback_query.message.message_id,
            reply_markup: { inline_keyboard: [] },
          }),
        })
      }
    }

    return new Response('ok')
  }

  return new Response('ok')
})
