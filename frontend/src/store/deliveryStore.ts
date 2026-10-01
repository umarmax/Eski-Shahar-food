import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DeliveryLocation } from '../lib/telegram'
import type { OrderType } from '../types'

interface DeliveryState {
  orderType: OrderType
  address: string
  location: DeliveryLocation | null
  setOrderType: (orderType: OrderType) => void
  setAddress: (address: string) => void
  setLocation: (location: DeliveryLocation | null) => void
}

/** Delivery/pickup choice and saved address, shared by the home header and checkout. */
export const useDeliveryStore = create<DeliveryState>()(
  persist(
    (set) => ({
      orderType: 'delivery',
      address: '',
      location: null,
      setOrderType: (orderType) => set({ orderType }),
      setAddress: (address) => set({ address }),
      setLocation: (location) => set({ location }),
    }),
    { name: 'eski-shahar-delivery' },
  ),
)
