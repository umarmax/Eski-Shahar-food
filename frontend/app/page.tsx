'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Clock, MapPin, Phone } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ProductCard } from '@/components/ui/ProductCard'
import { PageLoader } from '@/components/ui/Loading'
import { api } from '@/lib/api'
import { t, restaurantName } from '@/lib/i18n'
import { useAppStore } from '@/lib/store'
import type { Category, LocalizedProduct, RestaurantSettings } from '@/lib/types'

export default function HomePage() {
  const language = useAppStore((s) => s.language)
  const [products, setProducts] = useState<LocalizedProduct[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [settings, setSettings] = useState<RestaurantSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 400], [0, 120])

  useEffect(() => {
    Promise.all([
      api.getProducts(language, { popular: true }),
      api.getCategories(language),
      api.getSettings(),
    ])
      .then(([prods, cats, sett]) => {
        setProducts(prods.slice(0, 6))
        setCategories(cats)
        setSettings(sett)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [language])

  const specials = products.filter((p) => p.isSpecial)
  const chefPicks = products.filter((p) => p.isChefPick)

  if (loading) return <PageLoader />

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[85vh] min-h-[600px] overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1596040033229-a0b2c4a9388b?w=1400&q=80"
            alt="Uzbek table spread"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </motion.div>
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 ornament-pattern opacity-30" />

        <div className="relative h-full flex flex-col justify-end px-6 pb-16 max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {settings && (
              <p className="text-sand-light text-sm font-medium tracking-widest uppercase mb-3">
                {restaurantName(settings, language)}
              </p>
            )}
            <h1 className="font-serif text-4xl md:text-5xl text-white leading-[1.1] text-balance mb-4">
              {t(language, 'hero.title')}
            </h1>
            <p className="text-white/80 text-lg mb-8 max-w-sm">
              {t(language, 'hero.subtitle')}
            </p>
            <div className="flex gap-3">
              <Link href="/menu">
                <Button variant="secondary" size="lg">
                  {t(language, 'hero.orderNow')}
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/menu">
                <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                  {t(language, 'hero.browseMenu')}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Status bar */}
      {settings && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-4 -mt-8 relative z-10"
        >
          <div className="glass rounded-[20px] p-4 shadow-lift flex flex-wrap gap-4 justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${settings.isOpen ? 'bg-emerald animate-pulse' : 'bg-red-400'}`} />
              <span className="text-sm font-medium">
                {settings.isOpen ? t(language, 'hours.open') : t(language, 'hours.closed')}
              </span>
              <span className="text-text-muted text-sm">{settings.openTime} – {settings.closeTime}</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-text-muted">
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> ~45 {t(language, 'common.min')}</span>
              <a href={`tel:${settings.phone}`} className="flex items-center gap-1 hover:text-walnut">
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>
        </motion.section>
      )}

      {/* Categories */}
      <section className="px-4 py-10">
        <h2 className="font-serif text-2xl mb-5">{t(language, 'menu.title')}</h2>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 -mx-4 px-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={`/menu?category=${cat.slug}`}
                className="flex flex-col items-center gap-2 min-w-[80px] group"
              >
                <div className="w-16 h-16 rounded-[18px] bg-card shadow-soft flex items-center justify-center text-2xl group-hover:shadow-lift group-hover:-translate-y-1 transition-all duration-300">
                  {cat.emoji}
                </div>
                <span className="text-xs font-medium text-center text-text-muted group-hover:text-walnut transition-colors">
                  {cat.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Chef picks */}
      {chefPicks.length > 0 && (
        <section className="px-4 py-6 gradient-sunset rounded-t-[32px]">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif text-2xl">{t(language, 'chef.title')}</h2>
            <Link href="/menu?chefPick=true" className="text-walnut text-sm font-medium">→</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {chefPicks.slice(0, 2).map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Popular */}
      <section className="px-4 py-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif text-2xl">{t(language, 'popular.title')}</h2>
          <Link href="/menu?popular=true" className="text-walnut text-sm font-medium">→</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>

      {/* Location */}
      {settings && (
        <section className="px-4 pb-10">
          <div className="bg-card rounded-[24px] p-6 shadow-soft">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-emerald mt-0.5 shrink-0" />
              <div>
                <h3 className="font-serif text-xl mb-1">{restaurantName(settings, language)}</h3>
                <p className="text-text-muted text-sm">{settings.address}</p>
                <a href={`tel:${settings.phone}`} className="text-walnut text-sm font-medium mt-2 inline-block">
                  {settings.phone}
                </a>
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
