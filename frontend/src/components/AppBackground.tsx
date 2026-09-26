import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'

interface Bloom {
  id: number
  x: number
  y: number
}

const PATTERN_TILE = 80
const MAX_BLOOMS = 4
const BLOOM_THROTTLE_MS = 120

/**
 * Old-paper background with a drifting Uzbek girih pattern.
 * - grain + fibre texture, tea stains, darkened edges
 * - pattern drifts slowly (CSS) and shifts with scroll (parallax)
 * - tapping anywhere leaves a golden "ink bloom" that reveals the pattern
 */
export function AppBackground() {
  const reduceMotion = useReducedMotion()
  const { scrollY } = useScroll()
  // Wrap by one tile so the parallax offset never reveals the pattern's edge
  const parallaxY = useTransform(scrollY, (v) => -((v * 0.25) % PATTERN_TILE))

  const [blooms, setBlooms] = useState<Bloom[]>([])
  const lastBloomRef = useRef(0)
  const idRef = useRef(0)

  useEffect(() => {
    if (reduceMotion) return

    const onPointerDown = (e: PointerEvent) => {
      const now = performance.now()
      if (now - lastBloomRef.current < BLOOM_THROTTLE_MS) return
      lastBloomRef.current = now
      const bloom = { id: ++idRef.current, x: e.clientX, y: e.clientY }
      setBlooms((prev) => [...prev.slice(-(MAX_BLOOMS - 1)), bloom])
    }

    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    return () => window.removeEventListener('pointerdown', onPointerDown)
  }, [reduceMotion])

  const removeBloom = (id: number) => setBlooms((prev) => prev.filter((b) => b.id !== id))

  return (
    <div className="app-bg" aria-hidden="true">
      <div className="app-bg__glow" />
      <motion.div className="app-bg__pattern-wrap" style={reduceMotion ? undefined : { y: parallaxY }}>
        <div className="app-bg__pattern" />
      </motion.div>
      <div className="app-bg__stains" />
      <div className="app-bg__grain" />
      <div className="app-bg__vignette" />

      <AnimatePresence>
        {blooms.map((b) => (
          <motion.div
            key={b.id}
            className="app-bg__bloom"
            style={{ left: b.x, top: b.y }}
            initial={{ scale: 0.2, opacity: 0.9 }}
            animate={{ scale: 1, opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            onAnimationComplete={() => removeBloom(b.id)}
          >
            <div className="app-bg__bloom-pattern" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
