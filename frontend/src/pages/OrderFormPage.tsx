import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Layout } from '../components/Layout'
import { PageHeader } from '../components/PageHeader'
import { LocationPicker } from '../components/LocationPicker'
import { ReviewSheet } from '../components/Reviews'
import { BUSINESS } from '../config/business'
import { useDeliveryStore } from '../store/deliveryStore'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { WebApp, isInTelegram, type DeliveryLocation } from '../lib/telegram'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '../store/cartStore'
import { useSettingsStore, formatPrice } from '../store/settingsStore'
import { t, getProductName } from '../lib/i18n'
import type { OrderPayload, OrderType } from '../types'

const PHONE_REGEX = /^[\+]?[0-9\s\-\(\)]{9,20}$/

interface PlacedOrder {
  id: string
  total: number
  locationRequested: boolean
}

function readLocal(key: string) {
  try { return localStorage.getItem(key) ?? '' } catch { return '' }
}

function OrderSuccess({ order }: { order: PlacedOrder }) {
  const navigate = useNavigate()
  const lang = useSettingsStore((s) => s.language)
  const [copied, setCopied] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const shortId = order.id.slice(0, 8)

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(shortId)
      setCopied(true)
      try { WebApp.HapticFeedback.notificationOccurred('success') } catch { /* ignore */ }
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard not available
    }
  }

  return (
    <Layout hideNav>
      <motion.section
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
        className="px-4 pb-6 pt-12"
      >
        <div className="paper-card rounded-3xl p-6 text-center">
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.15, type: 'spring', damping: 12 }}
            className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full text-4xl"
            style={{ background: 'color-mix(in srgb, var(--color-emerald) 18%, transparent)' }}
          >
            ✅
          </motion.div>
          <h1 className="mb-1 font-serif text-3xl font-bold" style={{ color: 'var(--tg-theme-text-color)' }}>
            {t(lang, 'order_success_title')}
          </h1>
          <p className="mb-5 text-sm" style={{ color: 'var(--tg-theme-hint-color)' }}>
            {t(lang, 'order_success_text')}
          </p>

          <div className="ornament-divider mb-4" />

          <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--tg-theme-hint-color)' }}>
            {t(lang, 'order_number')}
          </p>
          <div className="mb-1 mt-1 flex items-center justify-center gap-3">
            <span className="font-mono text-2xl font-bold" style={{ color: 'var(--tg-theme-accent-text-color)' }}>
              №{shortId}
            </span>
            <button
              type="button"
              onClick={copyId}
              className="rounded-lg px-2 py-1 text-xs font-medium"
              style={{ background: 'var(--tg-theme-secondary-bg-color)', color: 'var(--tg-theme-link-color)' }}
            >
              {copied ? t(lang, 'order_copied') : t(lang, 'order_copy_id')}
            </button>
          </div>
          <p className="mb-5 text-sm font-semibold" style={{ color: 'var(--tg-theme-text-color)' }}>
            {formatPrice(order.total)}
          </p>

          {order.locationRequested && (
            <div
              className="mb-4 rounded-2xl p-3 text-sm"
              style={{ background: 'color-mix(in srgb, var(--tg-theme-accent-text-color) 15%, transparent)', color: 'var(--tg-theme-text-color)' }}
            >
              {t(lang, 'order_chat_location_hint')}
            </div>
          )}

          <div className="space-y-2">
            {order.locationRequested && isInTelegram && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => { try { WebApp.close() } catch { /* ignore */ } }}
                className="flex min-h-[52px] w-full items-center justify-center rounded-2xl text-base font-semibold"
                style={{ background: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)' }}
              >
                {t(lang, 'order_open_chat')}
              </motion.button>
            )}
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/profile')}
              className="flex min-h-[48px] w-full items-center justify-center rounded-2xl text-sm font-semibold"
              style={
                order.locationRequested && isInTelegram
                  ? { background: 'var(--tg-theme-secondary-bg-color)', color: 'var(--tg-theme-text-color)' }
                  : { background: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)' }
              }
            >
              {t(lang, 'my_orders_btn')}
            </motion.button>
            {isInTelegram && (
              <button
                type="button"
                onClick={() => setReviewOpen(true)}
                className="flex min-h-[44px] w-full items-center justify-center rounded-2xl text-sm font-semibold"
                style={{ color: 'var(--tg-theme-link-color)' }}
              >
                {t(lang, 'reviews_leave')}
              </button>
            )}
          </div>
        </div>
      </motion.section>
      <ReviewSheet open={reviewOpen} onClose={() => setReviewOpen(false)} orderId={order.id} />
    </Layout>
  )
}

