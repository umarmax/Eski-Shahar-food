import { motion } from 'framer-motion'
import { useSettingsStore } from '../store/settingsStore'
import { t } from '../lib/i18n'

export function HeroSection() {
  const lang = useSettingsStore((s) => s.language)

  return (
    <section className="gradient-hero relative overflow-hidden px-4 pb-8 pt-4">
      {/* Decorative pattern */}
      <div className="uzbek-pattern absolute inset-0 opacity-30" />
      
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
          }}
        >
          <span>🍵</span>
          <span>{t(lang, 'hero_badge')}</span>
        </div>

        {/* Title */}
        <h1
          className="mb-3 text-3xl font-bold leading-tight"
          style={{ color: 'var(--tg-theme-text-color)' }}
        >
          {t(lang, 'hero_title')}{' '}
          <span style={{ color: 'var(--tg-theme-accent-text-color)' }}>
            {t(lang, 'hero_title_accent')}
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className="text-sm leading-relaxed"
          style={{ color: 'var(--tg-theme-hint-color)' }}
        >
          {t(lang, 'hero_subtitle')}
        </p>
      </motion.div>

      {/* Decorative food emoji */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="absolute -right-4 top-8 text-7xl opacity-20"
      >
        🍚
      </motion.div>
    </section>
  )
}
