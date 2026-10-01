import type { Language } from '../lib/i18n'

// Single source of truth for public business info shown in the app.
/** Shown for dishes that don't have their own photo yet (admins replace it per dish). */
export const PLACEHOLDER_FOOD_IMAGE = '/brand/placeholder-food.webp'

export const BUSINESS = {
  name: 'Eski Shahar',
  phone: '+998907992929',
  phoneDisplay: '+998 90 799 29 29',
  botUsername: import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'eskishaharfood_bot',
  hours: '10:00 - 23:00',
  /** Opening hours in Tashkent time (UTC+5), used for the "closed now" banner */
  openHour: 10,
  closeHour: 23,
  /** Leave empty to hide the link on the About page */
  instagram: import.meta.env.VITE_INSTAGRAM_URL || '',
  facebook: import.meta.env.VITE_FACEBOOK_URL || '',
  address: {
    uz: 'Toshkent shahri, Shayxontohur tumani, Chorsu bozori',
    ru: 'г. Ташкент, Шайхантахурский район, рынок Чорсу',
    en: 'Tashkent city, Shaykhontokhur district, Chorsu market',
  } satisfies Record<Language, string>,
  mapUrl: 'https://yandex.uz/maps/?text=Chorsu%20bozori%2C%20Toshkent',
}
