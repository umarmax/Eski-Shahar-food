'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ChevronRight, Heart, Globe, HeadphonesIcon, Info, MapPin,
  Phone, ShoppingBag, Settings,
} from 'lucide-react'
import { ProductCard } from '@/components/ui/ProductCard'
import { PageLoader } from '@/components/ui/Loading'
import { api, formatPrice } from '@/lib/api'
import { t, restaurantName } from '@/lib/i18n'
import { useAppStore } from '@/lib/store'
import type { Language, Order, RestaurantSettings } from '@/lib/types'

const languages: { code: Language; label: string }[] = [
  { code: 'uz', label: "O'zbek" },
  { code: 'ru', label: 'Русский' },
  { code: 'en', label: 'English' },
]

const statusColors: Record<string, string> = {
  pending: 'bg-sand/30 text-walnut',
  accepted: 'bg-emerald/20 text-emerald',
  preparing: 'bg-orange-100 text-orange-700',
  courier: 'bg-blue-100 text-blue-700',
  delivered: 'bg-emerald/20 text-emerald',
  cancelled: 'bg-red-100 text-red-600',
}

export default function ProfilePage() {
  const language = useAppStore((s) => s.language)
  const setLanguage = useAppStore((s) => s.setLanguage)
  const user = useAppStore((s) => s.user)
  const favorites = useAppStore((s) => s.favorites)
  const [orders, setOrders] = useState<Order[]>([])
  const [favProducts, setFavProducts] = useState<Awaited<ReturnType<typeof api.getFavorites>>>([])
  const [settings, setSettings] = useState<RestaurantSettings | null>(null)
  const [tab, setTab] = useState<'menu' | 'orders' | 'favorites' | 'about'>('menu')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const promises: Promise<void>[] = [api.getSettings().then(setSettings).then(() => {})]
    if (user) {
      promises.push(api.getUserOrders(user.id).then(setOrders).then(() => {}))
      promises.push(api.getFavorites(user.id, language).then(setFavProducts).then(() => {}))
    }
    Promise.all(promises).finally(() => setLoading(false))
  }, [user, language])

  const menuItems = [
    { id: 'orders' as const, icon: ShoppingBag, label: t(language, 'profile.orders'), count: orders.length },
    { id: 'favorites' as const, icon: Heart, label: t(language, 'profile.favorites'), count: favorites.size },
    { id: 'about' as const, icon: Info, label: t(language, 'profile.about') },
  ]

  if (loading) return <PageLoader />

  return (
    <main className="min-h-screen px-4 pt-6 pb-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-walnut to-sand flex items-center justify-center text-white text-2xl font-serif">
          {user?.firstName?.[0] || 'M'}
        </div>
        <div>
          <h1 className="font-serif text-2xl">
            {user?.firstName} {user?.lastName}
          </h1>
          {user?.username && <p className="text-text-muted text-sm">@{user.username}</p>}
        </div>
      </div>

      {/* Language */}
      <div className="bg-card rounded-[20px] p-4 shadow-soft mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-4 h-4 text-walnut" />
          <span className="font-medium text-sm">{t(language, 'profile.language')}</span>
        </div>
        <div className="flex gap-2">
          {languages.map(({ code, label }) => (
            <button
              key={code}
              onClick={() => setLanguage(code)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                language === code ? 'bg-walnut text-white' : 'bg-cream text-text-muted'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Menu items */}
      <div className="bg-card rounded-[20px] shadow-soft overflow-hidden mb-4">
        {menuItems.map(({ id, icon: Icon, label, count }, i) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`w-full flex items-center gap-3 px-4 py-4 hover:bg-cream/50 transition-colors ${
              i > 0 ? 'border-t border-border' : ''
            }`}
          >
            <Icon className="w-5 h-5 text-walnut" />
            <span className="flex-1 text-left font-medium">{label}</span>
            {count !== undefined && count > 0 && (
              <span className="text-xs bg-cream px-2 py-0.5 rounded-full">{count}</span>
            )}
            <ChevronRight className="w-4 h-4 text-text-muted" />
          </button>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {settings && (
          <>
            <a
              href={`tel:${settings.phone}`}
              className="bg-card rounded-[18px] p-4 shadow-soft flex flex-col items-center gap-2 hover:shadow-lift transition-shadow"
            >
              <Phone className="w-5 h-5 text-emerald" />
              <span className="text-xs font-medium text-center">{t(language, 'profile.callOperator')}</span>
            </a>
            <a
              href={settings.telegramUrl || '#'}
              target="_blank"
              rel="noopener"
              className="bg-card rounded-[18px] p-4 shadow-soft flex flex-col items-center gap-2 hover:shadow-lift transition-shadow"
            >
              <HeadphonesIcon className="w-5 h-5 text-walnut" />
              <span className="text-xs font-medium text-center">{t(language, 'profile.support')}</span>
            </a>
          </>
        )}
        <Link
          href="/admin"
          className="bg-card rounded-[18px] p-4 shadow-soft flex flex-col items-center gap-2 hover:shadow-lift transition-shadow col-span-2"
        >
          <Settings className="w-5 h-5 text-text-muted" />
          <span className="text-xs font-medium">{t(language, 'admin.title')}</span>
        </Link>
      </div>

      {/* Tab content */}
      {tab === 'orders' && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2 className="font-serif text-xl mb-4">{t(language, 'profile.orders')}</h2>
          {orders.length === 0 ? (
            <p className="text-text-muted text-sm">—</p>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="bg-card rounded-[18px] p-4 shadow-soft">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium">#{order.orderNumber}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${statusColors[order.status]}`}>
                      {t(language, `order.status.${order.status}` as 'order.status.pending')}
                    </span>
                  </div>
                  <p className="text-sm text-text-muted">
                    {order.items.map((i) => `${i.product.nameUz || i.product.name} ×${i.quantity}`).join(', ')}
                  </p>
                  <p className="text-walnut font-semibold mt-2">{formatPrice(order.total, language)}</p>
                </div>
              ))}
            </div>
          )}
        </motion.section>
      )}

      {tab === 'favorites' && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2 className="font-serif text-xl mb-4">{t(language, 'profile.favorites')}</h2>
          {favProducts.length === 0 ? (
            <p className="text-text-muted text-sm">—</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {favProducts.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          )}
        </motion.section>
      )}

      {tab === 'about' && settings && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2 className="font-serif text-xl mb-4">{t(language, 'profile.about')}</h2>
          <div className="bg-card rounded-[20px] p-5 shadow-soft space-y-4">
            <h3 className="font-serif text-2xl">{restaurantName(settings, language)}</h3>
            <p className="text-text-muted text-sm leading-relaxed">
              {t(language, 'hero.subtitle')}
            </p>
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="w-4 h-4 text-emerald shrink-0 mt-0.5" />
              <span>{settings.address}</span>
            </div>
            <p className="text-sm">
              {settings.openTime} – {settings.closeTime}
            </p>
            {settings.instagramUrl && (
              <a href={settings.instagramUrl} target="_blank" rel="noopener" className="text-walnut text-sm">
                Instagram →
              </a>
            )}
          </div>
        </motion.section>
      )}
    </main>
  )
}
