import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { HomePage } from './pages/HomePage'
import { MenuPage } from './pages/MenuPage'
import { ProductPage } from './pages/ProductPage'
import { CartPage } from './pages/CartPage'
import { OrderFormPage } from './pages/OrderFormPage'
import { ProfilePage } from './pages/ProfilePage'
import { AboutPage } from './pages/AboutPage'
import { SettingsPage } from './pages/SettingsPage'
import { useSettingsStore } from './store/settingsStore'
import { useAuthStore } from './store/authStore'
import { WebApp } from './lib/telegram'
import { TelegramMainButtonSync } from './components/TelegramMainButtonSync'

function ThemeManager() {
  const theme = useSettingsStore((s) => s.theme)

  useEffect(() => {
    const root = document.documentElement
    
    if (theme === 'light') {
      root.dataset.colorScheme = 'light'
      root.style.setProperty('--tg-theme-bg-color', '#F8F3EB')
      root.style.setProperty('--tg-theme-text-color', '#0f172a')
      root.style.setProperty('--tg-theme-hint-color', '#64748b')
      root.style.setProperty('--tg-theme-secondary-bg-color', '#f1f5f9')
      root.style.setProperty('--tg-theme-button-color', '#8B5E3C')
      root.style.setProperty('--tg-theme-button-text-color', '#F8F3EB')
      root.style.setProperty('--tg-theme-accent-text-color', '#C79A5D')
      root.style.setProperty('--tg-theme-link-color', '#8B5E3C')
    } else if (theme === 'dark') {
      root.dataset.colorScheme = 'dark'
      root.style.setProperty('--tg-theme-bg-color', '#1c1c1e')
      root.style.setProperty('--tg-theme-text-color', '#f5f5f7')
      root.style.setProperty('--tg-theme-hint-color', '#8e8e93')
      root.style.setProperty('--tg-theme-secondary-bg-color', '#2c2c2e')
      root.style.setProperty('--tg-theme-button-color', '#C79A5D')
      root.style.setProperty('--tg-theme-button-text-color', '#1c1c1e')
      root.style.setProperty('--tg-theme-accent-text-color', '#C79A5D')
      root.style.setProperty('--tg-theme-link-color', '#C79A5D')
    } else {
      // auto - use Telegram theme
      try {
        const tgColorScheme = WebApp.colorScheme
        root.dataset.colorScheme = tgColorScheme ?? 'light'
      } catch {
        root.dataset.colorScheme = 'light'
      }
    }
  }, [theme])

  return null
}

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/order" element={<OrderFormPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </AnimatePresence>
  )
}

function AuthInit() {
  const initAuth = useAuthStore((s) => s.initAuth)
  useEffect(() => {
    void initAuth()
  }, [initAuth])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeManager />
      <AuthInit />
      <TelegramMainButtonSync />
      <AnimatedRoutes />
    </BrowserRouter>
  )
}
