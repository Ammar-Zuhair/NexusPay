// ============================================================
//  NexusPay — Catalog Data
// ============================================================

export const MOCK_CATEGORIES = [
  { id: 'cat-games',        slug: 'game-topups',         icon: '🎮', title: { en: 'Games',                   ar: 'الألعاب' } },
  { id: 'cat-gaming-cards', slug: 'gaming-gift-cards',   icon: '💳', title: { en: 'Gaming Gift Cards',        ar: 'بطاقات الألعاب' } },
  { id: 'cat-subs',         slug: 'subscriptions',       icon: '📺', title: { en: 'Digital Subscriptions',    ar: 'الاشتراكات الرقمية' } },
  { id: 'cat-ai',           slug: 'ai-services',         icon: '🤖', title: { en: 'AI Services',              ar: 'خدمات الذكاء الاصطناعي' } },
  { id: 'cat-software',     slug: 'software-licenses',   icon: '🖥️', title: { en: 'Software & Licenses',     ar: 'البرامج والتراخيص' } },
  { id: 'cat-keys',         slug: 'activation-keys',     icon: '🔑', title: { en: 'Activation Keys',          ar: 'مفاتيح التفعيل' } },
  { id: 'cat-vpn',          slug: 'security-vpn',        icon: '🛡️', title: { en: 'Security & VPN',          ar: 'الحماية وVPN' } },
  { id: 'cat-gift',         slug: 'gift-cards',          icon: '🎁', title: { en: 'Gift Cards',               ar: 'بطاقات الهدايا' } },
  { id: 'cat-wallets',      slug: 'digital-wallets',     icon: '💰', title: { en: 'Digital Wallets',          ar: 'المحافظ والعملات الرقمية' } },
  { id: 'cat-apps',         slug: 'apps-stores',         icon: '📱', title: { en: 'Apps & Stores',            ar: 'التطبيقات والمتاجر' } },
  { id: 'cat-other',        slug: 'other-services',      icon: '🌐', title: { en: 'Other Services',           ar: 'خدمات أخرى' } },
];

export const MOCK_GAMES = [];

// ─── For backward compatibility ───
export const MOCK_GIFT_CARDS = [];

// ─── User Orders ───
export const MOCK_USER_ORDERS = [];

export const MOCK_NOTIFICATIONS = [
  {
    id: 'n-101', category: 'orders',
    title: { en: 'Order Delivered', ar: 'تم تسليم الطلب' },
    message: { en: 'Your digital order was successfully fulfilled.', ar: 'تم تنفيذ طلبك الرقمي بنجاح.' },
    timestamp: 'Just now', read: false, type: 'success'
  }
];

export const MOCK_PROVIDERS_HEALTH = [
  { code: 'FASTPAY',      name: 'FastPay Digital Solutions', status: 'ACTIVE', circuitBreaker: 'CLOSED', availability: 99.8,  latencyMs: 450,  successRate: 99.2, score: 94.5, balance: 45000.00,  queueLength: 2  },
  { code: 'UNIPIN',       name: 'UniPin Global Gaming',      status: 'ACTIVE', circuitBreaker: 'CLOSED', availability: 95.2,  latencyMs: 1200, successRate: 94.5, score: 81.0, balance: 18500.00,  queueLength: 14 },
  { code: 'GLOBAL_CODES', name: 'GlobalCodes Direct API',    status: 'ACTIVE', circuitBreaker: 'CLOSED', availability: 99.99, latencyMs: 300,  successRate: 99.9, score: 98.2, balance: 120000.00, queueLength: 0  }
];

export const MOCK_TRACE_SCENARIO = {
  correlationId: 'CID-983728', orderId: 'ORD-88421',
  customer: 'Customer User', product: 'Digital Product',
  amount: '$12.99', paymentStatus: 'SUCCESS (Wallet Hold Captured)',
  gatewayTx: 'WL-HOLD-TX-9982', providerRequest: 'SENT',
  providerResponse: 'HTTP 200 OK', retriesCount: 0,
  finalStatus: 'COMPLETED',
  timeline: [
    { time: '11:14:01', step: 'HTTP Request Received',     detail: 'POST /api/v1/orders' },
    { time: '11:14:02', step: 'Wallet Balance Deducted',   detail: 'Deducted amount from Available Balance' }
  ]
};

export const MOCK_ADMIN_METRICS = {
  totalRevenueUSD: 0.00, netProfitUSD: 0.00,
  totalOrders: 0, activeUsers: 1,
  avgDeliveryTimeMs: 420, ordersPerMinute: 0
};

export const MOCK_FX_RATES = {
  USD: 1.0, EUR: 0.92, SAR: 3.75, AED: 3.67, EGP: 48.50
};

export const SUPPORTED_COUNTRIES = [
  { code: 'SA', name: 'المملكة العربية السعودية', nameEn: 'Saudi Arabia',  flag: '🇸🇦' },
  { code: 'AE', name: 'الإمارات العربية المتحدة', nameEn: 'UAE',           flag: '🇦🇪' },
  { code: 'KW', name: 'الكويت',                   nameEn: 'Kuwait',        flag: '🇰🇼' },
  { code: 'QA', name: 'قطر',                       nameEn: 'Qatar',         flag: '🇶🇦' },
  { code: 'BH', name: 'البحرين',                   nameEn: 'Bahrain',       flag: '🇧🇭' },
  { code: 'OM', name: 'سلطنة عُمان',               nameEn: 'Oman',          flag: '🇴🇲' },
  { code: 'YE', name: 'اليمن',                     nameEn: 'Yemen',         flag: '🇾🇪' },
  { code: 'EG', name: 'مصر',                       nameEn: 'Egypt',         flag: '🇪🇬' },
  { code: 'IQ', name: 'العراق',                    nameEn: 'Iraq',          flag: '🇮🇶' },
  { code: 'JO', name: 'الأردن',                    nameEn: 'Jordan',        flag: '🇯🇴' },
  { code: 'PS', name: 'فلسطين',                    nameEn: 'Palestine',     flag: '🇵🇸' },
  { code: 'LB', name: 'لبنان',                     nameEn: 'Lebanon',       flag: '🇱🇧' },
  { code: 'SY', name: 'سوريا',                     nameEn: 'Syria',         flag: '🇸🇾' },
  { code: 'MA', name: 'المغرب',                    nameEn: 'Morocco',       flag: '🇲🇦' },
  { code: 'DZ', name: 'الجزائر',                   nameEn: 'Algeria',       flag: '🇩🇿' },
  { code: 'TN', name: 'تونس',                      nameEn: 'Tunisia',       flag: '🇹🇳' },
  { code: 'LY', name: 'ليبيا',                     nameEn: 'Libya',         flag: '🇱🇾' },
  { code: 'SD', name: 'السودان',                   nameEn: 'Sudan',         flag: '🇸🇩' },
  { code: 'US', name: 'الولايات المتحدة',          nameEn: 'USA',           flag: '🇺🇸' },
  { code: 'GB', name: 'المملكة المتحدة',           nameEn: 'UK',            flag: '🇬🇧' },
  { code: 'CA', name: 'كندا',                      nameEn: 'Canada',        flag: '🇨🇦' },
  { code: 'TR', name: 'تركيا',                     nameEn: 'Turkey',        flag: '🇹🇷' },
  { code: 'FR', name: 'فرنسا',                     nameEn: 'France',        flag: '🇫🇷' },
  { code: 'DE', name: 'ألمانيا',                   nameEn: 'Germany',       flag: '🇩🇪' },
  { code: 'OTHER', name: 'دولة أخرى',             nameEn: 'Other Country', flag: '🌍' },
];
