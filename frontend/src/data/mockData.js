// ============================================================
//  NexusPay — Catalog Data
//  11 Categories | 40+ Products | 6 Product Types
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

// ---- Product Types ----
// TOP_UP          → شحن مباشر للحساب عبر UID
// GIFT_CARD       → بطاقة تحتوي على كود
// ACTIVATION_KEY  → مفتاح تفعيل برنامج
// SUBSCRIPTION    → اشتراك لمدة محددة
// ACCOUNT_UPGRADE → ترقية حساب مباشرة
// DIGITAL_CODE    → كود رقمي عام

export const MOCK_GAMES = [

  // ─────────────────────────────────────────────
  // 🎮  الألعاب — Game Top-Ups
  // ─────────────────────────────────────────────
  {
    id: 'pubg-mobile', categoryId: 'cat-games', productType: 'TOP_UP',
    title: { en: 'PUBG Mobile UC', ar: 'شدات ببجي موبايل' },
    publisher: 'Tencent Games',
    badge: 'INSTANT', isPopular: true, rating: 4.9, reviewsCount: 14250,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCczpk-ktW4LSFwcV8ZIeAOgkw72wT2S-tSrjtYRkV6UIWAyIEv8v7rX5NdsEUXfxzCN0zkVNylM7lda-0Ow1-htGHQGQFG43lYhXQrfYdnP-Qa0r1S7YSEaHGOKLDinGxczjjBDnELun4dLQmHGkoZQKZxDAkwxAFlrqlJXq08gfrrJdrKo3ATvi2b71MWAiKo0Vq4KxOCqoLovxKh5LCy8VV_qzGi625K0no3GGXtOUJM5d2-eBZM',
    minPriceUSD: 0.99, minPriceSAR: 3.75,
    deliveryInfo: { requiresUID: true, requiresServer: false },
    packages: [
      { id: 'pubg-60',   name: '60 UC',           priceUSD: 0.99,  priceSAR: 3.75,   providerCostUSD: 0.85 },
      { id: 'pubg-325',  name: '300 + 25 UC',     priceUSD: 4.99,  priceSAR: 18.75,  providerCostUSD: 4.40 },
      { id: 'pubg-660',  name: '600 + 60 UC',     priceUSD: 9.99,  priceSAR: 37.50,  providerCostUSD: 8.90 },
      { id: 'pubg-1800', name: '1500 + 300 UC',   priceUSD: 24.99, priceSAR: 93.75,  providerCostUSD: 22.00 },
      { id: 'pubg-3850', name: '3850 UC',          priceUSD: 49.99, priceSAR: 187.50, providerCostUSD: 44.00 },
    ],
    description: { en: 'Top up PUBG Mobile Unknown Cash (UC) instantly using your Player ID.', ar: 'اشحن شدات ببجي موبايل فوراً باستخدام معرف اللاعب الخاص بك.' }
  },
  {
    id: 'free-fire', categoryId: 'cat-games', productType: 'TOP_UP',
    title: { en: 'Free Fire Diamonds', ar: 'جواهر فري فاير' },
    publisher: 'Garena',
    badge: 'HOT DEAL', isPopular: true, rating: 4.8, reviewsCount: 9820,
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
    minPriceUSD: 1.49, minPriceSAR: 5.50,
    deliveryInfo: { requiresUID: true, requiresServer: false },
    packages: [
      { id: 'ff-100',  name: '100 + 10 Diamonds',   priceUSD: 1.49, priceSAR: 5.50,  providerCostUSD: 1.20 },
      { id: 'ff-530',  name: '530 + 53 Diamonds',   priceUSD: 4.99, priceSAR: 18.75, providerCostUSD: 4.30 },
      { id: 'ff-1080', name: '1080 + 108 Diamonds', priceUSD: 9.99, priceSAR: 37.50, providerCostUSD: 8.80 },
      { id: 'ff-2200', name: '2200 + 220 Diamonds', priceUSD: 19.99,priceSAR: 75.00, providerCostUSD: 17.50 },
    ],
    description: { en: 'Top up Free Fire Diamonds directly using your Player ID.', ar: 'اشحن جواهر فري فاير مباشرة باستخدام معرف اللاعب.' }
  },
  {
    id: 'mobile-legends', categoryId: 'cat-games', productType: 'TOP_UP',
    title: { en: 'Mobile Legends Diamonds', ar: 'ألماس موبايل ليجيندز' },
    publisher: 'Moonton',
    badge: 'POPULAR', isPopular: true, rating: 4.85, reviewsCount: 8700,
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80',
    minPriceUSD: 0.99, minPriceSAR: 3.75,
    deliveryInfo: { requiresUID: true, requiresServer: true },
    packages: [
      { id: 'mlbb-86',   name: '86 Diamonds',    priceUSD: 0.99,  priceSAR: 3.75,  providerCostUSD: 0.85 },
      { id: 'mlbb-172',  name: '172 Diamonds',   priceUSD: 1.99,  priceSAR: 7.50,  providerCostUSD: 1.70 },
      { id: 'mlbb-878',  name: '878 Diamonds',   priceUSD: 9.99,  priceSAR: 37.50, providerCostUSD: 8.80 },
      { id: 'mlbb-2195', name: '2195 Diamonds',  priceUSD: 24.99, priceSAR: 93.75, providerCostUSD: 22.00 },
    ],
    description: { en: 'Purchase Mobile Legends Bang Bang Diamonds using your User ID and Zone ID.', ar: 'اشترِ الألماس في موبايل ليجيندز باستخدام معرف المستخدم والزون.' }
  },
  {
    id: 'genshin-impact', categoryId: 'cat-games', productType: 'TOP_UP',
    title: { en: 'Genshin Impact Genesis Crystals', ar: 'كريستالات جنشن إمباكت' },
    publisher: 'HoYoverse',
    badge: 'TRENDING', isPopular: true, rating: 4.87, reviewsCount: 6200,
    image: 'https://images.unsplash.com/photo-1614294148960-9aa740632a87?auto=format&fit=crop&w=800&q=80',
    minPriceUSD: 1.99, minPriceSAR: 7.50,
    deliveryInfo: { requiresUID: true, requiresServer: true },
    packages: [
      { id: 'gi-60',   name: '60 Genesis Crystals',   priceUSD: 1.99,  priceSAR: 7.50,  providerCostUSD: 1.70 },
      { id: 'gi-330',  name: '330 Genesis Crystals',  priceUSD: 9.99,  priceSAR: 37.50, providerCostUSD: 8.80 },
      { id: 'gi-1090', name: '1090 Genesis Crystals', priceUSD: 29.99, priceSAR: 112.50, providerCostUSD: 26.00 },
    ],
    description: { en: 'Top up Genesis Crystals for Genshin Impact using your UID and Server.', ar: 'اشحن كريستالات جنشن إمباكت باستخدام UID والسيرفر.' }
  },
  {
    id: 'roblox', categoryId: 'cat-games', productType: 'TOP_UP',
    title: { en: 'Roblox Robux', ar: 'روبوكس روبلوكس' },
    publisher: 'Roblox Corporation',
    badge: 'POPULAR', isPopular: true, rating: 4.91, reviewsCount: 12800,
    image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80',
    minPriceUSD: 4.99, minPriceSAR: 18.75,
    deliveryInfo: { requiresUID: true, requiresServer: false },
    packages: [
      { id: 'robux-400',  name: '400 Robux',  priceUSD: 4.99,  priceSAR: 18.75, providerCostUSD: 4.20 },
      { id: 'robux-800',  name: '800 Robux',  priceUSD: 9.99,  priceSAR: 37.50, providerCostUSD: 8.80 },
      { id: 'robux-2000', name: '2000 Robux', priceUSD: 24.99, priceSAR: 93.75, providerCostUSD: 22.00 },
    ],
    description: { en: 'Top up Robux for your Roblox account using your username or ID.', ar: 'اشحن روبوكس فوراً لحسابك في روبلوكس باستخدام اسم المستخدم.' }
  },
  {
    id: 'honor-of-kings', categoryId: 'cat-games', productType: 'TOP_UP',
    title: { en: 'Honor of Kings Tokens', ar: 'رموز أونر أوف كينجز' },
    publisher: 'TiMi Studio Group',
    badge: 'NEW', isPopular: false, rating: 4.75, reviewsCount: 2100,
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
    minPriceUSD: 2.99, minPriceSAR: 11.25,
    deliveryInfo: { requiresUID: true, requiresServer: true },
    packages: [
      { id: 'hok-100', name: '100 Tokens', priceUSD: 2.99,  priceSAR: 11.25, providerCostUSD: 2.50 },
      { id: 'hok-600', name: '600 Tokens', priceUSD: 14.99, priceSAR: 56.25, providerCostUSD: 13.00 },
    ],
    description: { en: 'Top up Honor of Kings tokens using your Player ID.', ar: 'اشحن رموز أونر أوف كينجز باستخدام معرف اللاعب.' }
  },
  {
    id: 'clash-of-clans', categoryId: 'cat-games', productType: 'TOP_UP',
    title: { en: 'Clash of Clans Gems', ar: 'جواهر كلاش أوف كلانز' },
    publisher: 'Supercell',
    badge: 'CLASSIC', isPopular: true, rating: 4.82, reviewsCount: 5400,
    image: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=800&q=80',
    minPriceUSD: 1.99, minPriceSAR: 7.50,
    deliveryInfo: { requiresUID: true, requiresServer: false },
    packages: [
      { id: 'coc-80',   name: '80 Gems',   priceUSD: 1.99,  priceSAR: 7.50,  providerCostUSD: 1.70 },
      { id: 'coc-500',  name: '500 Gems',  priceUSD: 9.99,  priceSAR: 37.50, providerCostUSD: 8.80 },
      { id: 'coc-1200', name: '1200 Gems', priceUSD: 19.99, priceSAR: 75.00, providerCostUSD: 17.50 },
    ],
    description: { en: 'Purchase Clash of Clans Gems instantly using your Player Tag.', ar: 'اشترِ جواهر كلاش أوف كلانز فوراً باستخدام تاج اللاعب.' }
  },
  {
    id: 'fc-mobile', categoryId: 'cat-games', productType: 'TOP_UP',
    title: { en: 'EA FC Mobile Points', ar: 'نقاط FC موبايل' },
    publisher: 'EA Sports',
    badge: 'FIFA', isPopular: true, rating: 4.78, reviewsCount: 4800,
    image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80',
    minPriceUSD: 4.99, minPriceSAR: 18.75,
    deliveryInfo: { requiresUID: true, requiresServer: false },
    packages: [
      { id: 'fcm-500',  name: '500 FC Points',  priceUSD: 4.99,  priceSAR: 18.75, providerCostUSD: 4.20 },
      { id: 'fcm-1000', name: '1000 FC Points', priceUSD: 9.99,  priceSAR: 37.50, providerCostUSD: 8.80 },
      { id: 'fcm-2200', name: '2200 FC Points', priceUSD: 19.99, priceSAR: 75.00, providerCostUSD: 17.50 },
    ],
    description: { en: 'Top up EA FC Mobile Points using your Player ID.', ar: 'اشحن نقاط FC موبايل باستخدام معرف اللاعب.' }
  },

  // ─────────────────────────────────────────────
  // 💳  بطاقات الألعاب — Gaming Gift Cards
  // ─────────────────────────────────────────────
  {
    id: 'steam-giftcard', categoryId: 'cat-gaming-cards', productType: 'GIFT_CARD',
    title: { en: 'Steam Wallet Gift Card', ar: 'بطاقة شحن محفظة ستيم' },
    publisher: 'Valve Corporation',
    badge: 'GLOBAL', isPopular: true, rating: 4.95, reviewsCount: 19400,
    image: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?auto=format&fit=crop&w=800&q=80',
    minPriceUSD: 10.00, minPriceSAR: 37.50,
    deliveryInfo: { requiresUID: false, isCodeDelivery: true },
    packages: [
      { id: 'stm-5',  name: '$5 Steam Code',  priceUSD: 5.00,  priceSAR: 18.75,  providerCostUSD: 4.60 },
      { id: 'stm-10', name: '$10 Steam Code', priceUSD: 10.00, priceSAR: 37.50,  providerCostUSD: 9.20 },
      { id: 'stm-25', name: '$25 Steam Code', priceUSD: 25.00, priceSAR: 93.75,  providerCostUSD: 23.00 },
      { id: 'stm-50', name: '$50 Steam Code', priceUSD: 50.00, priceSAR: 187.50, providerCostUSD: 46.50 },
    ],
    description: { en: 'Add funds to your Steam Wallet to purchase games and in-game items.', ar: 'أضف رصيداً لمحفظة ستيم لشراء الألعاب والمنتجات داخل اللعبة.' }
  },
  {
    id: 'psn-card', categoryId: 'cat-gaming-cards', productType: 'GIFT_CARD',
    title: { en: 'PlayStation Store Gift Card', ar: 'بطاقة متجر PlayStation' },
    publisher: 'Sony Interactive',
    badge: 'PSN CREDIT', isPopular: true, rating: 4.92, reviewsCount: 11500,
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
    minPriceUSD: 10.00, minPriceSAR: 37.50,
    deliveryInfo: { requiresUID: false, isCodeDelivery: true },
    packages: [
      { id: 'psn-10', name: '$10 PSN Credit', priceUSD: 10.00, priceSAR: 37.50,  providerCostUSD: 9.30 },
      { id: 'psn-25', name: '$25 PSN Credit', priceUSD: 25.00, priceSAR: 93.75,  providerCostUSD: 23.20 },
      { id: 'psn-50', name: '$50 PSN Credit', priceUSD: 50.00, priceSAR: 187.50, providerCostUSD: 46.50 },
    ],
    description: { en: 'Buy PlayStation Store credit to purchase games, DLC, and subscriptions.', ar: 'اشترِ رصيد متجر PlayStation لشراء الألعاب والمحتوى الإضافي.' }
  },
  {
    id: 'xbox-giftcard', categoryId: 'cat-gaming-cards', productType: 'GIFT_CARD',
    title: { en: 'Xbox Gift Card', ar: 'بطاقة هدية Xbox' },
    publisher: 'Microsoft Xbox',
    badge: 'GLOBAL', isPopular: true, rating: 4.88, reviewsCount: 9200,
    image: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?auto=format&fit=crop&w=800&q=80',
    minPriceUSD: 10.00, minPriceSAR: 37.50,
    deliveryInfo: { requiresUID: false, isCodeDelivery: true },
    packages: [
      { id: 'xbox-gc-10', name: '$10 Xbox Code', priceUSD: 10.00, priceSAR: 37.50,  providerCostUSD: 9.20 },
      { id: 'xbox-gc-25', name: '$25 Xbox Code', priceUSD: 25.00, priceSAR: 93.75,  providerCostUSD: 23.00 },
      { id: 'xbox-gc-50', name: '$50 Xbox Code', priceUSD: 50.00, priceSAR: 187.50, providerCostUSD: 46.00 },
    ],
    description: { en: 'Xbox Gift Cards can be used for games, add-ons, movies, and Xbox Game Pass.', ar: 'بطاقات Xbox تُستخدم لشراء الألعاب والإضافات والأفلام وGame Pass.' }
  },
  {
    id: 'riot-card', categoryId: 'cat-gaming-cards', productType: 'GIFT_CARD',
    title: { en: 'Riot Games Gift Card', ar: 'بطاقة Riot Games' },
    publisher: 'Riot Games',
    badge: 'VALORANT', isPopular: true, rating: 4.85, reviewsCount: 7300,
    image: 'https://images.unsplash.com/photo-1614531341773-3bff8b7cb3fc?auto=format&fit=crop&w=800&q=80',
    minPriceUSD: 10.00, minPriceSAR: 37.50,
    deliveryInfo: { requiresUID: false, isCodeDelivery: true },
    packages: [
      { id: 'riot-10', name: '$10 Riot Points', priceUSD: 10.00, priceSAR: 37.50, providerCostUSD: 9.20 },
      { id: 'riot-25', name: '$25 Riot Points', priceUSD: 25.00, priceSAR: 93.75, providerCostUSD: 23.00 },
    ],
    description: { en: 'Use Riot Gift Cards to buy VP for Valorant or RP for League of Legends.', ar: 'استخدم بطاقات Riot لشراء نقاط Valorant أو League of Legends.' }
  },

  // ─────────────────────────────────────────────
  // 📺  الاشتراكات الرقمية — Subscriptions
  // ─────────────────────────────────────────────
  {
    id: 'netflix-sub', categoryId: 'cat-subs', productType: 'SUBSCRIPTION',
    title: { en: 'Netflix Premium', ar: 'اشتراك نيتفليكس بريميوم' },
    publisher: 'Netflix Inc.',
    badge: '4K ULTRA HD', isPopular: true, rating: 4.9, reviewsCount: 8400,
    image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=800&q=80',
    minPriceUSD: 12.99, minPriceSAR: 48.75,
    deliveryInfo: { requiresUID: false, isCodeDelivery: true },
    packages: [
      { id: 'net-1m', name: '1 Month Premium',  priceUSD: 12.99, priceSAR: 48.75,  providerCostUSD: 10.50 },
      { id: 'net-3m', name: '3 Months Premium', priceUSD: 34.99, priceSAR: 131.25, providerCostUSD: 29.00 },
    ],
    description: { en: 'Enjoy unlimited movies and TV shows in 4K Ultra HD on Netflix.', ar: 'استمتع بمشاهدة غير محدودة بجودة 4K على نيتفليكس.' }
  },
  {
    id: 'spotify-sub', categoryId: 'cat-subs', productType: 'SUBSCRIPTION',
    title: { en: 'Spotify Premium', ar: 'اشتراك سبوتيفاي بريميوم' },
    publisher: 'Spotify AB',
    badge: 'NO ADS', isPopular: true, rating: 4.88, reviewsCount: 7900,
    image: 'https://images.unsplash.com/photo-1611339555312-e607c8352fd7?auto=format&fit=crop&w=800&q=80',
    minPriceUSD: 9.99, minPriceSAR: 37.50,
    deliveryInfo: { requiresUID: false, isCodeDelivery: true },
    packages: [
      { id: 'spot-1m', name: '1 Month Individual', priceUSD: 9.99,  priceSAR: 37.50, providerCostUSD: 8.50 },
      { id: 'spot-3m', name: '3 Months Individual', priceUSD: 24.99, priceSAR: 93.75, providerCostUSD: 21.00 },
    ],
    description: { en: 'Listen to music ad-free, offline, and with unlimited skips.', ar: 'استمع للموسيقى بدون إعلانات وبكفاءة عالية مع إمكانية التحميل.' }
  },
  {
    id: 'xbox-gamepass', categoryId: 'cat-subs', productType: 'SUBSCRIPTION',
    title: { en: 'Xbox Game Pass Ultimate', ar: 'اشتراك Xbox Game Pass' },
    publisher: 'Microsoft Xbox',
    badge: 'EA PLAY INCLUDED', isPopular: true, rating: 4.95, reviewsCount: 11200,
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
    minPriceUSD: 14.99, minPriceSAR: 56.25,
    deliveryInfo: { requiresUID: false, isCodeDelivery: true },
    packages: [
      { id: 'xbox-1m', name: '1 Month Ultimate', priceUSD: 14.99, priceSAR: 56.25,  providerCostUSD: 12.50 },
      { id: 'xbox-3m', name: '3 Months Ultimate', priceUSD: 39.99, priceSAR: 149.96, providerCostUSD: 34.00 },
    ],
    description: { en: 'Access 100+ high-quality games on Xbox and PC, plus EA Play membership.', ar: 'وصول لأكثر من 100 لعبة على Xbox وPC بالإضافة لعضوية EA Play.' }
  },
  {
    id: 'youtube-premium', categoryId: 'cat-subs', productType: 'SUBSCRIPTION',
    title: { en: 'YouTube Premium', ar: 'اشتراك يوتيوب بريميوم' },
    publisher: 'Google LLC',
    badge: 'AD-FREE', isPopular: true, rating: 4.80, reviewsCount: 5100,
    image: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?auto=format&fit=crop&w=800&q=80',
    minPriceUSD: 13.99, minPriceSAR: 52.50,
    deliveryInfo: { requiresUID: false, isCodeDelivery: true },
    packages: [
      { id: 'yt-1m', name: '1 Month Premium', priceUSD: 13.99, priceSAR: 52.50, providerCostUSD: 11.50 },
    ],
    description: { en: 'Watch YouTube without ads, download videos, and access YouTube Music.', ar: 'شاهد يوتيوب بدون إعلانات وحمّل الفيديوهات واستمتع بـ YouTube Music.' }
  },
  {
    id: 'discord-nitro', categoryId: 'cat-subs', productType: 'SUBSCRIPTION',
    title: { en: 'Discord Nitro', ar: 'اشتراك ديسكورد نيترو' },
    publisher: 'Discord Inc.',
    badge: 'BOOST INCLUDED', isPopular: true, rating: 4.83, reviewsCount: 6200,
    image: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?auto=format&fit=crop&w=800&q=80',
    minPriceUSD: 9.99, minPriceSAR: 37.50,
    deliveryInfo: { requiresUID: false, isCodeDelivery: true },
    packages: [
      { id: 'nitro-1m',  name: '1 Month Nitro',  priceUSD: 9.99,  priceSAR: 37.50,  providerCostUSD: 8.50 },
      { id: 'nitro-12m', name: '12 Months Nitro', priceUSD: 99.99, priceSAR: 374.96, providerCostUSD: 88.00 },
    ],
    description: { en: 'Unlock Discord Nitro perks: animated avatar, custom emoji, server boosts and more.', ar: 'افتح مزايا ديسكورد نيترو: أفاتار متحرك، إيموجي مخصصة، وتعزيز السيرفر.' }
  },

  // ─────────────────────────────────────────────
  // 🤖  خدمات الذكاء الاصطناعي — AI Services
  // ─────────────────────────────────────────────
  {
    id: 'chatgpt-plus', categoryId: 'cat-ai', productType: 'SUBSCRIPTION',
    title: { en: 'ChatGPT Plus', ar: 'اشتراك ChatGPT Plus' },
    publisher: 'OpenAI',
    badge: 'GPT-4o', isPopular: true, rating: 4.95, reviewsCount: 14500,
    image: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&w=800&q=80',
    minPriceUSD: 19.99, minPriceSAR: 75.00,
    deliveryInfo: { requiresUID: false, isCodeDelivery: true },
    packages: [
      { id: 'gpt-1m', name: '1 Month ChatGPT Plus', priceUSD: 19.99, priceSAR: 75.00, providerCostUSD: 17.00 },
    ],
    description: { en: 'Access GPT-4o, image generation, voice mode, and priority availability.', ar: 'وصول لـ GPT-4o، توليد الصور، الوضع الصوتي، وأولوية التوفر.' }
  },
  {
    id: 'claude-pro', categoryId: 'cat-ai', productType: 'SUBSCRIPTION',
    title: { en: 'Claude Pro', ar: 'اشتراك Claude Pro' },
    publisher: 'Anthropic',
    badge: 'CLAUDE 3.7', isPopular: true, rating: 4.88, reviewsCount: 5200,
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80',
    minPriceUSD: 19.99, minPriceSAR: 75.00,
    deliveryInfo: { requiresUID: false, isCodeDelivery: true },
    packages: [
      { id: 'claude-1m', name: '1 Month Claude Pro', priceUSD: 19.99, priceSAR: 75.00, providerCostUSD: 17.00 },
    ],
    description: { en: 'Access Claude Sonnet and Opus models with extended context and priority.', ar: 'وصول لنماذج Claude Sonnet وOpus مع سياق موسّع وأولوية.' }
  },
  {
    id: 'midjourney', categoryId: 'cat-ai', productType: 'SUBSCRIPTION',
    title: { en: 'Midjourney Subscription', ar: 'اشتراك Midjourney' },
    publisher: 'Midjourney Inc.',
    badge: 'AI IMAGE', isPopular: true, rating: 4.90, reviewsCount: 8900,
    image: 'https://images.unsplash.com/photo-1684309569629-e19f93b93e1b?auto=format&fit=crop&w=800&q=80',
    minPriceUSD: 9.99, minPriceSAR: 37.50,
    deliveryInfo: { requiresUID: false, isCodeDelivery: true },
    packages: [
      { id: 'mj-basic', name: 'Basic Plan (1 Month)',    priceUSD: 9.99,  priceSAR: 37.50,  providerCostUSD: 8.50 },
      { id: 'mj-std',   name: 'Standard Plan (1 Month)', priceUSD: 29.99, priceSAR: 112.50, providerCostUSD: 26.00 },
    ],
    description: { en: 'Generate stunning AI images with Midjourney v6 in your Discord server.', ar: 'توليد صور ذكاء اصطناعي مذهلة مع Midjourney v6 في سيرفر ديسكورد.' }
  },

  // ─────────────────────────────────────────────
  // 🖥️  البرامج والتراخيص — Software
  // ─────────────────────────────────────────────
  {
    id: 'win11-pro', categoryId: 'cat-software', productType: 'ACTIVATION_KEY',
    title: { en: 'Windows 11 Pro License Key', ar: 'مفتاح تفعيل ويندوز 11 برو' },
    publisher: 'Microsoft',
    badge: 'LIFETIME', isPopular: true, rating: 4.85, reviewsCount: 3100,
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    minPriceUSD: 14.99, minPriceSAR: 56.25,
    deliveryInfo: { requiresUID: false, isCodeDelivery: true },
    packages: [
      { id: 'win-1pc', name: '1 PC Digital OEM Key', priceUSD: 14.99, priceSAR: 56.25, providerCostUSD: 11.00 },
    ],
    description: { en: 'Genuine Windows 11 Professional lifetime activation key for 1 PC.', ar: 'مفتاح تفعيل أصلي مدى الحياة لويندوز 11 برو لجهاز واحد.' }
  },
  {
    id: 'ms-office-2024', categoryId: 'cat-software', productType: 'ACTIVATION_KEY',
    title: { en: 'Microsoft Office 2024', ar: 'مايكروسوفت أوفيس 2024' },
    publisher: 'Microsoft',
    badge: 'LIFETIME KEY', isPopular: true, rating: 4.87, reviewsCount: 2800,
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80',
    minPriceUSD: 24.99, minPriceSAR: 93.75,
    deliveryInfo: { requiresUID: false, isCodeDelivery: true },
    packages: [
      { id: 'off-home', name: 'Home & Student 2024 (1 PC)', priceUSD: 24.99, priceSAR: 93.75,  providerCostUSD: 21.00 },
      { id: 'off-pro',  name: 'Professional 2024 (1 PC)',   priceUSD: 44.99, priceSAR: 168.75, providerCostUSD: 38.00 },
    ],
    description: { en: 'Microsoft Office 2024 includes Word, Excel, PowerPoint, and Outlook lifetime key.', ar: 'أوفيس 2024 يتضمن Word وExcel وPowerPoint وOutlook بمفتاح مدى الحياة.' }
  },
  {
    id: 'adobe-cc', categoryId: 'cat-software', productType: 'SUBSCRIPTION',
    title: { en: 'Adobe Creative Cloud', ar: 'أدوبي كريييتيف كلاود' },
    publisher: 'Adobe Inc.',
    badge: 'ALL APPS', isPopular: true, rating: 4.92, reviewsCount: 4100,
    image: 'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?auto=format&fit=crop&w=800&q=80',
    minPriceUSD: 54.99, minPriceSAR: 206.25,
    deliveryInfo: { requiresUID: false, isCodeDelivery: true },
    packages: [
      { id: 'adobe-1m', name: '1 Month All Apps', priceUSD: 54.99, priceSAR: 206.25, providerCostUSD: 48.00 },
    ],
    description: { en: 'Access all Adobe apps including Photoshop, Illustrator, Premiere, and more.', ar: 'وصول لجميع تطبيقات أدوبي بما فيها فوتوشوب وإليستريتور وبريمير.' }
  },

  // ─────────────────────────────────────────────
  // 🔑  مفاتيح التفعيل — Activation Keys
  // ─────────────────────────────────────────────
  {
    id: 'eset-key', categoryId: 'cat-keys', productType: 'ACTIVATION_KEY',
    title: { en: 'ESET NOD32 Antivirus Key', ar: 'مفتاح ESET NOD32' },
    publisher: 'ESET',
    badge: '1 YEAR', isPopular: true, rating: 4.80, reviewsCount: 1900,
    image: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?auto=format&fit=crop&w=800&q=80',
    minPriceUSD: 19.99, minPriceSAR: 75.00,
    deliveryInfo: { requiresUID: false, isCodeDelivery: true },
    packages: [
      { id: 'eset-1y-1pc', name: '1 Year / 1 PC',  priceUSD: 19.99, priceSAR: 75.00,  providerCostUSD: 17.00 },
      { id: 'eset-1y-3pc', name: '1 Year / 3 PCs', priceUSD: 34.99, priceSAR: 131.25, providerCostUSD: 30.00 },
    ],
    description: { en: 'ESET NOD32 Antivirus activation key, 1-year protection for 1 or 3 devices.', ar: 'مفتاح تفعيل ESET NOD32 للحماية لمدة سنة لجهاز أو 3 أجهزة.' }
  },
  {
    id: 'kaspersky-key', categoryId: 'cat-keys', productType: 'ACTIVATION_KEY',
    title: { en: 'Kaspersky Total Security Key', ar: 'مفتاح Kaspersky Total Security' },
    publisher: 'Kaspersky Lab',
    badge: 'TOTAL PROTECTION', isPopular: true, rating: 4.82, reviewsCount: 2400,
    image: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=800&q=80',
    minPriceUSD: 24.99, minPriceSAR: 93.75,
    deliveryInfo: { requiresUID: false, isCodeDelivery: true },
    packages: [
      { id: 'kas-1y', name: '1 Year / 1 Device', priceUSD: 24.99, priceSAR: 93.75, providerCostUSD: 21.00 },
    ],
    description: { en: 'Kaspersky Total Security key, full protection for your PC, Mac, and mobile.', ar: 'مفتاح Kaspersky Total Security للحماية الكاملة لجهاز الكمبيوتر والهاتف.' }
  },

  // ─────────────────────────────────────────────
  // 🛡️  الحماية وVPN — Security & VPN
  // ─────────────────────────────────────────────
  {
    id: 'nordvpn', categoryId: 'cat-vpn', productType: 'SUBSCRIPTION',
    title: { en: 'NordVPN Subscription', ar: 'اشتراك NordVPN' },
    publisher: 'Nord Security',
    badge: 'FASTEST VPN', isPopular: true, rating: 4.90, reviewsCount: 9800,
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    minPriceUSD: 12.99, minPriceSAR: 48.75,
    deliveryInfo: { requiresUID: false, isCodeDelivery: true },
    packages: [
      { id: 'nord-1m', name: '1 Month Standard', priceUSD: 12.99, priceSAR: 48.75,  providerCostUSD: 11.00 },
      { id: 'nord-1y', name: '1 Year Standard',  priceUSD: 59.99, priceSAR: 224.96, providerCostUSD: 52.00 },
    ],
    description: { en: 'NordVPN: ultra-fast VPN with 6000+ servers, no-log policy and military encryption.', ar: 'NordVPN: VPN فائق السرعة بـ 6000+ سيرفر وتشفير عسكري.' }
  },
  {
    id: 'expressvpn', categoryId: 'cat-vpn', productType: 'SUBSCRIPTION',
    title: { en: 'ExpressVPN Subscription', ar: 'اشتراك ExpressVPN' },
    publisher: 'Kape Technologies',
    badge: 'PREMIUM', isPopular: true, rating: 4.88, reviewsCount: 7600,
    image: 'https://images.unsplash.com/photo-1555066931-4365d14431b4?auto=format&fit=crop&w=800&q=80',
    minPriceUSD: 12.95, minPriceSAR: 48.75,
    deliveryInfo: { requiresUID: false, isCodeDelivery: true },
    packages: [
      { id: 'exp-1m', name: '1 Month Plan', priceUSD: 12.95, priceSAR: 48.75,  providerCostUSD: 11.00 },
      { id: 'exp-1y', name: '1 Year Plan',  priceUSD: 99.95, priceSAR: 374.81, providerCostUSD: 87.00 },
    ],
    description: { en: 'ExpressVPN: trusted VPN with 160 server locations and best-in-class privacy.', ar: 'ExpressVPN: VPN موثوق بـ 160 موقع سيرفر وخصوصية عالية المستوى.' }
  },

  // ─────────────────────────────────────────────
  // 🎁  بطاقات الهدايا — Gift Cards
  // ─────────────────────────────────────────────
  {
    id: 'apple-giftcard', categoryId: 'cat-gift', productType: 'GIFT_CARD',
    title: { en: 'Apple Gift Card', ar: 'بطاقة هدية آبل' },
    publisher: 'Apple Inc.',
    badge: 'INSTANT CODE', isPopular: true, rating: 4.9, reviewsCount: 16500,
    image: 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?auto=format&fit=crop&w=800&q=80',
    minPriceUSD: 10.00, minPriceSAR: 37.50,
    deliveryInfo: { requiresUID: false, isCodeDelivery: true },
    packages: [
      { id: 'app-10', name: '$10 Apple Gift Code', priceUSD: 10.00, priceSAR: 37.50,  providerCostUSD: 9.30 },
      { id: 'app-25', name: '$25 Apple Gift Code', priceUSD: 25.00, priceSAR: 93.75,  providerCostUSD: 23.20 },
      { id: 'app-50', name: '$50 Apple Gift Code', priceUSD: 50.00, priceSAR: 187.50, providerCostUSD: 46.50 },
    ],
    description: { en: 'Apple Gift Cards for App Store, iTunes, iCloud and Apple services.', ar: 'بطاقات آبل لمتجر التطبيقات وiTunes وiCloud وخدمات آبل.' }
  },
  {
    id: 'amazon-gift', categoryId: 'cat-gift', productType: 'GIFT_CARD',
    title: { en: 'Amazon Gift Card', ar: 'بطاقة هدية أمازون' },
    publisher: 'Amazon.com',
    badge: 'GLOBAL', isPopular: true, rating: 4.93, reviewsCount: 21000,
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80',
    minPriceUSD: 10.00, minPriceSAR: 37.50,
    deliveryInfo: { requiresUID: false, isCodeDelivery: true },
    packages: [
      { id: 'amz-10', name: '$10 Amazon Gift Card', priceUSD: 10.00, priceSAR: 37.50,  providerCostUSD: 9.20 },
      { id: 'amz-25', name: '$25 Amazon Gift Card', priceUSD: 25.00, priceSAR: 93.75,  providerCostUSD: 23.00 },
      { id: 'amz-50', name: '$50 Amazon Gift Card', priceUSD: 50.00, priceSAR: 187.50, providerCostUSD: 46.00 },
    ],
    description: { en: 'Buy Amazon Gift Cards for shopping millions of products worldwide.', ar: 'اشترِ بطاقات أمازون للتسوق من ملايين المنتجات حول العالم.' }
  },

  // ─────────────────────────────────────────────
  // 💰  المحافظ والعملات الرقمية — Digital Wallets
  // ─────────────────────────────────────────────
  {
    id: 'razer-gold', categoryId: 'cat-wallets', productType: 'DIGITAL_CODE',
    title: { en: 'Razer Gold', ar: 'رصيد Razer Gold' },
    publisher: 'Razer Inc.',
    badge: 'GAMING WALLET', isPopular: true, rating: 4.82, reviewsCount: 4300,
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    minPriceUSD: 5.00, minPriceSAR: 18.75,
    deliveryInfo: { requiresUID: false, isCodeDelivery: true },
    packages: [
      { id: 'rg-5',  name: '$5 Razer Gold',  priceUSD: 5.00,  priceSAR: 18.75, providerCostUSD: 4.60 },
      { id: 'rg-20', name: '$20 Razer Gold',  priceUSD: 20.00, priceSAR: 75.00, providerCostUSD: 18.40 },
    ],
    description: { en: 'Razer Gold is the unified virtual credits for gamers worldwide.', ar: 'Razer Gold هو رصيد افتراضي موحّد للاعبين حول العالم.' }
  },
  {
    id: 'paysafecard', categoryId: 'cat-wallets', productType: 'DIGITAL_CODE',
    title: { en: 'Paysafecard', ar: 'بايسيف كارد' },
    publisher: 'Paysafe Group',
    badge: 'PREPAID', isPopular: true, rating: 4.79, reviewsCount: 3100,
    image: 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&w=800&q=80',
    minPriceUSD: 10.00, minPriceSAR: 37.50,
    deliveryInfo: { requiresUID: false, isCodeDelivery: true },
    packages: [
      { id: 'psc-10', name: '€10 Paysafecard', priceUSD: 10.99, priceSAR: 41.25, providerCostUSD: 9.80 },
      { id: 'psc-25', name: '€25 Paysafecard', priceUSD: 26.99, priceSAR: 101.25, providerCostUSD: 24.00 },
    ],
    description: { en: 'Paysafecard prepaid voucher for secure online payments without a bank account.', ar: 'بطاقة Paysafecard المدفوعة مسبقاً للدفع الآمن أونلاين بدون حساب بنكي.' }
  },

  // ─────────────────────────────────────────────
  // 📱  التطبيقات والمتاجر — Apps & Stores
  // ─────────────────────────────────────────────
  {
    id: 'google-play', categoryId: 'cat-apps', productType: 'GIFT_CARD',
    title: { en: 'Google Play Store Code', ar: 'رصيد Google Play' },
    publisher: 'Google LLC',
    badge: 'INSTANT CODE', isPopular: true, rating: 4.92, reviewsCount: 15400,
    image: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=800&q=80',
    minPriceUSD: 10.00, minPriceSAR: 37.50,
    deliveryInfo: { requiresUID: false, isCodeDelivery: true },
    packages: [
      { id: 'gplay-10', name: '$10 Google Play Code', priceUSD: 10.00, priceSAR: 37.50,  providerCostUSD: 9.20 },
      { id: 'gplay-25', name: '$25 Google Play Code', priceUSD: 25.00, priceSAR: 93.75,  providerCostUSD: 23.00 },
      { id: 'gplay-50', name: '$50 Google Play Code', priceUSD: 50.00, priceSAR: 187.50, providerCostUSD: 46.00 },
    ],
    description: { en: 'Redeem Google Play codes for Android apps, games, movies, and books.', ar: 'استبدل أكواد Google Play لشراء التطبيقات والألعاب والأفلام والكتب.' }
  },

];

