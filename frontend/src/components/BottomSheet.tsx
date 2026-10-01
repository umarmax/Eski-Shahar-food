import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CloseIcon } from './icons'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-end justify-center"
          style={{ background: 'rgba(20, 10, 4, 0.45)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-3xl px-4 pt-3"
            style={{
              background: 'var(--tg-theme-bg-color)',
              paddingBottom: 'calc(var(--app-safe-bottom) + 20px)',
            }}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full" style={{ background: 'var(--tg-theme-hint-color)', opacity: 0.3 }} />
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold" style={{ color: 'var(--tg-theme-text-color)' }}>{title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full"
                style={{ background: 'var(--tg-theme-secondary-bg-color)', color: 'var(--tg-theme-hint-color)' }}
                aria-label="Close"
              >
                <CloseIcon size={18} />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
