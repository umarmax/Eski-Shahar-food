import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function langField(lang: string, uz: string, ru: string, en: string) {
  if (lang === 'ru') return ru
  if (lang === 'en') return en
  return uz
}

function localizeCategory(c: any, lang: string) {
  return {
    ...c,
    name: langField(lang, c.nameUz as string, c.nameRu as string, c.nameEn as string),
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const lang = searchParams.get('lang') || 'uz'
    
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { products: true } } },
    })
    
    return NextResponse.json(categories.map((c: Record<string, unknown>) => localizeCategory(c, lang)))
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
