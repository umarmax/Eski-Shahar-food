import { createClient } from '@supabase/supabase-js'
import type { Order, OrderPayload, Product } from '../types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!isSupabaseConfigured) {
  console.warn(
    '[Supabase] Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env',
  )
}

export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder-key',
)

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to load products: ${error.message}`)
  }

  return (data ?? []) as Product[]
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to load product: ${error.message}`)
  }

  return data as Product | null
}

export async function fetchProductsByCategory(
  category: string,
): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .order('price', { ascending: true })

  if (error) {
    throw new Error(`Failed to load category: ${error.message}`)
  }

  return (data ?? []) as Product[]
}

export async function createOrder(
  payload: OrderPayload,
  userId?: string | null,
): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .insert({
      user_id: userId ?? null,
      items: payload.items,
      total: 0, // Will be calculated server-side
      status: 'pending',
      telegram_user_id: payload.telegram_user_id ?? null,
      telegram_username: payload.telegram_username ?? null,
      customer_name: payload.customer_name ?? null,
      customer_phone: payload.customer_phone ?? null,
      delivery_address: payload.delivery_address ?? null,
      comment: payload.comment ?? null,
    })
    .select('*')
    .single()

  if (error) {
    throw new Error(`Failed to create order: ${error.message}`)
  }

  return data as Order
}

export async function fetchUserOrders(userId: string, telegramId?: number): Promise<Order[]> {
  // Try by user_id first
  if (userId && userId !== 'dev-user') {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (!error && data && data.length > 0) {
      return data as Order[]
    }
  }

  // Fallback: fetch by telegram_user_id
  if (telegramId) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('telegram_user_id', telegramId)
      .order('created_at', { ascending: false })

    if (!error) {
      return (data ?? []) as Order[]
    }
  }

  return []
}

export async function fetchOrdersByPhone(phone: string): Promise<Order[]> {
  // Normalize phone: remove spaces, dashes, parentheses
  const normalizedPhone = phone.replace(/[\s\-\(\)]/g, '')
  
  // Try exact match first
  let { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('customer_phone', phone)
    .order('created_at', { ascending: false })

  if (!error && data && data.length > 0) {
    return data as Order[]
  }

  // Try with normalized phone
  if (normalizedPhone !== phone) {
    const result = await supabase
      .from('orders')
      .select('*')
      .eq('customer_phone', normalizedPhone)
      .order('created_at', { ascending: false })
    
    if (!result.error && result.data && result.data.length > 0) {
      return result.data as Order[]
    }
  }

  // Try with ilike for partial match (handles HTML escaping)
  const likeResult = await supabase
    .from('orders')
    .select('*')
    .ilike('customer_phone', `%${normalizedPhone.slice(-9)}%`)
    .order('created_at', { ascending: false })

  if (!likeResult.error && likeResult.data) {
    return likeResult.data as Order[]
  }

  return []
}
