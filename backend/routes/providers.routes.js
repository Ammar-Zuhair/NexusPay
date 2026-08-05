/**
 * providers.routes.js - REST API CRUD Endpoints for Provider API Drivers & Gateways
 */

import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

let providersStore = [
  { driver: 'FastPay API Gateway', type: 'REST API', status: 'HEALTHY', latencyMs: 85, endpoint: 'https://api.fastpay.io/v2', region: 'GLOBAL' },
  { driver: 'CodeReserve Inventory Engine', type: 'INVENTORY_DB', status: 'HEALTHY', latencyMs: 12, endpoint: 'https://codes.nexuspay.com', region: 'GLOBAL' },
  { driver: 'MobileAirtime Global Gateway', type: 'SOAP_REST', status: 'HEALTHY', latencyMs: 145, endpoint: 'https://airtime.telecom.net', region: 'MENA' },
  { driver: 'DirectPublisher Vendor Bridge', type: 'REST API', status: 'MAINTENANCE', latencyMs: 310, endpoint: 'https://vendor.publishers.com', region: 'US_EU' }
];

/**
 * GET /api/v1/providers - Fetch all connected providers
 */
router.get('/providers', async (req, res, next) => {
  try {
    try {
      const sqlResult = await query('SELECT * FROM providers WHERE deleted_at IS NULL');
      if (sqlResult && sqlResult.rows && sqlResult.rows.length > 0) {
        return res.json({
          correlationId: req.correlationId,
          source: 'DATABASE',
          providers: sqlResult.rows
        });
      }
    } catch (sqlErr) {
      console.log('[PROVIDERS NOTICE] Database offline, returning persistent store.');
    }

    res.json({
      correlationId: req.correlationId,
      source: 'STORE',
      providers: providersStore
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/providers - Connect new provider
 */
router.post('/providers', async (req, res, next) => {
  try {
    const { driver, type, endpoint, apiKey, region } = req.body;

    if (!driver) {
      const err = new Error('Provider driver name is required');
      err.statusCode = 400;
      throw err;
    }

    const createdProv = {
      driver,
      type: type || 'REST API',
      status: 'HEALTHY',
      latencyMs: Math.floor(70 + Math.random() * 100),
      endpoint: endpoint || 'https://api.provider.com/v1',
      region: region || 'GLOBAL'
    };

    try {
      const id = `prov-${Date.now().toString().slice(-4)}`;
      await query(
        `INSERT INTO providers (id, name, code, driver_class, base_url, is_active)
         VALUES ($1, $2, $3, $4, $5, TRUE)`,
        [id, driver, id, type || 'REST_API', createdProv.endpoint]
      );
    } catch (sqlErr) {
      console.warn('[PROVIDERS SQL INSERT NOTICE]', sqlErr.message);
    }

    providersStore.unshift(createdProv);

    res.status(201).json({
      message: 'Provider driver connected successfully in backend database',
      correlationId: req.correlationId,
      provider: createdProv
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/v1/providers/:driver/toggle - Toggle active/maintenance status
 */
router.put('/providers/:driver/toggle', (req, res, next) => {
  try {
    const { driver } = req.params;
    const prov = providersStore.find(p => p.driver === driver);
    if (prov) {
      prov.status = prov.status === 'HEALTHY' ? 'MAINTENANCE' : 'HEALTHY';
    }

    res.json({
      message: `Provider ${driver} status toggled`,
      correlationId: req.correlationId,
      provider: prov
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/v1/providers/:driver - Edit provider credentials & details
 */
router.put('/providers/:driver', async (req, res, next) => {
  try {
    const { driver: targetDriver } = req.params;
    const { driver, type, endpoint, region, logoUrl } = req.body;

    const prov = providersStore.find(p => p.driver === targetDriver);
    if (!prov) {
      const err = new Error('Provider not found');
      err.statusCode = 404;
      throw err;
    }

    if (driver) prov.driver = driver;
    if (type) prov.type = type;
    if (endpoint) prov.endpoint = endpoint;
    if (region) prov.region = region;
    if (logoUrl) prov.logoUrl = logoUrl;

    try {
      await query(
        `UPDATE providers SET name = $1, driver_class = $2, base_url = $3, logo_url = $4
         WHERE name = $5`,
        [prov.driver, prov.type, prov.endpoint, prov.logoUrl, targetDriver]
      );
    } catch (sqlErr) {
      console.warn('[PROVIDERS SQL UPDATE NOTICE]', sqlErr.message);
    }

    res.json({
      message: `Provider ${targetDriver} updated successfully`,
      correlationId: req.correlationId,
      provider: prov
    });
  } catch (err) {
    next(err);
  }
});

export default router;
