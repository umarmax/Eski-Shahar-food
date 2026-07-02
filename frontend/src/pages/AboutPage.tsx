import { motion } from 'framer-motion'
import { Layout } from '../components/Layout'
import { PageHeader } from '../components/PageHeader'
import { useSettingsStore } from '../store/settingsStore'
import { t } from '../lib/i18n'
import { WebApp } from '../lib/telegram'

const CAFE_INFO = {
  name: 'Eski Shahar Choyxona',
  address: "Toshkent shahri, Chilonzor tumani, 1-mavze",
  address_uz: "Toshkent shahri, Chilonzor tumani, 1-mavze",
  address_ru: "г. Ташкент, Чиланзарский район, 1-й массив",
  address_en: "Tashkent city, Chilanzar district, 1st block",
  hours: '10:00 - 23:00',
  phone: '+998901234567',
  phone_display: '+998 90 123 45 67',
  telegram: 'eskishahar_bot',
  instagram: 'eskishahar_choyxona',
  yandex_maps: 'https://yandex.uz/maps/-/CDxqJK~r',
}

export function AboutPage() {
  const lang = useSettingsStore((s) => s.language)

  const getAddress = () => {
    if (lang === 'uz') return CAFE_INFO.address_uz
    if (lang === 'ru') return CAFE_INFO.address_ru
    return CAFE_INFO.address_en
  }

  return (
    <Layout hideNav>
      <PageHeader title={t(lang, 'about_title')} showBack />

      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 pb-6"
      >
        <div
          className="rounded-2xl p-6 text-center"
          style={{ background: 'var(--tg-theme-secondary-bg-color)' }}
        >
          <div className="mb-4 text-5xl">🍵</div>
          <h2
            className="mb-2 text-xl font-bold"
            style={{ color: 'var(--tg-theme-text-color)' }}
          >
            {CAFE_INFO.name}
          </h2>
          <p
            className="text-sm"
            style={{ color: 'var(--tg-theme-hint-color)' }}
          >
            {lang === 'uz' && "An'anaviy o'zbek oshxonasi"}
            {lang === 'ru' && 'Традиционная узбекская кухня'}
            {lang === 'en' && 'Traditional Uzbek cuisine'}
          </p>
        </div>
      </motion.section>

      {/* Address */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="px-4 pb-4"
      >
        <h3
          className="mb-3 text-sm font-semibold"
          style={{ color: 'var(--tg-theme-hint-color)' }}
        >
          {t(lang, 'about_address')}
        </h3>
        <button
          type="button"
          onClick={() => {
            try {
              WebApp.openLink(CAFE_INFO.yandex_maps)
            } catch {
              window.open(CAFE_INFO.yandex_maps, '_blank')
            }
          }}
          className="glass-card w-full rounded-2xl p-4 text-left"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">📍</span>
            <div>
              <p
                className="font-medium"
                style={{ color: 'var(--tg-theme-text-color)' }}
              >
                {getAddress()}
              </p>
              <p
                className="text-xs"
                style={{ color: 'var(--tg-theme-link-color)' }}
              >
                {lang === 'uz' && "Xaritada ko'rish →"}
                {lang === 'ru' && 'Открыть на карте →'}
                {lang === 'en' && 'View on map →'}
              </p>
            </div>
          </div>
        </button>
      </motion.section>

      {/* Working hours */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="px-4 pb-4"
      >
        <h3
          className="mb-3 text-sm font-semibold"
          style={{ color: 'var(--tg-theme-hint-color)' }}
        >
          {t(lang, 'about_hours')}
        </h3>
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🕐</span>
            <div>
              <p
                className="font-medium"
                style={{ color: 'var(--tg-theme-text-color)' }}
              >
                {CAFE_INFO.hours}
              </p>
              <p
                className="text-xs"
                style={{ color: 'var(--tg-theme-hint-color)' }}
              >
                {lang === 'uz' && 'Har kuni'}
                {lang === 'ru' && 'Ежедневно'}
                {lang === 'en' && 'Every day'}
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Phone */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="px-4 pb-4"
      >
        <h3
          className="mb-3 text-sm font-semibold"
          style={{ color: 'var(--tg-theme-hint-color)' }}
        >
          {t(lang, 'about_phone')}
        </h3>
        <button
          type="button"
          onClick={() => {
            try {
              WebApp.openLink(`tel:${CAFE_INFO.phone}`)
            } catch {
              window.location.href = `tel:${CAFE_INFO.phone}`
            }
          }}
          className="glass-card w-full rounded-2xl p-4 text-left"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">📞</span>
            <p
              className="font-medium"
              style={{ color: 'var(--tg-theme-text-color)' }}
            >
              {CAFE_INFO.phone_display}
            </p>
          </div>
        </button>
      </motion.section>

      {/* Social */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="px-4 pb-6"
      >
        <h3
          className="mb-3 text-sm font-semibold"
          style={{ color: 'var(--tg-theme-hint-color)' }}
        >
          {t(lang, 'about_social')}
        </h3>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => {
              try {
                WebApp.openTelegramLink(`https://t.me/${CAFE_INFO.telegram}`)
              } catch {
                window.open(`https://t.me/${CAFE_INFO.telegram}`, '_blank')
              }
            }}
            className="glass-card w-full rounded-2xl p-4 text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">✈️</span>
              <p
                className="font-medium"
                style={{ color: 'var(--tg-theme-text-color)' }}
              >
                @{CAFE_INFO.telegram}
              </p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => {
              try {
                WebApp.openLink(`https://instagram.com/${CAFE_INFO.instagram}`)
              } catch {
                window.open(`https://instagram.com/${CAFE_INFO.instagram}`, '_blank')
              }
            }}
            className="glass-card w-full rounded-2xl p-4 text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">📸</span>
              <p
                className="font-medium"
                style={{ color: 'var(--tg-theme-text-color)' }}
              >
                @{CAFE_INFO.instagram}
              </p>
            </div>
          </button>
        </div>
      </motion.section>
    </Layout>
  )
}
