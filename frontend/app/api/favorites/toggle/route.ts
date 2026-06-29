import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const toggleSchema = z.object({
  userId: z.string(),
  productId: z.string(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = toggleSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

    const { userId, productId } = parsed.data

    const existing = await prisma.favorite.findUnique({
      where: { userId_productId: { userId, productId } },
    })

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } })
      return NextResponse.json({ favorited: false })
    }

    await prisma.favorite.create({ data: { userId, productId } })
    return NextResponse.json({ favorited: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
