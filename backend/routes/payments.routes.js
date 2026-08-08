/**
 * payments.routes.js - Wallet Top-Up & Local Deposit Verification System
 * 
 * 🟢 CURRENT ACTIVE FLOW: Yemen Local Transfers & Banking (Kuraimi, Jeeb, OneCash, Jawali)
 * 🟡 RESERVED FOR FUTURE LAUNCH: International Payment Gateways (Visa / MasterCard / PayPal)
 */

import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// Supported payment methods config
const PAYMENT_METHODS = {
  /*
  // --- International (Temporarily commented out & reserved for future global launch) ---
  VISA_MC: { id: 'VISA_MC', name: 'Visa / MasterCard', regions: ['ALL'], simulatedDelayMs: 2200, failRate: 0.05 },
  APPLE_PAY: { id: 'APPLE_PAY', name: 'Apple Pay', regions: ['ALL'], simulatedDelayMs: 1500, failRate: 0.02 },
  PAYPAL: { id: 'PAYPAL', name: 'PayPal', regions: ['ALL'], simulatedDelayMs: 2800, failRate: 0.04 },
  */
  // --- Yemen Local Focus ---
  KURAIMI: { id: 'KURAIMI', name: 'كريمي (Kuraimi)', regions: ['YE'], simulatedDelayMs: 2000, failRate: 0 },
  JEEB: { id: 'JEEB', name: 'جيب (Jeeb Pay)', regions: ['YE'], simulatedDelayMs: 2000, failRate: 0 },
  ONE_CASH: { id: 'ONE_CASH', name: 'ون كاش (OneCash)', regions: ['YE'], simulatedDelayMs: 2000, failRate: 0 },
  MFALOOS: {
    id: 'MFALOOS', name: 'مفلوس (M-Faloos)',
    regions: ['YE'],
    simulatedDelayMs: 2500,
    failRate: 0.05
  }
};

/**
 * GET /api/v1/payments/methods?country=YE
 * Returns available payment methods for a given country
 */
router.get('/payments/methods', (req, res) => {
  const countryCode = (req.query.country || 'SA').toUpperCase();
  const available = Object.values(PAYMENT_METHODS).filter(method => 
    method.regions.includes('ALL') || method.regions.includes(countryCode)
  );
  res.json({ countryCode, methods: available.map(m => ({ id: m.id, name: m.name })) });
});

/**
 * GET /api/v1/wallet/:userId
 * Returns the real-time wallet balance from the database for a given user.
 * Called on page load and after every top-up to keep the frontend in sync.
 */
