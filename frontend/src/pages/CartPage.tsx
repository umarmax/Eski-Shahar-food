import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Layout } from '../components/Layout'
import { PageHeader } from '../components/PageHeader'
import { WebApp } from '../lib/telegram'
import { useCartStore } from '../store/cartStore'
import { useAppStore } from '../store/appStore'
import { useSettingsStore, formatPrice } from '../store/settingsStore'
import { t, getProductName } from '../lib/i18n'
import type { Product } from '../types'

const ADD_MORE_CATEGORIES = ['salads', 'drinks', 'desserts', 'bread']

export function CartPage() {
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const totalPrice = useCartStore((s) => s.totalPrice())
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const addItem = useCartStore((s) => s.addItem)
  const { products, loadProducts } = useAppStore()
  const lang = useSettingsStore((s) => s.language)

  const [addMoreProducts, setAddMoreProducts] = useState<Product[]>([])

  useEffect(() => {
    if (products.length === 0) {
      loadProducts()
    }
  }, [])

  useEffect(() => {
    if (products.length > 0) {
      const extras = products.filter(p => ADD_MORE_CATEGORIES.includes(p.category))
      setAddMoreProducts(extras)
    }
  }, [products])

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, Record<string, string>> = {
      salads: { uz: '🥗 Salatlar', ru: '🥗 Салаты' },
      drinks: { uz: '🥤 Ichimliklar', ru: '🥤 Напитки' },
      desserts: { uz: '🍰 Desertlar', ru: '🍰 Десерты' },
      bread: { uz: '🫓 Non va somsa', ru: '🫓 Хлеб и самса' },
    }
    return labels[cat]?.[lang] || labels[cat]?.['ru'] || cat
  }

  return (
    <Layout>
      <PageHeader
        title={t(lang, 'cart_title')}
        subtitle={
          items.length > 0
            ? `${items.length} ${t(lang, 'items_count')} · ${formatPrice(totalPrice)}`
            : t(lang, 'cart_empty')
        }
      />

      {items.length === 0 ? (
        <section className="px-4 pb-6">
          <div className="rounded-2xl p-8 text-center" style={{ background: 'var(--tg-theme-secondary-bg-color)' }}>
            <p className="mb-2 text-4xl">🛒</p>
            <p className="mb-4 text-sm" style={{ color: 'var(--tg-theme-hint-color)' }}>
              {t(lang, 'cart_empty_text')}
            </p>
            <Link
              to="/menu"
              className="inline-flex min-h-[44px] items-center rounded-xl px-5 text-sm font-semibold"
              style={{ background: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)' }}
            >
              {t(lang, 'go_to_menu')}
            </Link>
          </div>
        </section>
      ) : (
        <>
          <section className="space-y-3 px-4">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 }}
                className="glass-card rounded-2xl p-4"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <Link
                      to={`/product/${item.productId}`}
                      className="text-sm font-semibold"
                      style={{ color: 'var(--tg-theme-text-color)' }}
                    >
                      {getProductName(item.product, lang)}
                    </Link>
                  </div>
                  <p className="shrink-0 text-sm font-semibold" style={{ color: 'var(--tg-theme-accent-text-color)' }}>
                    {formatPrice(item.product.price * item.quantity)}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        updateQuantity(item.id, item.quantity - 1)
                        try { WebApp.HapticFeedback.selectionChanged() } catch {}
                      }}
                      className="flex h-11 w-11 items-center justify-center rounded-xl text-lg"
                      style={{ background: 'var(--tg-theme-secondary-bg-color)' }}
                    >
                      −
                    </button>
                    <span className="min-w-[24px] text-center text-sm font-medium" style={{ color: 'var(--tg-theme-text-color)' }}>
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        updateQuantity(item.id, item.quantity + 1)
                        try { WebApp.HapticFeedback.selectionChanged() } catch {}
                      }}
                      className="flex h-11 w-11 items-center justify-center rounded-xl text-lg"
                      style={{ background: 'var(--tg-theme-secondary-bg-color)' }}
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-xs font-medium"
                    style={{ color: 'var(--tg-theme-destructive-text-color)' }}
                  >
                    ✕
                  </button>
                </div>
              </motion.div>
            ))}
          </section>

          {/* Add more section */}
          {addMoreProducts.length > 0 && (
            <section className="px-4 pt-4">
              <h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--tg-theme-text-color)' }}>
                {lang === 'uz' ? 'Buyurtmangizga qo\'shing' : 'Добавить к заказу'}
              </h3>
              {ADD_MORE_CATEGORIES.map(cat => {
                const catProducts = addMoreProducts.filter(p => p.category === cat)
                if (catProducts.length === 0) return null
                return (
                  <div key={cat} className="mb-3">
                    <p className="text-xs font-medium mb-2" style={{ color: 'var(--tg-theme-hint-color)' }}>
                      {getCategoryLabel(cat)}
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                      {catProducts.map(product => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => {
                            addItem(product, 1)
                            try { WebApp.HapticFeedback.impactOccurred('light') } catch {}
                          }}
                          className="flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium"
                          style={{ background: 'var(--tg-theme-secondary-bg-color)', color: 'var(--tg-theme-text-color)' }}
                        >
                          <span className="truncate max-w-[100px]">{getProductName(product, lang)}</span>
                          <span style={{ color: 'var(--tg-theme-hint-color)' }}>{formatPrice(product.price)}</span>
                          <span style={{ color: 'var(--tg-theme-accent-text-color)' }}>+</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </section>
          )}

          <section className="px-4 py-6">
            <div
              className="glass-card rounded-2xl p-4"
              style={{ borderColor: 'color-mix(in srgb, var(--tg-theme-accent-text-color) 20%, transparent)' }}
            >
              <div className="mb-2 flex justify-between text-sm">
                <span style={{ color: 'var(--tg-theme-hint-color)' }}>{t(lang, 'free_delivery')}</span>
                <span style={{ color: 'var(--tg-theme-accent-text-color)' }}>0</span>
              </div>
              <div className="flex justify-between text-base font-semibold">
                <span style={{ color: 'var(--tg-theme-text-color)' }}>{t(lang, 'total')}</span>
                <span style={{ color: 'var(--tg-theme-text-color)' }}>{formatPrice(totalPrice)}</span>
              </div>
            </div>
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                try { WebApp.HapticFeedback.impactOccurred('medium') } catch {}
                navigate('/order')
              }}
              className="mt-4 flex min-h-[52px] w-full items-center justify-center rounded-2xl text-base font-semibold"
              style={{
                background: 'var(--tg-theme-button-color)',
                color: 'var(--tg-theme-button-text-color)',
              }}
            >
              {t(lang, 'checkout_btn')} · {formatPrice(totalPrice)}
            </motion.button>
          </section>
        </>
      )}
    </Layout>
  )
}
