import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  WebApp,
  canOpenLocationSettings,
  openLocationSettings,
  requestLocation,
  type DeliveryLocation,
} from '../lib/telegram'
import { t } from '../lib/i18n'
import { useSettingsStore } from '../store/settingsStore'

interface LocationPickerProps {
  value: DeliveryLocation | null
  onChange: (location: DeliveryLocation | null) => void
  viaChat: boolean
  onViaChatChange: (viaChat: boolean) => void
  /** Chat fallback is only possible for a signed-in Telegram user */
  canUseChat: boolean
  hasError?: boolean
}

type Status = 'idle' | 'loading' | 'denied' | 'unavailable'

export function LocationPicker({
  value,
  onChange,
  viaChat,
  onViaChatChange,
  canUseChat,
  hasError,
}: LocationPickerProps) {
  const lang = useSettingsStore((s) => s.language)
  const [status, setStatus] = useState<Status>('idle')

  const handleRequest = async () => {
    setStatus('loading')
    try { WebApp.HapticFeedback.impactOccurred('light') } catch { /* ignore */ }

    const result = await requestLocation()
    if (result.ok) {
      onChange(result.location)
      onViaChatChange(false)
      setStatus('idle')
      try { WebApp.HapticFeedback.notificationOccurred('success') } catch { /* ignore */ }
    } else {
      setStatus(result.reason)
      try { WebApp.HapticFeedback.notificationOccurred('warning') } catch { /* ignore */ }
    }
  }

  const openMap = () => {
    if (!value) return
    const url = `https://maps.google.com/?q=${value.lat},${value.lng}`
    try { WebApp.openLink(url) } catch { window.open(url, '_blank') }
  }

  return (
    <div
      className={`paper-card rounded-2xl p-4 ${hasError ? 'ring-2 ring-red-500' : ''}`}
    >
      <div className="mb-3">
        <p className="font-serif text-lg font-semibold" style={{ color: 'var(--tg-theme-text-color)' }}>
          {t(lang, 'loc_title')}
        </p>
        <p className="text-xs" style={{ color: 'var(--tg-theme-hint-color)' }}>
          {t(lang, 'loc_subtitle')}
        </p>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {value ? (
          <motion.div
            key="attached"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="flex items-center gap-3 rounded-xl p-3"
            style={{ background: 'color-mix(in srgb, var(--color-emerald) 14%, transparent)' }}
          >
            <span className="relative flex h-10 w-10 shrink-0 items-center justify-center">
              <span className="absolute inset-0 animate-ping rounded-full opacity-30" style={{ background: 'var(--color-emerald)' }} />
              <span className="relative text-2xl">📍</span>
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold" style={{ color: 'var(--tg-theme-text-color)' }}>
                ✓ {t(lang, 'loc_attached')}
              </p>
              <p className="truncate text-xs" style={{ color: 'var(--tg-theme-hint-color)' }}>
                {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
                {value.accuracy != null && ` · ${t(lang, 'loc_accuracy')} ±${Math.round(value.accuracy)} m`}
              </p>
              <div className="mt-1 flex gap-3 text-xs font-medium">
                <button type="button" onClick={openMap} style={{ color: 'var(--tg-theme-link-color)' }}>
                  {t(lang, 'loc_open_map')}
                </button>
                <button type="button" onClick={handleRequest} style={{ color: 'var(--tg-theme-link-color)' }}>
                  {t(lang, 'loc_change')}
                </button>
                <button type="button" onClick={() => onChange(null)} style={{ color: 'var(--tg-theme-destructive-text-color)' }}>
                  ✕
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="request" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.button
              type="button"
              onClick={handleRequest}
              disabled={status === 'loading'}
              whileTap={{ scale: 0.98 }}
              className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl text-base font-semibold disabled:opacity-60"
              style={{ background: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)' }}
            >
              {status === 'loading' ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {t(lang, 'loc_loading')}
                </>
              ) : (
                t(lang, 'loc_send')
              )}
            </motion.button>

            {(status === 'denied' || status === 'unavailable') && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 flex items-center justify-between gap-2 text-xs"
              >
                <span style={{ color: 'var(--tg-theme-destructive-text-color)' }}>
                  {t(lang, status === 'denied' ? 'loc_denied' : 'loc_unavailable')}
                </span>
                {status === 'denied' && canOpenLocationSettings() && (
                  <button
                    type="button"
                    onClick={openLocationSettings}
                    className="font-medium"
                    style={{ color: 'var(--tg-theme-link-color)' }}
                  >
                    {t(lang, 'loc_open_settings')}
                  </button>
                )}
              </motion.div>
            )}

            {canUseChat && (
              <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-xl p-2">
                <input
                  type="checkbox"
                  checked={viaChat}
                  onChange={(e) => {
                    onViaChatChange(e.target.checked)
                    try { WebApp.HapticFeedback.selectionChanged() } catch { /* ignore */ }
                  }}
                  className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--tg-theme-button-color)]"
                />
                <span>
                  <span className="block text-sm font-medium" style={{ color: 'var(--tg-theme-text-color)' }}>
                    ✈️ {t(lang, 'loc_via_chat')}
                  </span>
                  <span className="block text-xs" style={{ color: 'var(--tg-theme-hint-color)' }}>
                    {t(lang, 'loc_via_chat_hint')}
                  </span>
                </span>
              </label>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
