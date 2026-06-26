import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()
const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }))
app.use(express.json())

function langField(lang: string, uz: string, ru: string, en: string) {
  if (lang === 'ru') return ru
  if (lang === 'en') return en
  return uz
}

function localizeProduct(p: Record<string, unknown>, lang: string) {
  return {
    ...p,
    name: langField(lang, p.nameUz as string, p.nameRu as string, p.nameEn as string),
    description: langField(lang, p.descriptionUz as string, p.descriptionRu as string, p.descriptionEn as string),
    ingredients: langField(lang, p.ingredientsUz as string, p.ingredientsRu as string, p.ingredientsEn as string),
  }
}

function localizeCategory(c: Record<string, unknown>, lang: string) {
  return {
    ...c,
    name: langField(lang, c.nameUz as string, c.nameRu as string, c.nameEn as string),
  }
}

// Auth via Telegram init data (simplified — upsert user)
app.post('/api/auth/telegram', async (req, res) => {
  const { telegramId, username, firstName, lastName, language } = req.body
  if (!telegramId) return res.status(400).json({ error: 'telegramId required' })

  const user = await prisma.user.upsert({
    where: { telegramId: String(telegramId) },
    create: {
      telegramId: String(telegramId),
      username,
      firstName,
      lastName,
      language: language || 'uz',
    },
    update: { username, firstName, lastName, language: language || undefined },
  })
  res.json(user)
})

app.get('/api/settings', async (_req, res) => {
  const settings = await prisma.restaurantSettings.findFirst()
  res.json(settings)
})

app.get('/api/categories', async (req, res) => {
  const lang = (req.query.lang as string) || 'uz'
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { products: true } } },
  })
  res.json(categories.map((c) => localizeCategory(c as unknown as Record<string, unknown>, lang)))
})

app.get('/api/products', async (req, res) => {
  const lang = (req.query.lang as string) || 'uz'
  const {
    category,
    search,
    vegetarian,
    spicy,
    popular,
    chefPick,
    minPrice,
    maxPrice,
    maxCookTime,
    special,
  } = req.query

  const where: Record<string, unknown> = { isAvailable: true }

  if (category) {
    const cat = await prisma.category.findUnique({ where: { slug: String(category) } })
    if (cat) where.categoryId = cat.id
  }
  if (vegetarian === 'true') where.isVegetarian = true
  if (spicy === 'true') where.isSpicy = true
  if (popular === 'true') where.isPopular = true
  if (chefPick === 'true') where.isChefPick = true
  if (special === 'true') where.isSpecial = true
  if (minPrice) where.price = { ...(where.price as object || {}), gte: Number(minPrice) }
  if (maxPrice) where.price = { ...(where.price as object || {}), lte: Number(maxPrice) }
  if (maxCookTime) where.cookingTime = { lte: Number(maxCookTime) }

  let products = await prisma.product.findMany({
    where,
    include: { category: true },
    orderBy: [{ isPopular: 'desc' }, { nameUz: 'asc' }],
  })

  if (search) {
    const q = String(search).toLowerCase()
    products = products.filter(
      (p) =>
        p.nameUz.toLowerCase().includes(q) ||
        p.nameRu.toLowerCase().includes(q) ||
        p.nameEn.toLowerCase().includes(q) ||
        p.ingredientsUz.toLowerCase().includes(q) ||
        p.ingredientsRu.toLowerCase().includes(q) ||
        p.ingredientsEn.toLowerCase().includes(q)
    )
  }

  res.json(products.map((p) => localizeProduct(p as unknown as Record<string, unknown>, lang)))
})

app.get('/api/products/:slug', async (req, res) => {
  const lang = (req.query.lang as string) || 'uz'
  const product = await prisma.product.findUnique({
    where: { slug: req.params.slug },
    include: { category: true, reviews: { include: { user: true }, take: 10, orderBy: { createdAt: 'desc' } } },
  })
  if (!product) return res.status(404).json({ error: 'Not found' })

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id }, isAvailable: true },
    take: 4,
  })

  res.json({
    product: localizeProduct(product as unknown as Record<string, unknown>, lang),
    related: related.map((p) => localizeProduct(p as unknown as Record<string, unknown>, lang)),
  })
})

