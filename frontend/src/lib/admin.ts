import { supabase } from './supabase'
import { WebApp } from './telegram'
import type { Product } from '../types'

// Telegram user IDs that see the admin entry point. The server re-checks
// every request against its own list (admin-products Edge Function).
const ADMIN_IDS = (import.meta.env.VITE_ADMIN_TELEGRAM_IDS || '8627067211,6237960948')
  .split(',')
  .map((s: string) => s.trim())
  .filter(Boolean)

export function isAdminUser(): boolean {
  try {
    const id = WebApp.initDataUnsafe?.user?.id
    return Boolean(WebApp.initData) && id != null && ADMIN_IDS.includes(String(id))
  } catch {
    return false
  }
}

type EditableProduct = Omit<Product, 'id' | 'created_at'>

/** Editable fields; null clears a value. */
export type ProductDraft = { [K in keyof EditableProduct]?: EditableProduct[K] | null }

async function call<T>(action: string, payload: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await supabase.functions.invoke('admin-products', {
    body: { init_data: WebApp.initData, action, ...payload },
  })
  if (error) {
    let message = error.message
    try {
      const body = await (error as { context?: Response }).context?.json()
      if (body?.error) message = body.error
    } catch { /* not JSON */ }
    throw new Error(message)
  }
  return data as T
}

export const adminApi = {
  check: () => call<{ is_admin: boolean }>('check'),
  list: () => call<{ products: Product[] }>('list').then((r) => r.products),
  create: (product: ProductDraft) => call<{ product: Product }>('create', { product }).then((r) => r.product),
  update: (id: string, product: ProductDraft) =>
    call<{ product: Product }>('update', { id, product }).then((r) => r.product),
  remove: (id: string) => call<{ ok: boolean }>('delete', { id }),

  /** Compresses the image and uploads it; returns its public URL. */
  uploadImage: async (file: File): Promise<string> => {
    const blob = await compressImage(file)
    const { path, token, public_url } = await call<{ path: string; token: string; public_url: string }>(
      'upload-url',
      { content_type: blob.type },
    )
    const { error } = await supabase.storage
      .from('product-images')
      .uploadToSignedUrl(path, token, blob, { contentType: blob.type })
    if (error) throw new Error(error.message)
    return public_url
  },
}

const MAX_SIDE = 1280

/** Downscale to max 1280px and re-encode as JPEG (~200–400 KB). */
async function compressImage(file: File): Promise<Blob> {
  if (!file.type.startsWith('image/')) throw new Error('Not an image')

  const bitmap = await createImageBitmap(file).catch(() => null)
  if (!bitmap) return file

  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) return file
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85))
  return blob ?? file
}
