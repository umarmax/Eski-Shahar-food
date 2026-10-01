import { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { useSettingsStore } from '../store/settingsStore'
import { WebApp } from '../lib/telegram'
import { t } from '../lib/i18n'

const BUTTON_COLOR = '#C8773E'
const BUTTON_TEXT_COLOR = '#1E140D'

/**
 * Syncs cart state with Telegram's MainButton.
 * Shows "View Cart" button when items are in cart (except on cart/order pages).
 * Shows "Checkout" button on cart page when items exist.
 *
 * A single stable click handler is registered once; the target route lives
 * in a ref so re-renders never stack extra handlers.
 */
export function TelegramMainButtonSync() {
  const navigate = useNavigate()
  const location = useLocation()
  const items = useCartStore((s) => s.items)
  const totalPrice = useCartStore((s) => s.totalPrice())
  const language = useSettingsStore((s) => s.language)
  const targetRef = useRef('/cart')

  useEffect(() => {
    const handleClick = () => navigate(targetRef.current)
    try {
      WebApp.MainButton.onClick(handleClick)
    } catch {
      // Telegram SDK not available
    }
    return () => {
      try { WebApp.MainButton.offClick(handleClick) } catch { /* ignore */ }
    }
  }, [navigate])

  useEffect(() => {
    try {
      const MainButton = WebApp.MainButton
      const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
      const path = location.pathname

      if (path === '/order' || path === '/admin' || itemCount === 0) {
        MainButton.hide()
        return
      }

      const formattedTotal = `${totalPrice.toLocaleString('ru-RU')} ${t(language, 'currency')}`

      if (path === '/cart') {
        targetRef.current = '/order'
        MainButton.setText(`${t(language, 'checkout_btn')} • ${formattedTotal}`)
      } else if (path.startsWith('/product/')) {
        targetRef.current = '/cart'
        MainButton.setText(`${t(language, 'cart')} (${itemCount}) • ${formattedTotal}`)
      } else {
        targetRef.current = '/cart'
        MainButton.setText(`🛒 ${itemCount} • ${formattedTotal}`)
      }
      MainButton.color = BUTTON_COLOR
      MainButton.textColor = BUTTON_TEXT_COLOR
      MainButton.show()
    } catch {
      // Telegram SDK not available (running outside Telegram)
    }
  }, [items, totalPrice, location.pathname, language])

  return null
}

/**
 * Hook to control Telegram BackButton based on navigation
 */
export function useTelegramBackButton() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handleBack = () => navigate(-1)
    try {
      WebApp.BackButton.onClick(handleBack)
    } catch {
      // Telegram SDK not available
    }
    return () => {
      try { WebApp.BackButton.offClick(handleBack) } catch { /* ignore */ }
    }
  }, [navigate])

  useEffect(() => {
    try {
      if (location.pathname === '/') WebApp.BackButton.hide()
      else WebApp.BackButton.show()
    } catch {
      // Telegram SDK not available
    }
  }, [location.pathname])
}