router.get('/wallet/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const result = await query('SELECT available_balance, held_balance, currency FROM wallets WHERE user_id = $1', [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Wallet not found for this user' });
    }
    const w = result.rows[0];
    res.json({
      availableBalance: parseFloat(w.available_balance) || 0,
      heldBalance:      parseFloat(w.held_balance)      || 0,
      currency:         w.currency || 'USD'
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/payments/topup
 * Simulates a top-up operation with a given payment method
 * Body: { userId, amountUSD, paymentMethod, paymentData }
 */
router.post('/payments/topup', async (req, res, next) => {
  try {
    const { userId, amountUSD, paymentMethod, paymentData = {} } = req.body;

    if (!userId || !amountUSD || !paymentMethod) {
      return res.status(400).json({ error: 'userId, amountUSD, and paymentMethod are required' });
    }

    const amount = parseFloat(amountUSD);
    if (isNaN(amount) || amount <= 0 || amount > 10000) {
      return res.status(400).json({ error: 'Invalid amount. Must be between $1 and $10,000.' });
    }

    const methodConfig = PAYMENT_METHODS[paymentMethod];
    if (!methodConfig) {
      return res.status(400).json({ error: `Unsupported payment method: ${paymentMethod}` });
    }

    // Generate transaction ID
    const txId = `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    
    // Record initial PENDING transaction in DB
    let userCountry = 'SA';
    try {
      await query(
        `INSERT INTO wallet_topup_transactions (id, user_id, amount_usd, payment_method, payment_reference, status, country_code)
         VALUES ($1, $2, $3, $4, $5, 'PROCESSING', $6)`,
        [txId, userId, amount, paymentMethod, paymentData.reference || txId, userCountry]
      );
    } catch (dbErr) {
      console.warn('[TOPUP DB] Could not record transaction, continuing simulation.', dbErr.message);
    }

    // Simulate gateway processing delay
    await new Promise(resolve => setTimeout(resolve, methodConfig.simulatedDelayMs));

    // Simulate occasional decline
    const isDeclined = Math.random() < methodConfig.failRate;
    if (isDeclined) {
      try {
        await query(
          `UPDATE wallet_topup_transactions SET status = 'FAILED', gateway_response = $1 WHERE id = $2`,
          [JSON.stringify({ reason: 'SIMULATED_DECLINE', code: 'GATEWAY_DECLINED' }), txId]
        );
      } catch { /* ignore */ }
      return res.status(402).json({ 
        error: 'Payment declined by gateway. Please check your payment details and try again.',
        txId,
        status: 'FAILED'
      });
    }

    // SUCCESS — update wallet balance in DB
    try {
      await query(
        `UPDATE wallets SET available_balance = available_balance + $1 WHERE user_id = $2`,
        [amount, userId]
      );
      await query(
        `UPDATE wallet_topup_transactions SET status = 'COMPLETED', completed_at = NOW(), 
         gateway_response = $1 WHERE id = $2`,
        [JSON.stringify({ code: 'SIMULATED_SUCCESS', method: paymentMethod, maskedRef: paymentData.masked || '****' }), txId]
      );
    } catch (dbErr) {
      console.warn('[TOPUP DB] Wallet update failed:', dbErr.message);
    }

    res.json({
      success: true,
      txId,
      status: 'COMPLETED',
      amountUSD: amount,
      paymentMethod,
      newBalance: null, // Frontend fetches actual balance
      message: `Payment of $${amount.toFixed(2)} processed successfully via ${methodConfig.name}`
    });

  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/payments/paypal/config
 * Returns client_id for PayPal SDK initialization
 */
router.get('/payments/paypal/config', (req, res) => {
  res.json({
    clientId: process.env.PAYPAL_CLIENT_ID || 'sb',
    mode: process.env.PAYPAL_MODE || 'sandbox'
  });
});

/**
 * POST /api/v1/payments/paypal/create-order
 * Creates a PayPal Order via official PayPal REST API v2
 */
router.post('/payments/paypal/create-order', async (req, res, next) => {
  try {
    const { amountUSD, currency = 'USD', items = [] } = req.body;
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const mode = process.env.PAYPAL_MODE || 'sandbox';

    const baseUrl = mode === 'live' 
      ? 'https://api-m.paypal.com' 
      : 'https://api-m.sandbox.paypal.com';

    const amount = parseFloat(amountUSD || 9.99).toFixed(2);

    // Format item details for PayPal checkout window display
    const paypalItems = Array.isArray(items) && items.length > 0
      ? items.map(i => ({
          name: String(i.title || i.productTitle || 'Digital Product').substring(0, 127),
          unit_amount: {
            currency_code: currency,
            value: parseFloat(i.priceUSD || 9.99).toFixed(2)
          },
          quantity: String(i.quantity || 1),
          category: 'DIGITAL_GOODS'
        }))
      : [{
          name: 'NexusPay Digital Order',
          unit_amount: { currency_code: currency, value: amount },
          quantity: '1',
          category: 'DIGITAL_GOODS'
        }];

    const itemsSum = paypalItems.reduce((acc, i) => acc + (parseFloat(i.unit_amount.value) * parseInt(i.quantity, 10)), 0).toFixed(2);

    if (clientId && clientSecret) {
      const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
      });
      const tokenData = await tokenRes.json();
      if (!tokenRes.ok) {
        throw new Error(tokenData.error_description || 'Failed to authenticate with PayPal');
      }

      const orderRes = await fetch(`${baseUrl}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [{
            amount: {
              currency_code: currency,
              value: amount
            },
            description: 'NexusPay Digital Games & Subscriptions Order'
          }]
        })
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.message || 'Failed to create PayPal order');
      }

      const approvalUrl = orderData.links?.find(l => l.rel === 'approve')?.href;
      return res.json({
        id: orderData.id,
        status: orderData.status,
        approvalUrl,
        mode: 'LIVE_PAYPAL'
      });
    }

    // Sandbox Fallback
    const simulatedOrderId = `PAYPAL-ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    res.json({
      id: simulatedOrderId,
      status: 'CREATED',
      approvalUrl: `https://www.sandbox.paypal.com/checkoutnow?token=${simulatedOrderId}`,
      mode: 'SANDBOX_SIMULATED',
      amountUSD: amount
    });

  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/payments/paypal/capture-order
 * Captures payment for an approved PayPal Order
 */
router.post('/payments/paypal/capture-order', async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const mode = process.env.PAYPAL_MODE || 'sandbox';

    const baseUrl = mode === 'live' 
      ? 'https://api-m.paypal.com' 
      : 'https://api-m.sandbox.paypal.com';

    if (!orderId) {
      return res.status(400).json({ error: 'PayPal orderId is required' });
    }

    if (clientId && clientSecret) {
      const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
      });
      const tokenData = await tokenRes.json();

      const captureRes = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      const captureData = await captureRes.json();
      if (!captureRes.ok) {
        throw new Error(captureData.message || 'Failed to capture PayPal payment');
      }

      return res.json({
        success: true,
        orderId,
        status: captureData.status,
        captureId: captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id || orderId,
        payer: captureData.payer,
        message: 'PayPal payment captured successfully'
      });
    }

    res.json({
      success: true,
      orderId,
      status: 'COMPLETED',
      captureId: `CAP-${Date.now()}`,
      payer: { email_address: 'sandbox.payer@example.com', name: { given_name: 'PayPal User' } },
      message: 'PayPal payment captured successfully'
    });

  } catch (err) {
    next(err);
  }
});

