import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { notifyOperatorAndUser } from '@/lib/bot'

const orderSchema = z.object({
  userId: z.string(),
  items: z.array(z.object({ productId: z.string(), quantity: z.number().min(1) })),
  comment: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  promoCode: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = orderSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

    const { userId, items, comment, phone, address, latitude, longitude, promoCode } = parsed.data
    const settings = await prisma.restaurantSettings.findFirst()
    const deliveryCost = settings?.deliveryCost ?? 15000

    const productIds = items.map((i: { productId: string }) => i.productId)
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } })
    const productMap = new Map<string, { id: string; price: number; cookingTime: number }>(
      products.map((p: { id: string; price: number; cookingTime: number }) => [p.id, p])
    )

    let subtotal = 0
    let prepTime = 0
    const orderItems = items.map((item: { productId: string; quantity: number }) => {
      const product = productMap.get(item.productId) as { id: string; price: number; cookingTime: number } | undefined
      if (!product) throw new Error(`Product not found: ${item.productId}`)
      subtotal += product.price * item.quantity
      prepTime = Math.max(prepTime, product.cookingTime)
      return { productId: item.productId, quantity: item.quantity, price: product.price }
    })

    let discount = 0
    if (promoCode) {
      const promo = await prisma.promoCode.findFirst({ where: { code: promoCode, isActive: true } })
      if (promo) discount = Math.round(subtotal * (promo.discountPct / 100))
    }

    const total = subtotal + deliveryCost - discount

    // Use a transaction to ensure atomic order creation and user profile update
    const [order] = await prisma.$transaction([
      prisma.order.create({
        data: {
          userId,
          subtotal,
          deliveryCost,
          discount,
          total,
          promoCode,
          comment,
          phone,
          address,
          latitude,
          longitude,
          prepTimeMinutes: prepTime + 15,
          items: { create: orderItems },
        },
        include: { items: { include: { product: true } }, user: true },
      }),
      ...(phone ? [
        prisma.user.update({
          where: { id: userId },
          data: { phone, savedAddress: address, latitude, longitude },
        })
      ] : [])
    ])

    // Notify via Telegram bot
    await notifyOperatorAndUser(order as any)

    return NextResponse.json(order, { status: 201 })
  } catch (error: any) {
    console.error('Order creation error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: { items: { include: { product: true } }, user: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(orders)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
