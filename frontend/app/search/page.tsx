'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { ProductCard } from '@/components/ui/ProductCard'
import { PageLoader } from '@/components/ui/Loading'
import { api } from '@/lib/api'
import { t } from '@/lib/i18n'
import { useAppStore } from '@/lib/store'
import type { LocalizedProduct } from '@/lib/types'

export default function SearchPage() {
  const language = useAppStore((s) => s.language)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<LocalizedProduct[]>([])
  const [popular, setPopular] = useState<LocalizedProduct[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.getProducts(language, { popular: true }).then((p) => setPopular(p.slice(0, 6))).catch(console.error)
  }, [language])

  const search = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        setResults([])
        return
      }
      setLoading(true)
      try {
        const products = await api.getProducts(language, { search: q })
        setResults(products)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    },
    [language]
  )

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300)
    return () => clearTimeout(timer)
  }, [query, search])

  return (
    <main className="min-h-screen px-4 pt-6 pb-8 max-w-2xl mx-auto">
      <h1 className="font-serif text-3xl mb-6">{t(language, 'nav.search')}</h1>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t(language, 'search.placeholder')}
          className="w-full pl-12 pr-10 py-4 bg-card rounded-[20px] shadow-soft text-base outline-none focus:ring-2 focus:ring-walnut/20 transition-shadow"
          autoFocus
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2">
            <X className="w-5 h-5 text-text-muted" />
          </button>
        )}
      </div>

      {loading && <PageLoader />}

      {!loading && query && results.length === 0 && (
        <p className="text-center text-text-muted py-8">—</p>
      )}

      {!loading && results.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-4 sm:grid-cols-2">
          {results.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </motion.div>
      )}

      {!query && (
        <section>
          <h2 className="font-serif text-xl mb-4">{t(language, 'search.popular')}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {popular.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}
    </main>
  )
}
