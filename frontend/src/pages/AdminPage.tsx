import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Layout } from '../components/Layout'
import { PageHeader } from '../components/PageHeader'
import { ProductEditor } from '../components/admin/ProductEditor'
import { CATEGORIES, getCategoryName } from '../data/categories'
import { adminApi, isAdminUser } from '../lib/admin'
import { WebApp } from '../lib/telegram'
import { getProductName, type Language } from '../lib/i18n'
import { useAppStore } from '../store/appStore'
import { useSettingsStore, formatPrice } from '../store/settingsStore'
import type { Product } from '../types'

const tr = (lang: Language, o: Record<Language, string>) => o[lang]

type EditorState = { product: Product | null } | null

export function AdminPage() {
  const lang = useSettingsStore((s) => s.language)
  const reloadPublicMenu = useAppStore((s) => s.loadProducts)
  const allowed = isAdminUser()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string>('all')
  const [editor, setEditor] = useState<EditorState>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setProducts(await adminApi.list())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (allowed) void load()
  }, [allowed, load])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter((p) => {
      if (category !== 'all' && p.category !== category) return false
      if (!q) return true
      return [p.name, p.name_uz, p.name_ru, p.name_en].some((n) => n?.toLowerCase().includes(q))
    })
  }, [products, query, category])

  const upsertLocal = (saved: Product) => {
    setProducts((list) => {
      const idx = list.findIndex((p) => p.id === saved.id)
      if (idx === -1) return [saved, ...list]
      const copy = [...list]
      copy[idx] = saved
      return copy
    })
    void reloadPublicMenu()
  }

  const toggleAvailable = async (p: Product) => {
    const next = p.is_available === false
    upsertLocal({ ...p, is_available: next })
    try { WebApp.HapticFeedback.selectionChanged() } catch { /* ignore */ }
    try {
      upsertLocal(await adminApi.update(p.id, { is_available: next }))
    } catch (e) {
      upsertLocal(p)
      setError(e instanceof Error ? e.message : 'Update failed')
    }
  }

  if (!allowed) {
    return (
      <Layout hideNav>
        <PageHeader title="Admin" showBack />
        <section className="px-4">
          <div className="paper-card rounded-2xl p-8 text-center">
            <p className="mb-2 text-4xl">🔒</p>
            <p className="text-sm" style={{ color: 'var(--tg-theme-hint-color)' }}>
              {tr(lang, {
                uz: "Admin panel faqat Telegram ichida, ruxsat berilgan foydalanuvchilar uchun ochiladi.",
                ru: 'Админ-панель доступна только внутри Telegram для разрешённых пользователей.',
                en: 'The admin panel is only available inside Telegram for authorised users.',
              })}
            </p>
          </div>
        </section>
      </Layout>
    )
  }

  return (
    <Layout hideNav>
      <PageHeader
        title={tr(lang, { uz: 'Admin panel', ru: 'Админ-панель', en: 'Admin panel' })}
        subtitle={tr(lang, {
          uz: `${products.length} ta taom · menyuni boshqarish`,
          ru: `${products.length} блюд · управление меню`,
          en: `${products.length} dishes · manage menu`,
        })}
        showBack
      />

      <section className="space-y-3 px-4 pb-3">
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={() => setEditor({ product: null })}
          className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl text-base font-semibold shadow-md"
          style={{ background: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)' }}
        >
          ＋ {tr(lang, { uz: "Yangi taom qo'shish", ru: 'Добавить блюдо', en: 'Add new dish' })}
        </motion.button>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={tr(lang, { uz: '🔍 Qidirish...', ru: '🔍 Поиск...', en: '🔍 Search...' })}
          className="paper-input w-full rounded-xl px-4 py-3 text-base outline-none"
        />

        <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
          {[{ slug: 'all', icon: '📋', label: tr(lang, { uz: 'Hammasi', ru: 'Все', en: 'All' }) },
            ...CATEGORIES.map((c) => ({ slug: c.slug, icon: c.icon, label: getCategoryName(c, lang) }))].map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => setCategory(c.slug)}
              className="shrink-0 rounded-full px-3 py-1.5 text-xs font-medium"
              style={{
                background: category === c.slug ? 'var(--tg-theme-button-color)' : 'var(--tg-theme-secondary-bg-color)',
                color: category === c.slug ? 'var(--tg-theme-button-text-color)' : 'var(--tg-theme-text-color)',
              }}
            >
              {c.icon} {c.label}
            </button>
          ))}
        </div>

        {error && (
          <div
            className="flex items-center justify-between gap-2 rounded-xl p-3 text-sm"
            style={{ background: 'color-mix(in srgb, var(--tg-theme-destructive-text-color) 12%, transparent)', color: 'var(--tg-theme-destructive-text-color)' }}
          >
            <span>{error}</span>
            <button type="button" onClick={() => void load()} className="font-semibold underline">
              {tr(lang, { uz: 'Qayta', ru: 'Повторить', en: 'Retry' })}
            </button>
          </div>
        )}
      </section>

      <section className="space-y-2 px-4 pb-8">
        {loading && [1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl" style={{ background: 'var(--tg-theme-secondary-bg-color)' }} />
        ))}

        {!loading && visible.length === 0 && (
          <p className="paper-card rounded-2xl p-6 text-center text-sm" style={{ color: 'var(--tg-theme-hint-color)' }}>
            {tr(lang, { uz: 'Taomlar topilmadi', ru: 'Блюда не найдены', en: 'No dishes found' })}
          </p>
        )}

        {!loading && visible.map((p) => {
          const hidden = p.is_available === false
          return (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="paper-card flex items-center gap-3 rounded-2xl p-2 pr-3"
              style={{ opacity: hidden ? 0.6 : 1 }}
            >
              <button
                type="button"
                onClick={() => setEditor({ product: p })}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
              >
                <div
                  className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl"
                  style={{ background: 'var(--tg-theme-secondary-bg-color)' }}
                >
                  {p.image_url
                    ? <img src={p.image_url} alt="" className="h-full w-full object-cover" loading="lazy" />
                    : <span className="text-2xl">🍽️</span>}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold" style={{ color: 'var(--tg-theme-text-color)' }}>
                    {getProductName(p, lang)}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--tg-theme-hint-color)' }}>
                    {CATEGORIES.find((c) => c.slug === p.category)?.icon} {formatPrice(p.price)}
                  </p>
                  {hidden && (
                    <p className="text-[11px] font-medium" style={{ color: 'var(--tg-theme-destructive-text-color)' }}>
                      {tr(lang, { uz: 'Menyuda yashirilgan', ru: 'Скрыто из меню', en: 'Hidden from menu' })}
                    </p>
                  )}
                </div>
              </button>
              <button
                type="button"
                onClick={() => void toggleAvailable(p)}
                aria-label="toggle availability"
                className="relative h-7 w-12 shrink-0 rounded-full transition-colors"
                style={{ background: hidden ? 'var(--tg-theme-secondary-bg-color)' : 'var(--color-emerald)' }}
              >
                <span
                  className="absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all"
                  style={{ left: hidden ? 4 : 24 }}
                />
              </button>
            </motion.div>
          )
        })}
      </section>

      <AnimatePresence>
        {editor && (
          <ProductEditor
            key={editor.product?.id ?? 'new'}
            product={editor.product}
            onClose={() => setEditor(null)}
            onSaved={(saved) => { upsertLocal(saved); setEditor(null) }}
            onDeleted={(id) => {
              setProducts((list) => list.filter((p) => p.id !== id))
              void reloadPublicMenu()
              setEditor(null)
            }}
          />
        )}
      </AnimatePresence>
    </Layout>
  )
}
