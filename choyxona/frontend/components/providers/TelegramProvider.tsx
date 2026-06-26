'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api } from '@/lib/api'
import { useAppStore } from '@/lib/store'

type WebAppType = typeof import('@twa-dev/sdk').default

interface TelegramContextValue {
  webApp: WebAppType | null
  isReady: boolean
  isDark: boolean
  haptic: (type?: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') => void
  requestContact: () => Promise<string | null>
  requestLocation: () => Promise<{ latitude: number; longitude: number } | null>
}

const TelegramContext = createContext<TelegramContextValue>({
  webApp: null,
  isReady: false,
  isDark: false,
  haptic: () => {},
  requestContact: async () => null,
  requestLocation: async () => null,
})

export function TelegramProvider({ children }: { children: ReactNode }) {
  const [webApp, setWebApp] = useState<WebAppType | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const setUser = useAppStore((s) => s.setUser)
  const language = useAppStore((s) => s.language)

  useEffect(() => {
    let mounted = true

    import('@twa-dev/sdk').then(({ default: WebApp }) => {
      if (!mounted) return

      try {
        WebApp.ready()
        WebApp.expand()
        WebApp.enableClosingConfirmation()
        setWebApp(WebApp)

        const scheme = WebApp.colorScheme
        setIsDark(scheme === 'dark')

        if (WebApp.themeParams.bg_color) {
          document.documentElement.style.setProperty('--tg-bg', WebApp.themeParams.bg_color)
        }

        WebApp.onEvent('themeChanged', () => {
          setIsDark(WebApp.colorScheme === 'dark')
        })

        const tgUser = WebApp.initDataUnsafe?.user
        if (tgUser) {
          api
            .authTelegram({
              telegramId: String(tgUser.id),
              username: tgUser.username,
              firstName: tgUser.first_name,
              lastName: tgUser.last_name,
              language,
            })
            .then(setUser)
            .catch(console.error)
        } else {
          api
            .authTelegram({
              telegramId: 'dev-user-1',
              username: 'devuser',
              firstName: 'Mehmon',
              lastName: 'Test',
              language,
            })
            .then(setUser)
            .catch(console.error)
        }
      } catch {
        // Outside Telegram — dev mode
      }

      setIsReady(true)
    })

    return () => {
      mounted = false
    }
  }, [language, setUser])

  const haptic = (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light') => {
    if (!webApp) return
    try {
      if (type === 'success' || type === 'warning' || type === 'error') {
        webApp.HapticFeedback.notificationOccurred(type)
      } else {
        webApp.HapticFeedback.impactOccurred(type)
      }
    } catch {}
  }

  const requestContact = (): Promise<string | null> =>
    new Promise((resolve) => {
      if (!webApp) {
        resolve('+998 90 123 45 67')
        return
      }
      try {
        webApp.requestContact((accepted, data) => {
          if (!accepted || !data) {
            resolve(null)
            return
          }
          const response = data as unknown as { responseUnsafe?: { contact?: { phone_number?: string } } }
          resolve(response.responseUnsafe?.contact?.phone_number ?? null)
        })
      } catch {
        resolve('+998 90 123 45 67')
      }
    })

  const requestLocation = (): Promise<{ latitude: number; longitude: number } | null> =>
    new Promise((resolve) => {
      if (!webApp) {
        resolve({ latitude: 41.3111, longitude: 69.2797 })
        return
      }
      try {
        webApp.LocationManager.init(() => {
          webApp.LocationManager.getLocation((location) => {
            if (location) resolve({ latitude: location.latitude, longitude: location.longitude })
            else resolve(null)
          })
        })
      } catch {
        resolve({ latitude: 41.3111, longitude: 69.2797 })
      }
    })

  return (
    <TelegramContext.Provider
      value={{ webApp, isReady, isDark, haptic, requestContact, requestLocation }}
    >
      {children}
    </TelegramContext.Provider>
  )
}

export function useTelegram() {
  return useContext(TelegramContext)
}
