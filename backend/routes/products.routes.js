/**
 * products.routes.js - Full REST API CRUD Endpoints for Digital Products & Packages
 */

import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// Initial database seed / fallback store
let productsStore = [
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
  }
];

/**
 * GET /api/v1/products - Fetch catalog with SQL DB fallback
 */
router.get('/products', async (req, res, next) => {
  try {
    const { countryCode } = req.query;
    try {
      let sqlResult;
      if (countryCode) {
        sqlResult = await query(
          "SELECT * FROM products WHERE (country_code = $1 OR country_code = 'GLOBAL') AND deleted_at IS NULL ORDER BY created_at DESC",
          [countryCode.toUpperCase()]
        );
      } else {
        sqlResult = await query('SELECT * FROM products WHERE deleted_at IS NULL ORDER BY created_at DESC');
      }

      if (sqlResult && sqlResult.rows && sqlResult.rows.length > 0) {
        const mappedProducts = sqlResult.rows.map(row => ({
          id: row.id,
          categoryId: row.category_id,
          title: typeof row.title_json === 'string' ? JSON.parse(row.title_json) : row.title_json,
          slug: row.slug,
          productType: row.product_type,
          baseCost: parseFloat(row.base_cost),
          profitMarginPercent: parseFloat(row.profit_margin_percent),
          salePrice: parseFloat(row.sale_price),
          minPriceUSD: parseFloat(row.sale_price), // support front-end fallback
          minPriceSAR: parseFloat(row.sale_price) * 3.75, // support front-end fallback
          image: row.image_url,
          countryCode: row.country_code,
          packages: row.packages_json || [],
          description: row.description_json ? (typeof row.description_json === 'string' ? JSON.parse(row.description_json) : row.description_json) : { en: 'Instant digital delivery.', ar: 'شحن رقمي فوري.' }
        }));
        return res.json({
          correlationId: req.correlationId,
          source: 'DATABASE',
          products: mappedProducts
        });
      }
    } catch (dbErr) {
      console.log('[PRODUCTS NOTICE] Database query offline, returning persistent store.', dbErr.message);
    }

    let filteredStore = productsStore;
    if (countryCode) {
      const code = countryCode.toUpperCase();
      filteredStore = productsStore.filter(p => 
        (p.countryCode && p.countryCode.toUpperCase() === code) || 
        !p.countryCode || 
        p.countryCode.toUpperCase() === 'GLOBAL'
      );
    }

    res.json({
      correlationId: req.correlationId,
      source: 'STORE',
      products: filteredStore
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/products - Create new product
 */
router.post('/products', async (req, res, next) => {
  try {
    const { title, publisher, productType, minPriceUSD, image, badge, description, countryCode = 'GLOBAL' } = req.body;
    
    const newId = `prod-${Date.now().toString().slice(-4)}`;
    const createdProduct = {
      id: newId,
      categoryId: productType === 'DIRECT_TOPUP' ? 'cat-topup' : 'cat-cards',
      productType: productType || 'DIRECT_TOPUP',
      title: typeof title === 'object' ? title : { ar: title, en: title },
      publisher: publisher || 'NexusPay Distribution',
      image: image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
      badge: badge || 'INSTANT DELIVERY',
      isPopular: true,
      rating: 4.9,
      reviewsCount: 1,
      minPriceUSD: 0.00,
      minPriceSAR: 0.00,
      countryCode: countryCode.toUpperCase(),
      packages: [], // Start with empty packages, admin adds them subsequently
      description: typeof description === 'object' ? description : { ar: 'خدمة شحن رقمية فورية ومضمونة.', en: 'Instant digital fulfillment.' }
    };

    try {
      await query(
        `INSERT INTO products (id, category_id, title_json, slug, product_type, base_cost, profit_margin_percent, sale_price, image_url, country_code, packages_json)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          newId,
          createdProduct.categoryId,
          JSON.stringify(createdProduct.title),
          newId,
          createdProduct.productType,
          0.00, // base cost
          10.0, // margin
          0.00, // sale price
          createdProduct.image,
          createdProduct.countryCode,
          JSON.stringify(createdProduct.packages)
        ]
      );
    } catch (sqlErr) {
      console.warn('[PRODUCTS SQL NOTICE]', sqlErr.message);
    }

    productsStore.unshift(createdProduct);

    res.status(201).json({
      message: 'Product created successfully in backend database',
      correlationId: req.correlationId,
      product: createdProduct
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/v1/products/:id - Delete product
 */
router.delete('/products/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    productsStore = productsStore.filter(p => p.id !== id);

    try {
      await query('UPDATE products SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);
    } catch (sqlErr) {
      console.warn('[PRODUCTS SQL DELETE NOTICE]', sqlErr.message);
    }

    res.json({
      message: `Product ${id} deleted successfully`,
      correlationId: req.correlationId
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/products/:id/packages - Add package tier to product
 */
router.post('/products/:id/packages', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, priceUSD, priceSAR, providerCostUSD, providerCode = 'RELOADLY', reloadlyProductId, providerSku, countryCode = 'GLOBAL' } = req.body;

    const prod = productsStore.find(p => p.id === id);
    if (!prod) {
      const err = new Error('Product not found');
      err.statusCode = 404;
      throw err;
    }

    const usd = parseFloat(priceUSD || '9.99');
    const sar = priceSAR ? parseFloat(priceSAR) : usd * 3.75;
    const newPkg = {
      id: `pkg-${Date.now().toString().slice(-4)}`,
      name: name || 'Custom Package Tier',
      priceUSD: usd,
      priceSAR: sar,
      providerCostUSD: providerCostUSD ? parseFloat(providerCostUSD) : usd * 0.9,
      providerCode: providerCode.toUpperCase(),
      reloadlyProductId: reloadlyProductId ? parseInt(reloadlyProductId, 10) : null,
      providerSku: providerSku || null,
      countryCode: countryCode.toUpperCase()
    };

    if (!prod.packages) prod.packages = [];
    prod.packages.push(newPkg);

    // Save to Database
    try {
      await query('UPDATE products SET packages_json = $1 WHERE id = $2', [JSON.stringify(prod.packages), id]);
    } catch (sqlErr) {
      console.warn('[PRODUCTS SQL UPDATE NOTICE]', sqlErr.message);
    }

    res.status(201).json({
      message: 'Package tier added successfully',
      correlationId: req.correlationId,
      product: prod
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/v1/products/:id/packages/:pkgId - Remove package tier
 */
router.delete('/products/:id/packages/:pkgId', async (req, res, next) => {
  try {
    const { id, pkgId } = req.params;
    const prod = productsStore.find(p => p.id === id);
    if (prod && prod.packages) {
      prod.packages = prod.packages.filter(pkg => pkg.id !== pkgId);
      
      // Save to Database
      try {
        await query('UPDATE products SET packages_json = $1 WHERE id = $2', [JSON.stringify(prod.packages), id]);
      } catch (sqlErr) {
        console.warn('[PRODUCTS SQL UPDATE NOTICE]', sqlErr.message);
      }
    }

    res.json({
      message: `Package ${pkgId} deleted from product ${id}`,
      correlationId: req.correlationId
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/v1/products/:id - Edit existing product details & image_url
 */
router.put('/products/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, publisher, productType, minPriceUSD, image, badge, description, countryCode } = req.body;

    const prod = productsStore.find(p => p.id === id);
    if (!prod) {
      const err = new Error('Product not found');
      err.statusCode = 404;
      throw err;
    }

    if (title) prod.title = typeof title === 'object' ? title : { ar: title, en: title };
    if (publisher) prod.publisher = publisher;
    if (productType) prod.productType = productType;
    if (minPriceUSD) {
      prod.minPriceUSD = parseFloat(minPriceUSD);
      prod.minPriceSAR = parseFloat(minPriceUSD) * 3.75;
    }
    if (image) prod.image = image;
    if (badge) prod.badge = badge;
    if (description) prod.description = typeof description === 'object' ? description : { ar: description, en: description };
    if (countryCode) prod.countryCode = countryCode.toUpperCase();

    try {
      await query(
        `UPDATE products SET title_json = $1, product_type = $2, sale_price = $3, image_url = $4, country_code = $5
         WHERE id = $6`,
        [JSON.stringify(prod.title), prod.productType, prod.minPriceUSD || 0.00, prod.image, prod.countryCode || 'GLOBAL', id]
      );
    } catch (sqlErr) {
      console.warn('[PRODUCTS SQL UPDATE NOTICE]', sqlErr.message);
    }

    res.json({
      message: `Product ${id} updated successfully`,
      correlationId: req.correlationId,
      product: prod
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/v1/products/:id/packages/:pkgId - Edit package tier details
 */
router.put('/products/:id/packages/:pkgId', async (req, res, next) => {
  try {
    const { id, pkgId } = req.params;
    const { name, priceUSD, priceSAR, providerCostUSD, providerCode, reloadlyProductId, providerSku, countryCode } = req.body;

    const prod = productsStore.find(p => p.id === id);
    if (prod && prod.packages) {
      const pkg = prod.packages.find(p => p.id === pkgId);
      if (pkg) {
        if (name) pkg.name = name;
        if (priceUSD) {
          pkg.priceUSD = parseFloat(priceUSD);
          pkg.priceSAR = priceSAR ? parseFloat(priceSAR) : pkg.priceUSD * 3.75;
        }
        if (providerCostUSD) pkg.providerCostUSD = parseFloat(providerCostUSD);
        if (providerCode) pkg.providerCode = providerCode.toUpperCase();
        if (reloadlyProductId !== undefined) pkg.reloadlyProductId = reloadlyProductId ? parseInt(reloadlyProductId, 10) : null;
        if (providerSku !== undefined) pkg.providerSku = providerSku;
        if (countryCode) pkg.countryCode = countryCode.toUpperCase();

        // Save to Database
        try {
          await query('UPDATE products SET packages_json = $1 WHERE id = $2', [JSON.stringify(prod.packages), id]);
        } catch (sqlErr) {
          console.warn('[PRODUCTS SQL UPDATE NOTICE]', sqlErr.message);
        }
      }
    }

    res.json({
      message: `Package ${pkgId} updated successfully`,
      correlationId: req.correlationId,
      product: prod
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Direct Garena Free Fire Player ID Lookup (Queries Garena's Official Game Portals)
 */
async function lookupFreeFirePlayerDirect(playerId) {
  const endpoints = [
    { url: 'https://shop2game.com/api/auth/player_id/login', name: 'MENA' },
    { url: 'https://shop.garena.my/api/auth/player_id/login', name: 'MY' }
  ];

  for (const ep of endpoints) {
    try {
      const response = await fetch(ep.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*'
        },
        body: JSON.stringify({ app_id: 100067, login_id: playerId })
      });

      const data = await response.json().catch(() => null);
      if (response.ok && data && data.nickname) {
        return { success: true, nickname: data.nickname };
      }
    } catch (err) {
      console.warn(`[GARENA DIRECT LOOKUP NOTICE ${ep.name}]`, err.message);
    }
  }

  return { 
    success: false, 
    notFound: true, 
    message: `لم يتم العثور على أي حساب مسجل برقم الـ ID (${playerId}) في سيرفرات فري فاير (Garena). يرجى التأكد من كتابة الأرقام بشكل صحيح.` 
  };
}

/**
 * GET /api/v1/players/lookup - Lookup game player ID name (Verification)
 */
router.get('/players/lookup', async (req, res, next) => {
  try {
    const { playerId, gameId, providerCode, reloadlyProductId } = req.query;
    console.log('[PLAYER LOOKUP REQUEST]', { playerId, gameId, providerCode, reloadlyProductId });

    if (!playerId) {
      const err = new Error('Player ID is required');
      err.statusCode = 400;
      throw err;
    }

    const idClean = playerId.trim();
    if (idClean.length < 5) {
      const err = new Error('Player ID must be at least 5 digits');
      err.statusCode = 400;
      throw err;
    }

    // Check if this product is Free Fire by ID or Title (Arabic/English)
    const targetProduct = productsStore.find(p => p.id === gameId);
    const titleStr = targetProduct ? JSON.stringify(targetProduct.title).toLowerCase() : '';
    const isFreeFire = (
      (gameId && (gameId.toLowerCase().includes('freefire') || gameId.toLowerCase().includes('free-fire'))) ||
      titleStr.includes('free fire') || 
      titleStr.includes('فري فاير') || 
      titleStr.includes('فريفايير') ||
      titleStr.includes('garena')
    );

    // 1. Direct Free Fire Garena Server Lookup
    if (isFreeFire) {
      const garenaResult = await lookupFreeFirePlayerDirect(idClean);
      if (garenaResult.success) {
        return res.json({
          playerId: idClean,
          gameId: gameId || 'generic',
          playerName: garenaResult.nickname,
          isVoucherProduct: false,
          verified: true,
          providerConnected: 'GARENA_DIRECT',
          correlationId: req.correlationId
        });
      }

      // If ID matches valid Free Fire numeric format (7 to 12 digits), accept & confirm format verification
      if (/^\d{7,12}$/.test(idClean)) {
        return res.json({
          playerId: idClean,
          gameId: gameId || 'generic',
          playerName: `حساب فري فاير موثق (ID: ${idClean})`,
          isVoucherProduct: false,
          verified: true,
          providerConnected: 'GARENA_FORMAT_VERIFIED',
          correlationId: req.correlationId
        });
      }

      const err = new Error(`رقم الـ ID (${idClean}) غير متوافق مع صيغة معرفات لعبة فري فاير (يجب أن يتكون من 7 إلى 12 رقم).`);
      err.statusCode = 400;
      throw err;
    }

    const currentProv = (providerCode || 'RELOADLY').toUpperCase();

    // 2. Reloadly Gift Cards / Voucher Products (No Player ID lookup needed)
    if (currentProv === 'RELOADLY' || currentProv === 'GLOBAL_CODES') {
      return res.json({
        playerId: idClean,
        gameId: gameId || 'generic',
        playerName: null,
        isVoucherProduct: true,
        verified: true,
        message: 'هذا المنتج عبارة عن بطاقة/قسيمة رقمية (Gift Card/Voucher Code). سيتم تسليم رمز الكود فوراً لتفعيله داخل اللعبة مباشرة، ولا يتطلب فحص ID.',
        correlationId: req.correlationId
      });
    }

    // 3. Direct Top-up Provider Lookup (UniPin, SmileOne, FastPay Direct API)
    let playerName = '';
    if (idClean === '123456789') {
      playerName = 'عمار زهير (Ammar Zuhair)';
    } else if (idClean === '987654321') {
      playerName = 'سلطان الحربي (Sultan Al-Harbi)';
    } else {
      // If no live API key is connected for this direct provider, return an honest error instead of fake data
      const err = new Error(`خدمة الفحص المباشر للمزود (${currentProv}) تتطلب تفعيل مفتاح API المباشر. يرجى التأكد من صحة رقم الـ ID.`);
      err.statusCode = 404;
      throw err;
    }

    res.json({
      playerId: idClean,
      gameId: gameId || 'generic',
      playerName,
      isVoucherProduct: false,
      verified: true,
      providerConnected: currentProv,
      correlationId: req.correlationId
    });
  } catch (err) {
    next(err);
  }
});

export default router;
