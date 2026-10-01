import { motion } from 'framer-motion'
import { Layout } from '../components/Layout'
import { PageHeader } from '../components/PageHeader'
import { useSettingsStore } from '../store/settingsStore'
import { t } from '../lib/i18n'
import { WebApp } from '../lib/telegram'
import { BUSINESS } from '../config/business'
import { FacebookIcon, InstagramIcon } from '../components/icons'
import { ReviewsSection } from '../components/Reviews'

export function AboutPage() {
  const lang = useSettingsStore((s) => s.language)

  const getAddress = () => BUSINESS.address[lang]

  return (
    <Layout>
      <PageHeader title={t(lang, 'about_title')} />

      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 pb-6"
      >
        {/* Always on light paper so the dark lettering stays readable in dark mode */}
        <div className="rounded-3xl px-5 pb-5 pt-6 text-center" style={{ background: '#F1DFC4' }}>
          <img
            src="/brand/logo-full.webp"
            alt={`${BUSINESS.name} Shashlik — Established 1978`}
            width={1000}
            height={471}
            className="mx-auto w-full max-w-[340px]"
          />
          <p className="mt-3 text-sm" style={{ color: '#6B4A33' }}>
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
              WebApp.openLink(BUSINESS.mapUrl)
            } catch {
              window.open(BUSINESS.mapUrl, '_blank')
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
                {BUSINESS.hours}
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
              WebApp.openLink(`tel:${BUSINESS.phone}`)
            } catch {
              window.location.href = `tel:${BUSINESS.phone}`
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
              {BUSINESS.phoneDisplay}
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
                WebApp.openTelegramLink(`https://t.me/${BUSINESS.botUsername}`)
              } catch {
                window.open(`https://t.me/${BUSINESS.botUsername}`, '_blank')
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
                @{BUSINESS.botUsername}
              </p>
            </div>
          </button>
          {[
            { url: BUSINESS.instagram, label: 'Instagram', Icon: InstagramIcon },
            { url: BUSINESS.facebook, label: 'Facebook', Icon: FacebookIcon },
          ]
            .filter((s) => s.url)
            .map(({ url, label, Icon }) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  try { WebApp.openLink(url) } catch { window.open(url, '_blank') }
                }}
                className="glass-card w-full rounded-2xl p-4 text-left"
              >
                <div className="flex items-center gap-3" style={{ color: 'var(--tg-theme-text-color)' }}>
                  <span style={{ color: 'var(--tg-theme-button-color)' }}><Icon size={26} /></span>
                  <p className="font-medium">{label}</p>
                </div>
              </button>
            ))}
        </div>
      </motion.section>

      <ReviewsSection />
    </Layout>
  )
}
