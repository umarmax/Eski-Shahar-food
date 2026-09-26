import { motion } from 'framer-motion'
import { useSettingsStore } from '../store/settingsStore'
import { t } from '../lib/i18n'

export function HeroSection() {
  const lang = useSettingsStore((s) => s.language)

  return (
    <section className="gradient-hero relative overflow-hidden px-4 pb-8 pt-4">
      {/* Decorative rotating medallion */}
      <div
        className="hero-medallion pointer-events-none absolute -right-16 -top-10 h-64 w-64 opacity-25"
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
        {/* Badge */}
        <div
          className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium"
          style={{
            background: 'color-mix(in srgb, var(--tg-theme-accent-text-color) 15%, transparent)',
            color: 'var(--tg-theme-accent-text-color)',
            border: '1px solid color-mix(in srgb, var(--tg-theme-accent-text-color) 30%, transparent)',
          }}
        >
          <span>🍵</span>
          <span>{t(lang, 'hero_badge')}</span>
        </div>

        {/* Title */}
        <h1
          className="mb-3 font-serif text-4xl font-bold leading-tight"
          style={{ color: 'var(--tg-theme-text-color)' }}
        >
          {t(lang, 'hero_title')}{' '}
          <span className="italic" style={{ color: 'var(--tg-theme-accent-text-color)' }}>
            {t(lang, 'hero_title_accent')}
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className="max-w-[85%] text-sm leading-relaxed"
          style={{ color: 'var(--tg-theme-hint-color)' }}
        >
          {t(lang, 'hero_subtitle')}
        </p>

        <div className="ornament-divider mt-5 max-w-[240px]" />
      </motion.div>
    </section>
  )
}
