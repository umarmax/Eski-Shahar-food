import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Product } from '../types'

interface CartState {
  items: CartItem[]
  addItem: (product: Product, quantity?: number, notes?: string) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  updateNotes: (id: string, notes: string) => void
  clearCart: () => void
  totalItems: () => number
  totalPrice: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1, notes = '') => {
        const id = product.id
        const existing = get().items.find((item) => item.id === id)

        if (existing) {
          set({
            items: get().items.map((item) =>
              item.id === id
                ? { ...item, quantity: item.quantity + quantity }
                : item,
            ),
          })
          return
        }

        set({
          items: [
            ...get().items,
            { id, productId: product.id, product, quantity, notes },
          ],
        })
      },

      removeItem: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) })
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }

        set({
          items: get().items.map((item) =>
            item.id === id ? { ...item, quantity } : item,
          ),
        })
      },

      updateNotes: (id, notes) => {
        set({
          items: get().items.map((item) =>
            item.id === id ? { ...item, notes } : item,
          ),
        })
      },

      clearCart: () => set({ items: [] }),

      totalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      totalPrice: () =>
        get().items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0,
        ),
    }),
    { name: 'choyxona-cart' },
  ),
)
