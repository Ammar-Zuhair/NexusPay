/**
 * reloadly.routes.js - API Router for Reloadly Gift Cards and Digital Subscription Codes
 */

import express from 'express';
import { getProducts, getProductById } from '../services/reloadly.service.js';

const router = express.Router();

/**
 * GET /api/v1/reloadly/products
 * Fetches available gift cards, vouchers, and subscriptions catalog from Reloadly
 * Optional query parameters: countryCode, productName, page, size
 */
router.get('/reloadly/products', async (req, res, next) => {
  try {
    const { countryCode, productName, page, size } = req.query;
    const catalog = await getProducts({ countryCode, productName, page, size });
    res.json({ success: true, catalog });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/reloadly/products/:id
 * Fetches specific product details by ID
 */
router.get('/reloadly/products/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await getProductById(id);
    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
});

export default router;
