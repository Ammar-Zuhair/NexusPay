export const MOCK_CATEGORIES = [
  { id: 'cat-topup', slug: 'game-topups', title: { en: 'Game Top-Ups', ar: 'شحن ألعاب' }, icon: 'Gamepad2' },
  { id: 'cat-subs', slug: 'subscriptions', title: { en: 'Digital Subscriptions', ar: 'اشتراكات رقمية' }, icon: 'Tv' },
  { id: 'cat-cards', slug: 'gift-cards', title: { en: 'Gift Cards', ar: 'بطاقات الهدايا' }, icon: 'Gift' },
  { id: 'cat-software', slug: 'software-licenses', title: { en: 'Software Licenses', ar: 'تراخيص برامج' }, icon: 'Key' },
  { id: 'cat-recharge', slug: 'mobile-recharge', title: { en: 'Mobile Recharge', ar: 'شحن رصيد الجوال' }, icon: 'Smartphone' },
  { id: 'cat-vouchers', slug: 'digital-vouchers', title: { en: 'Digital Vouchers', ar: 'قسائم شراء' }, icon: 'Ticket' }
];

export const MOCK_GAMES = [
  {
    id: "pubg-mobile",
    categoryId: "cat-topup",
    productType: "DIRECT_TOPUP",
    title: { en: "PUBG Mobile UC", ar: "شدات ببجي موبايل" },
    category: "game-topups",
    publisher: "Tencent Games",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCczpk-ktW4LSFwcV8ZIeAOgkw72wT2S-tSrjtYRkV6UIWAyIEv8v7rX5NdsEUXfxzCN0zkVNylM7lda-0Ow1-htGHQGQFG43lYhXQrfYdnP-Qa0r1S7YSEaHGOKLDinGxczjjBDnELun4dLQmHGkoZQKZxDAkwxAFlrqlJXq08gfrrJdrKo3ATvi2b71MWAiKo0Vq4KxOCqoLovxKh5LCy8VV_qzGi625K0no3GGXtOUJM5d2-eBZM",
    badge: "INSTANT DELIVERY",
    isPopular: true,
    rating: 4.9,
    reviewsCount: 14250,
    minPriceUSD: 0.99,
    minPriceSAR: 3.75,
    packages: [
      { id: "pubg-60", name: "60 UC", priceUSD: 0.99, priceSAR: 3.75, providerCostUSD: 0.85 },
      { id: "pubg-325", name: "300 + 25 UC", priceUSD: 4.99, priceSAR: 18.75, providerCostUSD: 4.40 },
      { id: "pubg-660", name: "600 + 60 UC", priceUSD: 9.99, priceSAR: 37.50, providerCostUSD: 8.90 },
      { id: "pubg-1800", name: "1500 + 300 UC", priceUSD: 24.99, priceSAR: 93.75, providerCostUSD: 22.00 }
    ],
    description: {
      en: "Elevate your gaming experience with PUBG Mobile Unknown Cash (UC). Purchase UC instantly using your Player ID.",
      ar: "ارتقِ بتجربتك في اللعبة مع شدات ببجي موبايل (UC). اشترِ الشدات فوراً باستخدام معرف اللاعب (Player ID)."
    }
  },
  {
    id: "free-fire",
    categoryId: "cat-topup",
    productType: "DIRECT_TOPUP",
    title: { en: "Free Fire Diamonds", ar: "جواهر فري فاير" },
    category: "game-topups",
    publisher: "Garena",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
    badge: "HOT DEAL",
    isPopular: true,
    rating: 4.8,
    reviewsCount: 9820,
    minPriceUSD: 1.49,
    minPriceSAR: 5.50,
    packages: [
      { id: "ff-100", name: "100 + 10 Diamonds", priceUSD: 1.49, priceSAR: 5.50, providerCostUSD: 1.20 },
      { id: "ff-530", name: "530 + 53 Diamonds", priceUSD: 4.99, priceSAR: 18.75, providerCostUSD: 4.30 },
      { id: "ff-1080", name: "1080 + 108 Diamonds", priceUSD: 9.99, priceSAR: 37.50, providerCostUSD: 8.80 }
    ],
    description: {
      en: "Top up Free Fire Diamonds directly using your Player ID.",
      ar: "اشحن جواهر فري فاير مباشرة باستخدام معرف اللاعب."
    }
  },
  {
    id: "netflix-sub",
    categoryId: "cat-subs",
    productType: "SUBSCRIPTION",
    title: { en: "Netflix Premium Account", ar: "اشتراك نيتفليكس بريميوم" },
    category: "subscriptions",
    publisher: "Netflix Inc.",
    image: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=800&q=80",
    badge: "4K ULTRA HD",
    isPopular: true,
    rating: 4.9,
    reviewsCount: 8400,
    minPriceUSD: 12.99,
    minPriceSAR: 48.75,
    packages: [
      { id: "net-1m", name: "1 Month Premium (4 Screens)", priceUSD: 12.99, priceSAR: 48.75, providerCostUSD: 10.50 },
      { id: "net-3m", name: "3 Months Premium", priceUSD: 34.99, priceSAR: 131.25, providerCostUSD: 29.00 }
    ],
    description: {
      en: "Enjoy unlimited movies and TV shows in 4K Ultra HD on Netflix.",
      ar: "استمتع بمشاهدة غير محدودة للأفلام والمسلسلات بجودة 4K على نيتفليكس."
    }
  },
  {
    id: "steam-giftcard",
    categoryId: "cat-cards",
    productType: "VOUCHER_CODE",
    title: { en: "Steam Wallet Gift Card", ar: "بطاقة شحن محفظة ستيم" },
    category: "gift-cards",
    publisher: "Valve Corporation",
    image: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?auto=format&fit=crop&w=800&q=80",
    badge: "GLOBAL CODE",
    isPopular: true,
    rating: 4.95,
    reviewsCount: 19400,
    minPriceUSD: 10.00,
    minPriceSAR: 37.50,
    packages: [
      { id: "stm-10", name: "$10 Steam Code", priceUSD: 10.00, priceSAR: 37.50, providerCostUSD: 9.20 },
      { id: "stm-50", name: "$50 Steam Code", priceUSD: 50.00, priceSAR: 187.50, providerCostUSD: 46.50 }
    ],
    description: {
      en: "Add funds directly to your Steam Wallet to purchase games and in-game items.",
      ar: "أضف الرصيد مباشرة إلى محفظة ستيم الخاصة بك لشراء الألعاب والمنتجات."
    }
  },
  {
    id: "apple-giftcard",
    categoryId: "cat-cards",
    productType: "VOUCHER_CODE",
    title: { en: "Apple iTunes Gift Card", ar: "بطاقة آيتيونز آبل" },
    category: "gift-cards",
    publisher: "Apple Inc.",
    image: "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?auto=format&fit=crop&w=800&q=80",
    badge: "INSTANT CODE",
    isPopular: true,
    rating: 4.9,
    reviewsCount: 16500,
    minPriceUSD: 10.00,
    minPriceSAR: 37.50,
    packages: [
      { id: "app-10", name: "$10 Apple Gift Code", priceUSD: 10.00, priceSAR: 37.50, providerCostUSD: 9.30 },
      { id: "app-25", name: "$25 Apple Gift Code", priceUSD: 25.00, priceSAR: 93.75, providerCostUSD: 23.20 },
      { id: "app-50", name: "$50 Apple Gift Code", priceUSD: 50.00, priceSAR: 187.50, providerCostUSD: 46.50 }
    ],
    description: {
      en: "Buy Apple Gift Cards to pay for games, apps, iCloud storage, and Apple Music.",
      ar: "اشترِ بطاقات هدايا آبل لشراء الألعاب، التطبيقات، مساحة iCloud واشتراك Apple Music."
    }
  },
  {
    id: "xbox-gamepass",
    categoryId: "cat-subs",
    productType: "VOUCHER_CODE",
    title: { en: "XBOX Game Pass Ultimate", ar: "اشتراك جيم باس اولتيميت" },
    category: "subscriptions",
    publisher: "Microsoft Xbox",
    image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80",
    badge: "GLOBAL CODE",
    isPopular: true,
    rating: 4.95,
    reviewsCount: 11200,
    minPriceUSD: 14.99,
    minPriceSAR: 56.25,
    packages: [
      { id: "xbox-1m", name: "1 Month Ultimate Membership", priceUSD: 14.99, priceSAR: 56.25, providerCostUSD: 12.50 },
      { id: "xbox-3m", name: "3 Months Ultimate Membership", priceUSD: 39.99, priceSAR: 149.96, providerCostUSD: 34.00 }
    ],
    description: {
      en: "Get access to over 100 high-quality Xbox and PC games, plus EA Play membership.",
      ar: "احصل على وصول لأكثر من 100 لعبة عالية الجودة على Xbox وPC بالإضافة لعضوية EA Play."
    }
  },
  {
    id: "spotify-sub",
    categoryId: "cat-subs",
    productType: "VOUCHER_CODE",
    title: { en: "Spotify Premium Subscription", ar: "اشتراك سبوتيفاي بريميوم" },
    category: "subscriptions",
    publisher: "Spotify AB",
    image: "https://images.unsplash.com/photo-1611339555312-e607c8352fd7?auto=format&fit=crop&w=800&q=80",
    badge: "NO ADS",
    isPopular: true,
    rating: 4.88,
    reviewsCount: 7900,
    minPriceUSD: 9.99,
    minPriceSAR: 37.50,
    packages: [
      { id: "spot-1m", name: "1 Month Individual Premium", priceUSD: 9.99, priceSAR: 37.50, providerCostUSD: 8.50 },
      { id: "spot-3m", name: "3 Months Individual Premium", priceUSD: 24.99, priceSAR: 93.75, providerCostUSD: 21.00 }
    ],
    description: {
      en: "Listen to music ad-free, offline, and with unlimited skips.",
      ar: "استمع للموسيقى بدون إعلانات وبكفاءة عالية مع إمكانية التحميل والاستماع أوفلاين."
    }
  },
  {
    id: "google-play",
    categoryId: "cat-cards",
    productType: "VOUCHER_CODE",
    title: { en: "Google Play Store Code", ar: "بطاقة جوجل بلاي" },
    category: "gift-cards",
    publisher: "Google LLC",
    image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=800&q=80",
    badge: "INSTANT CODE",
    isPopular: true,
    rating: 4.92,
    reviewsCount: 15400,
    minPriceUSD: 10.00,
    minPriceSAR: 37.50,
    packages: [
      { id: "gplay-10", name: "$10 Google Play Code", priceUSD: 10.00, priceSAR: 37.50, providerCostUSD: 9.20 },
      { id: "gplay-25", name: "$25 Google Play Code", priceUSD: 25.00, priceSAR: 93.75, providerCostUSD: 23.00 },
      { id: "gplay-50", name: "$50 Google Play Code", priceUSD: 50.00, priceSAR: 187.50, providerCostUSD: 46.00 }
    ],
    description: {
      en: "Redeem Google Play codes for Android games, apps, movies, and books.",
      ar: "استبدل أكواد جوجل بلاي لشراء ألعاب الأندرويد والتطبيقات والأفلام والكتب."
    }
  },
  {
    id: "roblox",
    categoryId: "cat-topup",
    productType: "DIRECT_TOPUP",
    title: { en: "Roblox Robux", ar: "روبوكس روبلوكس" },
    category: "game-topups",
    publisher: "Roblox Corporation",
    image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80",
    badge: "POPULAR",
    isPopular: true,
    rating: 4.91,
    reviewsCount: 12800,
    minPriceUSD: 4.99,
    minPriceSAR: 18.75,
    packages: [
      { id: "robux-400", name: "400 Robux", priceUSD: 4.99, priceSAR: 18.75, providerCostUSD: 4.20 },
      { id: "robux-800", name: "800 Robux", priceUSD: 9.99, priceSAR: 37.50, providerCostUSD: 8.80 },
      { id: "robux-2000", name: "2000 Robux", priceUSD: 24.99, priceSAR: 93.75, providerCostUSD: 22.00 }
    ],
    description: {
      en: "Top up Robux for your Roblox account using your username or ID.",
      ar: "اشحن روبوكس فوراً لحسابك في روبلوكس باستخدام اسم المستخدم أو معرف الحساب."
    }
  },
  {
    id: "win11-pro",
    categoryId: "cat-software",
    productType: "LICENSE_KEY",
    title: { en: "Windows 11 Pro License Key", ar: "مفتاح تفعيل ويندوز 11 بروب" },
    category: "software-licenses",
    publisher: "Microsoft",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    badge: "LIFETIME ACTIVATION",
    isPopular: true,
    rating: 4.85,
    reviewsCount: 3100,
    minPriceUSD: 14.99,
    minPriceSAR: 56.25,
    packages: [
      { id: "win-1pc", name: "1 PC Digital OEM Key", priceUSD: 14.99, priceSAR: 56.25, providerCostUSD: 11.00 }
    ],
    description: {
      en: "Genuine Windows 11 Professional lifetime activation key for 1 PC.",
      ar: "مفتاح تفعيل أصلي ومدى الحياة لويندوز 11 بروفيشينال لجهاز واحد."
    }
  },
  {
    id: "stc-recharge",
    categoryId: "cat-recharge",
    productType: "MOBILE_RECHARGE",
    title: { en: "STC Sawa Airtime Recharge", ar: "شحن رصيد سوا اس تي سي" },
    category: "mobile-recharge",
    publisher: "STC Saudi",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80",
    badge: "SAUDI ARABIA",
    isPopular: true,
    rating: 4.9,
    reviewsCount: 7800,
    minPriceUSD: 5.33,
    minPriceSAR: 20.00,
    packages: [
      { id: "stc-20", name: "20 SAR Sawa Credit", priceUSD: 5.33, priceSAR: 20.00, providerCostUSD: 5.00 },
      { id: "stc-50", name: "50 SAR Sawa Credit", priceUSD: 13.33, priceSAR: 50.00, providerCostUSD: 12.50 }
    ],
    description: {
      en: "Instant mobile credit top-up for STC Sawa lines in Saudi Arabia.",
      ar: "شحن رصيد فوري لخطوط سوا اس تي سي في المملكة العربية السعودية."
    }
  }
];

