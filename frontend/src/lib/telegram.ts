// Use native Telegram WebApp from the script tag in index.html
// This is more reliable than @twa-dev/sdk

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
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
  ready: () => void
  expand: () => void
  close: () => void
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
  showAlert: (message: string, callback?: () => void) => void
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void
}

// Create a safe wrapper that handles missing Telegram context
const createSafeWebApp = (): TelegramWebApp => {
  const nativeWebApp = typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined
  
  console.log('[Telegram] Native WebApp:', nativeWebApp)
  console.log('[Telegram] initDataUnsafe:', nativeWebApp?.initDataUnsafe)
  console.log('[Telegram] initData:', nativeWebApp?.initData ? 'present' : 'empty')
  
  // If native WebApp exists and has data, use it
  if (nativeWebApp) {
    return nativeWebApp
  }
  
  // Fallback for development/browser testing
  console.warn('[Telegram] WebApp not available, using mock')
  return {
    initData: '',
    initDataUnsafe: {},
    colorScheme: 'light',
    themeParams: {},
    ready: () => console.log('[Telegram Mock] ready()'),
    expand: () => console.log('[Telegram Mock] expand()'),
    close: () => console.log('[Telegram Mock] close()'),
    onEvent: () => {},
    offEvent: () => {},
    MainButton: {
      text: '',
      color: '#000000',
      textColor: '#ffffff',
      isVisible: false,
      isActive: true,
      isProgressVisible: false,
      setText: () => {},
      onClick: () => {},
      offClick: () => {},
      show: () => {},
      hide: () => {},
      enable: () => {},
      disable: () => {},
      showProgress: () => {},
      hideProgress: () => {},
    },
    HapticFeedback: {
      impactOccurred: () => {},
      notificationOccurred: () => {},
      selectionChanged: () => {},
    },
    showAlert: (message: string, callback?: () => void) => {
      alert(message)
      callback?.()
    },
    showConfirm: (message: string, callback?: (confirmed: boolean) => void) => {
      const result = confirm(message)
      callback?.(result)
    },
  }
}

export const WebApp = createSafeWebApp()

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

function applyTelegramTheme() {
  try {
    const root = document.documentElement

    for (const [cssVar, paramKey] of Object.entries(THEME_VARS)) {
      const value = WebApp.themeParams[paramKey]
      if (value) {
        root.style.setProperty(cssVar, value)
      }
    }

    root.dataset.colorScheme = WebApp.colorScheme ?? 'light'
  } catch (e) {
    console.warn('[Telegram] applyTelegramTheme error:', e)
  }
}

export function initTelegramApp() {
  try {
    WebApp.ready()
  } catch (e) {
    console.warn('[Telegram] WebApp.ready() error:', e)
  }

  try {
    WebApp.expand()
  } catch (e) {
    console.warn('[Telegram] WebApp.expand() error:', e)
  }

  applyTelegramTheme()

  try {
    WebApp.onEvent('themeChanged', applyTelegramTheme)
  } catch (e) {
    console.warn('[Telegram] onEvent error:', e)
  }

  return WebApp
}
