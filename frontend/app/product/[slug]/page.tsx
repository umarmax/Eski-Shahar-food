'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowLeft, Clock, Flame, Heart, Leaf, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ProductCard, QuantitySelector } from '@/components/ui/ProductCard'
import { PageLoader } from '@/components/ui/Loading'
import { api, formatPrice } from '@/lib/api'
import { t } from '@/lib/i18n'
import { useAppStore } from '@/lib/store'
import { useTelegram } from '@/components/providers/TelegramProvider'
import type { LocalizedProduct } from '@/lib/types'

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const language = useAppStore((s) => s.language)
  const addToCart = useAppStore((s) => s.addToCart)
  const favorites = useAppStore((s) => s.favorites)
  const toggleFavorite = useAppStore((s) => s.toggleFavorite)
  const { haptic } = useTelegram()
  const [product, setProduct] = useState<LocalizedProduct | null>(null)
  const [related, setRelated] = useState<LocalizedProduct[]>([])
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    api.getProduct(slug, language)
      .then(({ product: p, related: r }) => {
        setProduct(p)
        setRelated(r)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [slug, language])

  if (loading || !product) return <PageLoader />

  const images = [product.imageUrl, ...product.galleryUrls].filter(Boolean)
  const isFav = favorites.has(product.id)

  return (
    <main className="min-h-screen pb-32">
      {/* Gallery */}
      <div className="relative">
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full glass flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => { toggleFavorite(product.id); haptic('light') }}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full glass flex items-center justify-center"
        >
          <Heart className={`w-5 h-5 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
        </button>

        <div className="relative aspect-square">
          <Image src={images[activeImage]} alt={product.name} fill className="object-cover" priority />
        </div>

        {images.length > 1 && (
          <div className="flex gap-2 px-4 py-3 overflow-x-auto hide-scrollbar">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`relative w-16 h-16 rounded-xl overflow-hidden shrink-0 ${
                  activeImage === i ? 'ring-2 ring-walnut' : 'opacity-60'
                }`}
              >
                <Image src={img} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 pt-6 space-y-6 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-start justify-between gap-4">
            <h1 className="font-serif text-3xl leading-tight">{product.name}</h1>
            <span className="font-semibold text-xl text-walnut shrink-0">
              {formatPrice(product.price, language)}
            </span>
          </div>
          <p className="text-text-muted mt-3 leading-relaxed">{product.description}</p>

          <div className="flex flex-wrap gap-2 mt-4">
            {product.isSpicy && (
              <span className="flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-xs">
                <Flame className="w-3 h-3" /> {t(language, 'filter.spicy')}
              </span>
            )}
            {product.isVegetarian && (
              <span className="flex items-center gap-1 px-3 py-1 bg-emerald/10 text-emerald rounded-full text-xs">
                <Leaf className="w-3 h-3" /> {t(language, 'filter.vegetarian')}
              </span>
            )}
          </div>
        </motion.div>

        {/* Details */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: t(language, 'product.weight'), value: product.weight },
            { label: t(language, 'product.nutrition'), value: `${product.calories} ${t(language, 'product.calories')}` },
            { label: t(language, 'product.cookingTime'), value: `${product.cookingTime} ${t(language, 'common.min')}`, icon: Clock },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-card rounded-[18px] p-3 shadow-soft text-center">
              {Icon && <Icon className="w-4 h-4 mx-auto text-walnut mb-1" />}
              <p className="text-xs text-text-muted">{label}</p>
              <p className="font-medium text-sm mt-0.5">{value}</p>
            </div>
          ))}
        </div>

        <div className="bg-card rounded-[20px] p-5 shadow-soft">
          <h3 className="font-medium mb-2">{t(language, 'product.ingredients')}</h3>
          <p className="text-text-muted text-sm leading-relaxed">{product.ingredients}</p>
        </div>

        {/* Reviews placeholder */}
        <div>
          <h3 className="font-serif text-xl mb-3 flex items-center gap-2">
            <Star className="w-5 h-5 text-sand fill-sand" />
            {t(language, 'product.reviews')}
          </h3>
          <div className="bg-card rounded-[18px] p-4 shadow-soft text-text-muted text-sm">
            ★★★★★ — 4.9
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div>
            <h3 className="font-serif text-xl mb-4">{t(language, 'product.recommended')}</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        )}
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-30 glass safe-bottom">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <QuantitySelector quantity={quantity} onChange={setQuantity} />
          <Button
            variant="emerald"
            size="lg"
            fullWidth
            onClick={() => {
              addToCart(product, quantity)
              haptic('success')
            }}
          >
            {t(language, 'product.addToCart')} — {formatPrice(product.price * quantity, language)}
          </Button>
        </div>
      </div>
    </main>
  )
}
