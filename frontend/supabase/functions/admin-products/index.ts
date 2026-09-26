// Supabase Edge Function: admin-products
// Deploy: supabase functions deploy admin-products
//
// Menu management for admins (Telegram IDs from getAdminIds()).
// Every request carries signed Telegram initData; the caller must be an admin.
//
// Body: { init_data, action, ... }
//   check                              → { is_admin: true }
//   list                               → { products }
//   create  { product }                → { product }
//   update  { id, product }            → { product }
//   delete  { id }                     → { ok: true }
//   upload-url { content_type }        → { path, token, public_url }

import {
  corsHeaders,
  createServiceClient,
  isAdminId,
  jsonResponse,
  validateTelegramInitData,
} from '../_shared/telegram.ts'

const BUCKET = 'product-images'
const CATEGORIES = ['plov', 'kebab', 'soups', 'main', 'salads', 'bread', 'drinks', 'desserts']
const IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

type ProductInput = Record<string, unknown>

function str(v: unknown, max: number): string | null {
  if (v == null) return null
  const s = String(v).trim()
  if (!s) return null
  if (s.length > max) throw new Error(`Text too long (max ${max})`)
  return s
}

function int(v: unknown, min: number, max: number): number | null {
  if (v == null || v === '') return null
  const n = Number(v)
  if (!Number.isInteger(n) || n < min || n > max) throw new Error(`Number out of range (${min}-${max})`)
  return n
}

/** Whitelist + validate product fields. `partial` allows omitting fields on update. */
function sanitizeProduct(input: ProductInput, partial: boolean): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  const has = (k: string) => Object.prototype.hasOwnProperty.call(input, k)

  for (const k of ['name_uz', 'name_ru', 'name_en']) {
    if (has(k)) out[k] = str(input[k], 120)
  }
  for (const k of ['description_uz', 'description_ru', 'description_en']) {
    if (has(k)) out[k] = str(input[k], 1000)
  }
  if (has('price')) out.price = int(input.price, 0, 100_000_000)
  if (has('category')) {
    const c = String(input.category)
    if (!CATEGORIES.includes(c)) throw new Error('Invalid category')
    out.category = c
  }
  if (has('image_url')) {
    const url = str(input.image_url, 1000)
    if (url && !url.startsWith('https://')) throw new Error('Image URL must be https')
    out.image_url = url
  }
  if (has('cook_time_minutes')) out.cook_time_minutes = int(input.cook_time_minutes, 0, 600)
  if (has('calories')) out.calories = int(input.calories, 0, 10000)
  for (const k of ['is_vegetarian', 'is_spicy', 'is_available']) {
    if (has(k)) out[k] = Boolean(input[k])
  }

  // Base name/description mirror the Uzbek text (fallbacks for older clients)
  const nameUz = out.name_uz as string | null | undefined
  if (nameUz !== undefined) {
    out.name = nameUz ?? out.name_ru ?? out.name_en ?? null
  }
  if (out.description_uz !== undefined) out.description = out.description_uz

  if (!partial) {
    if (!out.name) throw new Error('Name is required')
    if (out.price == null) throw new Error('Price is required')
    if (!out.category) throw new Error('Category is required')
  } else if (has('name_uz') && !out.name) {
    throw new Error('Name is required')
  }

  out.updated_at = new Date().toISOString()
  return out
}

/** Extract storage object path from a public URL of our bucket, if it is one. */
function storagePathFromUrl(url: string | null | undefined, supabaseUrl: string): string | null {
  if (!url) return null
  const prefix = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/`
  return url.startsWith(prefix) ? url.slice(prefix.length) : null
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  if (!botToken) return jsonResponse({ error: 'Not configured' }, 503)

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return jsonResponse({ error: 'Bad request' }, 400)
  }

  // ── Auth: signed initData + admin allow-list ──
  let userId: number
  try {
    const user = await validateTelegramInitData(String(body.init_data ?? ''), botToken)
    userId = user.id
  } catch {
    return jsonResponse({ error: 'Unauthorized' }, 401)
  }
  if (!isAdminId(userId)) {
    return jsonResponse({ error: 'Forbidden' }, 403)
  }

  const supabase = createServiceClient()
  const action = String(body.action ?? '')

  try {
    switch (action) {
      case 'check':
        return jsonResponse({ is_admin: true })

      case 'list': {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('category')
          .order('created_at', { ascending: false })
        if (error) throw error
        return jsonResponse({ products: data ?? [] })
      }

      case 'create': {
        const product = sanitizeProduct((body.product ?? {}) as ProductInput, false)
        const { data, error } = await supabase.from('products').insert(product).select('*').single()
        if (error) throw error
        console.log(`[Admin] ${userId} created product ${data.id}`)
        return jsonResponse({ product: data }, 201)
      }

      case 'update': {
        const id = String(body.id ?? '')
        const product = sanitizeProduct((body.product ?? {}) as ProductInput, true)

        const { data: before } = await supabase.from('products').select('image_url').eq('id', id).maybeSingle()
        if (!before) return jsonResponse({ error: 'Product not found' }, 404)

        const { data, error } = await supabase.from('products').update(product).eq('id', id).select('*').single()
        if (error) throw error

        // Remove the replaced photo from storage
        if ('image_url' in product && before.image_url !== data.image_url) {
          const oldPath = storagePathFromUrl(before.image_url, supabaseUrl)
          if (oldPath) await supabase.storage.from(BUCKET).remove([oldPath])
        }
        console.log(`[Admin] ${userId} updated product ${id}`)
        return jsonResponse({ product: data })
      }

      case 'delete': {
        const id = String(body.id ?? '')
        const { data, error } = await supabase.from('products').delete().eq('id', id).select('image_url').maybeSingle()
        if (error) throw error
        if (!data) return jsonResponse({ error: 'Product not found' }, 404)
        const oldPath = storagePathFromUrl(data.image_url, supabaseUrl)
        if (oldPath) await supabase.storage.from(BUCKET).remove([oldPath])
        console.log(`[Admin] ${userId} deleted product ${id}`)
        return jsonResponse({ ok: true })
      }

      case 'upload-url': {
        const ext = IMAGE_TYPES[String(body.content_type ?? '')]
        if (!ext) return jsonResponse({ error: 'Only JPEG, PNG or WebP images' }, 400)
        const path = `products/${crypto.randomUUID()}.${ext}`
        const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path)
        if (error) throw error
        const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path)
        return jsonResponse({ path, token: data.token, public_url: pub.publicUrl })
      }

      default:
        return jsonResponse({ error: 'Unknown action' }, 400)
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Request failed'
    console.error(`[Admin] ${action} failed:`, e)
    // Validation messages are safe to show; DB errors are not
    const safe = /required|too long|out of range|Invalid|must be/.test(message)
    return jsonResponse({ error: safe ? message : 'Request failed' }, safe ? 400 : 500)
  }
})
