'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Home, UtensilsCrossed, Search, ShoppingBag, User, Info, ShieldCheck } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { t } from '@/lib/i18n'
import { useTelegram } from '@/components/providers/TelegramProvider'

const baseTabs = [
  { href: '/', icon: Home, key: 'nav.home' as const },
  { href: '/menu', icon: UtensilsCrossed, key: 'nav.menu' as const },
  { href: '/cart', icon: ShoppingBag, key: 'nav.cart' as const },
  { href: '/about', icon: Info, key: 'nav.about' as const },
  { href: '/profile', icon: User, key: 'nav.profile' as const },
]

const adminTab = { href: '/admin', icon: ShieldCheck, key: 'nav.admin' as const }

export function BottomNav() {
  const pathname = usePathname()
  const language = useAppStore((s) => s.language)
  const cartCount = useAppStore((s) => s.cartCount())
  const { webApp } = useTelegram()

  const adminId = process.env.NEXT_PUBLIC_ADMIN_TELEGRAM_ID
  const userId = webApp?.initDataUnsafe?.user?.id?.toString()
  const isAdmin = !!(adminId && userId === adminId)

  if (pathname.startsWith('/checkout') || pathname.startsWith('/admin')) return null

  const tabs = isAdmin ? [...baseTabs, adminTab] : baseTabs

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
      <div className="mx-4 mb-4 glass rounded-[24px] shadow-lift">
        <div className="flex items-center justify-around py-2 px-2">
          {tabs.map(({ href, icon: Icon, key }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className="relative flex flex-col items-center gap-0.5 py-2 px-3 min-w-[48px]"
              >
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 bg-walnut/10 rounded-2xl"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-colors ${active ? 'text-walnut' : 'text-text-muted'}`}
                    strokeWidth={active ? 2.5 : 2}
                  />
                  {href === '/cart' && cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-emerald text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-medium ${active ? 'text-walnut' : 'text-text-muted'}`}>
                  {t(language, key)}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

export function FloatingCartButton() {
  const pathname = usePathname()
  const language = useAppStore((s) => s.language)
  const cartCount = useAppStore((s) => s.cartCount())
  const cartTotal = useAppStore((s) => s.cartTotal())

  if (cartCount === 0 || pathname === '/cart' || pathname.startsWith('/checkout')) return null

  return (
    <Link href="/cart" className="fixed bottom-24 left-4 right-4 z-40 md:left-auto md:right-6 md:w-80">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        whileTap={{ scale: 0.98 }}
        className="bg-emerald text-white rounded-[20px] px-5 py-4 shadow-lift flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold text-sm">
            {cartCount}
          </span>
          <span className="font-medium">{t(language, 'nav.cart')}</span>
        </div>
        <span className="font-semibold">{cartTotal.toLocaleString()} so&apos;m</span>
      </motion.div>
    </Link>
  )
}
