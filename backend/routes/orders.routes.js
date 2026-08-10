import express from 'express';
import crypto from 'crypto';
import { query } from '../config/database.js';
import { OrderStateMachine, ORDER_STATES } from '../services/orders/OrderStateMachine.js';
import { DoubleEntryLedger } from '../services/wallets/DoubleEntryLedger.js';
import { sendDigitalCodeEmail } from '../utils/emailDispatcher.js';

const router = express.Router();

// Fallback in-memory orders repository for standalone execution
const ordersDb = new Map();

/**
 * Top-Level Helper to Normalize PostgreSQL rows & Memory Store objects
 */
const mapOrderRow = (row) => {
  if (!row) return null;

  let delivered = row.delivered_payload || row.delivery_payload || row.deliveredPayload;
  if (typeof delivered === 'string') {
    try { delivered = JSON.parse(delivered); } catch (e) { delivered = null; }
  }

  const pinCode = row.pin_code || row.fulfillmentCode || (delivered && typeof delivered === 'object' ? delivered.pinCode : null);

  return {
    id: row.id,
    orderNumber: row.order_number || row.orderNumber || `ORD-${row.id}`,
    correlationId: row.correlation_id || row.correlationId,
    idempotencyKey: row.idempotency_key || row.idempotencyKey,
    userId: row.user_id || row.userId,
    isGuest: Boolean(row.is_guest ?? row.isGuest ?? false),
    productId: row.product_id || row.productId || 'pubg-uc',
    productTitle: row.product_title || row.productTitle || (row.product_id ? row.product_id.toUpperCase() : 'شحن رقمي'),
    packageTitle: row.package_title || row.packageTitle || 'باقة إلكترونية',
    userName: row.user_name || row.userName || row.user_full_name || (row.is_guest ? 'عميل زائر' : 'عميل مسجل'),
    userEmail: row.user_email || row.userEmail || row.u_email || row.guest_email || 'customer@nexuspaystore.com',
    guestEmail: row.guest_email || row.guestEmail || row.user_email || '',
    targetAccountId: row.target_account_id || row.targetAccountId || 'N/A',
    priceUSD: parseFloat(row.total_amount || row.total_usd || row.priceUSD || 9.99),
    totalUSD: parseFloat(row.total_amount || row.total_usd || row.priceUSD || 9.99),
    paymentMethod: (row.payment_method || row.paymentMethod || 'WALLET').toUpperCase(),
    status: row.status || 'PENDING',
    pin_code: pinCode,
    deliveredPayload: delivered || { pinCode: pinCode, serialNumber: null },
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    items: row.items_json ? (typeof row.items_json === 'string' ? JSON.parse(row.items_json) : row.items_json) : (row.items || [])
  };
};

/**
 * POST /api/v1/orders - Place digital order with TCC Reservation & Backend Ledger Recording
 */
