import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Layout } from '../components/Layout'
import { ProductCard } from '../components/ProductCard'
import { HomeHeader } from '../components/home/HomeHeader'
import { ArrowUpIcon } from '../components/icons'
import { CATEGORIES, getCategoryName } from '../data/categories'
import { t } from '../lib/i18n'
import { useAppStore } from '../store/appStore'
import { useSettingsStore } from '../store/settingsStore'
import type { Category, Product } from '../types'

interface Section {
  category: Category
  products: Product[]
}

export function HomePage() {
  const lang = useSettingsStore((s) => s.language)
  const { products, productsLoading, loadProducts } = useAppStore()
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    if (products.length === 0) void loadProducts()
  }, [products.length, loadProducts])

  const sections = useMemo<Section[]>(
    () =>
      CATEGORIES.map((category) => ({
        category,
        products: products.filter((p) => p.category === category.slug),
      })).filter((s) => s.products.length > 0),
    [products],
  )

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 700)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <Layout>
      <HomeHeader />

      {productsLoading && sections.length === 0 && (
        <div className="grid grid-cols-2 gap-3 px-4 pt-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-[22px]" style={{ background: 'var(--card-frame)' }} />
          ))}
        </div>
      )}

      {sections.map(({ category, products: items }) => (
        <section
          key={category.slug}
          id={`section-${category.slug}`}
          className="px-4 pt-5"
        >
          <h2 className="mb-3 text-[26px] font-extrabold" style={{ color: 'var(--tg-theme-text-color)' }}>
            {getCategoryName(category, lang)}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      ))}

      <div className="h-6" />

      <AnimatePresence>
        {showTop && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-lg"
            style={{
              left: 'max(16px, calc(50% - 224px + 16px))',
              bottom: 'calc(var(--app-safe-bottom) + 96px)',
              background: 'var(--tg-theme-button-color)',
              color: 'var(--tg-theme-button-text-color)',
            }}
            aria-label={t(lang, 'back_to_top')}
          >
            <ArrowUpIcon size={26} strokeWidth={2.5} />
          </motion.button>
        )}
      </AnimatePresence>

    </Layout>
  )
}
