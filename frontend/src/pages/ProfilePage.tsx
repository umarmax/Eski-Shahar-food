import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Layout } from '../components/Layout'
import { PageHeader } from '../components/PageHeader'
import { fetchOrdersByPhone, supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { useSettingsStore, formatPrice } from '../store/settingsStore'
import { t } from '../lib/i18n'
import { WebApp } from '../lib/telegram'
import type { Order } from '../types'

export function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const lang = useSettingsStore((s) => s.language)
  
  const [phone, setPhone] = useState('')
  const [orderId, setOrderId] = useState('')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [searchMode, setSearchMode] = useState<'phone' | 'orderId'>('phone')

  // Get Telegram user ID if available
  const telegramUserId = (() => {
    try {
      const tgId = user?.telegram_id || WebApp.initDataUnsafe?.user?.id || null
      console.log('[ProfilePage] Telegram user ID:', tgId)
      console.log('[ProfilePage] user from store:', user)
      console.log('[ProfilePage] WebApp.initDataUnsafe:', WebApp.initDataUnsafe)
      return tgId
    } catch (e) {
      console.error('[ProfilePage] Error getting Telegram ID:', e)
      return null
    }
  })()

  const isAuthenticated = telegramUserId && telegramUserId !== 0
  console.log('[ProfilePage] isAuthenticated:', isAuthenticated)

  // Load saved phone from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('choyxona-last-phone')
      if (saved) setPhone(saved)
    } catch {}
  }, [])

  // Auto-load orders if authenticated via Telegram
  useEffect(() => {
    if (isAuthenticated && telegramUserId) {
      loadOrdersByTelegram()
    }
  }, [isAuthenticated, telegramUserId])

  const loadOrdersByTelegram = async () => {
    if (!telegramUserId) return
    
    setLoading(true)
    setSearched(true)
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('telegram_user_id', telegramUserId)
        .order('created_at', { ascending: false })
      
      if (!error && data) {
        setOrders(data as Order[])
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearchByPhone = async () => {
    if (!phone.trim()) return
    
    console.log('[ProfilePage] Searching for phone:', phone.trim())
    setLoading(true)
    setSearched(true)
    
    // Save phone for future use
    try {
      localStorage.setItem('choyxona-last-phone', phone.trim())
    } catch {}
    
    try {
      const data = await fetchOrdersByPhone(phone.trim())
      console.log('[ProfilePage] Orders found:', data.length, data)
      setOrders(data)
    } catch (error) {
      console.error('[ProfilePage] Failed to fetch orders:', error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearchByOrderId = async () => {
    if (!orderId.trim()) return
    
    console.log('[ProfilePage] Searching for order ID:', orderId.trim())
    setLoading(true)
    setSearched(true)
    
    try {
      // Search by order ID (first 8 characters or full UUID)
      const searchId = orderId.trim().toLowerCase()
      
      // Try exact match first (full UUID)
      let { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', searchId)
        .order('created_at', { ascending: false })
      
      // If no exact match, try prefix match using ilike
      if ((!data || data.length === 0) && searchId.length >= 4) {
        const result = await supabase
          .from('orders')
          .select('*')
          .ilike('id', `${searchId}%`)
          .order('created_at', { ascending: false })
        
        if (!result.error && result.data) {
          data = result.data
          error = null
        }
      }
      
      if (!error && data) {
        console.log('[ProfilePage] Orders found by ID:', data.length, data)
        setOrders(data as Order[])
      } else {
        console.log('[ProfilePage] Order lookup error:', error)
        setOrders([])
      }
    } catch (error) {
      console.error('[ProfilePage] Failed to fetch order:', error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusLabel = (status: Order['status']) => {
    const statusMap: Record<string, string> = {
      pending: lang === 'uz' ? 'Kutilmoqda' : lang === 'ru' ? 'Ожидает' : 'Pending',
      confirmed: lang === 'uz' ? 'Tasdiqlandi' : lang === 'ru' ? 'Подтверждён' : 'Confirmed',
      preparing: lang === 'uz' ? 'Tayyorlanmoqda' : lang === 'ru' ? 'Готовится' : 'Preparing',
      ready: lang === 'uz' ? 'Tayyor' : lang === 'ru' ? 'Готов' : 'Ready',
      delivered: lang === 'uz' ? 'Yetkazildi' : lang === 'ru' ? 'Доставлен' : 'Delivered',
      cancelled: lang === 'uz' ? 'Bekor qilindi' : lang === 'ru' ? 'Отменён' : 'Cancelled',
    }
    return statusMap[status] || status
  }

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'var(--tg-theme-hint-color)'
      case 'confirmed': return '#3b82f6'
      case 'preparing': return '#f59e0b'
      case 'ready': return '#10b981'
      case 'delivered': return '#22c55e'
      case 'cancelled': return 'var(--tg-theme-destructive-text-color)'
      default: return 'var(--tg-theme-hint-color)'
    }
  }

  const displayName = user && user.id !== 'dev-user'
    ? [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Guest'
    : 'Guest'

  return (
    <Layout>
      <PageHeader title={t(lang, 'profile_title')} subtitle={t(lang, 'profile_subtitle')} />

      {/* Telegram User Info (if authenticated) */}
      {isAuthenticated && user && (
        <section className="px-4 pb-6">
          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center gap-4">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full text-2xl"
                style={{ background: 'var(--tg-theme-secondary-bg-color)' }}
              >
                {user.photo_url ? (
                  <img src={user.photo_url} alt="" className="h-full w-full rounded-full object-cover" />
                ) : (
                  '👤'
                )}
              </div>
              <div>
                <p className="font-semibold" style={{ color: 'var(--tg-theme-text-color)' }}>
                  {displayName}
                </p>
                {user.username && (
                  <p className="text-sm" style={{ color: 'var(--tg-theme-hint-color)' }}>
                    @{user.username}
                  </p>
                )}
                <p className="text-xs mt-1" style={{ color: 'var(--tg-theme-link-color)' }}>
                  ✓ {lang === 'uz' ? 'Telegram orqali kirgan' : lang === 'ru' ? 'Вход через Telegram' : 'Logged in via Telegram'}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Search mode toggle */}
      <section className="px-4 pb-4">
        <h2 className="mb-3 text-lg font-semibold" style={{ color: 'var(--tg-theme-text-color)' }}>
          {t(lang, 'my_orders')}
        </h2>
        
        <div className="flex gap-2 mb-3">
          <button
            type="button"
            onClick={() => setSearchMode('phone')}
            className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              searchMode === 'phone' ? 'opacity-100' : 'opacity-50'
            }`}
            style={{ 
              background: searchMode === 'phone' ? 'var(--tg-theme-button-color)' : 'var(--tg-theme-secondary-bg-color)',
              color: searchMode === 'phone' ? 'var(--tg-theme-button-text-color)' : 'var(--tg-theme-text-color)'
            }}
          >
            📱 {lang === 'uz' ? 'Telefon' : lang === 'ru' ? 'Телефон' : 'Phone'}
          </button>
          <button
            type="button"
            onClick={() => setSearchMode('orderId')}
            className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              searchMode === 'orderId' ? 'opacity-100' : 'opacity-50'
            }`}
            style={{ 
              background: searchMode === 'orderId' ? 'var(--tg-theme-button-color)' : 'var(--tg-theme-secondary-bg-color)',
              color: searchMode === 'orderId' ? 'var(--tg-theme-button-text-color)' : 'var(--tg-theme-text-color)'
            }}
          >
            🔢 {lang === 'uz' ? 'Buyurtma №' : lang === 'ru' ? 'Заказ №' : 'Order #'}
          </button>
        </div>
        
        {searchMode === 'phone' ? (
          <div className="flex gap-2">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchByPhone()}
              placeholder={t(lang, 'order_phone_placeholder')}
              className="flex-1 rounded-xl border-0 px-4 py-3 text-base outline-none"
              style={{ background: 'var(--tg-theme-secondary-bg-color)', color: 'var(--tg-theme-text-color)' }}
            />
            <button
              type="button"
              onClick={handleSearchByPhone}
              disabled={loading || !phone.trim()}
              className="rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-50"
              style={{ background: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)' }}
            >
              🔍
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchByOrderId()}
              placeholder={lang === 'uz' ? 'Buyurtma raqami (masalan: 5b8d0204)' : lang === 'ru' ? 'Номер заказа (например: 5b8d0204)' : 'Order number (e.g. 5b8d0204)'}
              className="flex-1 rounded-xl border-0 px-4 py-3 text-base outline-none"
              style={{ background: 'var(--tg-theme-secondary-bg-color)', color: 'var(--tg-theme-text-color)' }}
            />
            <button
              type="button"
              onClick={handleSearchByOrderId}
              disabled={loading || !orderId.trim()}
              className="rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-50"
              style={{ background: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)' }}
            >
              🔍
            </button>
          </div>
        )}
      </section>

      {/* Orders list */}
      <section className="px-4 pb-6">
        {loading && (
          <div className="flex justify-center py-8">
            <div className="text-2xl animate-pulse">⏳</div>
          </div>
        )}

        {!loading && searched && orders.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl p-8 text-center"
            style={{ background: 'var(--tg-theme-secondary-bg-color)' }}
          >
            <p className="mb-2 text-4xl">📋</p>
            <p className="mb-4 text-sm" style={{ color: 'var(--tg-theme-hint-color)' }}>
              {t(lang, 'no_orders')}
            </p>
            <Link
              to="/menu"
              className="inline-flex min-h-[44px] items-center rounded-xl px-5 text-sm font-semibold"
              style={{ background: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)' }}
            >
              {t(lang, 'go_to_menu')}
            </Link>
          </motion.div>
        )}

        {!loading && orders.length > 0 && (
          <div className="space-y-3">
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card rounded-2xl p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold" style={{ color: 'var(--tg-theme-text-color)' }}>
                    №{order.id.slice(0, 8)}
                  </span>
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{ background: `color-mix(in srgb, ${getStatusColor(order.status)} 20%, transparent)`, color: getStatusColor(order.status) }}
                  >
                    {getStatusLabel(order.status)}
                  </span>
                </div>
                <p className="text-sm" style={{ color: 'var(--tg-theme-hint-color)' }}>
                  {new Date(order.created_at).toLocaleDateString()} · {order.items.length} {t(lang, 'items_count')}
                </p>
                <p className="mt-1 font-semibold" style={{ color: 'var(--tg-theme-accent-text-color)' }}>
                  {formatPrice(order.total)}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* About link */}
      <section className="px-4 pb-6">
        <Link
          to="/about"
          className="glass-card flex items-center justify-between rounded-2xl p-4"
        >
          <span style={{ color: 'var(--tg-theme-text-color)' }}>{t(lang, 'about')}</span>
          <span style={{ color: 'var(--tg-theme-hint-color)' }}>→</span>
        </Link>
      </section>
    </Layout>
  )
}
