import { motion } from 'framer-motion'
import { useSettingsStore } from '../store/settingsStore'
import { t } from '../lib/i18n'

export function USPBanners() {
  const lang = useSettingsStore((s) => s.language)

  const usps = [
    {
      icon: '🚗',
      title: t(lang, 'usp_delivery'),
      subtitle: t(lang, 'usp_delivery_sub'),
    },
    {
      icon: '👨‍🍳',
      title: t(lang, 'usp_fresh'),
      subtitle: t(lang, 'usp_fresh_sub'),
    },
    {
      icon: '☪️',
      title: t(lang, 'usp_halal'),
      subtitle: t(lang, 'usp_halal_sub'),
    },
  ]

  return (
    <section className="px-4 pb-6">
      <div className="flex gap-3 overflow-x-auto pb-1 hide-scrollbar">
        {usps.map((usp, index) => (
          <motion.div
            key={usp.title}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="glass-card flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3"
            style={{ minWidth: '200px' }}
          >
            <span className="text-2xl">{usp.icon}</span>
            <div>
              <p
                className="text-sm font-semibold"
                style={{ color: 'var(--tg-theme-text-color)' }}
              >
                {usp.title}
              </p>
              <p
                className="text-xs"
                style={{ color: 'var(--tg-theme-hint-color)' }}
              >
                {usp.subtitle}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
