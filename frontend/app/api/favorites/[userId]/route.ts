import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params
    const { searchParams } = new URL(request.url)
    const lang = searchParams.get('lang') || 'uz'

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: { product: { include: { category: true } } },
    })

    const { localizeProduct } = await import('@/lib/productLocalization')

    return NextResponse.json(favorites.map((f: { product: Record<string, unknown> }) => localizeProduct(f.product, lang)))
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
