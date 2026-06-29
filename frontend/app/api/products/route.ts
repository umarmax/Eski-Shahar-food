import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const lang = searchParams.get('lang') || 'uz'
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const vegetarian = searchParams.get('vegetarian')
    const spicy = searchParams.get('spicy')
    const popular = searchParams.get('popular')
    const chefPick = searchParams.get('chefPick')
    const special = searchParams.get('special')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const maxCookTime = searchParams.get('maxCookTime')

    const where: any = { isAvailable: true }

    if (category) {
      const cat = await prisma.category.findUnique({ where: { slug: category } })
      if (cat) where.categoryId = cat.id
    }
    if (vegetarian === 'true') where.isVegetarian = true
    if (spicy === 'true') where.isSpicy = true
    if (popular === 'true') where.isPopular = true
    if (chefPick === 'true') where.isChefPick = true
    if (special === 'true') where.isSpecial = true
    if (minPrice) where.price = { ...(where.price || {}), gte: Number(minPrice) }
    if (maxPrice) where.price = { ...(where.price || {}), lte: Number(maxPrice) }
    if (maxCookTime) where.cookingTime = { lte: Number(maxCookTime) }

    let products = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: [{ isPopular: 'desc' }, { nameUz: 'asc' }],
    })

    if (search) {
      const q = search.toLowerCase()
      products = products.filter(
        (p: { nameUz: string; nameRu: string; nameEn: string; ingredientsUz: string; ingredientsRu: string; ingredientsEn: string }) =>
          p.nameUz.toLowerCase().includes(q) ||
          p.nameRu.toLowerCase().includes(q) ||
          p.nameEn.toLowerCase().includes(q) ||
          p.ingredientsUz.toLowerCase().includes(q) ||
          p.ingredientsRu.toLowerCase().includes(q) ||
          p.ingredientsEn.toLowerCase().includes(q)
      )
    }

    const { localizeProduct } = await import('@/lib/productLocalization')

    return NextResponse.json(products.map((p: Record<string, unknown>) => localizeProduct(p, lang)))
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