export const MOCK_GIFT_CARDS = [
  {
    id: "steam-giftcard",
    title: { en: "Steam Wallet Gift Card", ar: "بطاقة شحن محفظة ستيم" },
    minPriceSAR: 37.50,
    rating: 4.95
  },
  {
    id: "apple-giftcard",
    title: { en: "Apple iTunes Gift Card", ar: "بطاقة آيتيونز آبل" },
    minPriceSAR: 50.00,
    rating: 4.9
  }
];

export const MOCK_USER_ORDERS = [
  {
    id: "CW-884210",
    correlationId: "CID-983728",
    date: "2026-08-03 10:14",
    productTitle: "PUBG Mobile 600 + 60 UC",
    playerId: "5412896301",
    priceUSD: 9.99,
    priceSAR: 37.50,
    status: "DELIVERED",
    code: "DIRECT_TOPUP_FULFILLED"
  },
  {
    id: "CW-884209",
    correlationId: "CID-441209",
    date: "2026-08-02 18:30",
    productTitle: "Steam Wallet $10 Card",
    playerId: "DIRECT_CODE",
    priceUSD: 10.00,
    priceSAR: 37.50,
    status: "DELIVERED",
    code: "STEAM-9921-8812-3301"
  }
];

export const MOCK_NOTIFICATIONS = [
  {
    id: "n-101",
    category: "orders",
    title: { en: "Order CW-884210 Delivered", ar: "تم تسليم الطلب CW-884210" },
    message: { en: "Your PUBG Mobile UC was successfully credited via FastPay Provider.", ar: "تم شحن شدات ببجي موبايل بنجاح عبر مزود FastPay." },
    timestamp: "10 minutes ago",
    read: false,
    type: "success"
  },
  {
    id: "n-102",
    category: "security",
    title: { en: "New Device Login", ar: "تسجيل دخول من جهاز جديد" },
    message: { en: "Successful login detected from Windows Chrome (IP: 185.220.101.4).", ar: "تم رصد تسجيل دخول ناجح من متصفح كروم ويندوز." },
    timestamp: "1 hour ago",
    read: true,
    type: "info"
  }
];

