import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminTelegramId, getAuthenticatedUser } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user || user.telegramId !== getAdminTelegramId()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const now = new Date()
    const startOfDay = new Date(now)
    startOfDay.setHours(0, 0, 0, 0)

    const [totalOrders, todayOrders, totalRevenue, todayRevenue, products, customers, popularItems] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.order.aggregate({ _sum: { total: true } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { createdAt: { gte: startOfDay } } }),
      prisma.product.count(),
      prisma.order.groupBy({ by: ['userId'] }).then((rows: Array<{ userId: string }>) => rows.length),
      prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
    ])

    const productIds = popularItems.map((item: { productId: string }) => item.productId)
    const productsById = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, nameUz: true, nameEn: true },
    })

    const productMap = new Map<string, { id: string; nameUz: string; nameEn: string }>(
      productsById.map((product) => [product.id, product])
    )

    return NextResponse.json({
      totalOrders,
      todayOrders,
      totalRevenue: totalRevenue._sum.total ?? 0,
      todayRevenue: todayRevenue._sum.total ?? 0,
      products,
      customers,
      popularProducts: popularItems.map((item: { productId: string; _sum: { quantity: number | null } }) => ({
        product: productMap.get(item.productId) ?? null,
        quantity: item._sum.quantity ?? 0,
      })),
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
