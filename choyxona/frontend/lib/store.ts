import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Language, LocalizedProduct, User } from './types'

interface AppState {
  language: Language
  user: User | null
  cart: CartItem[]
  favorites: Set<string>
  promoCode: string | null
  promoDiscount: number
  setLanguage: (lang: Language) => void
  setUser: (user: User | null) => void
  addToCart: (product: LocalizedProduct, qty?: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  toggleFavorite: (productId: string) => void
  setFavorites: (ids: string[]) => void
  setPromo: (code: string | null, discount: number) => void
  cartTotal: () => number
  cartCount: () => number
  maxPrepTime: () => number
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      language: 'uz',
      user: null,
      cart: [],
      favorites: new Set<string>(),
      promoCode: null,
      promoDiscount: 0,

      setLanguage: (language) => set({ language }),
      setUser: (user) => set({ user }),

      addToCart: (product, qty = 1) => {
        const cart = get().cart
        const existing = cart.find((i) => i.product.id === product.id)
        if (existing) {
          set({
            cart: cart.map((i) =>
              i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i
            ),
          })
        } else {
          set({ cart: [...cart, { product, quantity: qty }] })
        }
      },

      removeFromCart: (productId) =>
        set({ cart: get().cart.filter((i) => i.product.id !== productId) }),

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId)
          return
        }
        set({
          cart: get().cart.map((i) =>
            i.product.id === productId ? { ...i, quantity } : i
          ),
        })
      },

      clearCart: () => set({ cart: [], promoCode: null, promoDiscount: 0 }),

      toggleFavorite: (productId) => {
        const favorites = new Set(get().favorites)
        if (favorites.has(productId)) favorites.delete(productId)
        else favorites.add(productId)
        set({ favorites })
      },

      setFavorites: (ids) => set({ favorites: new Set(ids) }),

      setPromo: (code, discount) => set({ promoCode: code, promoDiscount: discount }),

      cartTotal: () => get().cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0),

      cartCount: () => get().cart.reduce((sum, i) => sum + i.quantity, 0),

      maxPrepTime: () => {
        const times = get().cart.map((i) => i.product.cookingTime)
        return times.length ? Math.max(...times) + 15 : 0
      },
    }),
    {
      name: 'choyxona-store',
      partialize: (state) => ({
        language: state.language,
        cart: state.cart,
        favorites: Array.from(state.favorites),
        promoCode: state.promoCode,
        promoDiscount: state.promoDiscount,
      }),
      merge: (persisted, current) => {
        const p = persisted as Partial<AppState & { favorites: string[] }>
        return {
          ...current,
          ...p,
          favorites: new Set(p.favorites ?? []),
        }
      },
    }
  )
)
