// Shared helpers for Edge Functions: Telegram API, initData validation,
// and order notification messages.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export const TELEGRAM_API = 'https://api.telegram.org'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

export function createServiceClient() {
  const url = Deno.env.get('SUPABASE_URL')
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !key) throw new Error('Missing Supabase environment variables')
  return createClient(url, key)
}

// Escape for Telegram HTML parse_mode. Apply at render time only —
// values are stored raw in the database.
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

// Admins who manage the menu and receive order notifications.
// Override with the ADMIN_TELEGRAM_IDS secret (comma-separated).
const DEFAULT_ADMIN_IDS = ['8627067211', '6237960948']

export function getAdminIds(): string[] {
  const fromEnv = (Deno.env.get('ADMIN_TELEGRAM_IDS') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const ids = fromEnv.length > 0 ? fromEnv : DEFAULT_ADMIN_IDS
  return [...new Set(ids)]
}

export function isAdminId(id: number | string | undefined | null): boolean {
  return id != null && getAdminIds().includes(String(id))
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export function secretsMatch(provided: string | null, expected: string | undefined): boolean {
  if (!provided || !expected) return false
  return timingSafeEqual(provided, expected)
}

export interface TelegramInitUser {
  id: number
  first_name?: string
  last_name?: string
  username?: string
  language_code?: string
  photo_url?: string
}

/**
 * Validates Telegram WebApp initData (HMAC-SHA256) per
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 * Returns the signed user, throws if invalid or older than 24h.
 */
export async function validateTelegramInitData(
  initData: string,
  botToken: string,
): Promise<TelegramInitUser> {
  const params = new URLSearchParams(initData)
  const hash = params.get('hash')
  if (!hash) throw new Error('Missing hash in initData')

  const entries: string[] = []
  for (const [key, value] of params.entries()) {
    if (key !== 'hash') entries.push(`${key}=${value}`)
  }
  entries.sort()
  const dataCheckString = entries.join('\n')

  const enc = new TextEncoder()
  const secretKeyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode('WebAppData'),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const secretKey = await crypto.subtle.sign('HMAC', secretKeyMaterial, enc.encode(botToken))
  const hmacKey = await crypto.subtle.importKey(
    'raw',
    secretKey,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', hmacKey, enc.encode(dataCheckString))
  const computedHash = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  if (!timingSafeEqual(computedHash, hash)) {
    throw new Error('Invalid initData signature')
  }

  const authDate = Number(params.get('auth_date') ?? '0')
  if (Math.floor(Date.now() / 1000) - authDate > 86400) {
    throw new Error('initData expired')
  }

  const userRaw = params.get('user')
  if (!userRaw) throw new Error('No user in initData')
  const user = JSON.parse(userRaw) as TelegramInitUser
  if (!user?.id) throw new Error('Invalid user in initData')
  return user
}

// ── Telegram Bot API ──

export async function tgCall(botToken: string, method: string, body: Record<string, unknown>) {
  const res = await fetch(`${TELEGRAM_API}/bot${botToken}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!json.ok) console.error(`[Telegram] ${method} failed:`, json.description)
  return json
}

export function sendMessage(
  botToken: string,
  chatId: number | string,
  text: string,
  extra?: Record<string, unknown>,
) {
  return tgCall(botToken, 'sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    ...extra,
  })
}

export function sendLocation(
  botToken: string,
  chatId: number | string,
  lat: number,
  lng: number,
  extra?: Record<string, unknown>,
) {
  return tgCall(botToken, 'sendLocation', {
    chat_id: chatId,
    latitude: lat,
    longitude: lng,
    ...extra,
  })
}

// ── Order messages ──

export type BotLang = 'uz' | 'ru'

export function botLang(code?: string | null): BotLang {
  return code?.startsWith('uz') ? 'uz' : 'ru'
}

export interface NotifyOrder {
  id: string
  total: number
  customer_name: string | null
  customer_phone: string | null
  delivery_address: string | null
  comment: string | null
  telegram_username: string | null
  telegram_user_id: number | null
  delivery_lat: number | null
  delivery_lng: number | null
  location_accuracy: number | null
  location_requested_at: string | null
  lang: string | null
  items: Array<{ name: string; quantity: number; price: number }>
}

export function shortId(id: string) {
  return id.slice(0, 8)
}

export function mapLinks(lat: number, lng: number): string {
  const google = `https://maps.google.com/?q=${lat},${lng}`
  const yandex = `https://yandex.uz/maps/?pt=${lng},${lat}&z=17&l=map`
  return `<a href="${google}">Google</a> | <a href="${yandex}">Yandex</a>`
}

function formatSum(n: number) {
  return n.toLocaleString('ru')
}

export async function notifyAdminsNewOrder(botToken: string, order: NotifyOrder) {
  for (const adminId of getAdminIds()) {
    try {
      await notifyAdminNewOrder(botToken, adminId, order)
    } catch (e) {
      console.error(`[Notify] Admin ${adminId} failed:`, e)
    }
  }
}

async function notifyAdminNewOrder(botToken: string, adminChatId: string, order: NotifyOrder) {
  const hasCoords = order.delivery_lat != null && order.delivery_lng != null
  const comment = order.comment
    ? escapeHtml(order.comment.length > 200 ? order.comment.slice(0, 200) + '...' : order.comment)
    : null

  const itemLines = order.items
    .map((i) => `  • ${escapeHtml(i.name)} × ${i.quantity} — ${formatSum(i.price * i.quantity)} so'm`)
    .join('\n')

  let locationLine: string | null = null
  if (hasCoords) {
    const acc = order.location_accuracy ? ` (±${Math.round(order.location_accuracy)} m)` : ''
    locationLine = `🗺 <b>Joylashuv:</b> ${mapLinks(order.delivery_lat!, order.delivery_lng!)}${acc}`
  } else if (order.location_requested_at) {
    locationLine = `🗺 <b>Joylashuv:</b> <i>mijoz chatda yuboradi…</i>`
  }

  const text = [
    `🍽 <b>Yangi buyurtma #${shortId(order.id)}</b>`,
    '',
    `💰 <b>Jami:</b> ${formatSum(order.total)} so'm`,
    '',
    `👤 <b>Mijoz:</b> ${order.customer_name ? escapeHtml(order.customer_name) : '—'}`,
    order.customer_phone ? `📞 <b>Telefon:</b> ${escapeHtml(order.customer_phone)}` : null,
    order.delivery_address ? `📍 <b>Manzil:</b> ${escapeHtml(order.delivery_address)}` : null,
    locationLine,
    order.telegram_username ? `✈️ <b>Telegram:</b> @${escapeHtml(order.telegram_username)}` : null,
    comment ? `💬 <b>Izoh:</b> ${comment}` : null,
    '',
    `<b>Buyurtma tarkibi:</b>`,
    itemLines,
  ]
    .filter((l) => l !== null)
    .join('\n')

  const sent = await sendMessage(botToken, adminChatId, text, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '✅ Tasdiqlash', callback_data: `confirm_order:${order.id}` },
          { text: '❌ Bekor qilish', callback_data: `cancel_order:${order.id}` },
        ],
      ],
    },
  })

  if (hasCoords) {
    await sendLocation(botToken, adminChatId, order.delivery_lat!, order.delivery_lng!, {
      horizontal_accuracy: order.location_accuracy
        ? Math.min(1500, Math.max(0, order.location_accuracy))
        : undefined,
      reply_parameters: sent?.result?.message_id
        ? { message_id: sent.result.message_id, allow_sending_without_reply: true }
        : undefined,
    })
  }
}

