'use client'

import { MapPin, Clock, Phone, ArrowLeft, Instagram, MessageCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import { t } from '@/lib/i18n'

export default function AboutPage() {
  const router = useRouter()
  const language = useAppStore((s) => s.language)

  return (
    <main className="min-h-screen px-4 pt-6 pb-24 max-w-2xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-text-muted mb-6">
        <ArrowLeft className="w-4 h-4" /> {t(language, 'common.back')}
      </button>

      <h1 className="font-serif text-3xl mb-6">Choyxona — Old City Café</h1>

      <div className="space-y-4">
        {/* Address and Map Placeholder */}
        <div className="bg-card rounded-[20px] p-4 shadow-soft">
          <div className="flex items-start gap-3 mb-3">
            <MapPin className="w-5 h-5 text-walnut shrink-0 mt-0.5" />
            <div>
              <h2 className="font-semibold text-lg">Manzil</h2>
              <p className="text-sm text-text-muted mt-1">
                Eski Shahar, Navoiy ko'chasi 12-uy, Toshkent
              </p>
            </div>
          </div>
          {/* Static Map Image / Placeholder */}
          <a href="https://yandex.com/maps" target="_blank" rel="noopener noreferrer" className="block relative w-full h-32 bg-cream rounded-xl overflow-hidden mt-3 border border-border">
            <div className="absolute inset-0 flex items-center justify-center text-text-muted text-sm font-medium">
              Xaritada ko'rish (Yandex/Google)
            </div>
            {/* A real static map image would go here */}
          </a>
        </div>

        {/* Operating Hours */}
        <div className="bg-card rounded-[20px] p-4 shadow-soft">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-walnut shrink-0 mt-0.5" />
            <div>
              <h2 className="font-semibold text-lg">Ish vaqti</h2>
              <p className="text-sm text-text-muted mt-1">
                Har kuni: 10:00 - 23:00
              </p>
            </div>
          </div>
        </div>

        {/* Contacts */}
        <div className="bg-card rounded-[20px] p-4 shadow-soft">
          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-walnut shrink-0 mt-0.5" />
            <div className="w-full">
              <h2 className="font-semibold text-lg mb-3">Aloqa</h2>
              <div className="space-y-3">
                <a href="tel:+998901234567" className="flex items-center gap-3 w-full p-3 bg-cream rounded-xl text-sm font-medium">
                  <Phone className="w-4 h-4 text-emerald" />
                  +998 90 123 45 67
                </a>
                <a href="https://t.me/choyxona_support" target="_blank" className="flex items-center gap-3 w-full p-3 bg-cream rounded-xl text-sm font-medium">
                  <MessageCircle className="w-4 h-4 text-blue-500" />
                  Telegram Support
                </a>
                <a href="https://instagram.com/choyxona" target="_blank" className="flex items-center gap-3 w-full p-3 bg-cream rounded-xl text-sm font-medium">
                  <Instagram className="w-4 h-4 text-pink-500" />
                  Instagram
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
