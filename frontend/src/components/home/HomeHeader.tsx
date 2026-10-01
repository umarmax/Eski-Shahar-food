import { useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LANGUAGES, t } from '../../lib/i18n'
import { WebApp } from '../../lib/telegram'
import { useSettingsStore, type ThemeMode } from '../../store/settingsStore'
import { CheckIcon, ChevronDownIcon, MoonIcon, SunIcon } from '../icons'

interface HeroOption<T extends string> {
  value: T
  label: string
  icon: ReactNode
}

/** Chip floating over the hero photo that opens a pick-one menu. */
function HeroPicker<T extends string>({
  trigger,
  label,
  options,
  value,
  onChange,
}: {
  trigger: ReactNode
  label: string
  options: HeroOption<T>[]
  value: T
  onChange: (value: T) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('pointerdown', close)
    return () => window.removeEventListener('pointerdown', close)
  }, [open])

  return (
    <div ref={ref} className={`relative ${open ? 'z-20' : 'z-10'}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 items-center gap-1 rounded-full px-3 text-xs font-bold uppercase"
        style={{
          background: 'rgba(23, 15, 10, 0.55)',
          color: '#FFF1DE',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 241, 222, 0.25)',
        }}
        aria-label={label}
        aria-expanded={open}
      >
        {trigger}
        <ChevronDownIcon size={14} style={{ transform: open ? 'rotate(180deg)' : undefined, transition: 'transform .2s' }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-11 w-44 overflow-hidden rounded-2xl shadow-lg"
            style={{ background: 'var(--card-frame)' }}
            role="menu"
          >
            {options.map((opt, i) => (
              <button
                key={opt.value}
                type="button"
                role="menuitemradio"
                aria-checked={opt.value === value}
                onClick={() => {
                  onChange(opt.value)
                  setOpen(false)
                  try { WebApp.HapticFeedback.selectionChanged() } catch { /* ignore */ }
                }}
                className="flex w-full items-center justify-between gap-2 px-4 py-3 text-[15px]"
                style={{
                  color: 'var(--tg-theme-text-color)',
                  borderTop: i ? '1px solid color-mix(in srgb, var(--tg-theme-text-color) 10%, transparent)' : undefined,
                }}
              >
                <span className="flex items-center gap-2">{opt.icon}{opt.label}</span>
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: opt.value === value ? 'var(--tg-theme-button-color)' : 'var(--paper-card)',
                    color: 'var(--tg-theme-button-text-color)',
                  }}
                >
                  {opt.value === value && <CheckIcon size={14} strokeWidth={3} />}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** Language chip with the theme chip right below it. */
function HeroSettings() {
  const { language, setLanguage, theme, setTheme } = useSettingsStore()
  const themeIcon = theme === 'dark' ? <MoonIcon size={16} /> : theme === 'light' ? <SunIcon size={16} /> : 'A'

  return (
    <div className="absolute right-3 top-3 flex flex-col items-end gap-2">
      <HeroPicker
        trigger={language}
        label={t(language, 'language')}
        value={language}
        onChange={setLanguage}
        options={LANGUAGES.map((l) => ({ value: l.code, label: l.label, icon: <span>{l.flag}</span> }))}
      />
      <HeroPicker<ThemeMode>
        trigger={themeIcon}
        label={t(language, 'theme')}
        value={theme}
        onChange={setTheme}
        options={[
          { value: 'light', label: t(language, 'theme_light'), icon: <SunIcon size={18} /> },
          { value: 'dark', label: t(language, 'theme_dark'), icon: <MoonIcon size={18} /> },
          { value: 'auto', label: t(language, 'theme_auto'), icon: <span className="w-[18px] text-center text-xs font-bold">A</span> },
        ]}
      />
    </div>
  )
}

/**
 * Home header: grill photo as the hero, with the dome mark, name and slogan set
 * into the smoke (top-left) and language + theme chips top-right.
 */
export function HomeHeader() {
  const language = useSettingsStore((s) => s.language)

  return (
    <header className="px-4 pt-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl shadow-lg"
        style={{ background: 'var(--card-frame)' }}
      >
        <img
          src="/brand/hero-grill.webp"
          alt=""
          width={900}
          height={900}
          className="aspect-square w-full object-cover"
        />

        {/* Darken the smoky corner and the bottom edge just enough for the lettering */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(125% 90% at 0% 0%, rgba(23,15,10,0.82) 0%, rgba(23,15,10,0.5) 40%, transparent 65%),' +
              'linear-gradient(to top, rgba(23,15,10,0.35), transparent 22%)',
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="absolute left-4 top-4 flex flex-col items-start"
          style={{ color: '#FFF1DE' }}
        >
          <img
            src="/brand/dome.webp"
            alt=""
            width={360}
            height={110}
            className="mb-2 h-[38px] w-auto drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]"
          />
          <h1
            className="font-serif text-[34px] font-bold leading-none tracking-tight"
            style={{ textShadow: '0 2px 12px rgba(0,0,0,0.55)' }}
          >
            Eski Shahar
          </h1>
          <span className="mt-2.5 flex items-center gap-2">
            <span className="h-[2px] w-6 rounded-full" style={{ background: '#F0A866' }} />
            <span
              className="font-serif text-[21px] font-semibold italic leading-none"
              style={{ color: '#FFC98E', textShadow: '0 2px 10px rgba(0,0,0,0.75)' }}
            >
              {t(language, 'slogan').replace(/~/g, '').trim()}
            </span>
            <span className="h-[2px] w-6 rounded-full" style={{ background: '#F0A866' }} />
          </span>
        </motion.div>

        <HeroSettings />
      </motion.div>
    </header>
  )
}