export const MOCK_PROVIDERS_HEALTH = [
  {
    code: 'FASTPAY',
    name: 'FastPay Digital Solutions',
    status: 'ACTIVE',
    circuitBreaker: 'CLOSED',
    availability: 99.8,
    latencyMs: 450,
    successRate: 99.2,
    score: 94.5,
    balance: 45000.00,
    queueLength: 2
  },
  {
    code: 'UNIPIN',
    name: 'UniPin Global Gaming',
    status: 'ACTIVE',
    circuitBreaker: 'CLOSED',
    availability: 95.2,
    latencyMs: 1200,
    successRate: 94.5,
    score: 81.0,
    balance: 18500.00,
    queueLength: 14
  },
  {
    code: 'GLOBAL_CODES',
    name: 'GlobalCodes Direct API',
    status: 'ACTIVE',
    circuitBreaker: 'CLOSED',
    availability: 99.99,
    latencyMs: 300,
    successRate: 99.9,
    score: 98.2,
    balance: 120000.00,
    queueLength: 0
  }
];

export const MOCK_TRACE_SCENARIO = {
  correlationId: 'CID-983728',
  orderId: 'ORD-88421',
  customer: 'Tariq Al-Harbi (usr-demo-01)',
  product: 'Netflix Premium 1 Month',
  amount: '$12.99',
  paymentStatus: 'SUCCESS (Wallet Hold Captured)',
  gatewayTx: 'WL-HOLD-TX-9982',
  providerRequest: 'SENT (FastPay Digital)',
  providerResponse: 'TIMEOUT 504 (Response time > 3000ms)',
  retriesCount: 3,
  finalStatus: 'SENT_TO_DLQ (Pending Administrative Investigation)',
  timeline: [
    { time: '11:14:01', step: 'HTTP Request Received', detail: 'POST /api/v1/orders with X-Correlation-ID: CID-983728' },
    { time: '11:14:02', step: 'Wallet Hold Executed', detail: 'DoubleEntryLedger: Held $12.99 from Available Balance ($450.00 -> $437.01)' },
    { time: '11:14:03', step: 'Smart Routing Selected Provider', detail: 'SmartRoutingEngine evaluated FastPay (Score: 94.5) as Primary Provider' },
    { time: '11:14:04', step: 'Provider API Call Initiated', detail: 'POST https://api.fastpay.com/v2/orders' },
    { time: '11:14:07', step: 'Provider API Timeout', detail: 'HTTP 504 Gateway Timeout (FastPay server unresponsive)' },
    { time: '11:14:12', step: 'Exponential Retry 1 Failed', detail: 'Attempt 2 failed with 504 Timeout' },
    { time: '11:14:22', step: 'Exponential Retry 2 Failed', detail: 'Attempt 3 failed with 504 Timeout' },
    { time: '11:14:23', step: 'Circuit Breaker Recorded Failure', detail: 'FastPay CircuitBreaker consecutive failures incremented to 3' },
    { time: '11:14:24', step: 'Order Moved to DLQ', detail: 'DLQManager captured incident ORD-88421. Status set to SENT_TO_DLQ' }
  ]
};

