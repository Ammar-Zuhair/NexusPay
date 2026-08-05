import express from 'express';

const router = express.Router();

// Mock in-memory order repository for Express demonstration
const ordersDb = new Map();

/**
 * POST /api/v1/orders - Place digital order
 */
router.post('/orders', (req, res, next) => {
  try {
    const { productId, quantity, targetAccountId, currency } = req.body;
    const idempotencyKey = req.headers['idempotency-key'];

    if (!productId) {
      const err = new Error('productId is required');
      err.statusCode = 400;
      err.code = 'INVALID_PAYLOAD';
      throw err;
    }

    const orderId = `CW-01J4X8B9-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder = {
      id: orderId,
      orderNumber: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      correlationId: req.correlationId,
      idempotencyKey: idempotencyKey || `ik-${Date.now()}`,
      status: 'DELIVERED', // Asynchronous FSM state
      productId,
      quantity: quantity || 1,
      totalAmount: 10.00,
      currency: currency || 'USD',
      targetAccountId: targetAccountId || 'PLAYER-88120',
      deliveredPayload: {
        pin: 'PUBG-UC-8841-9920-ABCD',
        instructions: 'Redeem code at midasbuy.com'
      },
      createdAt: new Date().toISOString()
    };

    ordersDb.set(orderId, newOrder);

    res.status(202).json({
      message: 'Order created and delivered successfully',
      correlationId: req.correlationId,
      order: newOrder
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/orders/:id - Fetch order status
 */
router.get('/orders/:id', (req, res, next) => {
  try {
    const order = ordersDb.get(req.params.id);
    if (!order) {
      const err = new Error('Order not found');
      err.statusCode = 404;
      err.code = 'ORDER_NOT_FOUND';
      throw err;
    }

    res.json({
      correlationId: req.correlationId,
      order
    });
  } catch (err) {
    next(err);
  }
});

export default router;
