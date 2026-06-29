import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const validateSchema = z.object({
  code: z.string(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = validateSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

    const { code } = parsed.data

    const promo = await prisma.promoCode.findFirst({ where: { code, isActive: true } })
    if (!promo) return NextResponse.json({ error: 'Invalid promo code' }, { status: 404 })

    return NextResponse.json({ discountPct: promo.discountPct })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
