import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const userUpdateSchema = z.object({
  language: z.string().optional(),
  phone: z.string().optional(),
  savedAddress: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
})

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const parsed = userUpdateSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

    const data = {
      ...(parsed.data.language ? { language: parsed.data.language as 'uz' | 'ru' | 'en' } : {}),
      ...(parsed.data.phone !== undefined ? { phone: parsed.data.phone } : {}),
      ...(parsed.data.savedAddress !== undefined ? { savedAddress: parsed.data.savedAddress } : {}),
      ...(parsed.data.latitude !== undefined ? { latitude: parsed.data.latitude } : {}),
      ...(parsed.data.longitude !== undefined ? { longitude: parsed.data.longitude } : {}),
    }

    const user = await prisma.user.update({
      where: { id },
      data,
    })

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
