import type { Category } from '../types'

export const CATEGORIES: Category[] = [
  {
    id: '1',
    slug: 'plov',
    name: 'Plov',
    name_uz: 'Palov',
    name_ru: 'Плов',
    name_en: 'Plov',
    icon: '🍚',
  },
  {
    id: '2',
    slug: 'kebab',
    name: 'Kebab',
    name_uz: 'Kabob',
    name_ru: 'Шашлык',
    name_en: 'Kebab',
    icon: '🍢',
  },
  {
    id: '3',
    slug: 'soups',
    name: 'Soups',
    name_uz: "Sho'rvalar",
    name_ru: 'Супы',
    name_en: 'Soups',
    icon: '🍲',
  },
  {
    id: '4',
    slug: 'main',
    name: 'Main dishes',
    name_uz: 'Asosiy taomlar',
    name_ru: 'Основные блюда',
    name_en: 'Main dishes',
    icon: '🥘',
  },
  {
    id: '5',
    slug: 'salads',
    name: 'Salads',
    name_uz: 'Salatlar',
    name_ru: 'Салаты',
    name_en: 'Salads',
    icon: '🥗',
  },
  {
    id: '6',
    slug: 'bread',
    name: 'Bread & Samsa',
    name_uz: 'Non va somsa',
    name_ru: 'Хлеб и самса',
    name_en: 'Bread & Samsa',
    icon: '🫓',
  },
  {
    id: '7',
    slug: 'drinks',
    name: 'Drinks',
    name_uz: 'Ichimliklar',
    name_ru: 'Напитки',
    name_en: 'Drinks',
    icon: '🍵',
  },
  {
    id: '8',
    slug: 'desserts',
    name: 'Desserts',
    name_uz: 'Shirinliklar',
    name_ru: 'Десерты',
    name_en: 'Desserts',
    icon: '🍯',
  },
]

export function getCategoryName(category: Category, lang: 'uz' | 'ru' | 'en'): string {
  if (lang === 'uz') return category.name_uz
  if (lang === 'ru') return category.name_ru
  if (lang === 'en') return category.name_en
  return category.name
}