// ─── For backward compatibility ───
export const MOCK_GIFT_CARDS = MOCK_GAMES.filter(p =>
  p.categoryId === 'cat-gift' || p.categoryId === 'cat-gaming-cards'
);

// ─── User Orders ───
export const MOCK_USER_ORDERS = [
  {
    id: 'CW-884210', correlationId: 'CID-983728',
    date: '2026-08-03 10:14',
    productTitle: 'PUBG Mobile 600 + 60 UC', playerId: '5412896301',
    priceUSD: 9.99, priceSAR: 37.50, status: 'DELIVERED', code: 'DIRECT_TOPUP_FULFILLED'
  },
  {
    id: 'CW-884209', correlationId: 'CID-441209',
    date: '2026-08-02 18:30',
    productTitle: 'Steam Wallet $10 Card', playerId: 'DIRECT_CODE',
    priceUSD: 10.00, priceSAR: 37.50, status: 'DELIVERED', code: 'STEAM-9921-8812-3301'
  }
];

export const MOCK_NOTIFICATIONS = [
  {
    id: 'n-101', category: 'orders',
    title: { en: 'Order CW-884210 Delivered', ar: 'تم تسليم الطلب CW-884210' },
    message: { en: 'Your PUBG Mobile UC was successfully credited.', ar: 'تم شحن شدات ببجي موبايل بنجاح.' },
    timestamp: '10 minutes ago', read: false, type: 'success'
  },
  {
    id: 'n-102', category: 'security',
    title: { en: 'New Device Login', ar: 'تسجيل دخول من جهاز جديد' },
    message: { en: 'Successful login from Windows Chrome (IP: 185.220.101.4).', ar: 'تسجيل دخول ناجح من كروم ويندوز.' },
    timestamp: '1 hour ago', read: true, type: 'info'
  }
];

