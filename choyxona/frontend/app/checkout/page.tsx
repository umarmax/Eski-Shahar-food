'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Phone, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { TeaSteamLoader } from '@/components/ui/Loading'
import { api, formatPrice } from '@/lib/api'
import { t } from '@/lib/i18n'
import { useAppStore } from '@/lib/store'
import { useTelegram } from '@/components/providers/TelegramProvider'

const DELIVERY_COST = 15000

export default function CheckoutPage() {
  const router = useRouter()
  const language = useAppStore((s) => s.language)
  const user = useAppStore((s) => s.user)
  const cart = useAppStore((s) => s.cart)
  const cartTotal = useAppStore((s) => s.cartTotal)
  const promoCode = useAppStore((s) => s.promoCode)
  const promoDiscount = useAppStore((s) => s.promoDiscount)
  const clearCart = useAppStore((s) => s.clearCart)
  const { haptic, requestContact, requestLocation } = useTelegram()

  const [phone, setPhone] = useState(user?.phone || '')
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    user?.latitude ? { lat: user.latitude, lng: user.longitude! } : null
  )
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [orderNumber, setOrderNumber] = useState<number | null>(null)

  const subtotal = cartTotal()
  const discount = Math.round(subtotal * (promoDiscount / 100))
  const total = subtotal + DELIVERY_COST - discount

  const handleRequestContact = async () => {
    const num = await requestContact()
    if (num) {
      setPhone(num)
      haptic('success')
    }
  }

  const handleRequestLocation = async () => {
    const loc = await requestLocation()
    if (loc) {
      setLocation({ lat: loc.latitude, lng: loc.longitude })
      haptic('success')
    }
  }

  const handleSubmit = async () => {
    if (!user || cart.length === 0) return
    setSubmitting(true)
    try {
      const order = await api.createOrder({
        userId: user.id,
        items: cart.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        comment,
        phone,
        address: location ? `${location.lat}, ${location.lng}` : undefined,
        latitude: location?.lat,
        longitude: location?.lng,
        promoCode: promoCode || undefined,
      })
      setOrderNumber(order.orderNumber)
      clearCart()
      setSuccess(true)
      haptic('success')
    } catch (e) {
      console.error(e)
      haptic('error')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <CheckCircle className="w-16 h-16 text-emerald mx-auto mb-4" />
          <h1 className="font-serif text-3xl mb-2">{t(language, 'checkout.success')}</h1>
          {orderNumber && (
            <p className="text-text-muted mb-6">#{orderNumber}</p>
          )}
          <p className="text-sm text-text-muted max-w-xs mx-auto mb-8">
            Operator siz bilan bog&apos;lanadi va to&apos;lov tafsilotlarini beradi.
          </p>
          <Button variant="primary" onClick={() => router.push('/')}>
            {t(language, 'nav.home')}
          </Button>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-4 pt-6 pb-8 max-w-2xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-text-muted mb-6">
        <ArrowLeft className="w-4 h-4" /> {t(language, 'common.back')}
      </button>

      <h1 className="font-serif text-3xl mb-6">{t(language, 'checkout.title')}</h1>

      {/* Order summary */}
      <div className="bg-card rounded-[20px] p-4 shadow-soft mb-4 space-y-2">
        {cart.map((item) => (
          <div key={item.product.id} className="flex justify-between text-sm">
            <span>{item.product.name} × {item.quantity}</span>
            <span>{formatPrice(item.product.price * item.quantity, language)}</span>
          </div>
        ))}
        <div className="border-t border-border pt-2 flex justify-between font-semibold">
          <span>{t(language, 'cart.total')}</span>
          <span className="text-walnut">{formatPrice(total, language)}</span>
        </div>
      </div>

      {/* Contact */}
      <div className="space-y-3 mb-6">
        <Button variant="outline" fullWidth onClick={handleRequestContact}>
          <Phone className="w-4 h-4" />
          {t(language, 'checkout.requestContact')}
        </Button>
        {phone && (
          <p className="text-sm text-emerald text-center">✓ {phone}</p>
        )}

        <Button variant="outline" fullWidth onClick={handleRequestLocation}>
          <MapPin className="w-4 h-4" />
          {t(language, 'checkout.requestLocation')}
        </Button>
        {location && (
          <p className="text-sm text-emerald text-center">
            ✓ {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
          </p>
        )}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={t(language, 'checkout.comment')}
        rows={3}
        className="w-full px-4 py-3 bg-card rounded-[20px] shadow-soft text-sm outline-none resize-none mb-6"
      />

      <Button
        variant="emerald"
        size="lg"
        fullWidth
        disabled={submitting || !phone}
        onClick={handleSubmit}
      >
        {submitting ? <TeaSteamLoader size="sm" /> : t(language, 'checkout.confirm')}
      </Button>
    </main>
  )
}