app.get('/api/products/id/:id', async (req, res) => {
  const lang = (req.query.lang as string) || 'uz'
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: { category: true, reviews: { include: { user: true }, take: 10 } },
  })
  if (!product) return res.status(404).json({ error: 'Not found' })
  res.json(localizeProduct(product as unknown as Record<string, unknown>, lang))
})

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

app.post('/api/orders', async (req, res) => {
  const parsed = orderSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const { userId, items, comment, phone, address, latitude, longitude, promoCode } = parsed.data
  const settings = await prisma.restaurantSettings.findFirst()
  const deliveryCost = settings?.deliveryCost ?? 15000

  const productIds = items.map((i) => i.productId)
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } })
  const productMap = new Map(products.map((p) => [p.id, p]))

  let subtotal = 0
  let prepTime = 0
  const orderItems = items.map((item) => {
    const product = productMap.get(item.productId)
    if (!product) throw new Error('Product not found')
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

  const order = await prisma.order.create({
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
  })

  if (phone) {
    await prisma.user.update({ where: { id: userId }, data: { phone, savedAddress: address, latitude, longitude } })
  }

  res.status(201).json(order)
})

app.get('/api/orders/user/:userId', async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.params.userId },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  })
  res.json(orders)
})

app.patch('/api/orders/:id/status', async (req, res) => {
  const { status } = req.body
  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { status },
    include: { items: { include: { product: true } }, user: true },
  })
  res.json(order)
})

app.get('/api/orders', async (_req, res) => {
  const orders = await prisma.order.findMany({
    include: { items: { include: { product: true } }, user: true },
    orderBy: { createdAt: 'desc' },
  })
  res.json(orders)
})

app.get('/api/favorites/:userId', async (req, res) => {
  const lang = (req.query.lang as string) || 'uz'
  const favorites = await prisma.favorite.findMany({
    where: { userId: req.params.userId },
    include: { product: { include: { category: true } } },
  })
  res.json(favorites.map((f) => localizeProduct(f.product as unknown as Record<string, unknown>, lang)))
})

app.post('/api/favorites/toggle', async (req, res) => {
  const { userId, productId } = req.body
  const existing = await prisma.favorite.findUnique({
    where: { userId_productId: { userId, productId } },
  })
  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } })
    return res.json({ favorited: false })
  }
  await prisma.favorite.create({ data: { userId, productId } })
  res.json({ favorited: true })
})

app.post('/api/promo/validate', async (req, res) => {
  const { code } = req.body
  const promo = await prisma.promoCode.findFirst({ where: { code, isActive: true } })
  if (!promo) return res.status(404).json({ error: 'Invalid promo code' })
  res.json({ discountPct: promo.discountPct })
})

app.patch('/api/users/:id', async (req, res) => {
  const { language, phone, savedAddress, latitude, longitude } = req.body
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { language, phone, savedAddress, latitude, longitude },
  })
  res.json(user)
})

// Admin routes
app.get('/api/admin/stats', async (_req, res) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const [totalOrders, todayOrders, totalRevenue, todayRevenue, products, customers] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: today } } }),
    prisma.order.aggregate({ _sum: { total: true } }),
    prisma.order.aggregate({ where: { createdAt: { gte: today } }, _sum: { total: true } }),
    prisma.product.count(),
    prisma.user.count(),
  ])
  const popular = await prisma.orderItem.groupBy({
    by: ['productId'],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 5,
  })
  const popularProducts = await Promise.all(
    popular.map(async (p) => {
      const product = await prisma.product.findUnique({ where: { id: p.productId } })
      return { product, quantity: p._sum.quantity }
    })
  )
  res.json({
    totalOrders,
    todayOrders,
    totalRevenue: totalRevenue._sum.total || 0,
    todayRevenue: todayRevenue._sum.total || 0,
    products,
    customers,
    popularProducts,
  })
})

app.patch('/api/admin/products/:id', async (req, res) => {
  const product = await prisma.product.update({ where: { id: req.params.id }, data: req.body })
  res.json(product)
})

app.listen(PORT, () => {
  console.log(`Choyxona API running on http://localhost:${PORT}`)
})
