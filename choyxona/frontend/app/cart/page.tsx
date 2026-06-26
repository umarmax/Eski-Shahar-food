'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { QuantitySelector } from '@/components/ui/ProductCard'
import { api, formatPrice } from '@/lib/api'
import { t } from '@/lib/i18n'
import { useAppStore } from '@/lib/store'
import { useTelegram } from '@/components/providers/TelegramProvider'

const DELIVERY_COST = 15000

export default function CartPage() {
  const language = useAppStore((s) => s.language)
  const cart = useAppStore((s) => s.cart)
  const updateQuantity = useAppStore((s) => s.updateQuantity)
  const removeFromCart = useAppStore((s) => s.removeFromCart)
  const cartTotal = useAppStore((s) => s.cartTotal)
  const maxPrepTime = useAppStore((s) => s.maxPrepTime)
  const promoCode = useAppStore((s) => s.promoCode)
  const promoDiscount = useAppStore((s) => s.promoDiscount)
  const setPromo = useAppStore((s) => s.setPromo)
  const { haptic } = useTelegram()
  const [promoInput, setPromoInput] = useState('')
  const [promoError, setPromoError] = useState('')

  const subtotal = cartTotal()
  const discount = Math.round(subtotal * (promoDiscount / 100))
  const total = subtotal + DELIVERY_COST - discount

  const applyPromo = async () => {
    try {
      const { discountPct } = await api.validatePromo(promoInput.toUpperCase())
      setPromo(promoInput.toUpperCase(), discountPct)
      setPromoError('')
      haptic('success')
    } catch {
      setPromoError('Invalid')
      haptic('error')
    }
  }

  if (cart.length === 0) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 pb-8">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <p className="font-serif text-2xl mb-2">{t(language, 'cart.empty')}</p>
          <Link href="/menu">
            <Button variant="primary" className="mt-4">{t(language, 'hero.browseMenu')}</Button>
          </Link>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-4 pt-6 pb-8 max-w-2xl mx-auto">
      <h1 className="font-serif text-3xl mb-6">{t(language, 'cart.title')}</h1>

      <div className="space-y-3 mb-6">
        {cart.map((item, i) => (
          <motion.div
            key={item.product.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card rounded-[20px] p-3 shadow-soft flex gap-3"
          >
            <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
              <Image src={item.product.imageUrl} alt={item.product.name} fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{item.product.name}</h3>
              <p className="text-walnut font-semibold text-sm mt-0.5">
                {formatPrice(item.product.price * item.quantity, language)}
              </p>
              <div className="flex items-center justify-between mt-2">
                <QuantitySelector
                  quantity={item.quantity}
                  onChange={(q) => updateQuantity(item.product.id, q)}
                  size="sm"
                />
                <button
                  onClick={() => { removeFromCart(item.product.id); haptic('light') }}
                  className="text-text-muted hover:text-red-500 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Promo */}
      <div className="bg-card rounded-[20px] p-4 shadow-soft mb-4">
        <p className="text-sm font-medium mb-2">{t(language, 'cart.promo')}</p>
        <div className="flex gap-2">
          <input
            value={promoInput}
            onChange={(e) => setPromoInput(e.target.value)}
            placeholder="SILKROAD10"
            className="flex-1 px-3 py-2 rounded-xl bg-cream text-sm outline-none"
          />
          <Button variant="secondary" size="sm" onClick={applyPromo}>
            {t(language, 'cart.apply')}
          </Button>
        </div>
        {promoCode && <p className="text-emerald text-xs mt-2">✓ {promoCode} (-{promoDiscount}%)</p>}
        {promoError && <p className="text-red-500 text-xs mt-2">{promoError}</p>}
      </div>

      {/* Summary */}
      <div className="bg-card rounded-[20px] p-5 shadow-soft space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">{t(language, 'cart.subtotal')}</span>
          <span>{formatPrice(subtotal, language)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">{t(language, 'cart.delivery')}</span>
          <span>{formatPrice(DELIVERY_COST, language)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm text-emerald">
            <span>Promo</span>
            <span>-{formatPrice(discount, language)}</span>
          </div>
        )}
        <div className="border-t border-border pt-3 flex justify-between font-semibold text-lg">
          <span>{t(language, 'cart.total')}</span>
          <span className="text-walnut">{formatPrice(total, language)}</span>
        </div>
        <p className="text-xs text-text-muted">
          {t(language, 'cart.prepTime')}: ~{maxPrepTime()} {t(language, 'common.min')}
        </p>
      </div>

      <Link href="/checkout">
        <Button variant="emerald" size="lg" fullWidth>
          {t(language, 'cart.checkout')}
        </Button>
      </Link>
    </main>
  )
}
