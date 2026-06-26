'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, Minus, Plus, Clock, Flame, Leaf } from 'lucide-react'
import type { LocalizedProduct } from '@/lib/types'
import { formatPrice } from '@/lib/api'
import { useAppStore } from '@/lib/store'
import { useTelegram } from '@/components/providers/TelegramProvider'
import { t } from '@/lib/i18n'

interface ProductCardProps {
  product: LocalizedProduct
  index?: number
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const language = useAppStore((s) => s.language)
  const addToCart = useAppStore((s) => s.addToCart)
  const favorites = useAppStore((s) => s.favorites)
  const toggleFavorite = useAppStore((s) => s.toggleFavorite)
  const { haptic } = useTelegram()
  const isFav = favorites.has(product.id)

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -6 }}
      className="group bg-card rounded-[20px] overflow-hidden shadow-soft hover:shadow-lift transition-shadow duration-300"
    >
      <Link href={`/product/${product.slug}`} className="block relative aspect-[4/3] overflow-hidden">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 400px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-3 left-3 flex gap-1.5">
          {product.isPopular && (
            <span className="px-2.5 py-1 bg-sand text-text text-xs font-medium rounded-full">★</span>
          )}
          {product.isChefPick && (
            <span className="px-2.5 py-1 bg-emerald text-white text-xs font-medium rounded-full">Chef</span>
          )}
          {product.isSpicy && <Flame className="w-5 h-5 text-orange-400 drop-shadow" />}
          {product.isVegetarian && <Leaf className="w-5 h-5 text-emerald drop-shadow" />}
        </div>
        <button
          onClick={(e) => {
            e.preventDefault()
            toggleFavorite(product.id)
            haptic('light')
          }}
          className="absolute top-3 right-3 w-9 h-9 rounded-full glass flex items-center justify-center"
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : 'text-text'}`} />
        </button>
      </Link>

      <div className="p-4 space-y-3">
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-serif text-xl text-text leading-tight">{product.name}</h3>
          <p className="text-text-muted text-sm line-clamp-2 mt-1">{product.description}</p>
        </Link>

        <div className="flex flex-wrap gap-2 text-xs text-text-muted">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> {product.cookingTime} {t(language, 'common.min')}
          </span>
          <span>{product.weight}</span>
          <span>{product.calories} {t(language, 'product.calories')}</span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="font-semibold text-lg text-walnut">{formatPrice(product.price, language)}</span>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              addToCart(product)
              haptic('success')
            }}
            className="w-10 h-10 rounded-full bg-emerald text-white flex items-center justify-center shadow-soft"
          >
            <Plus className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.article>
  )
}

export function QuantitySelector({
  quantity,
  onChange,
  size = 'md',
}: {
  quantity: number
  onChange: (q: number) => void
  size?: 'sm' | 'md'
}) {
  const { haptic } = useTelegram()
  const btn = size === 'sm' ? 'w-7 h-7' : 'w-9 h-9'
  const icon = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'

  return (
    <div className="flex items-center gap-2 bg-cream rounded-full p-1">
      <button
        onClick={() => { onChange(quantity - 1); haptic('light') }}
        className={`${btn} rounded-full bg-white shadow-soft flex items-center justify-center`}
      >
        <Minus className={icon} />
      </button>
      <span className="w-6 text-center font-medium">{quantity}</span>
      <button
        onClick={() => { onChange(quantity + 1); haptic('light') }}
        className={`${btn} rounded-full bg-walnut text-white flex items-center justify-center`}
      >
        <Plus className={icon} />
      </button>
    </div>
  )
}
