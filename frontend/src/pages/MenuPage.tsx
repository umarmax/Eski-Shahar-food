import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CATEGORIES, getCategoryName } from '../data/categories'
import { Layout } from '../components/Layout'
import { PageHeader } from '../components/PageHeader'
import { ProductCard } from '../components/ProductCard'
import { useAppStore } from '../store/appStore'
import { useSettingsStore } from '../store/settingsStore'
import { t } from '../lib/i18n'

export function MenuPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeCategory = searchParams.get('category') ?? 'all'
  const lang = useSettingsStore((s) => s.language)

  const { products, loadProducts, loadProductsByCategory, productsLoading } = useAppStore()

  const [filtered, setFiltered] = useState(products)
  const [loading, setLoading] = useState(true)

  const categoryMeta = useMemo(
    () => CATEGORIES.find((c) => c.slug === activeCategory),
    [activeCategory],
  )

  useEffect(() => {
    void loadProducts()
  }, [loadProducts])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      if (activeCategory === 'all') {
        if (!cancelled) { setFiltered(products); setLoading(false) }
        return
      }
      const data = await loadProductsByCategory(activeCategory)
      if (!cancelled) { setFiltered(data); setLoading(false) }
    }

    void load()
    return () => { cancelled = true }
  }, [activeCategory, products, loadProductsByCategory])

  const selectCategory = (slug: string) => {
    if (slug === 'all') setSearchParams({})
    else setSearchParams({ category: slug })
  }

  const isLoading = loading || productsLoading

  const catTitle = categoryMeta
    ? getCategoryName(categoryMeta, lang)
    : t(lang, 'menu_title')

  return (
    <Layout>
      <PageHeader title={catTitle} subtitle={t(lang, 'menu_subtitle')} showBack />

      <section className="px-4 pb-4">
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          <button
            type="button"
            onClick={() => selectCategory('all')}
            className="shrink-0 rounded-full px-4 py-2 text-xs font-medium"
            style={{
              background: activeCategory === 'all' ? 'var(--tg-theme-button-color)' : 'var(--tg-theme-secondary-bg-color)',
              color: activeCategory === 'all' ? 'var(--tg-theme-button-text-color)' : 'var(--tg-theme-text-color)',
            }}
          >
            {t(lang, 'cat_all')}
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              onClick={() => selectCategory(cat.slug)}
              className="shrink-0 rounded-full px-4 py-2 text-xs font-medium"
              style={{
                background: activeCategory === cat.slug ? 'var(--tg-theme-button-color)' : 'var(--tg-theme-secondary-bg-color)',
                color: activeCategory === cat.slug ? 'var(--tg-theme-button-text-color)' : 'var(--tg-theme-text-color)',
              }}
            >
              {cat.icon} {getCategoryName(cat, lang)}
            </button>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 px-4 pb-6">
        {isLoading && [1, 2, 3, 4].map((i) => (
          <div key={i} className="h-48 animate-pulse rounded-2xl" style={{ background: 'var(--tg-theme-secondary-bg-color)' }} />
        ))}

        {!isLoading && filtered.length === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-2 rounded-2xl p-6 text-center text-sm"
            style={{ background: 'var(--tg-theme-secondary-bg-color)', color: 'var(--tg-theme-hint-color)' }}
          >
            {t(lang, 'no_products')}
          </motion.p>
        )}

        {!isLoading && filtered.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </section>
    </Layout>
  )
}
