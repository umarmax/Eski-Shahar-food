'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, TrendingUp, Users, ShoppingBag, UtensilsCrossed, Plus, Edit, Trash } from 'lucide-react'
import { PageLoader } from '@/components/ui/Loading'
import { Button } from '@/components/ui/Button'
import { api, formatPrice } from '@/lib/api'
import { t } from '@/lib/i18n'
import { useAppStore } from '@/lib/store'
import type { AdminStats, Order } from '@/lib/types'

export default function AdminPage() {
  const language = useAppStore((s) => s.language)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [tab, setTab] = useState<'orders' | 'analytics' | 'menu'>('orders')
  const [loading, setLoading] = useState(true)

  const fetchProducts = () => api.getProducts(language).then(setProducts).catch(console.error)

  useEffect(() => {
    Promise.all([api.getAdminStats(), api.getAllOrders(), fetchProducts()])
      .then(([s, o]) => {
        setStats(s)
        setOrders(o)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const updateStatus = async (id: string, status: string) => {
    const updated = await api.updateOrderStatus(id, status)
    setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)))
  }

  if (loading) return <PageLoader />

  const statCards = stats
    ? [
        { icon: ShoppingBag, label: t(language, 'admin.orders'), value: stats.todayOrders, sub: `/${stats.totalOrders} total` },
        { icon: TrendingUp, label: 'Revenue today', value: formatPrice(stats.todayRevenue, language), sub: formatPrice(stats.totalRevenue, language) },
        { icon: UtensilsCrossed, label: 'Menu items', value: stats.products },
        { icon: Users, label: 'Customers', value: stats.customers },
      ]
    : []

  return (
    <main className="min-h-screen px-4 pt-6 pb-8 max-w-2xl mx-auto">
      <Link href="/profile" className="flex items-center gap-2 text-text-muted mb-4">
        <ArrowLeft className="w-4 h-4" /> {t(language, 'common.back')}
      </Link>

      <h1 className="font-serif text-3xl mb-6">{t(language, 'admin.title')}</h1>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {(['orders', 'analytics', 'menu'] as const).map((t_) => (
          <button
            key={t_}
            onClick={() => setTab(t_)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              tab === t_ ? 'bg-walnut text-white' : 'bg-card text-text-muted shadow-soft'
            }`}
          >
            {t_ === 'menu' ? 'Menu CRUD' : t(language, t_ === 'orders' ? 'admin.orders' : 'admin.analytics')}
          </button>
        ))}
      </div>

      {tab === 'analytics' && stats && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {statCards.map(({ icon: Icon, label, value, sub }) => (
              <div key={label} className="bg-card rounded-[20px] p-4 shadow-soft">
                <Icon className="w-5 h-5 text-walnut mb-2" />
                <p className="text-xs text-text-muted">{label}</p>
                <p className="font-serif text-2xl mt-1">{value}</p>
                {sub && <p className="text-xs text-text-muted">{sub}</p>}
              </div>
            ))}
          </div>

          {stats.popularProducts.length > 0 && (
            <div className="bg-card rounded-[20px] p-4 shadow-soft">
              <h3 className="font-medium mb-3">{t(language, 'popular.title')}</h3>
              {stats.popularProducts.map(({ product, quantity }, i) => (
                <div key={i} className="flex justify-between py-2 border-b border-border last:border-0 text-sm">
                  <span>{product?.nameUz || product?.nameEn || '—'}</span>
                  <span className="text-text-muted">{quantity} sold</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {tab === 'orders' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-card rounded-[20px] p-4 shadow-soft">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold">#{order.orderNumber}</p>
                  <p className="text-sm text-text-muted">
                    {order.user?.firstName} {order.user?.lastName} · {order.phone}
                  </p>
                </div>
                <span className="font-semibold text-walnut">{formatPrice(order.total, language)}</span>
              </div>
              <p className="text-sm mb-2">
                {order.items.map((i) => `${i.product.nameUz} ×${i.quantity}`).join(', ')}
              </p>
              {order.comment && <p className="text-xs text-text-muted mb-2">"{order.comment}"</p>}
              <div className="flex gap-1.5 flex-wrap">
                {(['pending', 'accepted', 'preparing', 'courier', 'delivered'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(order.id, s)}
                    className={`px-2 py-1 rounded-lg text-xs ${
                      order.status === s ? 'bg-walnut text-white' : 'bg-cream text-text-muted'
                    }`}
                  >
                    {t(language, `order.status.${s}`)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {tab === 'menu' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold text-lg">Menu Items</h2>
            <Link href="/admin/menu/new">
              <Button size="sm" variant="emerald" className="gap-2"><Plus className="w-4 h-4"/> Add New</Button>
            </Link>
          </div>
          
          <div className="space-y-3">
            {products.map((p) => (
              <div key={p.id} className="bg-card rounded-[20px] p-4 shadow-soft flex gap-4 items-center">
                <img src={p.imageUrl} alt={p.name} className="w-16 h-16 rounded-xl object-cover bg-cream" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{p.name}</h3>
                  <p className="text-sm text-text-muted">{formatPrice(p.price, language)}</p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/menu/${p.id}`}>
                    <button className="p-2 text-text-muted hover:text-walnut bg-cream rounded-full">
                      <Edit className="w-4 h-4" />
                    </button>
                  </Link>
                  <button onClick={async () => {
                    if (confirm('Are you sure you want to delete this product?')) {
                      await api.deleteProduct(p.id)
                      fetchProducts()
                    }
                  }} className="p-2 text-red-400 hover:text-red-500 bg-red-50 rounded-full">
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </main>
  )
}