export function locationRequestKeyboard(lang: BotLang) {
  return {
    keyboard: [[{
      text: lang === 'uz' ? '📍 Joylashuvni yuborish' : '📍 Отправить геолокацию',
      request_location: true,
    }]],
    resize_keyboard: true,
    one_time_keyboard: true,
    input_field_placeholder: lang === 'uz' ? 'Tugmani bosing 👇' : 'Нажмите кнопку 👇',
  }
}

export async function sendOrderConfirmationToCustomer(botToken: string, order: NotifyOrder) {
  if (!order.telegram_user_id) return
  const lang = botLang(order.lang)
  const id = shortId(order.id)
  const name = order.customer_name ? escapeHtml(order.customer_name) : ''
  const itemLines = order.items
    .map((i) => `  • ${escapeHtml(i.name)} × ${i.quantity} — ${formatSum(i.price * i.quantity)} ${lang === 'uz' ? "so'm" : 'сум'}`)
    .join('\n')

  const text = lang === 'uz'
    ? [
        `✅ <b>Buyurtmangiz qabul qilindi!</b>`,
        '',
        `📋 <b>Buyurtma №:</b> ${id}`,
        name ? `👤 <b>Mijoz:</b> ${name}` : null,
        '',
        `<b>Tarkibi:</b>`,
        itemLines,
        '',
        `💰 <b>Jami:</b> ${formatSum(order.total)} so'm`,
        '',
        `⏳ Buyurtmangiz tayyorlanmoqda. Tez orada siz bilan bog'lanamiz!`,
      ]
    : [
        `✅ <b>Ваш заказ принят!</b>`,
        '',
        `📋 <b>Заказ №:</b> ${id}`,
        name ? `👤 <b>Клиент:</b> ${name}` : null,
        '',
        `<b>Состав:</b>`,
        itemLines,
        '',
        `💰 <b>Итого:</b> ${formatSum(order.total)} сум`,
        '',
        `⏳ Ваш заказ готовится. Мы скоро свяжемся с вами!`,
      ]

  const miniAppUrl = Deno.env.get('MINI_APP_URL')
  await sendMessage(botToken, order.telegram_user_id, text.filter((l) => l !== null).join('\n'), {
    reply_markup: miniAppUrl
      ? {
          inline_keyboard: [[{
            text: lang === 'uz' ? '📦 Buyurtmani kuzatish' : '📦 Отследить заказ',
            web_app: { url: `${miniAppUrl}/profile` },
          }]],
        }
      : undefined,
  })

  // Customer chose to share location from the chat: show Telegram's
  // native "share location" keyboard button.
  const needsLocation = order.location_requested_at && order.delivery_lat == null
  if (needsLocation) {
    const prompt = lang === 'uz'
      ? `📍 <b>Yetkazib berish uchun joylashuvingizni yuboring</b>\n\nPastdagi tugmani bosing — kuryer sizni aniq topadi.`
      : `📍 <b>Отправьте геолокацию для доставки</b>\n\nНажмите кнопку ниже — курьер найдёт вас точно.`
    await sendMessage(botToken, order.telegram_user_id, prompt, {
      reply_markup: locationRequestKeyboard(lang),
    })
  }
}

const STATUS_TEXT: Record<string, Record<BotLang, string>> = {
  confirmed: {
    uz: '✅ Buyurtmangiz #{id} tasdiqlandi va tayyorlanmoqda!',
    ru: '✅ Ваш заказ #{id} подтверждён и готовится!',
  },
  cancelled: {
    uz: '❌ Buyurtmangiz #{id} bekor qilindi. Savollar bo\'lsa, biz bilan bog\'laning.',
    ru: '❌ Ваш заказ #{id} отменён. Если есть вопросы — свяжитесь с нами.',
  },
}

export async function notifyCustomerStatus(
  botToken: string,
  telegramUserId: number,
  orderId: string,
  status: string,
  langCode: string | null,
) {
  const tpl = STATUS_TEXT[status]?.[botLang(langCode)]
  if (!tpl) return
  await sendMessage(botToken, telegramUserId, tpl.replace('{id}', shortId(orderId)))
}