export const MOCK_PROVIDERS_HEALTH = [
  { code: 'FASTPAY',      name: 'FastPay Digital Solutions', status: 'ACTIVE', circuitBreaker: 'CLOSED', availability: 99.8,  latencyMs: 450,  successRate: 99.2, score: 94.5, balance: 45000.00,  queueLength: 2  },
  { code: 'UNIPIN',       name: 'UniPin Global Gaming',      status: 'ACTIVE', circuitBreaker: 'CLOSED', availability: 95.2,  latencyMs: 1200, successRate: 94.5, score: 81.0, balance: 18500.00,  queueLength: 14 },
  { code: 'GLOBAL_CODES', name: 'GlobalCodes Direct API',    status: 'ACTIVE', circuitBreaker: 'CLOSED', availability: 99.99, latencyMs: 300,  successRate: 99.9, score: 98.2, balance: 120000.00, queueLength: 0  }
];

export const MOCK_TRACE_SCENARIO = {
  correlationId: 'CID-983728', orderId: 'ORD-88421',
  customer: 'Tariq Al-Harbi (usr-demo-01)', product: 'Netflix Premium 1 Month',
  amount: '$12.99', paymentStatus: 'SUCCESS (Wallet Hold Captured)',
  gatewayTx: 'WL-HOLD-TX-9982', providerRequest: 'SENT (FastPay Digital)',
  providerResponse: 'TIMEOUT 504 (Response time > 3000ms)', retriesCount: 3,
  finalStatus: 'SENT_TO_DLQ (Pending Administrative Investigation)',
  timeline: [
    { time: '11:14:01', step: 'HTTP Request Received',     detail: 'POST /api/v1/orders with X-Correlation-ID: CID-983728' },
    { time: '11:14:02', step: 'Wallet Hold Executed',       detail: 'Held $12.99 from Available Balance' },
    { time: '11:14:03', step: 'Smart Routing Selected',     detail: 'FastPay (Score: 94.5) selected as Primary' },
    { time: '11:14:07', step: 'Provider API Timeout',       detail: 'HTTP 504 Gateway Timeout (FastPay unresponsive)' },
    { time: '11:14:24', step: 'Order Moved to DLQ',         detail: 'Status set to SENT_TO_DLQ' }
  ]
};

export const MOCK_ADMIN_METRICS = {
  totalRevenueUSD: 1485900.00, netProfitUSD: 185737.50,
  totalOrders: 124850, activeUsers: 45200,
  avgDeliveryTimeMs: 420, ordersPerMinute: 84
};

export const MOCK_FX_RATES = {
  USD: 1.0, EUR: 0.92, SAR: 3.75, AED: 3.67, YER: 250.0, EGP: 48.50
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
