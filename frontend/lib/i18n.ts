import type { Language } from './types'

type TranslationKey =
  | 'hero.title'
  | 'hero.subtitle'
  | 'hero.orderNow'
  | 'hero.browseMenu'
  | 'nav.home'
  | 'nav.menu'
  | 'nav.search'
  | 'nav.cart'
  | 'nav.profile'
  | 'menu.title'
  | 'menu.all'
  | 'menu.filters'
  | 'filter.vegetarian'
  | 'filter.spicy'
  | 'filter.popular'
  | 'filter.chefPick'
  | 'filter.price'
  | 'filter.cookTime'
  | 'product.addToCart'
  | 'product.ingredients'
  | 'product.nutrition'
  | 'product.cookingTime'
  | 'product.weight'
  | 'product.calories'
  | 'product.reviews'
  | 'product.recommended'
  | 'cart.title'
  | 'cart.empty'
  | 'cart.subtotal'
  | 'cart.delivery'
  | 'cart.total'
  | 'cart.promo'
  | 'cart.apply'
  | 'cart.checkout'
  | 'cart.prepTime'
  | 'checkout.title'
  | 'checkout.confirm'
  | 'checkout.comment'
  | 'checkout.requestContact'
  | 'checkout.requestLocation'
  | 'checkout.success'
  | 'search.placeholder'
  | 'search.popular'
  | 'profile.orders'
  | 'profile.favorites'
  | 'profile.address'
  | 'profile.language'
  | 'profile.support'
  | 'profile.about'
  | 'profile.callOperator'
  | 'specials.title'
  | 'popular.title'
  | 'chef.title'
  | 'hours.open'
  | 'hours.closed'
  | 'delivery.estimate'
  | 'common.min'
  | 'common.back'
  | 'order.status.pending'
  | 'order.status.accepted'
  | 'order.status.preparing'
  | 'order.status.courier'
  | 'order.status.delivered'
  | 'admin.title'
  | 'admin.orders'
  | 'admin.analytics'
  | 'nav.admin'
  | 'nav.about'

