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
import { AdminPage } from './pages/AdminPage'
import { useSettingsStore } from './store/settingsStore'
import { useAuthStore } from './store/authStore'
import { WebApp, applyTelegramTheme, syncTelegramChrome } from './lib/telegram'
import { TelegramMainButtonSync, useTelegramBackButton } from './components/TelegramMainButtonSync'
import { AppBackground } from './components/AppBackground'

function ThemeManager() {
  const theme = useSettingsStore((s) => s.theme)

  useEffect(() => {
    const root = document.documentElement

    if (theme === 'auto') {
      applyTelegramTheme()
      try {
        WebApp.onEvent('themeChanged', applyTelegramTheme)
      } catch {
        // not in Telegram
      }
      return () => {
        try { WebApp.offEvent('themeChanged', applyTelegramTheme) } catch { /* ignore */ }
      }
    }

    root.dataset.colorScheme = theme
    syncTelegramChrome()
  }, [theme])

  return null
}

function TelegramBackButton() {
  useTelegramBackButton()
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
        <Route path="/admin" element={<AdminPage />} />
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
      <AppBackground />
      <ThemeManager />
      <AuthInit />
      <TelegramMainButtonSync />
      <TelegramBackButton />
      <AnimatedRoutes />
    </BrowserRouter>
  )
}
