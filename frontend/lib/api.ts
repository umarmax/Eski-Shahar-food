import type { AdminStats, Category, LocalizedProduct, Order, ProductFilters, RestaurantSettings, User } from './types'
import type { Language } from './types'

const API = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || ''

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const url = /^https?:\/\//i.test(path) ? path : `${API}${path}`
  const res = await fetch(url, {
    credentials: 'include',
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

const getAdminHeaders = () => ({})
export const api = {
  authTelegram: (data: {
    initData: string
    language?: Language
  }) => fetchApi<User>('/api/auth/telegram', { method: 'POST', body: JSON.stringify(data) }),

  getSettings: () => fetchApi<RestaurantSettings>('/api/settings'),

  getCategories: (lang: Language) => fetchApi<Category[]>(`/api/categories?lang=${lang}`),

  getProducts: (lang: Language, filters?: ProductFilters) => {
    const params = new URLSearchParams({ lang })
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== '') params.set(k, String(v))
      })
    }
    return fetchApi<LocalizedProduct[]>(`/api/products?${params}`)
  },

  getProduct: (slug: string, lang: Language) =>
    fetchApi<{ product: LocalizedProduct; related: LocalizedProduct[] }>(
      `/api/products/${slug}?lang=${lang}`
    ),

  createOrder: (data: {
    userId: string
    items: { productId: string; quantity: number }[]
    comment?: string
    phone?: string
    address?: string
    latitude?: number
    longitude?: number
    promoCode?: string
  }) => fetchApi<Order>('/api/orders', { method: 'POST', body: JSON.stringify(data) }),

  getUserOrders: (userId: string) => fetchApi<Order[]>(`/api/orders/user/${userId}`),

  toggleFavorite: (userId: string, productId: string) =>
    fetchApi<{ favorited: boolean }>('/api/favorites/toggle', {
      method: 'POST',
      body: JSON.stringify({ userId, productId }),
    }),

  getFavorites: (userId: string, lang: Language) =>
    fetchApi<LocalizedProduct[]>(`/api/favorites/${userId}?lang=${lang}`),

  validatePromo: (code: string) => fetchApi<{ discountPct: number }>('/api/promo/validate', {
    method: 'POST',
    body: JSON.stringify({ code }),
  }),

  updateUser: (id: string, data: Partial<User>) =>
    fetchApi<User>(`/api/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  getAdminStats: () => fetchApi<AdminStats>('/api/admin/stats', { headers: getAdminHeaders() }),

  getAllOrders: () => fetchApi<Order[]>('/api/orders'), // not strictly admin if used elsewhere, but typically admin

  updateOrderStatus: (id: string, status: string) =>
    fetchApi<Order>(`/api/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
      headers: getAdminHeaders(), // Assuming we want to protect this eventually, but it's not under /api/admin/
    }),

  // CRUD Products
  createProduct: (data: Partial<LocalizedProduct>) =>
    fetchApi<LocalizedProduct>('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: getAdminHeaders(),
    }),

  updateProduct: (id: string, data: Partial<LocalizedProduct>) =>
    fetchApi<LocalizedProduct>(`/api/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: getAdminHeaders(),
    }),

  deleteProduct: (id: string) =>
    fetchApi<{ success: boolean }>(`/api/admin/products/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders(),
    }),
}

export function formatPrice(amount: number, lang: Language = 'uz'): string {
  const formatted = amount.toLocaleString('ru-RU')
  if (lang === 'en') return `${formatted} UZS`
  return `${formatted} so'm`
}
