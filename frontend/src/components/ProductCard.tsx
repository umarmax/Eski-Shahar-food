import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSettingsStore, formatPrice } from '../store/settingsStore'
import { useCartStore } from '../store/cartStore'
import { getProductName } from '../lib/i18n'
import { WebApp } from '../lib/telegram'
import type { Product } from '../types'

interface ProductCardProps {
  product: Product
  index?: number
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const lang = useSettingsStore((s) => s.language)
  const addItem = useCartStore((s) => s.addItem)

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product, 1)
    try { WebApp.HapticFeedback.impactOccurred('light') } catch {}
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        to={`/product/${product.id}`}
        className="glass-card block rounded-2xl p-3 active:opacity-90"
      >
        <div
          className="mb-3 flex h-28 items-center justify-center rounded-xl overflow-hidden"
          style={{ background: 'var(--tg-theme-secondary-bg-color)' }}
        >
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={getProductName(product, lang)}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <span className="text-4xl">🍽️</span>
          )}
        </div>
        <p
          className="mb-1 line-clamp-2 text-sm font-medium leading-snug"
          style={{ color: 'var(--tg-theme-text-color)' }}
        >
          {getProductName(product, lang)}
        </p>
        <div className="flex items-center justify-between">
          <p
            className="text-sm font-semibold"
            style={{ color: 'var(--tg-theme-accent-text-color)' }}
          >
            {formatPrice(product.price)}
          </p>
          <button
            type="button"
            onClick={handleQuickAdd}
            className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
            style={{ background: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)' }}
          >
            +
          </button>
        </div>
        {product.cook_time_minutes && (
          <p
            className="mt-1 text-xs"
            style={{ color: 'var(--tg-theme-hint-color)' }}
          >
            ⏱️ {product.cook_time_minutes} min
          </p>
        )}
      </Link>
    </motion.div>
  )
}