// ============================================================
// 🇾🇪 YEMEN REGIONAL BANKS & MANUAL DEPOSIT VERIFICATION SYSTEM
// ============================================================

let YEMEN_BANKS = [
  { 
    id: 'yb-101', 
    name: 'حساب الكريمي المميز (صنعاء والشمال)', 
    region: 'NORTH', 
    appName: 'تطبيق حاسب / الكريمي', 
    recipientName: 'عمار Zuhair', 
    accountNumber: '301294819', 
    whatsappPhone: '+967775479340', 
    imageUrl: 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&w=200&q=80',
    notes: 'تحويل مباشر برقم الحساب مع إرفاق الإشعار' 
  },
  { 
    id: 'yb-102', 
    name: 'محفظة جيب الإلكترونية (Jeeb Pay)', 
    region: 'NORTH', 
    appName: 'تطبيق جيب Jeeb', 
    recipientName: 'عمار Zuhair', 
    accountNumber: '775479340', 
    whatsappPhone: '+967775479340', 
    imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=200&q=80',
    notes: 'تحويل مباشر بالهاتف في تطبيق جيب' 
  },
  { 
    id: 'yb-103', 
    name: 'محفظة ون كاش (OneCash)', 
    region: 'NORTH', 
    appName: 'ون كاش', 
    recipientName: 'عمار Zuhair', 
    accountNumber: '775479340', 
    whatsappPhone: '+967775479340', 
    imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=200&q=80',
    notes: 'شحن حساب المحفظة المباشر' 
  },
  { 
    id: 'yb-104', 
    name: 'محفظة جوالي (Jawali)', 
    region: 'NORTH', 
    appName: 'تطبيق جوالي', 
    recipientName: 'عمار Zuhair', 
    accountNumber: '775479340', 
    whatsappPhone: '+967775479340', 
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0a67daf40953?auto=format&fit=crop&w=200&q=80',
    notes: 'حوالة جوالي سريعة' 
  },
  { 
    id: 'yb-201', 
    name: 'حساب بنك الكريمي (عدن والجنوب)', 
    region: 'SOUTH', 
    appName: 'بنك الكريمي المميز', 
    recipientName: 'عمار Zuhair', 
    accountNumber: '305591024', 
    whatsappPhone: '+967775479340', 
    imageUrl: 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&w=200&q=80',
    notes: 'تحويل حساب حاسب الكريمي - الفرع الرئيسي عدن' 
  },
  { 
    id: 'yb-202', 
    name: 'البنك الأهلي اليمني (عدن)', 
    region: 'SOUTH', 
    appName: 'البنك الأهلي', 
    recipientName: 'عمار Zuhair', 
    accountNumber: '109284019', 
    whatsappPhone: '+967775479340', 
    imageUrl: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?auto=format&fit=crop&w=200&q=80',
    notes: 'إيداع بنكي مباشر' 
  }
];

let DEPOSIT_REQUESTS = [];

/**
 * GET /api/v1/payments/yemen-banks
 * Returns Yemen banks & mobile wallets filtered optional by region (NORTH / SOUTH / BOTH)
 */
router.get('/payments/yemen-banks', (req, res) => {
  const { region } = req.query;
  if (region) {
    const filtered = YEMEN_BANKS.filter(b => b.region === region || b.region === 'BOTH');
    return res.json({ success: true, banks: filtered });
  }
  res.json({ success: true, banks: YEMEN_BANKS });
});

/**
 * POST /api/v1/payments/yemen-banks
 * Admin: Add new Bank / Wallet account
 */
router.post('/payments/yemen-banks', (req, res) => {
  const { name, region = 'NORTH', appName, recipientName, accountNumber, whatsappPhone = '+967775479340', imageUrl = '', notes = '' } = req.body;
  if (!name || !accountNumber || !recipientName) {
    return res.status(400).json({ error: 'name, accountNumber, and recipientName are required' });
  }
  const newBank = {
    id: `yb-${Date.now()}`,
    name,
    region,
    appName: appName || name,
    recipientName,
    accountNumber,
    whatsappPhone,
    imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&w=200&q=80',
    notes
  };
  YEMEN_BANKS.push(newBank);
  res.json({ success: true, bank: newBank });
});

