// Internationalization system for AllByRent
// Supports automatic language detection and manual override

export type Locale = 'en' | 'ru' | 'es' | 'zh' | 'hi' | 'ar' | 'pt' | 'fr' | 'de' | 'ja' | 'ko'

export const locales: Locale[] = ['en', 'ru', 'es', 'zh', 'hi', 'ar', 'pt', 'fr', 'de', 'ja', 'ko']

export const localeNames: Record<Locale, string> = {
  en: 'English',
  ru: 'Русский',
  es: 'Español',
  zh: '中文',
  hi: 'हिन्दी',
  ar: 'العربية',
  pt: 'Português',
  fr: 'Français',
  de: 'Deutsch',
  ja: '日本語',
  ko: '한국어',
}

export const translations: Record<Locale, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.search': 'Search',
    'nav.list': 'List',
    'nav.rentals': 'Rentals',
    'nav.profile': 'Profile',
    'nav.requests': 'Requests',
    
    // Home
    'home.tagline': 'Own less. Enjoy more.',
    'home.search_placeholder': 'What do you need?',
    'home.nearby': 'Nearby',
    'home.requests_feed': 'Neighbors are looking for',
    'home.no_items': 'No items in this category yet',
    'home.be_first': 'Be the first to list!',
    'home.traveling': 'Traveling?',
    'home.traveling_desc': 'Rent what you need at your destination',
    
    // Categories
    'cat.all': 'All',
    'cat.electronics': 'Electronics',
    'cat.tools': 'Tools',
    'cat.sports': 'Sports',
    'cat.outdoor': 'Outdoor',
    'cat.music': 'Music',
    'cat.party': 'Party',
    'cat.baby': 'Baby & Kids',
    'cat.fashion': 'Fashion',
    'cat.home': 'Home',
    'cat.vehicles': 'Vehicles',
    'cat.photo': 'Photo & Video',
    'cat.gaming': 'Gaming',
    'cat.books': 'Books',
    'cat.medical': 'Medical',
    'cat.garden': 'Garden',
    'cat.office': 'Office',
    'cat.art': 'Art & Craft',
    'cat.travel': 'Travel',
    'cat.pets': 'Pets',
    
    // Item detail
    'item.per_day': '/day',
    'item.per_week': '/week',
    'item.per_month': '/month',
    'item.book_now': 'Book Now',
    'item.share': 'Share',
    'item.insurance': 'Auto-Insurance',
    'item.coverage': 'Coverage up to',
    'item.qr_tracking': 'QR Tracking',
    'item.verified_owner': 'Verified Owner',
    'item.description': 'Description',
    'item.includes': 'Rental includes',
    'item.free_delivery': 'Free local delivery',
    'item.support': '24/7 support',
    'item.check_dates': 'Check availability',
    
    // Rental request
    'request.title': 'Request an Item',
    'request.subtitle': "Can't find what you need? Let neighbors know!",
    'request.what_need': 'What do you need?',
    'request.when_need': 'When do you need it?',
    'request.budget': 'Your budget',
    'request.details': 'Additional details',
    'request.share_request': 'Share request',
    'request.post': 'Post Request',
    'request.share_social': 'Share to social media',
    'request.notify_neighbors': 'Notify neighbors nearby',
    
    // Requests feed
    'requests.title': 'Rental Requests',
    'requests.subtitle': 'Help your neighbors!',
    'requests.empty': 'No requests in your area',
    'requests.i_have_this': 'I have this!',
    'requests.offer': 'Make an offer',
    
    // List item
    'list.title': 'List Your Item',
    'list.subtitle': 'Share what you own, earn while helping neighbors',
    'list.photos': 'Photos',
    'list.photos_hint': 'Add up to 5 photos',
    'list.item_title': 'Title',
    'list.category': 'Category',
    'list.description': 'Description',
    'list.pricing': 'Pricing',
    'list.day': 'Day',
    'list.week': 'Week',
    'list.month': 'Month',
    'list.generate_qr': 'Generate QR Code',
    'list.qr_hint': 'QR code helps track your item physically',
    'list.publish': 'Publish Listing',
    
    // Active rental
    'rental.title': 'Active Rental',
    'rental.checked_in': 'Checked In',
    'rental.pending': 'Pending Check-in',
    'rental.time_remaining': 'Time Remaining',
    'rental.insurance_active': 'Auto-Insurance Active',
    'rental.insurance_pending': 'Insurance activates on check-in',
    'rental.scan_qr': 'Scan QR Code',
    'rental.return': 'Start Return Process',
    'rental.contact_owner': 'Contact Owner',
    'rental.extend': 'Extend Rental',
    
    // Mr. Rentano
    'rentano.name': 'Mr. Rentano',
    'rentano.greeting': "Hello! I'm Mr. Rentano, your rental assistant. How can I help you today?",
    'rentano.speaks_your_language': 'Speaks your language',
    'rentano.ask_insurance': 'How does insurance work?',
    'rentano.ask_extend': 'Extend my rental',
    'rentano.ask_report': 'Report an issue',
    'rentano.ask_suggest': 'Suggest items for me',
    'rentano.type_message': 'Type a message...',
    
    // Traveler mode
    'travel.mode': 'Traveler Mode',
    'travel.current_location': 'Current location',
    'travel.destination': 'Your destination',
    'travel.find_rentals': 'Find rentals at destination',
    'travel.pack_light': 'Pack light, rent on arrival',
    
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.done': 'Done',
    'common.loading': 'Loading...',
    'common.error': 'Something went wrong',
    'common.retry': 'Try again',
    'common.km_away': 'km away',
    'common.reviews': 'reviews',
  },
  
  ru: {
    // Navigation
    'nav.home': 'Главная',
    'nav.search': 'Поиск',
    'nav.list': 'Сдать',
    'nav.rentals': 'Аренды',
    'nav.profile': 'Профиль',
    'nav.requests': 'Запросы',
    
    // Home
    'home.tagline': 'Владей меньше. Наслаждайся больше.',
    'home.search_placeholder': 'Что вам нужно?',
    'home.nearby': 'Рядом',
    'home.requests_feed': 'Соседи ищут',
    'home.no_items': 'Пока нет товаров в этой категории',
    'home.be_first': 'Будьте первым!',
    'home.traveling': 'В путешествии?',
    'home.traveling_desc': 'Арендуйте на месте назначения',
    
    // Categories
    'cat.all': 'Все',
    'cat.electronics': 'Электроника',
    'cat.tools': 'Инструменты',
    'cat.sports': 'Спорт',
    'cat.outdoor': 'Отдых',
    'cat.music': 'Музыка',
    'cat.party': 'Праздник',
    'cat.baby': 'Детское',
    'cat.fashion': 'Мода',
    'cat.home': 'Для дома',
    'cat.vehicles': 'Транспорт',
    'cat.photo': 'Фото и видео',
    'cat.gaming': 'Игры',
    'cat.books': 'Книги',
    'cat.medical': 'Медицина',
    'cat.garden': 'Сад',
    'cat.office': 'Офис',
    'cat.art': 'Творчество',
    'cat.travel': 'Путешествия',
    'cat.pets': 'Питомцы',
    
    // Item detail
    'item.per_day': '/день',
    'item.per_week': '/неделя',
    'item.per_month': '/месяц',
    'item.book_now': 'Забронировать',
    'item.share': 'Поделиться',
    'item.insurance': 'Авто-страховка',
    'item.coverage': 'Покрытие до',
    'item.qr_tracking': 'QR отслеживание',
    'item.verified_owner': 'Проверенный владелец',
    'item.description': 'Описание',
    'item.includes': 'Включено в аренду',
    'item.free_delivery': 'Бесплатная доставка',
    'item.support': 'Поддержка 24/7',
    'item.check_dates': 'Проверить даты',
    
    // Rental request
    'request.title': 'Запрос на аренду',
    'request.subtitle': 'Не нашли нужное? Расскажите соседям!',
    'request.what_need': 'Что вам нужно?',
    'request.when_need': 'Когда нужно?',
    'request.budget': 'Ваш бюджет',
    'request.details': 'Дополнительно',
    'request.share_request': 'Поделиться запросом',
    'request.post': 'Отправить запрос',
    'request.share_social': 'Поделиться в соцсетях',
    'request.notify_neighbors': 'Уведомить соседей',
    
    // Requests feed
    'requests.title': 'Запросы на аренду',
    'requests.subtitle': 'Помогите соседям!',
    'requests.empty': 'Нет запросов рядом',
    'requests.i_have_this': 'У меня есть!',
    'requests.offer': 'Предложить',
    
    // List item
    'list.title': 'Сдать в аренду',
    'list.subtitle': 'Делитесь вещами, зарабатывайте помогая',
    'list.photos': 'Фото',
    'list.photos_hint': 'До 5 фотографий',
    'list.item_title': 'Название',
    'list.category': 'Категория',
    'list.description': 'Описание',
    'list.pricing': 'Цены',
    'list.day': 'День',
    'list.week': 'Неделя',
    'list.month': 'Месяц',
    'list.generate_qr': 'Создать QR-код',
    'list.qr_hint': 'QR помогает отслеживать вещь',
    'list.publish': 'Опубликовать',
    
    // Active rental
    'rental.title': 'Активная аренда',
    'rental.checked_in': 'Получено',
    'rental.pending': 'Ожидает получения',
    'rental.time_remaining': 'Осталось времени',
    'rental.insurance_active': 'Страховка активна',
    'rental.insurance_pending': 'Страховка активируется при получении',
    'rental.scan_qr': 'Сканировать QR',
    'rental.return': 'Начать возврат',
    'rental.contact_owner': 'Связаться',
    'rental.extend': 'Продлить',
    
    // Mr. Rentano
    'rentano.name': 'Мистер Рентано',
    'rentano.greeting': 'Привет! Я Мистер Рентано, ваш помощник по аренде. Чем могу помочь?',
    'rentano.speaks_your_language': 'Говорит на вашем языке',
    'rentano.ask_insurance': 'Как работает страховка?',
    'rentano.ask_extend': 'Продлить аренду',
    'rentano.ask_report': 'Сообщить о проблеме',
    'rentano.ask_suggest': 'Подобрать для меня',
    'rentano.type_message': 'Введите сообщение...',
    
    // Traveler mode
    'travel.mode': 'Режим путешественника',
    'travel.current_location': 'Текущее место',
    'travel.destination': 'Место назначения',
    'travel.find_rentals': 'Найти аренду на месте',
    'travel.pack_light': 'Путешествуйте налегке',
    
    // Common
    'common.save': 'Сохранить',
    'common.cancel': 'Отмена',
    'common.back': 'Назад',
    'common.next': 'Далее',
    'common.done': 'Готово',
    'common.loading': 'Загрузка...',
    'common.error': 'Что-то пошло не так',
    'common.retry': 'Попробовать снова',
    'common.km_away': 'км',
    'common.reviews': 'отзывов',
  },
  
  es: {
    'nav.home': 'Inicio',
    'nav.search': 'Buscar',
    'nav.list': 'Publicar',
    'nav.rentals': 'Alquileres',
    'nav.profile': 'Perfil',
    'nav.requests': 'Solicitudes',
    'home.tagline': 'Posee menos. Disfruta más.',
    'home.search_placeholder': '¿Qué necesitas?',
    'home.nearby': 'Cerca',
    'home.requests_feed': 'Los vecinos buscan',
    'item.book_now': 'Reservar',
    'item.share': 'Compartir',
    'rentano.greeting': '¡Hola! Soy Mr. Rentano, tu asistente de alquiler. ¿Cómo puedo ayudarte?',
    'common.km_away': 'km',
  },
  
  zh: {
    'nav.home': '首页',
    'nav.search': '搜索',
    'nav.list': '发布',
    'nav.rentals': '租赁',
    'nav.profile': '我的',
    'nav.requests': '需求',
    'home.tagline': '少拥有，多享受。',
    'home.search_placeholder': '你需要什么？',
    'home.nearby': '附近',
    'home.requests_feed': '邻居在找',
    'item.book_now': '立即预订',
    'item.share': '分享',
    'rentano.greeting': '你好！我是租赁助手Mr. Rentano。有什么可以帮你的？',
    'common.km_away': '公里',
  },
  
  hi: {
    'nav.home': 'होम',
    'nav.search': 'खोजें',
    'nav.list': 'लिस्ट करें',
    'nav.rentals': 'किराए',
    'nav.profile': 'प्रोफ़ाइल',
    'home.tagline': 'कम रखें। ज़्यादा आनंद लें।',
    'home.search_placeholder': 'आपको क्या चाहिए?',
    'item.book_now': 'अभी बुक करें',
    'rentano.greeting': 'नमस्ते! मैं Mr. Rentano हूं, आपका रेंटल असिस्टेंट। मैं कैसे मदद कर सकता हूं?',
  },
  
  ar: {
    'nav.home': 'الرئيسية',
    'nav.search': 'بحث',
    'nav.list': 'أضف',
    'nav.rentals': 'الإيجارات',
    'nav.profile': 'الملف',
    'home.tagline': 'امتلك أقل. استمتع أكثر.',
    'home.search_placeholder': 'ماذا تحتاج؟',
    'item.book_now': 'احجز الآن',
    'rentano.greeting': 'مرحباً! أنا Mr. Rentano، مساعدك في الإيجار. كيف يمكنني مساعدتك؟',
  },
  
  pt: {
    'nav.home': 'Início',
    'nav.search': 'Buscar',
    'nav.list': 'Anunciar',
    'nav.rentals': 'Aluguéis',
    'nav.profile': 'Perfil',
    'home.tagline': 'Tenha menos. Aproveite mais.',
    'home.search_placeholder': 'O que você precisa?',
    'item.book_now': 'Reservar',
    'rentano.greeting': 'Olá! Sou o Mr. Rentano, seu assistente de aluguel. Como posso ajudar?',
  },
  
  fr: {
    'nav.home': 'Accueil',
    'nav.search': 'Rechercher',
    'nav.list': 'Publier',
    'nav.rentals': 'Locations',
    'nav.profile': 'Profil',
    'home.tagline': 'Posséder moins. Profiter plus.',
    'home.search_placeholder': 'De quoi avez-vous besoin?',
    'item.book_now': 'Réserver',
    'rentano.greeting': 'Bonjour! Je suis Mr. Rentano, votre assistant location. Comment puis-je vous aider?',
  },
  
  de: {
    'nav.home': 'Start',
    'nav.search': 'Suchen',
    'nav.list': 'Anbieten',
    'nav.rentals': 'Mieten',
    'nav.profile': 'Profil',
    'home.tagline': 'Weniger besitzen. Mehr genießen.',
    'home.search_placeholder': 'Was brauchst du?',
    'item.book_now': 'Jetzt buchen',
    'rentano.greeting': 'Hallo! Ich bin Mr. Rentano, dein Miet-Assistent. Wie kann ich helfen?',
  },
  
  ja: {
    'nav.home': 'ホーム',
    'nav.search': '検索',
    'nav.list': '出品',
    'nav.rentals': 'レンタル',
    'nav.profile': 'プロフィール',
    'home.tagline': '所有を減らし、楽しみを増やす。',
    'home.search_placeholder': '何が必要ですか？',
    'item.book_now': '今すぐ予約',
    'rentano.greeting': 'こんにちは！レンタルアシスタントのMr. Rentanoです。何かお手伝いできますか？',
  },
  
  ko: {
    'nav.home': '홈',
    'nav.search': '검색',
    'nav.list': '등록',
    'nav.rentals': '대여',
    'nav.profile': '프로필',
    'home.tagline': '덜 소유하고, 더 즐기세요.',
    'home.search_placeholder': '무엇이 필요하세요?',
    'item.book_now': '지금 예약',
    'rentano.greeting': '안녕하세요! 렌탈 도우미 Mr. Rentano입니다. 무엇을 도와드릴까요?',
  },
}

// Get translation with fallback to English
export function t(locale: Locale, key: string): string {
  return translations[locale]?.[key] || translations.en[key] || key
}

// Detect browser language
export function detectLocale(): Locale {
  if (typeof window === 'undefined') return 'en'
  
  const browserLang = navigator.language.split('-')[0] as Locale
  return locales.includes(browserLang) ? browserLang : 'en'
}

// Format currency based on locale
export function formatCurrency(amount: number, locale: Locale, currency = 'USD'): string {
  const currencyMap: Record<Locale, string> = {
    en: 'USD',
    ru: 'RUB',
    es: 'EUR',
    zh: 'CNY',
    hi: 'INR',
    ar: 'AED',
    pt: 'BRL',
    fr: 'EUR',
    de: 'EUR',
    ja: 'JPY',
    ko: 'KRW',
  }
  
  const localeCurrency = currencyMap[locale] || currency
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: localeCurrency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Get locale-specific date format
export function formatDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}
