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

export default router;
