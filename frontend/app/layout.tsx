import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import './globals.css'
import { TelegramProvider } from '@/components/providers/TelegramProvider'
import { BottomNav, FloatingCartButton } from '@/components/layout/BottomNav'
import { PageTransition } from '@/components/layout/PageTransition'

const serif = Cormorant_Garamond({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-serif',
})

const sans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'Choyxona — Old City Café',
  description: 'Traditional Uzbek cuisine delivered to your home',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#F8F3EB',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" className={`${serif.variable} ${sans.variable}`}>
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js" async />
      </head>
      <body className="antialiased min-h-screen pb-28 ornament-pattern">
        <TelegramProvider>
          <PageTransition>{children}</PageTransition>
          <FloatingCartButton />
          <BottomNav />
        </TelegramProvider>
      </body>
    </html>
  )
}
