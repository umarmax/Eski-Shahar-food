import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

interface PageHeaderProps {
  title: string
  subtitle?: string
  showBack?: boolean
}

export function PageHeader({ title, subtitle, showBack = false }: PageHeaderProps) {
  const navigate = useNavigate()

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 pb-4 pt-6"
    >
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{
              background: 'var(--tg-theme-secondary-bg-color)',
              color: 'var(--tg-theme-text-color)',
            }}
          >
            ←
          </button>
        )}
        <div className="flex-1">
          <h1
            className="text-2xl font-bold"
            style={{ color: 'var(--tg-theme-text-color)' }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className="mt-1 text-sm"
              style={{ color: 'var(--tg-theme-hint-color)' }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </motion.header>
  )
}
