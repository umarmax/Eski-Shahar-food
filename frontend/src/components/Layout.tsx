import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { useSettingsStore } from '../store/settingsStore'
import { t } from '../lib/i18n'
import { AboutIcon, CartIcon, HomeIcon, ProfileIcon } from './icons'

interface LayoutProps {
  children: ReactNode
  hideNav?: boolean
}

export function Layout({ children, hideNav = false }: LayoutProps) {
  const cartCount = useCartStore((s) => s.totalItems())
  const lang = useSettingsStore((s) => s.language)

  const TABS = [
    { to: '/', label: t(lang, 'home'), Icon: HomeIcon, end: true },
    { to: '/cart', label: t(lang, 'cart'), Icon: CartIcon, end: false },
    { to: '/about', label: t(lang, 'about'), Icon: AboutIcon, end: false },
    { to: '/profile', label: t(lang, 'profile'), Icon: ProfileIcon, end: false },
  ] as const

  return (
    <div className="app-shell mx-auto max-w-md">
      <main>{children}</main>

      {!hideNav && (
        <nav
          className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md rounded-t-3xl px-2 pt-2"
          style={{
            paddingBottom: 'calc(var(--app-safe-bottom) + 8px)',
            background: 'color-mix(in srgb, var(--paper-card) 94%, transparent)',
            boxShadow: '0 -6px 24px -12px rgba(var(--paper-ink), 0.35)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div className="flex items-center justify-around">
            {TABS.map(({ to, label, Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className="relative flex min-h-[52px] min-w-[64px] flex-col items-center justify-center gap-1 rounded-xl px-2 text-[11px] font-medium"
                style={({ isActive }) => ({
                  color: isActive ? 'var(--tg-theme-button-color)' : 'var(--tg-theme-hint-color)',
                })}
              >
                <Icon size={24} />
                <span>{label}</span>
                {to === '/cart' && cartCount > 0 && (
                  <span
                    className="absolute right-2 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold"
                    style={{
                      background: 'var(--tg-theme-accent-text-color)',
                      color: 'var(--tg-theme-button-text-color)',
                    }}
                  >
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </div>
  )
}
