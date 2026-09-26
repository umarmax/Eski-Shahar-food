// Use native Telegram WebApp from the script tag in index.html
// This is more reliable than @twa-dev/sdk

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
}

interface TelegramLocationData {
  latitude: number
  longitude: number
  horizontal_accuracy?: number | null
}

interface TelegramLocationManager {
  isInited: boolean
  isLocationAvailable: boolean
  isAccessRequested: boolean
  isAccessGranted: boolean
  init: (callback?: () => void) => void
  getLocation: (callback: (data: TelegramLocationData | null) => void) => void
  openSettings: () => void
}

interface TelegramWebApp {
  initData: string
  initDataUnsafe: {
    query_id?: string
    user?: {
      id: number
      first_name: string
      last_name?: string
      username?: string
      language_code?: string
      photo_url?: string
    }
    auth_date?: number
    hash?: string
    chat_instance?: string
    chat_type?: string
    start_param?: string
  }
  version: string
  colorScheme: 'light' | 'dark'
  themeParams: {
    bg_color?: string
    text_color?: string
    hint_color?: string
    link_color?: string
    button_color?: string
    button_text_color?: string
    secondary_bg_color?: string
    accent_text_color?: string
    destructive_text_color?: string
  }
  isVersionAtLeast: (version: string) => boolean
  ready: () => void
  expand: () => void
  close: () => void
  setHeaderColor: (color: string) => void
  setBackgroundColor: (color: string) => void
  onEvent: (eventType: string, callback: () => void) => void
  offEvent: (eventType: string, callback: () => void) => void
  MainButton: {
    text: string
    color: string
    textColor: string
    isVisible: boolean
    isActive: boolean
    isProgressVisible: boolean
    setText: (text: string) => void
    onClick: (callback: () => void) => void
    offClick: (callback: () => void) => void
    show: () => void
    hide: () => void
    enable: () => void
    disable: () => void
    showProgress: (leaveActive?: boolean) => void
    hideProgress: () => void
  }
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void
    selectionChanged: () => void
  }
  LocationManager?: TelegramLocationManager
  openLink: (url: string, options?: { try_instant_view?: boolean }) => void
  openTelegramLink: (url: string) => void
  showAlert: (message: string, callback?: () => void) => void
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void
  BackButton: {
    isVisible: boolean
    onClick: (callback: () => void) => void
    offClick: (callback: () => void) => void
    show: () => void
    hide: () => void
  }
}

const noop = () => {}

// Create a safe wrapper that handles missing Telegram context
const createSafeWebApp = (): TelegramWebApp => {
  const nativeWebApp = typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined
  if (nativeWebApp) return nativeWebApp

  // Fallback for development/browser testing
  return {
    initData: '',
    initDataUnsafe: {},
    version: '6.0',
    colorScheme: 'light',
    themeParams: {},
    isVersionAtLeast: () => false,
    ready: noop,
    expand: noop,
    close: noop,
    setHeaderColor: noop,
    setBackgroundColor: noop,
    onEvent: noop,
    offEvent: noop,
    MainButton: {
      text: '',
      color: '#000000',
      textColor: '#ffffff',
      isVisible: false,
      isActive: true,
      isProgressVisible: false,
      setText: noop,
      onClick: noop,
      offClick: noop,
      show: noop,
      hide: noop,
      enable: noop,
      disable: noop,
      showProgress: noop,
      hideProgress: noop,
    },
    HapticFeedback: {
      impactOccurred: noop,
      notificationOccurred: noop,
      selectionChanged: noop,
    },
    openLink: (url: string) => { window.open(url, '_blank') },
    openTelegramLink: (url: string) => { window.open(url, '_blank') },
    showAlert: (message: string, callback?: () => void) => {
      alert(message)
      callback?.()
    },
    showConfirm: (message: string, callback?: (confirmed: boolean) => void) => {
      callback?.(confirm(message))
    },
    BackButton: {
      isVisible: false,
      onClick: noop,
      offClick: noop,
      show: noop,
      hide: noop,
    },
  }
}

export const WebApp = createSafeWebApp()

/** True when running inside a real Telegram client with a signed user. */
export const isInTelegram = Boolean(WebApp.initData && WebApp.initDataUnsafe?.user?.id)

