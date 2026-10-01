import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { CATEGORIES, getCategoryName } from '../../data/categories'
import { adminApi, type ProductDraft } from '../../lib/admin'
import { WebApp } from '../../lib/telegram'
import { useSettingsStore } from '../../store/settingsStore'
import type { Language } from '../../lib/i18n'
import type { Product } from '../../types'

const tr = (lang: Language, o: Record<Language, string>) => o[lang]

type TextLang = 'uz' | 'ru' | 'en'

interface ProductEditorProps {
  product: Product | null // null = new product
  onClose: () => void
  onSaved: (product: Product) => void
  onDeleted: (id: string) => void
}

function emptyDraft(): ProductDraft {
  return {
    name_uz: '',
    name_ru: '',
    name_en: '',
    description_uz: '',
    description_ru: '',
    description_en: '',
    price: null,
    category: 'main',
    image_url: null,
    cook_time_minutes: null,
    calories: null,
    weight_grams: null,
    is_vegetarian: false,
    is_spicy: false,
    is_available: true,
  }
}

function confirmAsync(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      WebApp.showConfirm(message, (ok) => resolve(ok))
    } catch {
      resolve(window.confirm(message))
    }
  })
}

export function ProductEditor({ product, onClose, onSaved, onDeleted }: ProductEditorProps) {
  const lang = useSettingsStore((s) => s.language)
  const [draft, setDraft] = useState<ProductDraft>(() =>
    product
      ? {
          ...emptyDraft(),
          ...product,
          name_uz: product.name_uz ?? product.name,
          description_uz: product.description_uz ?? product.description ?? '',
        }
      : emptyDraft(),
  )
  const [textLang, setTextLang] = useState<TextLang>('uz')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const set = <K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }))

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const url = await adminApi.uploadImage(file)
      set('image_url', url)
      try { WebApp.HapticFeedback.notificationOccurred('success') } catch { /* ignore */ }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleSave = async () => {
    if (!draft.name_uz?.trim()) {
      setError(tr(lang, { uz: "Nomi (o'zbekcha) majburiy", ru: 'Название (узб.) обязательно', en: 'Uzbek name is required' }))
      setTextLang('uz')
      return
    }
    if (draft.price == null || Number.isNaN(draft.price) || draft.price < 0) {
      setError(tr(lang, { uz: 'Narxni kiriting', ru: 'Укажите цену', en: 'Enter a price' }))
      return
    }

    setSaving(true)
    setError(null)
    const payload: ProductDraft = {
      name_uz: draft.name_uz,
      name_ru: draft.name_ru,
      name_en: draft.name_en,
      description_uz: draft.description_uz,
      description_ru: draft.description_ru,
      description_en: draft.description_en,
      price: draft.price,
      category: draft.category,
      image_url: draft.image_url ?? null,
      cook_time_minutes: draft.cook_time_minutes ?? null,
      calories: draft.calories ?? null,
      weight_grams: draft.weight_grams ?? null,
      is_vegetarian: draft.is_vegetarian,
      is_spicy: draft.is_spicy,
      is_available: draft.is_available,
    }
    try {
      const saved = product ? await adminApi.update(product.id, payload) : await adminApi.create(payload)
      try { WebApp.HapticFeedback.notificationOccurred('success') } catch { /* ignore */ }
      onSaved(saved)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
      try { WebApp.HapticFeedback.notificationOccurred('error') } catch { /* ignore */ }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!product) return
    const ok = await confirmAsync(
      tr(lang, {
        uz: `"${draft.name_uz}" o'chirilsinmi? Buni qaytarib bo'lmaydi.`,
        ru: `Удалить «${draft.name_uz}»? Это нельзя отменить.`,
        en: `Delete "${draft.name_uz}"? This cannot be undone.`,
      }),
    )
    if (!ok) return
    setSaving(true)
    try {
      await adminApi.remove(product.id)
      onDeleted(product.id)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
      setSaving(false)
    }
  }

  const nameKey = `name_${textLang}` as const
  const descKey = `description_${textLang}` as const
  const labelCls = 'mb-1 block text-xs font-semibold uppercase tracking-wide'
  const labelStyle = { color: 'var(--tg-theme-hint-color)' }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-3xl px-4 pt-3"
        style={{
          background: 'var(--tg-theme-bg-color)',
          paddingBottom: 'calc(var(--app-safe-bottom) + 16px)',
        }}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full" style={{ background: 'var(--tg-theme-hint-color)', opacity: 0.3 }} />

        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-2xl font-bold" style={{ color: 'var(--tg-theme-text-color)' }}>
            {product
              ? tr(lang, { uz: 'Taomni tahrirlash', ru: 'Редактировать блюдо', en: 'Edit dish' })
              : tr(lang, { uz: 'Yangi taom', ru: 'Новое блюдо', en: 'New dish' })}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full"
            style={{ background: 'var(--tg-theme-secondary-bg-color)', color: 'var(--tg-theme-hint-color)' }}
          >
            ✕
          </button>
        </div>

        {/* Photo */}
        <div className="mb-4">
          <div
            className="relative mb-2 flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl"
            style={{ background: 'var(--tg-theme-secondary-bg-color)' }}
          >
            {draft.image_url ? (
              <img src={draft.image_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-5xl opacity-50">🍽️</span>
            )}
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
                <span className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
              </div>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => void handleFile(e.target.files?.[0])}
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="flex-1 rounded-xl py-3 text-sm font-semibold disabled:opacity-50"
              style={{ background: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)' }}
            >
              📷 {draft.image_url
                ? tr(lang, { uz: 'Rasmni almashtirish', ru: 'Заменить фото', en: 'Replace photo' })
                : tr(lang, { uz: 'Rasm yuklash', ru: 'Загрузить фото', en: 'Upload photo' })}
            </button>
            {draft.image_url && (
              <button
                type="button"
                onClick={() => set('image_url', null)}
                className="rounded-xl px-4 py-3 text-sm font-semibold"
                style={{ background: 'var(--tg-theme-secondary-bg-color)', color: 'var(--tg-theme-destructive-text-color)' }}
              >
                🗑
              </button>
            )}
          </div>
        </div>

        {/* Language tabs for name + description */}
        <div className="mb-2 flex gap-1 rounded-xl p-1" style={{ background: 'var(--tg-theme-secondary-bg-color)' }}>
          {(['uz', 'ru', 'en'] as TextLang[]).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setTextLang(l)}
              className="flex-1 rounded-lg py-1.5 text-xs font-semibold uppercase"
              style={{
                background: textLang === l ? 'var(--paper-card)' : 'transparent',
                color: textLang === l ? 'var(--tg-theme-text-color)' : 'var(--tg-theme-hint-color)',
              }}
            >
              {l}{l === 'uz' && ' *'}
            </button>
          ))}
        </div>

        <div className="mb-3">
          <label className={labelCls} style={labelStyle}>
            {tr(lang, { uz: 'Nomi', ru: 'Название', en: 'Name' })} ({textLang.toUpperCase()})
          </label>
          <input
            value={(draft[nameKey] as string) ?? ''}
            onChange={(e) => set(nameKey, e.target.value)}
            maxLength={120}
            className="paper-input w-full rounded-xl px-4 py-3 text-base outline-none"
          />
        </div>

        <div className="mb-3">
          <label className={labelCls} style={labelStyle}>
            {tr(lang, { uz: 'Tavsif', ru: 'Описание', en: 'Description' })} ({textLang.toUpperCase()})
          </label>
          <textarea
            value={(draft[descKey] as string) ?? ''}
            onChange={(e) => set(descKey, e.target.value)}
            rows={3}
            maxLength={1000}
            className="paper-input w-full resize-none rounded-xl px-4 py-3 text-base outline-none"
          />
        </div>

        <div className="mb-3 grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls} style={labelStyle}>
              {tr(lang, { uz: "Narxi (so'm)", ru: 'Цена (сум)', en: 'Price (sum)' })} *
            </label>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              step={1000}
              value={draft.price ?? ''}
              onChange={(e) => set('price', e.target.value === '' ? null : Number(e.target.value))}
              className="paper-input w-full rounded-xl px-4 py-3 text-base outline-none"
            />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>
              {tr(lang, { uz: 'Kategoriya', ru: 'Категория', en: 'Category' })}
            </label>
            <select
              value={draft.category ?? 'main'}
              onChange={(e) => set('category', e.target.value)}
              className="paper-input w-full rounded-xl px-3 py-3 text-base outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.icon} {getCategoryName(c, lang)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>
              {tr(lang, { uz: 'Tayyorlash (daq.)', ru: 'Готовка (мин)', en: 'Cook time (min)' })}
            </label>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={draft.cook_time_minutes ?? ''}
              onChange={(e) => set('cook_time_minutes', e.target.value === '' ? null : Number(e.target.value))}
              className="paper-input w-full rounded-xl px-4 py-3 text-base outline-none"
            />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>
              {tr(lang, { uz: 'Kaloriya', ru: 'Калории', en: 'Calories' })}
            </label>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={draft.calories ?? ''}
              onChange={(e) => set('calories', e.target.value === '' ? null : Number(e.target.value))}
              className="paper-input w-full rounded-xl px-4 py-3 text-base outline-none"
            />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>
              {tr(lang, { uz: 'Vazni (g)', ru: 'Вес (г)', en: 'Weight (g)' })}
            </label>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={draft.weight_grams ?? ''}
              onChange={(e) => set('weight_grams', e.target.value === '' ? null : Number(e.target.value))}
              className="paper-input w-full rounded-xl px-4 py-3 text-base outline-none"
            />
          </div>
        </div>

        <div className="paper-card mb-4 space-y-1 rounded-2xl p-2">
          {([
            ['is_available', { uz: '✅ Sotuvda bor', ru: '✅ В наличии', en: '✅ Available' }],
            ['is_vegetarian', { uz: '🥬 Vegetarian', ru: '🥬 Вегетарианское', en: '🥬 Vegetarian' }],
            ['is_spicy', { uz: '🌶️ Achchiq', ru: '🌶️ Острое', en: '🌶️ Spicy' }],
          ] as const).map(([key, label]) => (
            <label key={key} className="flex cursor-pointer items-center justify-between rounded-xl px-2 py-2">
              <span className="text-sm font-medium" style={{ color: 'var(--tg-theme-text-color)' }}>
                {tr(lang, label)}
              </span>
              <input
                type="checkbox"
                checked={Boolean(draft[key])}
                onChange={(e) => set(key, e.target.checked)}
                className="h-5 w-5 accent-[var(--tg-theme-button-color)]"
              />
            </label>
          ))}
        </div>

        {error && (
          <p className="mb-3 rounded-xl p-3 text-sm" style={{ background: 'color-mix(in srgb, var(--tg-theme-destructive-text-color) 12%, transparent)', color: 'var(--tg-theme-destructive-text-color)' }}>
            {error}
          </p>
        )}

        <div className="flex gap-2">
          {product && (
            <button
              type="button"
              disabled={saving}
              onClick={handleDelete}
              className="rounded-2xl px-4 text-sm font-semibold disabled:opacity-50"
              style={{ background: 'var(--tg-theme-secondary-bg-color)', color: 'var(--tg-theme-destructive-text-color)' }}
            >
              🗑 {tr(lang, { uz: "O'chirish", ru: 'Удалить', en: 'Delete' })}
            </button>
          )}
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            disabled={saving || uploading}
            onClick={handleSave}
            className="flex min-h-[52px] flex-1 items-center justify-center rounded-2xl text-base font-semibold disabled:opacity-50"
            style={{ background: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)' }}
          >
            {saving
              ? tr(lang, { uz: 'Saqlanmoqda...', ru: 'Сохранение...', en: 'Saving...' })
              : tr(lang, { uz: 'Saqlash', ru: 'Сохранить', en: 'Save' })}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
