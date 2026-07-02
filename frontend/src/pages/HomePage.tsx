import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CategoryList } from '../components/CategoryList'
import { HeroSection } from '../components/HeroSection'
import { Layout } from '../components/Layout'
import { USPBanners } from '../components/USPBanners'
import { useAppStore } from '../store/appStore'
import { useSettingsStore, formatPrice } from '../store/settingsStore'
import { t, LANGUAGES, getProductName } from '../lib/i18n'
import { WebApp } from '../lib/telegram'
import type { Category } from '../types'

function ProductsPreview() {
  const { products, productsLoading, loadProducts } = useAppStore()
  const lang = useSettingsStore((s) => s.language)

  useEffect(() => {
    void loadProducts()
  }, [loadProducts])

  if (productsLoading) {
    return (
      <section className="px-4 pb-6">
        <div className="flex gap-3 overflow-x-auto pb-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 w-36 shrink-0 animate-pulse rounded-2xl"
              style={{ background: 'var(--tg-theme-secondary-bg-color)' }}
            />
          ))}
        </div>
      </section>
    )
  }

  if (products.length === 0) return null

  return (
    <section className="px-4 pb-6">
      <div className="mb-3 flex items-end justify-between">
        <h2
          className="text-lg font-semibold"
          style={{ color: 'var(--tg-theme-text-color)' }}
        >
          {t(lang, 'popular')}
        </h2>
        <Link
          to="/menu"
          className="text-xs font-medium"
          style={{ color: 'var(--tg-theme-link-color)' }}
        >
          {t(lang, 'all')}
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1 hide-scrollbar">
        {products.slice(0, 6).map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + index * 0.05 }}
          >
            <Link
              to={`/product/${product.id}`}
              className="glass-card block w-36 shrink-0 rounded-2xl p-3 active:opacity-90"
            >
              <div
                className="mb-2 flex h-16 items-center justify-center rounded-xl overflow-hidden"
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
                  <span className="text-3xl">🍽️</span>
                )}
              </div>
              <p
                className="mb-1 line-clamp-2 text-xs font-medium leading-snug"
                style={{ color: 'var(--tg-theme-text-color)' }}
              >
                {getProductName(product, lang)}
              </p>
              <p
                className="text-xs font-semibold"
                style={{ color: 'var(--tg-theme-accent-text-color)' }}
              >
                {formatPrice(product.price)}
              </p>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

function ThemeSwitcher() {
  const { theme, setTheme } = useSettingsStore()
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex h-9 w-9 items-center justify-center rounded-xl"
      style={{
        background: 'color-mix(in srgb, var(--tg-theme-secondary-bg-color) 80%, transparent)',
        color: 'var(--tg-theme-text-color)',
      }}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  )
}

function LanguagePicker() {
  const { language, setLanguage } = useSettingsStore()
  const [open, setOpen] = useState(false)
  const current = LANGUAGES.find((l) => l.code === language)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 items-center gap-1 rounded-xl px-3 text-sm font-medium"
        style={{
          background: 'color-mix(in srgb, var(--tg-theme-secondary-bg-color) 80%, transparent)',
          color: 'var(--tg-theme-text-color)',
        }}
      >
        <span>{current?.flag}</span>
        <span className="text-xs">{current?.code.toUpperCase()}</span>
        <span className="text-xs" style={{ color: 'var(--tg-theme-hint-color)' }}>▾</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-11 z-50 rounded-2xl p-2 shadow-lg"
            style={{ background: 'var(--tg-theme-secondary-bg-color)', minWidth: '140px' }}
          >
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => { setLanguage(lang.code); setOpen(false) }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium"
                style={{
                  background: language === lang.code
                    ? 'color-mix(in srgb, var(--tg-theme-accent-text-color) 15%, transparent)'
                    : 'transparent',
                  color: language === lang.code
                    ? 'var(--tg-theme-accent-text-color)'
                    : 'var(--tg-theme-text-color)',
                }}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const CONTACT_PHONE = '+998901234567'
const CONTACT_PHONE_DISPLAY = '+998 90 123 45 67'
const CONTACT_BOT = 'eskishahar_bot'

function ContactButton() {
  const [open, setOpen] = useState(false)
  const lang = useSettingsStore((s) => s.language)

  return (
    <>
      <section className="px-4 pb-6 pt-2">
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={() => setOpen(true)}
          className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl text-base font-semibold"
          style={{
            background: 'var(--tg-theme-secondary-bg-color)',
            color: 'var(--tg-theme-text-color)',
          }}
        >
          📞 {t(lang, 'contact_us')}
        </motion.button>
      </section>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.5)' }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 inset-x-0 z-50 mx-auto max-w-md rounded-t-3xl px-6 pt-6"
              style={{ background: 'var(--tg-theme-bg-color)', paddingBottom: 'calc(var(--app-safe-bottom) + 80px)' }}
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full" style={{ background: 'var(--tg-theme-hint-color)', opacity: 0.3 }} />

              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-xl font-semibold" style={{ color: 'var(--tg-theme-text-color)' }}>
                  {t(lang, 'contact_us')}
                </h3>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-base"
                  style={{ background: 'var(--tg-theme-secondary-bg-color)', color: 'var(--tg-theme-hint-color)' }}
                >
                  ✕
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  try {
                    WebApp.openLink(`tel:${CONTACT_PHONE}`)
                  } catch {
                    window.location.href = `tel:${CONTACT_PHONE}`
                  }
                }}
                className="mb-3 flex min-h-[64px] w-full items-center gap-4 rounded-2xl px-5"
                style={{ background: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)' }}
              >
                <span className="text-2xl">📞</span>
                <div className="text-left">
                  <div className="text-base font-semibold">{CONTACT_PHONE_DISPLAY}</div>
                  <div className="text-xs opacity-75">{t(lang, 'about_phone')}</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  try {
                    WebApp.openTelegramLink(`https://t.me/${CONTACT_BOT}`)
                  } catch {
                    window.open(`https://t.me/${CONTACT_BOT}`, '_blank')
                  }
                }}
                className="flex min-h-[64px] w-full items-center gap-4 rounded-2xl px-5"
                style={{ background: 'var(--tg-theme-secondary-bg-color)', color: 'var(--tg-theme-text-color)' }}
              >
                <span className="text-2xl">✈️</span>
                <div className="text-left">
                  <div className="text-base font-semibold">@{CONTACT_BOT}</div>
                  <div className="text-xs" style={{ color: 'var(--tg-theme-hint-color)' }}>Telegram</div>
                </div>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export function HomePage() {
  const navigate = useNavigate()

  const handleCategorySelect = (category: Category) => {
    navigate(`/menu?category=${category.slug}`)
  }

  return (
    <Layout>
      <div className="flex items-center justify-end gap-2 px-4 pt-3 pb-1">
        <ThemeSwitcher />
        <LanguagePicker />
      </div>
      <HeroSection />
      <USPBanners />
      <CategoryList onSelect={handleCategorySelect} />
      <ProductsPreview />
      <ContactButton />
    </Layout>
  )
}