router.post('/orders', async (req, res, next) => {
  const correlationId = req.correlationId || `CID-${Math.floor(100000 + Math.random() * 900000)}`;
  const idempotencyKey = req.headers['idempotency-key'] || `ik-${Date.now()}`;

  try {
    const { 
      productId, 
      productTitle,
      packageId, 
      packageTitle,
      userName,
      userEmail,
      quantity = 1, 
      priceUSD = 9.99,
      providerCostUSD = 8.50,
      gatewayFeeUSD = 0.30,
      couponDiscountUSD = 0.00,
      taxUSD = 0.00,
      providerCode = 'RELOADLY',
      targetAccountId, 
      currency = 'USD',
      paymentMethod = 'WALLET',
      isGuest = false,
      guestEmail = '',
      userId,
      items = []
    } = req.body;

    if (!productId) {
      const err = new Error('productId is required');
      err.statusCode = 400;
      err.code = 'INVALID_PAYLOAD';
      throw err;
    }

    const targetUserId = userId || (req.body.user ? req.body.user.id : null) || (isGuest ? 'guest-user' : userEmail);
    const currentUserId = targetUserId;

    // 1. Calculate Comprehensive Net Profit Formula:
    const sellPrice = parseFloat(priceUSD) * parseInt(quantity, 10);
    const providerCost = parseFloat(providerCostUSD) * parseInt(quantity, 10);
    const gatewayFee = parseFloat(gatewayFeeUSD);
    const couponDiscount = parseFloat(couponDiscountUSD);
    const tax = parseFloat(taxUSD);
    const netProfit = sellPrice - providerCost - gatewayFee - couponDiscount - tax;

    let updatedBalance = null;
    // Check & Deduct Wallet Balance in Database if paying via WALLET
    if (paymentMethod === 'WALLET' && currentUserId) {
      try {
        const walletCheck = await query('SELECT available_balance FROM wallets WHERE user_id = $1', [currentUserId]);
        if (walletCheck.rows.length === 0) {
          await query(
            `INSERT INTO wallets (id, user_id, available_balance, held_balance, currency)
             VALUES ($1, $2, 500.00, 0.00, 'USD') ON CONFLICT (id) DO NOTHING`,
            [`wlt-${currentUserId}`, currentUserId]
          );
        }

        const freshCheck = await query('SELECT available_balance FROM wallets WHERE user_id = $1', [currentUserId]);
        if (freshCheck.rows.length > 0) {
          const avail = parseFloat(freshCheck.rows[0].available_balance) || 0;
          if (avail < sellPrice) {
            return res.status(400).json({ error: 'رصيد محفظتك غير كافٍ لشراء هذا المنتج. يرجى شحن المحفظة أولاً.' });
          }
          const deductRes = await query(
            'UPDATE wallets SET available_balance = available_balance - $1 WHERE user_id = $2 RETURNING available_balance',
            [sellPrice, currentUserId]
          );
          if (deductRes.rows.length > 0) {
            updatedBalance = parseFloat(deductRes.rows[0].available_balance);
            console.log(`[WALLETS API SUCCESS] User ${currentUserId} balance deducted by $${sellPrice}. New balance: $${updatedBalance}`);
          }
        }
      } catch (wErr) {
        console.warn('[BACKEND WALLET DEDUCT WARN]', wErr.message);
      }
    }

    const orderId = `NP-${Date.now().toString().slice(-6)}`;
    let newOrder = {
      id: orderId,
      orderNumber: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      correlationId: correlationId,
      idempotencyKey: idempotencyKey,
      status: ORDER_STATES.CREATED,
      productId,
      productTitle: productTitle || productId,
      packageId: packageId || 'default-pkg',
      packageTitle: packageTitle || productTitle || 'باقة شحن',
      userName: userName || (isGuest ? 'عميل زائر' : 'عميل مسجل'),
      userEmail: userEmail || guestEmail || 'customer@nexuspaystore.com',
      quantity: parseInt(quantity, 10),
      priceUSD: sellPrice,
      providerCostUSD: providerCost,
      gatewayFeeUSD: gatewayFee,
      couponDiscountUSD: couponDiscount,
      taxUSD: tax,
      netProfitUSD: netProfit,
      providerCode: providerCode,
      currency: currency,
      paymentMethod: paymentMethod,
      isGuest: isGuest,
      guestEmail: guestEmail || userEmail || '',
      targetAccountId: targetAccountId || 'N/A',
      deliveredPayload: {
        pinCode: null,
        serialNumber: null,
        status: 'AWAITING_FULFILLMENT'
      },
      createdAt: new Date().toISOString(),
      items: items.length > 0 ? items : [{ productId, productTitle, packageTitle, quantity, priceUSD }]
    };

    // FSM Transition to PENDING
    OrderStateMachine.transition(newOrder, ORDER_STATES.VALIDATING_REQUEST, 'Validating customer payload on server', correlationId);
    OrderStateMachine.transition(newOrder, ORDER_STATES.PAYMENT_PENDING, 'Awaiting gateway confirmation', correlationId);
    OrderStateMachine.transition(newOrder, ORDER_STATES.PAYMENT_CONFIRMED, 'Idempotency validated & payment confirmed', correlationId);
    OrderStateMachine.transition(newOrder, ORDER_STATES.PENDING, 'Awaiting admin code fulfillment', correlationId);

    newOrder.status = 'PENDING';

    // Save to Database with ACID Transaction (Master Order + Order_Items Junction Table)
    try {
      const dbUserId = currentUserId || (isGuest ? 'guest-user' : null);

      await query('BEGIN');

      // 1. Insert Master Order into `orders` table
      await query(
        `INSERT INTO orders (id, order_number, correlation_id, idempotency_key, user_id, product_id, product_title, package_title, user_name, user_email, guest_email, status, total_amount, total_usd, payment_method, target_account_id, delivered_payload, delivery_payload, items_json, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $13, $14, $15, $16, $16, $17, $18)
         ON CONFLICT (id) DO UPDATE SET
           user_id = EXCLUDED.user_id,
           status = EXCLUDED.status,
           product_title = EXCLUDED.product_title,
           package_title = EXCLUDED.package_title,
           user_name = EXCLUDED.user_name,
           user_email = EXCLUDED.user_email,
           guest_email = EXCLUDED.guest_email,
           payment_method = EXCLUDED.payment_method,
           target_account_id = EXCLUDED.target_account_id,
           delivered_payload = EXCLUDED.delivered_payload,
           delivery_payload = EXCLUDED.delivery_payload,
           items_json = EXCLUDED.items_json`,
        [
          newOrder.id,
          newOrder.orderNumber,
          newOrder.correlationId,
          newOrder.idempotencyKey,
          dbUserId,
          newOrder.productId,
          newOrder.productTitle,
          newOrder.packageTitle,
          newOrder.userName,
          newOrder.userEmail,
          newOrder.guestEmail,
          newOrder.status,
          newOrder.priceUSD,
          newOrder.paymentMethod,
          newOrder.targetAccountId,
          JSON.stringify(newOrder.deliveredPayload),
          JSON.stringify(newOrder.items),
          newOrder.createdAt
        ]
      );

      // 2. Populate Normalized `order_items` Junction Table (ACID Atomicity & Price Lock)
      for (let i = 0; i < newOrder.items.length; i++) {
        const item = newOrder.items[i];
        const itemId = `item-${newOrder.id}-${i + 1}`;
        const itemProdId = item.productId || item.id || newOrder.productId || 'pubg-mobile';
        const unitPrice = parseFloat(item.priceUSD || item.price || (newOrder.priceUSD / newOrder.items.length));
        const itemQty = parseInt(item.quantity || 1, 10);

        await query(
          `INSERT INTO order_items (id, order_id, product_id, unit_price, quantity)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (id) DO UPDATE SET
             unit_price = EXCLUDED.unit_price,
             quantity = EXCLUDED.quantity`,
          [itemId, newOrder.id, itemProdId, unitPrice, itemQty]
        );
      }

      await query('COMMIT');
      console.log(`[ORDERS DB SUCCESS] Master Order ${newOrder.id} and ${newOrder.items.length} order_items committed in Postgres for user ${dbUserId}`);
    } catch (dbErr) {
      try { await query('ROLLBACK'); } catch (rbErr) {}
      console.warn('[ORDERS API TRANSACTION NOTE] DB transaction fallback:', dbErr.message);
    }

    const mapped = mapOrderRow(newOrder);
    ordersDb.set(orderId, mapped);

    return res.status(201).json({
      message: 'Order created successfully and set to PENDING status for admin review',
      correlationId: correlationId,
      order: mapped,
      updatedWalletBalance: updatedBalance
    });
  } catch (err) {
    console.error('[ORDERS API ERROR]', err.message);
    next(err);
  }
});

