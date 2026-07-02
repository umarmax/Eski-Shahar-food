import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Layout } from '../components/Layout'
import { PageHeader } from '../components/PageHeader'
import { fetchOrdersByPhone } from '../lib/supabase'
import { useSettingsStore, formatPrice } from '../store/settingsStore'
import { t } from '../lib/i18n'
import type { Order } from '../types'

export function ProfilePage() {
  const lang = useSettingsStore((s) => s.language)
  
  const [phone, setPhone] = useState('')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  // Load saved phone from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('choyxona-last-phone')
      if (saved) setPhone(saved)
    } catch {}
  }, [])

  const handleSearch = async () => {
    if (!phone.trim()) return
    
    setLoading(true)
    setSearched(true)
    
    // Save phone for future use
    try {
      localStorage.setItem('choyxona-last-phone', phone.trim())
    } catch {}
    
    try {
      const data = await fetchOrdersByPhone(phone.trim())
      setOrders(data)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
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

  return (
    <Layout>
      <PageHeader title={t(lang, 'profile_title')} subtitle={t(lang, 'profile_subtitle')} />

      {/* Phone search for orders */}
      <section className="px-4 pb-6">
        <h2 className="mb-3 text-lg font-semibold" style={{ color: 'var(--tg-theme-text-color)' }}>
          {t(lang, 'my_orders')}
        </h2>
        <div className="flex gap-2">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={t(lang, 'order_phone_placeholder')}
            className="flex-1 rounded-xl border-0 px-4 py-3 text-base outline-none"
            style={{ background: 'var(--tg-theme-secondary-bg-color)', color: 'var(--tg-theme-text-color)' }}
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={loading || !phone.trim()}
            className="rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-50"
            style={{ background: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)' }}
          >
            🔍
          </button>
        </div>
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
