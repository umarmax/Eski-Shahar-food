export type Language = 'uz' | 'ru' | 'en'

export interface LocalizedProduct {
  id: string
  slug: string
  name: string
  nameUz: string
  nameRu: string
  nameEn: string
  description: string
  ingredients: string
  imageUrl: string
  galleryUrls: string[]
  price: number
  weight: string
  calories: number
  cookingTime: number
  isVegetarian: boolean
  isSpicy: boolean
  isPopular: boolean
  isChefPick: boolean
  isSpecial: boolean
  isAvailable: boolean
  categoryId: string
  category?: Category
}

export interface Category {
  id: string
  slug: string
  emoji: string
  name: string
  nameUz: string
  nameRu: string
  nameEn: string
  sortOrder: number
  _count?: { products: number }
}

export interface CartItem {
  product: LocalizedProduct
  quantity: number
}

export interface User {
  id: string
  telegramId: string
  username?: string
  firstName?: string
  lastName?: string
  phone?: string
  language: Language
  savedAddress?: string
  latitude?: number
  longitude?: number
}

export interface Order {
  id: string
  orderNumber: number
  status: 'pending' | 'accepted' | 'preparing' | 'courier' | 'delivered' | 'cancelled'
  subtotal: number
  deliveryCost: number
  discount: number
  total: number
  prepTimeMinutes: number
  comment?: string
  phone?: string
  createdAt: string
  user?: User
  items: { id: string; quantity: number; price: number; product: LocalizedProduct }[]
}

export interface AdminStats {
  totalOrders: number
  todayOrders: number
  totalRevenue: number
  todayRevenue: number
  products: number
  customers: number
  popularProducts: {
    product: { nameUz: string; nameEn: string } | null
    quantity: number | null
  }[]
}

export interface RestaurantSettings {
  nameUz: string
  nameRu: string
  nameEn: string
  phone: string
  address: string
  latitude: number
  longitude: number
  openTime: string
  closeTime: string
  deliveryCost: number
  instagramUrl?: string
  telegramUrl?: string
  isOpen: boolean
}

export interface ProductFilters {
  category?: string
  search?: string
  vegetarian?: boolean
  spicy?: boolean
  popular?: boolean
  chefPick?: boolean
  minPrice?: number
  maxPrice?: number
  maxCookTime?: number
  special?: boolean
}
