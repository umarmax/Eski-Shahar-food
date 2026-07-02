import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Layout } from '../components/Layout'
import { useAppStore } from '../store/appStore'
import { useCartStore } from '../store/cartStore'
import { useSettingsStore, formatPrice } from '../store/settingsStore'
import { t, getProductName, getProductDescription } from '../lib/i18n'
import { WebApp } from '../lib/telegram'
import type { Product } from '../types'

export function ProductPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getProductById } = useAppStore()
  const addItem = useCartStore((s) => s.addItem)
  const lang = useSettingsStore((s) => s.language)

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    if (!id) return

    async function load() {
      setLoading(true)
      const data = await getProductById(id!)
      setProduct(data)
      setLoading(false)
    }

    void load()
  }, [id, getProductById])

  const handleAddToCart = () => {
    if (!product) return

    addItem(product, quantity)
    try { WebApp.HapticFeedback.notificationOccurred('success') } catch {}
    navigate('/menu')
  }

  if (loading) {
    return (
      <Layout hideNav>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-4xl animate-pulse">🍽️</div>
        </div>
      </Layout>
    )
  }

  if (!product) {
    return (
      <Layout hideNav>
        <div className="flex min-h-screen flex-col items-center justify-center p-6">
          <div className="text-4xl mb-4">😔</div>
          <p style={{ color: 'var(--tg-theme-hint-color)' }}>Product not found</p>
          <button
            type="button"
            onClick={() => navigate('/menu')}
            className="mt-4 rounded-xl px-6 py-3 text-sm font-semibold"
            style={{ background: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)' }}
          >
            {t(lang, 'go_to_menu')}
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout hideNav>
      {/* Back button */}
      <div className="px-4 pt-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full"
          style={{ background: 'var(--tg-theme-secondary-bg-color)' }}
        >
          ←
        </button>
      </div>

      {/* Product image */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-4 mt-4 h-56 rounded-2xl overflow-hidden"
        style={{ background: 'var(--tg-theme-secondary-bg-color)' }}
      >
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={getProductName(product, lang)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-6xl">🍽️</div>
        )}
      </motion.div>

      {/* Product info */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="px-4 pt-6"
      >
        <h1
          className="text-2xl font-bold mb-2"
          style={{ color: 'var(--tg-theme-text-color)' }}
        >
          {getProductName(product, lang)}
        </h1>

        <p
          className="text-2xl font-bold mb-4"
          style={{ color: 'var(--tg-theme-accent-text-color)' }}
        >
          {formatPrice(product.price)}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {product.is_vegetarian && (
            <span
              className="rounded-full px-3 py-1 text-xs font-medium"
              style={{ background: 'var(--tg-theme-secondary-bg-color)', color: 'var(--tg-theme-text-color)' }}
            >
              {t(lang, 'vegetarian')}
            </span>
          )}
          {product.is_spicy && (
            <span
              className="rounded-full px-3 py-1 text-xs font-medium"
              style={{ background: 'var(--tg-theme-secondary-bg-color)', color: 'var(--tg-theme-text-color)' }}
            >
              {t(lang, 'spicy')}
            </span>
          )}
          {product.cook_time_minutes && (
            <span
              className="rounded-full px-3 py-1 text-xs font-medium"
              style={{ background: 'var(--tg-theme-secondary-bg-color)', color: 'var(--tg-theme-text-color)' }}
            >
              {t(lang, 'cook_time')} {product.cook_time_minutes} {t(lang, 'minutes')}
            </span>
          )}
          {product.calories && (
            <span
              className="rounded-full px-3 py-1 text-xs font-medium"
              style={{ background: 'var(--tg-theme-secondary-bg-color)', color: 'var(--tg-theme-text-color)' }}
            >
              {product.calories} {t(lang, 'calories')}
            </span>
          )}
        </div>

        {/* Description */}
        {getProductDescription(product, lang) && (
          <p
            className="text-sm leading-relaxed mb-6"
            style={{ color: 'var(--tg-theme-hint-color)' }}
          >
            {getProductDescription(product, lang)}
          </p>
        )}

        {/* Quantity selector */}
        <div className="flex items-center justify-between mb-6">
          <span style={{ color: 'var(--tg-theme-text-color)' }}>Quantity</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-lg"
              style={{ background: 'var(--tg-theme-secondary-bg-color)' }}
            >
              −
            </button>
            <span
              className="min-w-[32px] text-center text-lg font-semibold"
              style={{ color: 'var(--tg-theme-text-color)' }}
            >
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-lg"
              style={{ background: 'var(--tg-theme-secondary-bg-color)' }}
            >
              +
            </button>
          </div>
        </div>

        {/* Add to cart button */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={handleAddToCart}
          className="flex min-h-[52px] w-full items-center justify-center rounded-2xl text-base font-semibold mb-6"
          style={{
            background: 'var(--tg-theme-button-color)',
            color: 'var(--tg-theme-button-text-color)',
          }}
        >
          {t(lang, 'add_to_cart')} · {formatPrice(product.price * quantity)}
        </motion.button>
      </motion.div>
    </Layout>
  )
}
