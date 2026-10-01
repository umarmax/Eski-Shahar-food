export interface Product {
  id: string
  name: string
  name_uz?: string
  name_ru?: string
  name_en?: string
  description?: string
  description_uz?: string
  description_ru?: string
  description_en?: string
  price: number
  category: string
  image_url?: string
  is_vegetarian?: boolean
  is_spicy?: boolean
  cook_time_minutes?: number
  calories?: number
  is_available?: boolean
  weight_grams?: number | null
  created_at: string
}

export type OrderType = 'delivery' | 'pickup'

export interface Category {
  id: string
  slug: string
  name: string
  name_uz: string
  name_ru: string
  name_en: string
  icon: string
}

export interface CartItem {
  id: string
  productId: string
  product: Product
  quantity: number
  notes?: string
}

export interface OrderItem {
  product_id: string
  name: string
  quantity: number
  price: number
  notes?: string
}

export interface Order {
  id: string
  user_id?: string
  items: OrderItem[]
  total: number
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  telegram_user_id?: number
  telegram_username?: string
  customer_name?: string
  customer_phone?: string
  delivery_address?: string
  delivery_lat?: number | null
  delivery_lng?: number | null
  order_type?: OrderType
  comment?: string
  created_at: string
}

export interface OrderPayload {
  items: {
    product_id: string
    quantity: number
  }[]
  init_data?: string
  lang: string
  customer_name: string
  customer_phone: string
  delivery_address?: string
  delivery_location?: { lat: number; lng: number; accuracy: number | null }
  location_via_chat?: boolean
  order_type: OrderType
  comment?: string
}

export interface UserProfile {
  id: string
  telegram_id: number
  first_name: string
  last_name?: string | null
  username?: string | null
  photo_url?: string | null
  phone?: string | null
}
