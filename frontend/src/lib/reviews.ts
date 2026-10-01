import { isSupabaseConfigured, supabase } from './supabase'
import { WebApp } from './telegram'

export interface Review {
  id: string
  author_name: string
  rating: number
  text: string | null
  created_at: string
}

export interface ReviewsSummary {
  reviews: Review[]
  average: number
  count: number
}

async function errorMessage(error: { message: string }): Promise<string> {
  try {
    const body = await (error as { context?: Response }).context?.json()
    if (body?.error) return body.error
  } catch { /* not JSON */ }
  return error.message
}

export async function fetchReviews(): Promise<ReviewsSummary> {
  if (!isSupabaseConfigured) return { reviews: [], average: 0, count: 0 }
  const { data, error } = await supabase.functions.invoke<ReviewsSummary>('reviews', { body: { action: 'list' } })
  if (error) throw new Error(await errorMessage(error))
  return data ?? { reviews: [], average: 0, count: 0 }
}

export async function submitReview(rating: number, text: string, orderId?: string): Promise<Review> {
  const { data, error } = await supabase.functions.invoke<{ review: Review }>('reviews', {
    body: { action: 'create', init_data: WebApp.initData, rating, text, order_id: orderId },
  })
  if (error) throw new Error(await errorMessage(error))
  return data!.review
}