const translations: Record<Language, Record<TranslationKey, string>> = {
  uz: {
    'hero.title': 'An\'anaviy o\'zbek taomlari uyingizga yetkaziladi',
    'hero.subtitle': 'Eski Shahar qalbidan haqiqiy ta\'m.',
    'hero.orderNow': 'Buyurtma berish',
    'hero.browseMenu': 'Menyuni ko\'rish',
    'nav.home': 'Bosh sahifa',
    'nav.menu': 'Menyu',
    'nav.search': 'Qidiruv',
    'nav.cart': 'Savat',
    'nav.profile': 'Profil',
    'menu.title': 'Menyu',
    'menu.all': 'Hammasi',
    'menu.filters': 'Filtrlar',
    'filter.vegetarian': 'Vegetarian',
    'filter.spicy': 'Achchiq',
    'filter.popular': 'Mashhur',
    'filter.chefPick': 'Oshpaz tavsiyasi',
    'filter.price': 'Narx',
    'filter.cookTime': 'Pishirish vaqti',
    'product.addToCart': 'Savatga qo\'shish',
    'product.ingredients': 'Tarkibi',
    'product.nutrition': 'Kaloriya',
    'product.cookingTime': 'Pishirish vaqti',
    'product.weight': 'Og\'irlik',
    'product.calories': 'kkal',
    'product.reviews': 'Sharhlar',
    'product.recommended': 'Tavsiya etiladi',
    'cart.title': 'Savat',
    'cart.empty': 'Savat bo\'sh',
    'cart.subtotal': 'Jami',
    'cart.delivery': 'Yetkazib berish',
    'cart.total': 'Umumiy',
    'cart.promo': 'Promo kod',
    'cart.apply': 'Qo\'llash',
    'cart.checkout': 'Buyurtmani rasmiylashtirish',
    'cart.prepTime': 'Taxminiy tayyorlanish',
    'checkout.title': 'Buyurtma',
    'checkout.confirm': 'Buyurtmani tasdiqlash',
    'checkout.comment': 'Izoh qoldiring...',
    'checkout.requestContact': 'Telefon raqamini ulashish',
    'checkout.requestLocation': 'Joylashuvni ulashish',
    'checkout.success': 'Buyurtma qabul qilindi!',
    'search.placeholder': 'Taom, tarkib yoki kategoriya bo\'yicha qidiring...',
    'search.popular': 'Mashhur taomlar',
    'profile.orders': 'Buyurtmalar tarixi',
    'profile.favorites': 'Sevimlilar',
    'profile.address': 'Saqlangan manzil',
    'profile.language': 'Til',
    'profile.support': 'Yordam',
    'profile.about': 'Kafe haqida',
    'profile.callOperator': 'Operatorga qo\'ng\'iroq',
    'specials.title': 'Bugungi maxsus taomlar',
    'popular.title': 'Mashhur taomlar',
    'chef.title': 'Oshpaz tavsiyasi',
    'hours.open': 'Ochiq',
    'hours.closed': 'Yopiq',
    'delivery.estimate': 'Yetkazib berish vaqti',
    'common.min': 'daq',
    'common.back': 'Orqaga',
    'order.status.pending': 'Kutilmoqda',
    'order.status.accepted': 'Qabul qilindi',
    'order.status.preparing': 'Tayyorlanmoqda',
    'order.status.courier': 'Kuryer yo\'lda',
    'order.status.delivered': 'Yetkazildi',
    'admin.title': 'Admin panel',
    'admin.orders': 'Buyurtmalar',
    'admin.analytics': 'Analitika',
    'nav.admin': 'Admin',
    'nav.about': 'Haqida',
  },
  ru: {
    'hero.title': 'Традиционная узбекская кухня с доставкой',
    'hero.subtitle': 'Аутентичный вкус из сердца Старого города.',
    'hero.orderNow': 'Заказать',
    'hero.browseMenu': 'Смотреть меню',
    'nav.home': 'Главная',
    'nav.menu': 'Меню',
    'nav.search': 'Поиск',
    'nav.cart': 'Корзина',
    'nav.profile': 'Профиль',
    'menu.title': 'Меню',
    'menu.all': 'Все',
    'menu.filters': 'Фильтры',
    'filter.vegetarian': 'Вегетарианское',
    'filter.spicy': 'Острое',
    'filter.popular': 'Популярное',
    'filter.chefPick': 'От шефа',
    'filter.price': 'Цена',
    'filter.cookTime': 'Время готовки',
    'product.addToCart': 'В корзину',
    'product.ingredients': 'Состав',
    'product.nutrition': 'Калории',
    'product.cookingTime': 'Время готовки',
    'product.weight': 'Вес',
    'product.calories': 'ккал',
    'product.reviews': 'Отзывы',
    'product.recommended': 'Рекомендуем',
    'cart.title': 'Корзина',
    'cart.empty': 'Корзина пуста',
    'cart.subtotal': 'Сумма',
    'cart.delivery': 'Доставка',
    'cart.total': 'Итого',
    'cart.promo': 'Промокод',
    'cart.apply': 'Применить',
    'cart.checkout': 'Оформить заказ',
    'cart.prepTime': 'Примерное время',
    'checkout.title': 'Заказ',
    'checkout.confirm': 'Подтвердить заказ',
    'checkout.comment': 'Комментарий...',
    'checkout.requestContact': 'Поделиться телефоном',
    'checkout.requestLocation': 'Поделиться локацией',
    'checkout.success': 'Заказ принят!',
    'search.placeholder': 'Поиск по названию, ингредиентам или категории...',
    'search.popular': 'Популярные блюда',
    'profile.orders': 'История заказов',
    'profile.favorites': 'Избранное',
    'profile.address': 'Сохранённый адрес',
    'profile.language': 'Язык',
    'profile.support': 'Поддержка',
    'profile.about': 'О кафе',
    'profile.callOperator': 'Позвонить оператору',
    'specials.title': 'Специальные предложения',
    'popular.title': 'Популярные блюда',
    'chef.title': 'Рекомендация шефа',
    'hours.open': 'Открыто',
    'hours.closed': 'Закрыто',
    'delivery.estimate': 'Время доставки',
    'common.min': 'мин',
    'common.back': 'Назад',
    'order.status.pending': 'Ожидание',
    'order.status.accepted': 'Принят',
    'order.status.preparing': 'Готовится',
    'order.status.courier': 'Курьер в пути',
    'order.status.delivered': 'Доставлен',
    'admin.title': 'Админ-панель',
    'admin.orders': 'Заказы',
    'admin.analytics': 'Аналитика',
    'nav.admin': 'Админ',
    'nav.about': 'О нас',
  },
  en: {
    'hero.title': 'Traditional Uzbek Cuisine Delivered to Your Home',
    'hero.subtitle': 'Authentic taste from the heart of the Old City.',
    'hero.orderNow': 'Order Now',
    'hero.browseMenu': 'Browse Menu',
    'nav.home': 'Home',
    'nav.menu': 'Menu',
    'nav.search': 'Search',
    'nav.cart': 'Cart',
    'nav.profile': 'Profile',
    'menu.title': 'Menu',
    'menu.all': 'All',
    'menu.filters': 'Filters',
    'filter.vegetarian': 'Vegetarian',
    'filter.spicy': 'Spicy',
    'filter.popular': 'Popular',
    'filter.chefPick': 'Chef\'s pick',
    'filter.price': 'Price',
    'filter.cookTime': 'Cook time',
    'product.addToCart': 'Add to cart',
    'product.ingredients': 'Ingredients',
    'product.nutrition': 'Calories',
    'product.cookingTime': 'Cooking time',
    'product.weight': 'Weight',
    'product.calories': 'kcal',
    'product.reviews': 'Reviews',
    'product.recommended': 'Recommended',
    'cart.title': 'Cart',
    'cart.empty': 'Cart is empty',
    'cart.subtotal': 'Subtotal',
    'cart.delivery': 'Delivery',
    'cart.total': 'Total',
    'cart.promo': 'Promo code',
    'cart.apply': 'Apply',
    'cart.checkout': 'Continue to checkout',
    'cart.prepTime': 'Estimated prep time',
    'checkout.title': 'Checkout',
    'checkout.confirm': 'Confirm order',
    'checkout.comment': 'Add a comment...',
    'checkout.requestContact': 'Share phone number',
    'checkout.requestLocation': 'Share location',
    'checkout.success': 'Order placed!',
    'search.placeholder': 'Search by name, ingredients or category...',
    'search.popular': 'Popular dishes',
    'profile.orders': 'Order history',
    'profile.favorites': 'Favorites',
    'profile.address': 'Saved address',
    'profile.language': 'Language',
    'profile.support': 'Support',
    'profile.about': 'About café',
    'profile.callOperator': 'Call operator',
    'specials.title': 'Today\'s specials',
    'popular.title': 'Popular dishes',
    'chef.title': 'Chef recommendations',
    'hours.open': 'Open',
    'hours.closed': 'Closed',
    'delivery.estimate': 'Delivery estimate',
    'common.min': 'min',
    'common.back': 'Back',
    'order.status.pending': 'Pending',
    'order.status.accepted': 'Accepted',
    'order.status.preparing': 'Preparing',
    'order.status.courier': 'On the way',
    'order.status.delivered': 'Delivered',
    'admin.title': 'Admin panel',
    'admin.orders': 'Orders',
    'admin.analytics': 'Analytics',
    'nav.admin': 'Admin',
    'nav.about': 'About',
  },
}

export function t(lang: Language, key: TranslationKey): string {
  return translations[lang][key] ?? key
}

export function restaurantName(settings: { nameUz: string; nameRu: string; nameEn: string }, lang: Language) {
  if (lang === 'ru') return settings.nameRu
  if (lang === 'en') return settings.nameEn
  return settings.nameUz
}
