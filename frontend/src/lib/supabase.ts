import { createClient } from '@supabase/supabase-js'
import type { Order, Product } from '../types'

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

// Hidden (stop-listed) dishes are filtered client-side so this works
// before and after migration 005 adds the column.
const isAvailable = (p: Product) => p.is_available !== false

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to load products: ${error.message}`)
  }

  return ((data ?? []) as Product[]).filter(isAvailable)
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

  return ((data ?? []) as Product[]).filter(isAvailable)
}

export async function fetchMyOrders(initData: string): Promise<Order[]> {
  const { data, error } = await supabase.functions.invoke<{ orders: Order[] }>('my-orders', {
    body: { init_data: initData },
  })
  if (error) throw new Error(error.message)
  return data?.orders ?? []
}

export async function fetchOrderByIdAndPhone(orderId: string, phone: string): Promise<Order[]> {
  const { data, error } = await supabase.functions.invoke<{ orders: Order[] }>('my-orders', {
    body: { order_id: orderId, phone },
  })
  if (error) throw new Error(error.message)
  return data?.orders ?? []
}
