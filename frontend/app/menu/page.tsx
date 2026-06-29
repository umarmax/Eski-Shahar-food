'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { SlidersHorizontal, X } from 'lucide-react'
import { ProductCard } from '@/components/ui/ProductCard'
import { PageLoader, SkeletonCard } from '@/components/ui/Loading'
import { api } from '@/lib/api'
import { t } from '@/lib/i18n'
import { useAppStore } from '@/lib/store'
import type { Category, LocalizedProduct, ProductFilters } from '@/lib/types'

function MenuContent() {
  const language = useAppStore((s) => s.language)
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<LocalizedProduct[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<ProductFilters>({
    category: searchParams.get('category') || undefined,
    popular: searchParams.get('popular') === 'true' || undefined,
    chefPick: searchParams.get('chefPick') === 'true' || undefined,
  })

  useEffect(() => {
    api.getCategories(language).then(setCategories).catch(console.error)
  }, [language])

  useEffect(() => {
    setLoading(true)
    api.getProducts(language, filters)
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [language, filters])

  const toggleFilter = (key: keyof ProductFilters) => {
    setFilters((f) => ({ ...f, [key]: f[key] ? undefined : true }))
  }

  return (
    <main className="min-h-screen px-4 pt-6 pb-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl">{t(language, 'menu.title')}</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-10 h-10 rounded-full bg-card shadow-soft flex items-center justify-center"
        >
          <SlidersHorizontal className="w-5 h-5 text-walnut" />
        </button>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-4 -mx-4 px-4">
        <button
          onClick={() => setFilters((f) => ({ ...f, category: undefined }))}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !filters.category ? 'bg-walnut text-white' : 'bg-card text-text-muted shadow-soft'
          }`}
        >
          {t(language, 'menu.all')}
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilters((f) => ({ ...f, category: cat.slug }))}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
              filters.category === cat.slug ? 'bg-walnut text-white' : 'bg-card text-text-muted shadow-soft'
            }`}
          >
            <span>{cat.emoji}</span> {cat.name}
          </button>
        ))}
      </div>

      {/* Filters panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="bg-card rounded-[20px] p-4 shadow-soft space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">{t(language, 'menu.filters')}</span>
                <button onClick={() => setShowFilters(false)}><X className="w-4 h-4" /></button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(['vegetarian', 'spicy', 'popular', 'chefPick'] as const).map((key) => (
                  <button
                    key={key}
                    onClick={() => toggleFilter(key)}
                    className={`px-3 py-1.5 rounded-full text-sm ${
                      filters[key] ? 'bg-emerald text-white' : 'bg-cream text-text-muted'
                    }`}
                  >
                    {t(language, `filter.${key === 'chefPick' ? 'chefPick' : key}` as 'filter.vegetarian')}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-text-muted">{t(language, 'filter.price')} min</label>
                  <input
                    type="number"
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-cream border-0 text-sm"
                    placeholder="0"
                    onChange={(e) => setFilters((f) => ({ ...f, minPrice: Number(e.target.value) || undefined }))}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-text-muted">{t(language, 'filter.price')} max</label>
                  <input
                    type="number"
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-cream border-0 text-sm"
                    placeholder="100000"
                    onChange={(e) => setFilters((f) => ({ ...f, maxPrice: Number(e.target.value) || undefined }))}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}

      {!loading && products.length === 0 && (
        <p className="text-center text-text-muted py-12">—</p>
      )}
    </main>
  )
}

export default function MenuPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <MenuContent />
    </Suspense>
  )
}
