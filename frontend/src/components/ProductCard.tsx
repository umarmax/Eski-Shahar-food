import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useSettingsStore, formatPrice } from '../store/settingsStore'
import { useCartStore } from '../store/cartStore'
import { getProductName, t } from '../lib/i18n'
import { WebApp } from '../lib/telegram'
import type { Product } from '../types'
import { PLACEHOLDER_FOOD_IMAGE } from '../config/business'

interface ProductCardProps {
  product: Product
  index?: number
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const lang = useSettingsStore((s) => s.language)
  const addItem = useCartStore((s) => s.addItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const quantity = useCartStore((s) => s.items.find((i) => i.id === product.id)?.quantity ?? 0)
  const name = getProductName(product, lang)

  const haptic = () => {
    try { WebApp.HapticFeedback.impactOccurred('light') } catch { /* ignore */ }
  }

  const add = () => { addItem(product, 1); haptic() }
  const change = (delta: number) => { updateQuantity(product.id, quantity + delta); haptic() }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 8) * 0.03 }}
      className="menu-card flex flex-col p-2"
    >
      <Link to={`/product/${product.id}`} className="block flex-1 active:opacity-90">
        <div className="menu-card__photo mb-2 flex aspect-square items-center justify-center overflow-hidden">
          <img
            src={product.image_url || PLACEHOLDER_FOOD_IMAGE}
            alt={name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="px-1">
          <p className="text-[17px] font-extrabold leading-tight" style={{ color: 'var(--tg-theme-accent-text-color)' }}>
            {formatPrice(product.price)}
          </p>
          <p className="mt-0.5 line-clamp-2 text-sm font-medium leading-snug" style={{ color: 'var(--tg-theme-text-color)' }}>
            {name}
          </p>
          {product.weight_grams ? (
            <p className="text-xs" style={{ color: 'var(--tg-theme-hint-color)' }}>
              {product.weight_grams} {t(lang, 'weight_unit')}
            </p>
          ) : null}
        </div>
      </Link>

      <div className="mt-3 h-11">
        <AnimatePresence mode="wait" initial={false}>
          {quantity === 0 ? (
            <motion.button
              key="add"
              type="button"
              onClick={add}
              whileTap={{ scale: 0.96 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-11 w-full items-center justify-center rounded-2xl text-xl font-medium"
              style={{ background: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)' }}
              aria-label={t(lang, 'add_to_cart')}
            >
              +
            </motion.button>
          ) : (
            <motion.div
              key="stepper"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-11 w-full items-center justify-between rounded-2xl px-1"
              style={{ background: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)' }}
            >
              <button type="button" onClick={() => change(-1)} className="h-10 w-10 text-xl" aria-label="−">−</button>
              <span className="text-base font-bold">{quantity}</span>
              <button type="button" onClick={() => change(1)} className="h-10 w-10 text-xl" aria-label="+">+</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