// ── Location ──

export interface DeliveryLocation {
  lat: number
  lng: number
  accuracy: number | null
}

export type LocationResult =
  | { ok: true; location: DeliveryLocation }
  | { ok: false; reason: 'denied' | 'unavailable' }

function hasTelegramLocationManager(): boolean {
  try {
    return Boolean(WebApp.LocationManager) && WebApp.isVersionAtLeast('8.0')
  } catch {
    return false
  }
}

function browserGeolocation(): Promise<LocationResult> {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) {
      resolve({ ok: false, reason: 'unavailable' })
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          ok: true,
          location: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: Number.isFinite(pos.coords.accuracy) ? pos.coords.accuracy : null,
          },
        }),
      (err) =>
        resolve({ ok: false, reason: err.code === err.PERMISSION_DENIED ? 'denied' : 'unavailable' }),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    )
  })
}

/**
 * Ask for the user's current location.
 * Uses Telegram's native LocationManager (Bot API 8.0+), falls back to the
 * browser Geolocation API on older clients / outside Telegram.
 */
export function requestLocation(): Promise<LocationResult> {
  if (!hasTelegramLocationManager()) return browserGeolocation()

  const lm = WebApp.LocationManager!
  return new Promise((resolve) => {
    const fetchLocation = () => {
      if (!lm.isLocationAvailable) {
        void browserGeolocation().then(resolve)
        return
      }
      lm.getLocation((data) => {
        if (data && Number.isFinite(data.latitude) && Number.isFinite(data.longitude)) {
          resolve({
            ok: true,
            location: {
              lat: data.latitude,
              lng: data.longitude,
              accuracy: data.horizontal_accuracy ?? null,
            },
          })
        } else {
          resolve({ ok: false, reason: lm.isAccessRequested && !lm.isAccessGranted ? 'denied' : 'unavailable' })
        }
      })
    }

    try {
      if (lm.isInited) fetchLocation()
      else lm.init(fetchLocation)
    } catch {
      void browserGeolocation().then(resolve)
    }
  })
}

/** Opens Telegram's location permission settings, if supported. */
export function canOpenLocationSettings(): boolean {
  return hasTelegramLocationManager() && Boolean(WebApp.LocationManager?.isAccessRequested)
}

export function openLocationSettings() {
  try {
    WebApp.LocationManager?.openSettings()
  } catch {
    // not supported
  }
}

// ── Theme ──

const THEME_VARS: Record<string, keyof TelegramWebApp['themeParams']> = {
  '--tg-theme-bg-color': 'bg_color',
  '--tg-theme-text-color': 'text_color',
  '--tg-theme-hint-color': 'hint_color',
  '--tg-theme-link-color': 'link_color',
  '--tg-theme-button-color': 'button_color',
  '--tg-theme-button-text-color': 'button_text_color',
  '--tg-theme-secondary-bg-color': 'secondary_bg_color',
  '--tg-theme-accent-text-color': 'accent_text_color',
  '--tg-theme-destructive-text-color': 'destructive_text_color',
}

export const THEME_CSS_VARS = Object.keys(THEME_VARS)

/** Sync Telegram's header/background with the app's paper colors. */
export function syncTelegramChrome() {
  try {
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--tg-theme-bg-color').trim()
    if (bg && WebApp.isVersionAtLeast('6.1')) {
      WebApp.setHeaderColor(bg)
      WebApp.setBackgroundColor(bg)
    }
  } catch {
    // older clients
  }
}

/**
 * Applies the app's color scheme. Paper palette is defined in index.css per
 * scheme; Telegram only decides light vs dark in "auto" mode.
 */
export function applyTelegramTheme() {
  try {
    const root = document.documentElement
    for (const cssVar of THEME_CSS_VARS) root.style.removeProperty(cssVar)
    root.dataset.colorScheme = WebApp.colorScheme ?? 'light'
    syncTelegramChrome()
  } catch {
    // ignore
  }
}

export function initTelegramApp() {
  try { WebApp.ready() } catch { /* ignore */ }
  try { WebApp.expand() } catch { /* ignore */ }
  return WebApp
}
