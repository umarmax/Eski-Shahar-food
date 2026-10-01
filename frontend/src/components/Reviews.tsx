import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BottomSheet } from './BottomSheet'
import { StarIcon } from './icons'
import { t } from '../lib/i18n'
import { fetchReviews, submitReview, type Review, type ReviewsSummary } from '../lib/reviews'
import { WebApp, isInTelegram } from '../lib/telegram'
import { useSettingsStore } from '../store/settingsStore'

function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <span className="flex" style={{ color: '#E0A030' }}>
      {[1, 2, 3, 4, 5].map((n) => <StarIcon key={n} size={size} filled={n <= Math.round(value)} />)}
    </span>
  )
}

interface ReviewSheetProps {
  open: boolean
  onClose: () => void
  orderId?: string
  onSubmitted?: (review: Review) => void
}

export function ReviewSheet({ open, onClose, orderId, onSubmitted }: ReviewSheetProps) {
  const lang = useSettingsStore((s) => s.language)
  const [rating, setRating] = useState(5)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) { setDone(false); setError(null) }
  }, [open])

  const send = async () => {
    setSending(true)
    setError(null)
    try {
      const review = await submitReview(rating, text, orderId)
      setDone(true)
      setText('')
      onSubmitted?.(review)
      try { WebApp.HapticFeedback.notificationOccurred('success') } catch { /* ignore */ }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setSending(false)
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={t(lang, 'reviews_title')}>
      {!isInTelegram ? (
        <p className="pb-4 text-sm" style={{ color: 'var(--tg-theme-hint-color)' }}>{t(lang, 'reviews_only_telegram')}</p>
      ) : done ? (
        <div className="pb-4 text-center">
          <p className="mb-4 text-lg font-semibold" style={{ color: 'var(--tg-theme-text-color)' }}>{t(lang, 'reviews_thanks')}</p>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[48px] w-full rounded-2xl font-semibold"
            style={{ background: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)' }}
          >
            OK
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium" style={{ color: 'var(--tg-theme-hint-color)' }}>{t(lang, 'reviews_your_rating')}</p>
            <div className="flex justify-center gap-2" style={{ color: '#E0A030' }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <motion.button
                  key={n}
                  type="button"
                  whileTap={{ scale: 0.85 }}
                  onClick={() => {
                    setRating(n)
                    try { WebApp.HapticFeedback.selectionChanged() } catch { /* ignore */ }
                  }}
                  aria-label={`${n}`}
                >
                  <StarIcon size={40} filled={n <= rating} />
                </motion.button>
              ))}
            </div>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t(lang, 'reviews_placeholder')}
            rows={4}
            maxLength={1000}
            className="paper-input w-full resize-none rounded-xl px-4 py-3 text-base outline-none"
          />
          {error && <p className="text-sm" style={{ color: 'var(--tg-theme-destructive-text-color)' }}>{error}</p>}
          <button
            type="button"
            disabled={sending}
            onClick={send}
            className="min-h-[52px] w-full rounded-2xl text-base font-semibold disabled:opacity-50"
            style={{ background: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)' }}
          >
            {sending ? '...' : t(lang, 'reviews_submit')}
          </button>
        </div>
      )}
    </BottomSheet>
  )
}

/** Average rating, latest reviews and a "leave a review" button. */
export function ReviewsSection() {
  const lang = useSettingsStore((s) => s.language)
  const [summary, setSummary] = useState<ReviewsSummary | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const load = useCallback(() => {
    fetchReviews().then(setSummary).catch(() => setSummary({ reviews: [], average: 0, count: 0 }))
  }, [])

  useEffect(load, [load])

  return (
    <section id="reviews" className="px-4 pb-6">
      <div className="mb-3 flex items-end justify-between">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--tg-theme-hint-color)' }}>{t(lang, 'reviews_title')}</h3>
        {summary && summary.count > 0 && (
          <span className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: 'var(--tg-theme-text-color)' }}>
            <Stars value={summary.average} />
            {summary.average.toFixed(1)} · {summary.count} {t(lang, 'reviews_count')}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        className="mb-3 min-h-[48px] w-full rounded-2xl text-base font-semibold"
        style={{ background: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)' }}
      >
        {t(lang, 'reviews_leave')}
      </button>

      {summary && summary.reviews.length === 0 && (
        <p className="paper-card rounded-2xl p-4 text-center text-sm" style={{ color: 'var(--tg-theme-hint-color)' }}>
          {t(lang, 'reviews_empty')}
        </p>
      )}

      <div className="space-y-2">
        {summary?.reviews.slice(0, 10).map((r) => (
          <div key={r.id} className="paper-card rounded-2xl p-4">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-semibold" style={{ color: 'var(--tg-theme-text-color)' }}>{r.author_name}</span>
              <Stars value={r.rating} size={14} />
            </div>
            {r.text && <p className="text-sm leading-relaxed" style={{ color: 'var(--tg-theme-text-color)' }}>{r.text}</p>}
            <p className="mt-1 text-xs" style={{ color: 'var(--tg-theme-hint-color)' }}>
              {new Date(r.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      <ReviewSheet open={sheetOpen} onClose={() => setSheetOpen(false)} onSubmitted={load} />
    </section>
  )
}
