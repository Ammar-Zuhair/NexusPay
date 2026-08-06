/**
 * payments.routes.js - Wallet Top-Up Payment Gateway Simulation
 * Simulates Visa/MC/ApplePay/PayPal and Yemeni mobile wallets (Kuraimi, Jeeb, OneCash, MFaloos)
 * Ready to be replaced with real API calls when credentials are available.
 */

import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// Supported payment methods config
const PAYMENT_METHODS = {
  // --- International ---
  VISA_MC: {
    id: 'VISA_MC', name: 'Visa / MasterCard',
    regions: ['ALL'],
    simulatedDelayMs: 2200,
    failRate: 0.05 // 5% simulated decline
  },
  APPLE_PAY: {
    id: 'APPLE_PAY', name: 'Apple Pay',
    regions: ['ALL'],
    simulatedDelayMs: 1500,
    failRate: 0.02
  },
  PAYPAL: {
    id: 'PAYPAL', name: 'PayPal',
    regions: ['ALL'],
    simulatedDelayMs: 2800,
    failRate: 0.04
  },
  // --- Yemen Only ---
  KURAIMI: {
    id: 'KURAIMI', name: 'كريمي (Kuraimi)',
    regions: ['YE'],
    simulatedDelayMs: 3500,
    failRate: 0.06
  },
  JEEB: {
    id: 'JEEB', name: 'جيب (Jeeb Pay)',
    regions: ['YE'],
    simulatedDelayMs: 3200,
    failRate: 0.07
  },
  ONE_CASH: {
    id: 'ONE_CASH', name: 'ون كاش (OneCash)',
    regions: ['YE'],
    simulatedDelayMs: 3000,
    failRate: 0.06
  },
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

export default router;
