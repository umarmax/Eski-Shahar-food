import { Telegraf } from 'telegraf'
import { PrismaClient, Order, OrderItem, Product, User } from '@prisma/client'

const token = process.env.TELEGRAM_BOT_TOKEN

export const bot = token ? new Telegraf(token) : null

const operatorChatId = process.env.OPERATOR_CHAT_ID

if (bot) {
  bot.start((ctx) => {
    ctx.reply(
      'Assalomu alaykum! Choyxona botiga xush kelibsiz. Quyidagi tugma orqali menyuni ochishingiz mumkin:',
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Menyuni ochish 🍽",
                web_app: { url: process.env.FRONTEND_URL || 'http://localhost:3000' }
              }
            ]
          ]
        }
      }
    )
  })

  // Start the bot gracefully
  bot.launch().catch((err) => console.error('Bot launch error:', err))

  // Enable graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'))
  process.once('SIGTERM', () => bot.stop('SIGTERM'))
} else {
  console.warn('TELEGRAM_BOT_TOKEN is not set. Bot is disabled.')
}

type FullOrder = Order & {
  items: (OrderItem & { product: Product })[]
  user: User
}

export async function notifyOperatorAndUser(order: FullOrder) {
  if (!bot) return

  // 1. Notify operator
  if (operatorChatId) {
    const itemsList = order.items
      .map((item) => `- ${item.product.nameUz} x${item.quantity} = ${item.price * item.quantity} so'm`)
      .join('\n')

    const operatorMsg = `🚨 YANGI BUYURTMA #${order.id.slice(-6)} 🚨\n\n` +
      `👤 Mijoz: ${order.user.firstName} ${order.user.lastName || ''} (@${order.user.username || 'yoq'})\n` +
      `📞 Telefon: ${order.phone || 'Kiritilmagan'}\n` +
      `📍 Manzil: ${order.address || 'Kiritilmagan'}\n` +
      (order.latitude && order.longitude ? `🗺 Geo: ${order.latitude}, ${order.longitude}\n` : '') +
      `💬 Izoh: ${order.comment || 'Yoq'}\n\n` +
      `🛒 Buyurtma:\n${itemsList}\n\n` +
      `🚚 Yetkazib berish: ${order.deliveryCost} so'm\n` +
      `💰 Jami: ${order.total} so'm\n`

    try {
      await bot.telegram.sendMessage(operatorChatId, operatorMsg)
      if (order.latitude && order.longitude) {
        await bot.telegram.sendLocation(operatorChatId, order.latitude, order.longitude)
      }
    } catch (e) {
      console.error('Failed to notify operator:', e)
    }
  }

  // 2. Notify user
  if (order.user.telegramId) {
    const userMsg = `✅ Buyurtmangiz qabul qilindi!\n\n` +
      `Buyurtma raqami: #${order.id.slice(-6)}\n` +
      `Jami summa: ${order.total} so'm\n\n` +
      `Operator tez orada siz bilan bog'lanadi.`

    try {
      await bot.telegram.sendMessage(order.user.telegramId, userMsg)
    } catch (e) {
      console.error('Failed to notify user:', e)
    }
  }
}
