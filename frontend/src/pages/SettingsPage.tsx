import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { PageHeader } from '../components/PageHeader'
import { useSettingsStore, type ThemeMode } from '../store/settingsStore'
import { t, type Language, LANGUAGES } from '../lib/i18n'

const themes: { code: ThemeMode; labelKey: 'theme_auto' | 'theme_light' | 'theme_dark'; icon: string }[] = [
  { code: 'auto', labelKey: 'theme_auto', icon: '🔄' },
  { code: 'light', labelKey: 'theme_light', icon: '☀️' },
  { code: 'dark', labelKey: 'theme_dark', icon: '🌙' },
]

export function SettingsPage() {
  const navigate = useNavigate()
  const language = useSettingsStore((s) => s.language)
  const theme = useSettingsStore((s) => s.theme)
  const setLanguage = useSettingsStore((s) => s.setLanguage)
  const setTheme = useSettingsStore((s) => s.setTheme)

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="min-h-screen pb-24"
      >
        <PageHeader title={t(language, 'settings')} subtitle={t(language, 'profile_subtitle')} showBack />

        <div className="px-4 py-6 space-y-6">
          {/* Language Selection */}
          <section>
            <h2 className="text-sm font-medium text-[var(--tg-theme-hint-color)] uppercase tracking-wide mb-3">
              {t(language, 'language')}
            </h2>
            <div className="bg-[var(--tg-theme-secondary-bg-color)] rounded-2xl overflow-hidden">
              {LANGUAGES.map((lang, index) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`
                    w-full flex items-center justify-between px-4 py-3.5
                    ${index !== LANGUAGES.length - 1 ? 'border-b border-[var(--tg-theme-bg-color)]' : ''}
                    active:bg-[var(--tg-theme-bg-color)] transition-colors
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{lang.flag}</span>
                    <span className="text-[var(--tg-theme-text-color)] font-medium">
                      {lang.label}
                    </span>
                  </div>
                  {language === lang.code && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 rounded-full bg-[var(--tg-theme-button-color)] flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 text-[var(--tg-theme-button-text-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Theme Selection */}
          <section>
            <h2 className="text-sm font-medium text-[var(--tg-theme-hint-color)] uppercase tracking-wide mb-3">
              {t(language, 'theme')}
            </h2>
            <div className="bg-[var(--tg-theme-secondary-bg-color)] rounded-2xl overflow-hidden">
              {themes.map((themeOption, index) => (
                <button
                  key={themeOption.code}
                  onClick={() => setTheme(themeOption.code)}
                  className={`
                    w-full flex items-center justify-between px-4 py-3.5
                    ${index !== themes.length - 1 ? 'border-b border-[var(--tg-theme-bg-color)]' : ''}
                    active:bg-[var(--tg-theme-bg-color)] transition-colors
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{themeOption.icon}</span>
                    <span className="text-[var(--tg-theme-text-color)] font-medium">
                      {t(language, themeOption.labelKey)}
                    </span>
                  </div>
                  {theme === themeOption.code && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 rounded-full bg-[var(--tg-theme-button-color)] flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 text-[var(--tg-theme-button-text-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-[var(--tg-theme-hint-color)] mt-2 px-1">
              {language === 'uz' && "Auto rejimida Telegram mavzusi ishlatiladi"}
              {language === 'ru' && "В режиме Auto используется тема Telegram"}
              {language === 'en' && "Auto mode uses your Telegram theme"}
            </p>
          </section>

          {/* App Info */}
          <section>
            <h2 className="text-sm font-medium text-[var(--tg-theme-hint-color)] uppercase tracking-wide mb-3">
              {t(language, 'about')}
            </h2>
            <div className="bg-[var(--tg-theme-secondary-bg-color)] rounded-2xl p-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8B5E3C] to-[#C79A5D] flex items-center justify-center text-2xl">
                  🍵
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--tg-theme-text-color)]">
                    Eski Shahar Choyxona
                  </h3>
                  <p className="text-sm text-[var(--tg-theme-hint-color)]">
                    v1.0.0
                  </p>
                </div>
              </div>
              <p className="text-sm text-[var(--tg-theme-hint-color)] mt-4">
                {language === 'uz' && "An'anaviy o'zbek oshxonasi. Telegram Mini App orqali buyurtma bering."}
                {language === 'ru' && "Традиционная узбекская кухня. Заказывайте через Telegram Mini App."}
                {language === 'en' && "Traditional Uzbek cuisine. Order through Telegram Mini App."}
              </p>
            </div>
          </section>
        </div>
      </motion.div>
    </Layout>
  )
}
