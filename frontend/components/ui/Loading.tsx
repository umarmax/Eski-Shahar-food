'use client'

import { motion } from 'framer-motion'

export function TeaSteamLoader({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dims = { sm: 'w-8 h-8', md: 'w-12 h-12', lg: 'w-16 h-16' }
  return (
    <div className={`relative ${dims[size]} flex items-end justify-center`}>
      <div className="w-3/4 h-1/3 bg-walnut/20 rounded-b-full" />
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-4 bg-sand/60 rounded-full"
          style={{ left: `${30 + i * 20}%`, bottom: '45%' }}
          animate={{ y: [-2, -12, -2], opacity: [0.3, 0.8, 0.3], scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
        />
      ))}
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
      <TeaSteamLoader size="lg" />
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-text-muted text-sm"
      >
        ...
      </motion.p>
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-card rounded-[20px] overflow-hidden shadow-soft">
      <div className="aspect-[4/3] skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-6 w-3/4 skeleton rounded-lg" />
        <div className="h-4 w-full skeleton rounded-lg" />
        <div className="h-4 w-1/2 skeleton rounded-lg" />
      </div>
    </div>
  )
}