export const MOCK_ADMIN_METRICS = {
  totalRevenueUSD: 1485900.00,
  netProfitUSD: 185737.50,
  totalOrders: 124850,
  activeUsers: 45200,
  avgDeliveryTimeMs: 420,
  ordersPerMinute: 84
};

export const MOCK_FX_RATES = {
  USD: 1.0,
  EUR: 0.92,
  SAR: 3.75,
  AED: 3.67,
  YER: 250.0,
  EGP: 48.50
};

export const SUPPORTED_COUNTRIES = [
  // الخليج (Gulf)
  { code: 'SA', name: 'المملكة العربية السعودية', nameEn: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'AE', name: 'الإمارات العربية المتحدة', nameEn: 'UAE', flag: '🇦🇪' },
  { code: 'KW', name: 'الكويت', nameEn: 'Kuwait', flag: '🇰🇼' },
  { code: 'QA', name: 'قطر', nameEn: 'Qatar', flag: '🇶🇦' },
  { code: 'BH', name: 'البحرين', nameEn: 'Bahrain', flag: '🇧🇭' },
  { code: 'OM', name: 'سلطنة عُمان', nameEn: 'Oman', flag: '🇴🇲' },

  // الشام ومصر والرافدين (Levant, Egypt, Iraq)
  { code: 'YE', name: 'اليمن', nameEn: 'Yemen', flag: '🇾🇪' },
  { code: 'EG', name: 'مصر', nameEn: 'Egypt', flag: '🇪🇬' },
  { code: 'IQ', name: 'العراق', nameEn: 'Iraq', flag: '🇮🇶' },
  { code: 'JO', name: 'الأردن', nameEn: 'Jordan', flag: '🇯🇴' },
  { code: 'PS', name: 'فلسطين', nameEn: 'Palestine', flag: '🇵🇸' },
  { code: 'LB', name: 'لبنان', nameEn: 'Lebanon', flag: '🇱🇧' },
  { code: 'SY', name: 'سوريا', nameEn: 'Syria', flag: '🇸🇾' },

  // المغرب العربي (Maghreb)
  { code: 'MA', name: 'المغرب', nameEn: 'Morocco', flag: '🇲🇦' },
  { code: 'DZ', name: 'الجزائر', nameEn: 'Algeria', flag: '🇩🇿' },
  { code: 'TN', name: 'تونس', nameEn: 'Tunisia', flag: '🇹🇳' },
  { code: 'LY', name: 'ليبيا', nameEn: 'Libya', flag: '🇱🇾' },
  { code: 'MR', name: 'موريتانيا', nameEn: 'Mauritania', flag: '🇲🇷' },

  // دول عربية أخرى (Other Arab countries)
  { code: 'SD', name: 'السودان', nameEn: 'Sudan', flag: '🇸🇩' },
  { code: 'SO', name: 'الصومال', nameEn: 'Somalia', flag: '🇸🇴' },
  { code: 'DJ', name: 'جيبوتي', nameEn: 'Djibouti', flag: '🇩🇯' },
  { code: 'KM', name: 'جزر القمر', nameEn: 'Comoros', flag: '🇰🇲' },

  // دول عالمية مشهورة (Popular Global Countries)
  { code: 'US', name: 'الولايات المتحدة', nameEn: 'USA', flag: '🇺🇸' },
  { code: 'GB', name: 'المملكة المتحدة', nameEn: 'UK', flag: '🇬🇧' },
  { code: 'CA', name: 'كندا', nameEn: 'Canada', flag: '🇨🇦' },
  { code: 'TR', name: 'تركيا', nameEn: 'Turkey', flag: '🇹🇷' },
  { code: 'FR', name: 'فرنسا', nameEn: 'France', flag: '🇫🇷' },
  { code: 'DE', name: 'ألمانيا', nameEn: 'Germany', flag: '🇩🇪' },
  { code: 'OTHER', name: 'دولة أخرى', nameEn: 'Other Country', flag: '🌍' }
];