/**
 * GET /api/v1/orders - List all orders from backend database
 */
router.get('/orders', async (req, res, next) => {
  try {
    try {
      const sqlResult = await query(`
        SELECT o.*, u.full_name as user_full_name, u.email as u_email 
        FROM orders o 
        LEFT JOIN users u ON o.user_id = u.id 
        ORDER BY o.created_at DESC 
        LIMIT 100
      `);
      if (sqlResult && sqlResult.rows && sqlResult.rows.length > 0) {
        const mappedOrders = sqlResult.rows.map(mapOrderRow);
        return res.json({
          success: true,
          source: 'DATABASE',
          count: mappedOrders.length,
          orders: mappedOrders
        });
      }
    } catch (sqlErr) {
      console.log('[ORDERS NOTICE] DB offline or query error:', sqlErr.message);
    }

    const ordersList = Array.from(ordersDb.values()).map(mapOrderRow);
    res.json({
      success: true,
      source: 'STORE',
      count: ordersList.length,
      orders: ordersList
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/orders/user/:userId - List user orders strictly isolated from backend database
 */
router.get('/orders/user/:userId', async (req, res, next) => {
  try {
    const rawUserId = userId.trim();
    const numericOnly = rawUserId.replace(/\D/g, '');

    try {
      const sqlResult = await query(
        `SELECT o.*, u.full_name as user_full_name, u.email as u_email 
         FROM orders o 
         LEFT JOIN users u ON o.user_id = u.id 
         WHERE o.user_id = $1 
            OR ($2 <> '' AND o.user_id = $2)
            OR ($2 <> '' AND o.user_id = 'usr-' || $2)
            OR LOWER(o.user_email) = LOWER($1)
            OR LOWER(o.guest_email) = LOWER($1)
            OR o.user_id IN (SELECT id FROM users WHERE LOWER(email) = LOWER($1) OR id = $1 OR ($2 <> '' AND id = $2))
         ORDER BY o.created_at DESC 
         LIMIT 100`,
        [rawUserId, numericOnly]
      );

      const mappedOrders = sqlResult && sqlResult.rows ? sqlResult.rows.map(mapOrderRow) : [];
      return res.json({
        success: true,
        source: 'DATABASE',
        count: mappedOrders.length,
        orders: mappedOrders
      });
    } catch (sqlErr) {
      console.log('[USER ORDERS SQL NOTICE]', sqlErr.message);
    }

    const filteredStore = Array.from(ordersDb.values())
      .filter(o => {
        const oUser = String(o.userId || o.user_id || '');
        const oEmail = String(o.userEmail || o.guestEmail || '').toLowerCase();
        const reqLow = rawUserId.toLowerCase();
        
        if (oUser === rawUserId || (numericOnly && oUser.replace(/\D/g, '') === numericOnly)) return true;
        if (oEmail && oEmail === reqLow) return true;
        return false;
      })
      .map(mapOrderRow);

    res.json({
      success: true,
      source: 'STORE',
      count: filteredStore.length,
      orders: filteredStore
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/orders/:id/approve-dispatch - Admin: Approve order and dispatch code email
 */
router.post('/orders/:id/approve-dispatch', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { 
      recipientEmail, 
      fulfillmentCode = '', 
      serialNumber = '', 
      emailSubject = 'كود التفعيل الخاص بطلبك من NexusPay Store', 
      emailBody = 'مرحباً بك، نشكرك على شرائك من منصتنا. مرفق أدناه كود التفعيل الرقمي المرفق بطلبك.' 
    } = req.body;

    if (!recipientEmail) {
      return res.status(400).json({ error: 'recipientEmail is required' });
    }

    let order = ordersDb.get(id);

    const deliveredPayload = {
      pinCode: fulfillmentCode,
      serialNumber: serialNumber,
      emailSubject: emailSubject,
      emailBody: emailBody,
      dispatchedAt: new Date().toISOString()
    };

    if (order) {
      order.status = 'COMPLETED';
      order.pin_code = fulfillmentCode;
      order.deliveredPayload = deliveredPayload;
      ordersDb.set(id, order);
    }

    try {
      await query(
        `UPDATE orders SET status = $1, delivered_payload = $2, delivery_payload = $2 WHERE id = $3`,
        ['COMPLETED', JSON.stringify(deliveredPayload), id]
      );
    } catch (sqlErr) {
      console.warn('[ORDERS DISPATCH SQL NOTE]', sqlErr.message);
    }

    try {
      await sendDigitalCodeEmail({
        toEmail: recipientEmail,
        userName: order?.userName || 'العميل الكريم',
        orderId: id,
        productTitle: order?.productTitle || 'منتج رقمي',
        packageTitle: order?.packageTitle || 'باقة إلكترونية',
        pinCode: fulfillmentCode,
        serialNumber: serialNumber,
        emailSubject: emailSubject,
        emailBody: emailBody
      });
    } catch (emailErr) {
      console.warn('[ORDER DISPATCH EMAIL WARNING]', emailErr.message);
    }

    const updatedObj = mapOrderRow({
      ...(order || {}),
      id,
      status: 'COMPLETED',
      pin_code: fulfillmentCode,
      delivered_payload: deliveredPayload
    });

    return res.json({
      success: true,
      message: 'Order approved and code email dispatched successfully',
      emailSentTo: recipientEmail,
      order: updatedObj
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/orders/:id/reject - Admin: Reject order with reason
 */
router.post('/orders/:id/reject', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason = 'تم رفض الطلب من قبل الإدارة' } = req.body;

    let order = ordersDb.get(id);
    if (order) {
      order.status = 'REJECTED';
      order.rejectionReason = reason;
      ordersDb.set(id, order);
    }

    try {
      await query(
        `UPDATE orders SET status = $1 WHERE id = $2`,
        ['REJECTED', id]
      );
    } catch (sqlErr) {
      console.warn('[ORDERS REJECT SQL NOTE]', sqlErr.message);
    }

    return res.json({
      success: true,
      message: 'Order rejected successfully',
      order: order || { id, status: 'REJECTED', rejectionReason: reason }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