export function OrderFormPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const items = useCartStore((s) => s.items)
  const totalPrice = useCartStore((s) => s.totalPrice())
  const clearCart = useCartStore((s) => s.clearCart)
  const lang = useSettingsStore((s) => s.language)

  const tgUser = (() => {
    try { return WebApp.initDataUnsafe?.user } catch { return null }
  })()

  const savedName = readLocal('choyxona-last-name')
  const defaultName = user && user.id !== 'dev-user'
    ? [user.first_name, user.last_name].filter(Boolean).join(' ')
    : tgUser
      ? [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ')
      : savedName

  const [name, setName] = useState(defaultName || savedName)
  const [phone, setPhone] = useState(readLocal('choyxona-last-phone'))
  const delivery = useDeliveryStore()
  const orderType = delivery.orderType
  const isDelivery = orderType === 'delivery'
  const [location, setLocation] = useState<DeliveryLocation | null>(delivery.location)
  const [locationViaChat, setLocationViaChat] = useState(false)
  const [address, setAddress] = useState(delivery.address)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null)

  const clearError = (key: string) => {
    if (errors[key]) setErrors({ ...errors, [key]: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (items.length === 0) {
      try { WebApp.showAlert(t(lang, 'cart_is_empty')) } catch { /* ignore */ }
      navigate('/cart')
      return
    }

    const newErrors: Record<string, string> = {}
    if (!name.trim()) newErrors.name = t(lang, 'val_name_required')
    else if (name.length > 100) newErrors.name = t(lang, 'val_name_long')
    if (!phone.trim()) newErrors.phone = t(lang, 'val_phone_required')
    else if (!PHONE_REGEX.test(phone)) newErrors.phone = t(lang, 'val_phone_invalid')
    else if (phone.length > 20) newErrors.phone = t(lang, 'val_phone_long')
    if (isDelivery && !location && !address.trim() && !(locationViaChat && isInTelegram)) {
      newErrors.location = t(lang, 'val_location_or_address')
    }
    if (address && address.length > 500) newErrors.address = t(lang, 'val_address_long')
    if (comment && comment.length > 1000) newErrors.comment = t(lang, 'val_comment_long')

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      try { WebApp.HapticFeedback.notificationOccurred('error') } catch { /* ignore */ }
      try { WebApp.showAlert(t(lang, 'val_fix_errors')) } catch { /* ignore */ }
      return
    }

    setErrors({})
    setSubmitting(true)

    try {
      const orderPayload: OrderPayload = {
        items: items.map((item) => ({
          product_id: item.productId,
          quantity: item.quantity,
        })),
        init_data: WebApp.initData || undefined,
        lang,
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        order_type: orderType,
        delivery_address: isDelivery ? address.trim() || undefined : undefined,
        delivery_location: isDelivery ? location ?? undefined : undefined,
        location_via_chat: isDelivery && !location && locationViaChat && isInTelegram,
        comment: comment.trim() || undefined,
      }

      let order: PlacedOrder

      if (isSupabaseConfigured) {
        const { data, error } = await supabase.functions.invoke('create-order', {
          body: orderPayload,
        })
        if (error) {
          // Surface the function's own error message (e.g. rate limit) instead of the generic one
          let message = error.message || 'Failed to create order'
          try {
            const body = await (error as { context?: Response }).context?.json()
            if (body?.error) message = body.error
          } catch { /* not JSON */ }
          throw new Error(message)
        }
        if (!data?.order) throw new Error('Order creation failed')
        order = {
          id: data.order.id,
          total: data.order.total,
          locationRequested: Boolean(data.order.location_requested),
        }
      } else {
        // Mock order for development
        order = {
          id: crypto.randomUUID(),
          total: totalPrice,
          locationRequested: Boolean(orderPayload.location_via_chat),
        }
        console.info('[Order] mock payload', orderPayload, items.map((i) => getProductName(i.product, lang)))
      }

      try {
        localStorage.setItem('choyxona-last-name', name.trim())
        localStorage.setItem('choyxona-last-phone', phone.trim())
      } catch { /* ignore */ }

      if (isDelivery) {
        delivery.setAddress(address.trim())
        delivery.setLocation(location)
      }
      clearCart()
      setPlacedOrder(order)
      try { WebApp.HapticFeedback.notificationOccurred('success') } catch { /* ignore */ }
    } catch (error) {
      try { WebApp.HapticFeedback.notificationOccurred('error') } catch { /* ignore */ }
      const message = error instanceof Error ? error.message : t(lang, 'error_title')
      try { WebApp.showAlert(message) } catch { alert(message) }
    } finally {
      setSubmitting(false)
    }
  }

  if (placedOrder) return <OrderSuccess order={placedOrder} />

  if (items.length === 0) {
    return (
      <Layout hideNav>
        <PageHeader title={t(lang, 'order_title')} subtitle={t(lang, 'order_cart_empty')} />
        <section className="px-4 pb-6">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="paper-card rounded-2xl p-8 text-center"
          >
            <p className="mb-4 text-4xl">🛒</p>
            <p className="mb-4 text-sm" style={{ color: 'var(--tg-theme-hint-color)' }}>
              {t(lang, 'order_cart_empty_text')}
            </p>
            <button
              type="button"
              onClick={() => navigate('/menu')}
              className="inline-flex min-h-[44px] items-center rounded-xl px-5 text-sm font-semibold"
              style={{ background: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)' }}
            >
              {t(lang, 'go_to_menu')}
            </button>
          </motion.div>
        </section>
      </Layout>
    )
  }

  const inputClass = (key: string, extra = '') =>
    `paper-input w-full rounded-xl px-4 py-3 text-base outline-none ${extra} ${errors[key] ? 'ring-2 ring-red-500' : ''}`

  const labelStyle = { color: 'var(--tg-theme-text-color)' }

  return (
    <Layout hideNav>
      <PageHeader
        title={t(lang, 'order_title')}
        subtitle={`${items.length} ${t(lang, 'items_count')} · ${formatPrice(totalPrice)}`}
        showBack
      />

      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 px-4 pb-6"
      >
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="mb-2 block text-sm font-medium" style={labelStyle}>
              {t(lang, 'order_name_label')} <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); clearError('name') }}
              placeholder={t(lang, 'order_name_placeholder')}
              maxLength={100}
              autoComplete="name"
              className={inputClass('name')}
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium" style={labelStyle}>
              {t(lang, 'order_phone_label')} <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); clearError('phone') }}
              placeholder={t(lang, 'order_phone_placeholder')}
              maxLength={20}
              autoComplete="tel"
              className={inputClass('phone')}
            />
            {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
          </div>

          <div className="flex gap-1 rounded-2xl p-1" style={{ background: 'var(--card-frame)' }}>
            {(['delivery', 'pickup'] as OrderType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => { delivery.setOrderType(type); clearError('location') }}
                className="flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors"
                style={{
                  background: orderType === type ? 'var(--tg-theme-button-color)' : 'transparent',
                  color: orderType === type ? 'var(--tg-theme-button-text-color)' : 'var(--tg-theme-text-color)',
                }}
              >
                {t(lang, type)}
              </button>
            ))}
          </div>

          {!isDelivery && (
            <div className="paper-card rounded-2xl p-4">
              <p className="mb-1 text-xs" style={{ color: 'var(--tg-theme-hint-color)' }}>{t(lang, 'pickup_note')}</p>
              <p className="font-semibold" style={{ color: 'var(--tg-theme-text-color)' }}>📍 {BUSINESS.address[lang]}</p>
              <button
                type="button"
                onClick={() => { try { WebApp.openLink(BUSINESS.mapUrl) } catch { window.open(BUSINESS.mapUrl, '_blank') } }}
                className="mt-1 text-xs font-medium"
                style={{ color: 'var(--tg-theme-link-color)' }}
              >
                {t(lang, 'loc_open_map')} →
              </button>
            </div>
          )}

          {isDelivery && (<>
          <div>
            <LocationPicker
              value={location}
              onChange={(loc) => { setLocation(loc); clearError('location') }}
              viaChat={locationViaChat}
              onViaChatChange={(v) => { setLocationViaChat(v); clearError('location') }}
              canUseChat={isInTelegram}
              hasError={Boolean(errors.location)}
            />
            {errors.location && <p className="mt-1 text-xs text-red-500">{errors.location}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium" style={labelStyle}>
              {t(lang, 'order_address_label')}
              {!location && (
                <span className="ml-1 text-xs font-normal" style={{ color: 'var(--tg-theme-hint-color)' }}>
                  ({t(lang, 'loc_or_address')})
                </span>
              )}
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => { setAddress(e.target.value); clearError('address'); clearError('location') }}
              placeholder={t(lang, 'order_address_placeholder')}
              maxLength={500}
              autoComplete="street-address"
              className={inputClass('address')}
            />
            {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
          </div>
          </>)}

          <div>
            <label className="mb-2 block text-sm font-medium" style={labelStyle}>
              {t(lang, 'order_comment_label')}
            </label>
            <textarea
              value={comment}
              onChange={(e) => { setComment(e.target.value); clearError('comment') }}
              placeholder={t(lang, 'order_comment_placeholder')}
              rows={3}
              maxLength={1000}
              className={inputClass('comment', 'resize-none')}
            />
            {errors.comment && <p className="mt-1 text-xs text-red-500">{errors.comment}</p>}
          </div>

          <div className="paper-card rounded-2xl p-4">
            <p className="mb-1 text-sm" style={{ color: 'var(--tg-theme-hint-color)' }}>
              {t(lang, 'order_total')}
            </p>
            <p className="font-serif text-3xl font-bold" style={{ color: 'var(--tg-theme-text-color)' }}>
              {formatPrice(totalPrice)}
            </p>
          </div>

          <motion.button
            type="submit"
            disabled={submitting}
            whileTap={submitting ? {} : { scale: 0.98 }}
            className="flex min-h-[52px] w-full items-center justify-center rounded-2xl text-base font-semibold shadow-md disabled:opacity-50"
            style={{ background: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)' }}
          >
            {submitting ? t(lang, 'order_submitting') : t(lang, 'order_submit')}
          </motion.button>

          <p className="text-center text-xs" style={{ color: 'var(--tg-theme-hint-color)' }}>
            {t(lang, 'order_privacy')}
          </p>
        </form>
      </motion.section>
    </Layout>
  )
}
