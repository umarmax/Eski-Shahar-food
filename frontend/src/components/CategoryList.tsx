import { motion } from 'framer-motion'
import { CATEGORIES, getCategoryName } from '../data/categories'
import { useSettingsStore } from '../store/settingsStore'
import type { Category } from '../types'

interface CategoryListProps {
  onSelect: (category: Category) => void
}

export function CategoryList({ onSelect }: CategoryListProps) {
  const lang = useSettingsStore((s) => s.language)

  return (
    <section className="px-4 pb-6">
      <div className="flex gap-3 overflow-x-auto pb-1 hide-scrollbar">
        {CATEGORIES.map((category, index) => (
          <motion.button
            key={category.id}
            type="button"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.05 }}
            onClick={() => onSelect(category)}
            className="glass-card flex shrink-0 flex-col items-center gap-2 rounded-2xl px-4 py-3 active:opacity-90"
            style={{ minWidth: '80px' }}
          >
            <span className="text-2xl">{category.icon}</span>
            <span
              className="text-xs font-medium"
              style={{ color: 'var(--tg-theme-text-color)' }}
            >
              {getCategoryName(category, lang)}
            </span>
          </motion.button>
        ))}
      </div>
    </section>
  )
}

export { CATEGORIES }
