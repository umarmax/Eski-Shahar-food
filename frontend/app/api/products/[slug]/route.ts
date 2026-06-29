import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const lang = searchParams.get('lang') || 'uz'

    const product = await prisma.product.findUnique({
      where: { slug },
      include: { category: true, reviews: { include: { user: true }, take: 10, orderBy: { createdAt: 'desc' } } },
    })

    if (!product) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const related = await prisma.product.findMany({
      where: { categoryId: product.categoryId, id: { not: product.id }, isAvailable: true },
      take: 4,
    })

    const { localizeProduct } = await import('@/lib/productLocalization')

    return NextResponse.json({
      product: localizeProduct(product, lang),
      related: related.map((p: Record<string, unknown>) => localizeProduct(p, lang)),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
