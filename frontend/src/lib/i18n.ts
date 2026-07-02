export type Language = 'uz' | 'ru' | 'en'

export const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: 'uz', label: "O'zbek", flag: '🇺🇿' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
]

export type TranslationKey = keyof typeof translations.ru

export const translations = {
  uz: {
    // Nav
    home: 'Bosh sahifa',
    menu: 'Menyu',
    cart: 'Savat',
    profile: 'Profil',
    about: 'Biz haqimizda',
    // Home
    hero_badge: 'Eski Shahar choyxonasi',
    hero_title: "Ta'm, siz",
    hero_title_accent: 'his qiladigan',
    hero_subtitle: "An'anaviy o'zbek taomlari, oilaviy muhit va mehmonnavozlik",
    popular: 'Mashhur taomlar',
    all: 'Hammasi →',
    // USP
    usp_delivery: 'Bepul yetkazib berish',
    usp_delivery_sub: "50 000 so'mdan ortiq buyurtmalarga",
    usp_fresh: 'Yangi tayyorlangan',
    usp_fresh_sub: 'Har bir taom buyurtma bo\'yicha',
    usp_halal: '100% Halol',
    usp_halal_sub: 'Sertifikatlangan mahsulotlar',
    // Menu/Catalog
    menu_title: 'Menyu',
    menu_subtitle: 'Barcha taomlar va ichimliklar',
    no_products: 'Bu kategoriyada hozircha taomlar yo\'q',
    // Product
    add_to_cart: 'Savatga qo\'shish',
    cook_time: '⏱️ Tayyorlanish vaqti',
    minutes: 'daqiqa',
    calories: 'kkal',
    vegetarian: '🥬 Vegetarian',
    spicy: '🌶️ Achchiq',
    added_to_cart: 'Savatga qo\'shildi',
    // Cart
    cart_title: 'Savat',
    cart_empty: 'Hozircha bo\'sh',
    cart_empty_text: 'Menyudan taom qo\'shing',
    go_to_menu: 'Menyuga o\'tish',
    free_delivery: '🚗 Bepul yetkazib berish',
    total: 'Jami',
    // Order
    order_title: 'Buyurtmani rasmiylashtirish',
    order_name_label: 'Ismingiz nima?',
    order_name_placeholder: 'Ismingiz',
    order_phone_label: 'Telefon',
    order_phone_placeholder: '+998 90 123 45 67',
    order_address_label: 'Yetkazib berish manzili',
    order_address_placeholder: 'Shahar, ko\'cha, uy, xonadon',
    order_comment_label: 'Buyurtmaga izoh',
    order_comment_placeholder: 'Tilaklar, qo\'ng\'iroq uchun qulay vaqt...',
    order_total: 'To\'lov summasi',
    order_submit: 'Buyurtmani tasdiqlash',
    order_submitting: 'Yuborilmoqda...',
    order_privacy: 'Tugmani bosish orqali siz shaxsiy ma\'lumotlarni qayta ishlashga rozilik bildirasiz',
    order_success: 'buyurtma qabul qilindi!\n\nTez orada siz bilan bog\'lanamiz.',
    order_cart_empty: 'Savat bo\'sh',
    order_cart_empty_text: 'Savatga taom qo\'shing',
    // Profile
    profile_title: 'Profil',
    profile_subtitle: 'Sizning Telegram hisobingiz',
    my_orders: 'Mening buyurtmalarim',
    no_orders: 'Hozircha buyurtmalar yo\'q.',
    contact_us: 'Biz bilan bog\'lanish',
    logout: 'Chiqish',
    // About
    about_title: 'Biz haqimizda',
    about_address: 'Manzil',
    about_hours: 'Ish vaqti',
    about_phone: 'Telefon',
    about_social: 'Ijtimoiy tarmoqlar',
    // Errors
    error_title: 'Nimadir noto\'g\'ri ketdi',
    error_subtitle: 'Ilovani qayta ishga tushirishga harakat qiling',
    error_reload: 'Qayta yuklash',
    // Currency
    currency: "so'm",
    // Settings
    settings: 'Sozlamalar',
    language: 'Til',
    theme: 'Mavzu',
    theme_light: 'Yorug\'',
    theme_dark: 'Qorong\'u',
    theme_auto: 'Avtomatik',
    // Checkout button
    checkout_btn: 'Buyurtma berish',
    // Categories
    cat_all: 'Hammasi',
    cat_soups: 'Sho\'rvalar',
    cat_main: 'Asosiy taomlar',
    cat_salads: 'Salatlar',
    cat_bread: 'Non va somsa',
    cat_drinks: 'Ichimliklar',
    cat_desserts: 'Shirinliklar',
    cat_plov: 'Palov',
    cat_kebab: 'Kabob',
    // Validation
    val_name_required: 'Ism majburiy',
    val_name_long: 'Ism juda uzun (maks. 100 belgi)',
    val_phone_required: 'Telefon majburiy',
    val_phone_invalid: 'Telefon formati noto\'g\'ri',
    val_phone_long: 'Telefon juda uzun',
    val_address_long: 'Manzil juda uzun (maks. 500 belgi)',
    val_comment_long: 'Izoh juda uzun (maks. 1000 belgi)',
    val_fix_errors: 'Iltimos, xatolarni to\'g\'rilang',
    cart_is_empty: 'Savat bo\'sh',
    // Cart items count
    items_count: 'ta',
    // Order status
    status_pending: 'Kutilmoqda',
    status_confirmed: 'Tasdiqlangan',
    status_preparing: 'Tayyorlanmoqda',
    status_ready: 'Tayyor',
    status_delivered: 'Yetkazildi',
    status_cancelled: 'Bekor qilindi',
  },
  ru: {
    // Nav
    home: 'Главная',
    menu: 'Меню',
    cart: 'Корзина',
    profile: 'Профиль',
    about: 'О нас',
    // Home
    hero_badge: 'Чайхана Эски Шахар',
    hero_title: 'Вкус, который',
    hero_title_accent: 'чувствуется',
    hero_subtitle: 'Традиционная узбекская кухня, семейная атмосфера и гостеприимство',
    popular: 'Популярные блюда',
    all: 'Все →',
    // USP
    usp_delivery: 'Бесплатная доставка',
    usp_delivery_sub: 'При заказе от 50 000 сум',
    usp_fresh: 'Свежеприготовленное',
    usp_fresh_sub: 'Каждое блюдо по заказу',
    usp_halal: '100% Халяль',
    usp_halal_sub: 'Сертифицированные продукты',
    // Menu/Catalog
    menu_title: 'Меню',
    menu_subtitle: 'Все блюда и напитки',
    no_products: 'В этой категории пока нет блюд',
    // Product
    add_to_cart: 'В корзину',
    cook_time: '⏱️ Время приготовления',
    minutes: 'мин',
    calories: 'ккал',
    vegetarian: '🥬 Вегетарианское',
    spicy: '🌶️ Острое',
    added_to_cart: 'Добавлено в корзину',
    // Cart
    cart_title: 'Корзина',
    cart_empty: 'Пока пусто',
    cart_empty_text: 'Добавьте блюдо из меню',
    go_to_menu: 'Перейти в меню',
    free_delivery: '🚗 Бесплатная доставка',
    total: 'Итого',
    // Order
    order_title: 'Оформление заказа',
    order_name_label: 'Как к вам обращаться?',
    order_name_placeholder: 'Ваше имя',
    order_phone_label: 'Телефон',
    order_phone_placeholder: '+998 90 123 45 67',
    order_address_label: 'Адрес доставки',
    order_address_placeholder: 'Город, улица, дом, кв.',
    order_comment_label: 'Комментарий к заказу',
    order_comment_placeholder: 'Пожелания, удобное время для звонка...',
    order_total: 'Итого к оплате',
    order_submit: 'Подтвердить заказ',
    order_submitting: 'Отправка...',
    order_privacy: 'Нажимая кнопку, вы соглашаетесь с обработкой персональных данных',
    order_success: 'заказ принят!\n\nМы свяжемся с вами в ближайшее время.',
    order_cart_empty: 'Корзина пуста',
    order_cart_empty_text: 'Добавьте блюда в корзину',
    // Profile
    profile_title: 'Профиль',
    profile_subtitle: 'Ваш аккаунт Telegram',
    my_orders: 'Мои заказы',
    no_orders: 'Заказов пока нет.',
    contact_us: 'Связаться с нами',
    logout: 'Выйти',
    // About
    about_title: 'О нас',
    about_address: 'Адрес',
    about_hours: 'Время работы',
    about_phone: 'Телефон',
    about_social: 'Социальные сети',
    // Errors
    error_title: 'Что-то пошло не так',
    error_subtitle: 'Попробуйте перезапустить приложение',
    error_reload: 'Перезагрузить',
    // Currency
    currency: 'сум',
    // Settings
    settings: 'Настройки',
    language: 'Язык',
    theme: 'Тема',
    theme_light: 'Светлая',
    theme_dark: 'Тёмная',
    theme_auto: 'Авто',
    // Checkout button
    checkout_btn: 'Оформить заказ',
    // Categories
    cat_all: 'Все',
    cat_soups: 'Супы',
    cat_main: 'Основные блюда',
    cat_salads: 'Салаты',
    cat_bread: 'Хлеб и самса',
    cat_drinks: 'Напитки',
    cat_desserts: 'Десерты',
    cat_plov: 'Плов',
    cat_kebab: 'Шашлык',
    // Validation
    val_name_required: 'Имя обязательно',
    val_name_long: 'Имя слишком длинное (макс. 100 символов)',
    val_phone_required: 'Телефон обязателен',
    val_phone_invalid: 'Неверный формат телефона',
    val_phone_long: 'Телефон слишком длинный',
    val_address_long: 'Адрес слишком длинный (макс. 500 символов)',
    val_comment_long: 'Комментарий слишком длинный (макс. 1000 символов)',
    val_fix_errors: 'Пожалуйста, исправьте ошибки в форме',
    cart_is_empty: 'Корзина пуста',
    // Cart items count
    items_count: 'поз.',
    // Order status
    status_pending: 'Ожидает',
    status_confirmed: 'Подтверждён',
    status_preparing: 'Готовится',
    status_ready: 'Готов',
    status_delivered: 'Доставлен',
    status_cancelled: 'Отменён',
  },
  en: {
    // Nav
    home: 'Home',
    menu: 'Menu',
    cart: 'Cart',
    profile: 'Profile',
    about: 'About',
    // Home
    hero_badge: 'Eski Shahar Teahouse',
    hero_title: 'Taste you can',
    hero_title_accent: 'feel',
    hero_subtitle: 'Traditional Uzbek cuisine, family atmosphere and hospitality',
    popular: 'Popular dishes',
    all: 'All →',
    // USP
    usp_delivery: 'Free delivery',
    usp_delivery_sub: 'For orders over 50,000 sum',
    usp_fresh: 'Freshly prepared',
    usp_fresh_sub: 'Every dish made to order',
    usp_halal: '100% Halal',
    usp_halal_sub: 'Certified products',
    // Menu/Catalog
    menu_title: 'Menu',
    menu_subtitle: 'All dishes and drinks',
    no_products: 'No dishes in this category yet',
    // Product
    add_to_cart: 'Add to cart',
    cook_time: '⏱️ Cooking time',
    minutes: 'min',
    calories: 'kcal',
    vegetarian: '🥬 Vegetarian',
    spicy: '🌶️ Spicy',
    added_to_cart: 'Added to cart',
    // Cart
    cart_title: 'Cart',
    cart_empty: 'Empty for now',
    cart_empty_text: 'Add a dish from the menu',
    go_to_menu: 'Go to menu',
    free_delivery: '🚗 Free delivery',
    total: 'Total',
    // Order
    order_title: 'Checkout',
    order_name_label: 'Your name',
    order_name_placeholder: 'Your name',
    order_phone_label: 'Phone',
    order_phone_placeholder: '+998 90 123 45 67',
    order_address_label: 'Delivery address',
    order_address_placeholder: 'City, street, house, apt.',
    order_comment_label: 'Order comment',
    order_comment_placeholder: 'Wishes, convenient call time...',
    order_total: 'Total to pay',
    order_submit: 'Confirm order',
    order_submitting: 'Sending...',
    order_privacy: 'By clicking the button, you agree to personal data processing',
    order_success: 'order accepted!\n\nWe will contact you shortly.',
    order_cart_empty: 'Cart is empty',
    order_cart_empty_text: 'Add items to cart',
    // Profile
    profile_title: 'Profile',
    profile_subtitle: 'Your Telegram account',
    my_orders: 'My orders',
    no_orders: 'No orders yet.',
    contact_us: 'Contact us',
    logout: 'Log out',
    // About
    about_title: 'About us',
    about_address: 'Address',
    about_hours: 'Working hours',
    about_phone: 'Phone',
    about_social: 'Social media',
    // Errors
    error_title: 'Something went wrong',
    error_subtitle: 'Try restarting the app',
    error_reload: 'Reload',
    // Currency
    currency: 'sum',
    // Settings
    settings: 'Settings',
    language: 'Language',
    theme: 'Theme',
    theme_light: 'Light',
    theme_dark: 'Dark',
    theme_auto: 'Auto',
    // Checkout button
    checkout_btn: 'Checkout',
    // Categories
    cat_all: 'All',
    cat_soups: 'Soups',
    cat_main: 'Main dishes',
    cat_salads: 'Salads',
    cat_bread: 'Bread & Samsa',
    cat_drinks: 'Drinks',
    cat_desserts: 'Desserts',
    cat_plov: 'Plov',
    cat_kebab: 'Kebab',
    // Validation
    val_name_required: 'Name is required',
    val_name_long: 'Name is too long (max 100 chars)',
    val_phone_required: 'Phone is required',
    val_phone_invalid: 'Invalid phone format',
    val_phone_long: 'Phone is too long',
    val_address_long: 'Address is too long (max 500 chars)',
    val_comment_long: 'Comment is too long (max 1000 chars)',
    val_fix_errors: 'Please fix the errors in the form',
    cart_is_empty: 'Cart is empty',
    // Cart items count
    items_count: 'items',
    // Order status
    status_pending: 'Pending',
    status_confirmed: 'Confirmed',
    status_preparing: 'Preparing',
    status_ready: 'Ready',
    status_delivered: 'Delivered',
    status_cancelled: 'Cancelled',
  },
}

export function t(lang: Language, key: TranslationKey): string {
  return (translations[lang] as Record<string, string>)[key] ?? (translations.ru as Record<string, string>)[key] ?? key
}

export function getProductName(product: { name: string; name_uz?: string; name_ru?: string; name_en?: string }, lang: Language): string {
  if (lang === 'uz' && product.name_uz) return product.name_uz
  if (lang === 'ru' && product.name_ru) return product.name_ru
  if (lang === 'en' && product.name_en) return product.name_en
  return product.name
}

export function getProductDescription(product: { description?: string; description_uz?: string; description_ru?: string; description_en?: string }, lang: Language): string {
  if (lang === 'uz' && product.description_uz) return product.description_uz
  if (lang === 'ru' && product.description_ru) return product.description_ru
  if (lang === 'en' && product.description_en) return product.description_en
  return product.description ?? ''
}
