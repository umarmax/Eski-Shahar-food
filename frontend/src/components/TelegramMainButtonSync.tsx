import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { useSettingsStore } from '../store/settingsStore'
import { WebApp } from '../lib/telegram'
import { t } from '../lib/i18n'

/**
 * Syncs cart state with Telegram's MainButton.
 * Shows "View Cart" button when items are in cart (except on cart/order pages).
 * Shows "Checkout" button on cart page when items exist.
 */
export function TelegramMainButtonSync() {
  const navigate = useNavigate()
  const location = useLocation()
  const items = useCartStore((s) => s.items)
  const totalPrice = useCartStore((s) => s.totalPrice())
  const language = useSettingsStore((s) => s.language)

  useEffect(() => {
    try {
      const MainButton = WebApp.MainButton
      if (!MainButton) return

      const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
      const isCartPage = location.pathname === '/cart'
      const isOrderPage = location.pathname === '/order'
      const isProductPage = location.pathname.startsWith('/product/')

      // Hide button on order page (form submission handled separately)
      if (isOrderPage) {
        MainButton.hide()
        return
      }

      // No items - hide button
      if (itemCount === 0) {
        MainButton.hide()
        return
      }

      // Format price
      const formattedTotal = totalPrice.toLocaleString('uz-UZ')

      if (isCartPage) {
        // On cart page - show "Checkout" button
        MainButton.setText(`${t(language, 'checkout_btn')} • ${formattedTotal} ${t(language, 'currency')}`)
        MainButton.color = '#8B5E3C' // Primary brown
        MainButton.textColor = '#F8F3EB' // Cream
        MainButton.onClick(() => navigate('/order'))
        MainButton.show()
      } else if (isProductPage) {
        // On product page - show "View Cart" with item count
        MainButton.setText(`${t(language, 'cart')} (${itemCount}) • ${formattedTotal} ${t(language, 'currency')}`)
        MainButton.color = '#8B5E3C'
        MainButton.textColor = '#F8F3EB'
        MainButton.onClick(() => navigate('/cart'))
        MainButton.show()
      } else {
        // On other pages - show floating cart indicator
        MainButton.setText(`🛒 ${itemCount} • ${formattedTotal} ${t(language, 'currency')}`)
        MainButton.color = '#8B5E3C'
        MainButton.textColor = '#F8F3EB'
        MainButton.onClick(() => navigate('/cart'))
        MainButton.show()
      }

      // Cleanup
      return () => {
        try {
          MainButton.offClick(() => {})
        } catch {
          // Ignore cleanup errors
        }
      }
    } catch {
      // Telegram SDK not available (running outside Telegram)
    }
  }, [items, totalPrice, location.pathname, language, navigate])

  return null
}

/**
 * Hook to control Telegram BackButton based on navigation
 */
export function useTelegramBackButton() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    try {
      const BackButton = WebApp.BackButton
      if (!BackButton) return

      const isHomePage = location.pathname === '/'

      if (isHomePage) {
        BackButton.hide()
      } else {
        BackButton.show()
        BackButton.onClick(() => navigate(-1))
      }

      return () => {
        try {
          BackButton.offClick(() => {})
        } catch {
          // Ignore cleanup errors
        }
      }
    } catch {
      // Telegram SDK not available
    }
  }, [location.pathname, navigate])
}
