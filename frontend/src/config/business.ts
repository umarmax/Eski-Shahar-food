import type { Language } from '../lib/i18n'

// Single source of truth for public business info shown in the app.
export const BUSINESS = {
  name: 'Eski Shahar',
  phone: '+998907992929',
  phoneDisplay: '+998 90 799 29 29',
  botUsername: import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'eskishaharfood_bot',
  hours: '10:00 - 23:00',
  address: {
    uz: 'Toshkent shahri, Shayxontohur tumani, Chorsu bozori',
    ru: 'г. Ташкент, Шайхантахурский район, рынок Чорсу',
    en: 'Tashkent city, Shaykhontokhur district, Chorsu market',
  } satisfies Record<Language, string>,
  mapUrl: 'https://yandex.uz/maps/?text=Chorsu%20bozori%2C%20Toshkent',
}