/**
 * PUT /api/v1/payments/yemen-banks/:id
 * Admin: Update Bank / Wallet account
 */
router.put('/payments/yemen-banks/:id', (req, res) => {
  const { id } = req.params;
  const index = YEMEN_BANKS.findIndex(b => b.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Bank account not found' });
  }
  YEMEN_BANKS[index] = { ...YEMEN_BANKS[index], ...req.body };
  res.json({ success: true, bank: YEMEN_BANKS[index] });
});

/**
 * DELETE /api/v1/payments/yemen-banks/:id
 * Admin: Delete Bank / Wallet account
 */
router.delete('/payments/yemen-banks/:id', (req, res) => {
  const { id } = req.params;
  YEMEN_BANKS = YEMEN_BANKS.filter(b => b.id !== id);
  res.json({ success: true, message: 'Bank account deleted' });
});

/**
 * POST /api/v1/payments/deposit-request
 * User: Submit manual deposit request (Pending Verification)
 */
router.post('/payments/deposit-request', async (req, res) => {
  try {
    const { userId, userName, userEmail, userPhone, amountUSD, region, bankId, bankName, accountNumber, recipientName, referenceNumber, userNotes } = req.body;

    if (!userId || !amountUSD || !bankId || !referenceNumber) {
      return res.status(400).json({ error: 'userId, amountUSD, bankId, and referenceNumber are required' });
    }

    const depositReq = {
      id: `DP-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      userId,
      userName: userName || 'عميل المحفظة',
      userEmail: userEmail || '',
      userPhone: userPhone || '',
      amountUSD: parseFloat(amountUSD),
      region: region || 'NORTH',
      bankId,
      bankName: bankName || 'بنك يمني',
      accountNumber: accountNumber || '',
      recipientName: recipientName || '',
      referenceNumber,
      userNotes: userNotes || '',
      status: 'PENDING_VERIFICATION',
      createdAt: new Date().toISOString()
    };

    DEPOSIT_REQUESTS.unshift(depositReq);

    // Record in DB if pool is ready
    try {
      await query(
        `INSERT INTO wallet_topup_transactions (id, user_id, amount_usd, payment_method, payment_reference, status, country_code)
         VALUES ($1, $2, $3, $4, $5, 'PENDING', 'YE')`,
        [depositReq.id, userId, depositReq.amountUSD, bankName, referenceNumber]
      );
    } catch { /* ignore */ }

    res.json({
      success: true,
      depositRequest: depositReq,
      message: 'تم استقبال طلب الإيداع بنجاح وهو قيد التحقق والتأكيد من الإدارة.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/v1/payments/deposit-requests
 * Admin: Get all deposit requests
 */
router.get('/payments/deposit-requests', (req, res) => {
  res.json({ success: true, requests: DEPOSIT_REQUESTS });
});

/**
 * PUT /api/v1/payments/deposit-requests/:id/approve
 * Admin: Approve deposit request & credit user wallet
 */
router.put('/payments/deposit-requests/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const reqItem = DEPOSIT_REQUESTS.find(r => r.id === id);
    if (!reqItem) {
      return res.status(404).json({ error: 'Deposit request not found' });
    }

    if (reqItem.status === 'COMPLETED') {
      return res.status(400).json({ error: 'Deposit request is already completed' });
    }

    reqItem.status = 'COMPLETED';
    reqItem.approvedAt = new Date().toISOString();

    // Credit User Wallet in DB
    try {
      await query(
        `UPDATE wallets SET available_balance = available_balance + $1 WHERE user_id = $2`,
        [reqItem.amountUSD, reqItem.userId]
      );
      await query(
        `UPDATE wallet_topup_transactions SET status = 'COMPLETED', completed_at = NOW() WHERE id = $1`,
        [id]
      );
    } catch { /* ignore */ }

    res.json({
      success: true,
      depositRequest: reqItem,
      message: `تم تأكيد إيداع $${reqItem.amountUSD} وشحن محفظة المستخدم بنجاح!`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/v1/payments/deposit-requests/:id/reject
 * Admin: Reject deposit request
 */
router.put('/payments/deposit-requests/:id/reject', (req, res) => {
  const { id } = req.params;
  const { reason = 'لم يتم العثور على الإيداع بالأرقام المذكورة' } = req.body;
  const reqItem = DEPOSIT_REQUESTS.find(r => r.id === id);
  if (!reqItem) {
    return res.status(404).json({ error: 'Deposit request not found' });
  }

  reqItem.status = 'REJECTED';
  reqItem.rejectionReason = reason;
  reqItem.rejectedAt = new Date().toISOString();

  res.json({
    success: true,
    depositRequest: reqItem,
    message: 'تم رفض طلب الإيداع وتحديث الحالة'
  });
});

export default router;

