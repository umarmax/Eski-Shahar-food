import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Layout } from '../components/Layout'
import { PageHeader } from '../components/PageHeader'
import { fetchMyOrders, fetchOrderByIdAndPhone } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { useSettingsStore, formatPrice } from '../store/settingsStore'
import { t } from '../lib/i18n'
import { WebApp, isInTelegram } from '../lib/telegram'
import { isAdminUser } from '../lib/admin'
import type { Order } from '../types'

export function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const lang = useSettingsStore((s) => s.language)

  const [phone, setPhone] = useState(() => {
    try { return localStorage.getItem('choyxona-last-phone') ?? '' } catch { return '' }
  })
  const [orderId, setOrderId] = useState('')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  // Signed Telegram session → load own orders automatically
  useEffect(() => {
    if (!isInTelegram) return
    let cancelled = false
    setLoading(true)
    setSearched(true)
    fetchMyOrders(WebApp.initData)
      .then((data) => { if (!cancelled) setOrders(data) })
      .catch(() => { if (!cancelled) setOrders([]) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const handleLookup = async () => {
    if (!phone.trim() || !orderId.trim()) return
    setLoading(true)
    setSearched(true)
    try { localStorage.setItem('choyxona-last-phone', phone.trim()) } catch { /* ignore */ }
    try {
      setOrders(await fetchOrderByIdAndPhone(orderId.trim(), phone.trim()))
    } catch {
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
      {isInTelegram && user && (
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

      {/* Order lookup (outside Telegram: order ID + phone) */}
      <section className="px-4 pb-4">
        <h2 className="mb-3 font-serif text-xl font-semibold" style={{ color: 'var(--tg-theme-text-color)' }}>
          {t(lang, 'my_orders')}
        </h2>

        {!isInTelegram && (
          <div className="paper-card space-y-2 rounded-2xl p-3">
            <p className="text-xs" style={{ color: 'var(--tg-theme-hint-color)' }}>
              {t(lang, 'lookup_hint')}
            </p>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder={t(lang, 'lookup_order_id_placeholder')}
              maxLength={40}
              className="paper-input w-full rounded-xl px-4 py-3 text-base outline-none"
            />
            <div className="flex gap-2">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                placeholder={t(lang, 'order_phone_placeholder')}
                className="paper-input min-w-0 flex-1 rounded-xl px-4 py-3 text-base outline-none"
              />
              <button
                type="button"
                onClick={handleLookup}
                disabled={loading || !phone.trim() || !orderId.trim()}
                className="rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-50"
                style={{ background: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)' }}
              >
                🔍
              </button>
            </div>
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

      {/* Admin entry (server re-checks permissions) */}
      {isAdminUser() && (
        <section className="px-4 pb-3">
          <Link
            to="/admin"
            className="flex items-center justify-between rounded-2xl p-4 font-semibold"
            style={{ background: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)' }}
          >
            <span>⚙️ {lang === 'ru' ? 'Админ-панель' : 'Admin panel'}</span>
            <span>→</span>
          </Link>
        </section>
      )}

      {/* About + settings links */}
      <section className="space-y-2 px-4 pb-6">
        <Link
          to="/settings"
          className="glass-card flex items-center justify-between rounded-2xl p-4"
        >
          <span style={{ color: 'var(--tg-theme-text-color)' }}>⚙️ {t(lang, 'settings')}</span>
          <span style={{ color: 'var(--tg-theme-hint-color)' }}>→</span>
        </Link>
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
