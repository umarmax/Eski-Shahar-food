import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Language } from '../lib/i18n'

export type ThemeMode = 'auto' | 'light' | 'dark'

interface SettingsState {
  language: Language
  theme: ThemeMode
  setLanguage: (lang: Language) => void
  setTheme: (theme: ThemeMode) => void
}

export function formatPrice(price: number): string {
  return `${price.toLocaleString('ru-RU')} so'm`
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'uz',
      theme: 'auto',
      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'choyxona-settings' },
  ),
)
