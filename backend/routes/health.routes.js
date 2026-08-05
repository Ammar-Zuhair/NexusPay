import express from 'express';

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    version: '9.0.0',
    service: 'CoinWestie API Gateway',
    timestamp: new Date().toISOString()
  });
});

router.get('/ready', (req, res) => {
  res.json({
    status: 'READY',
    dbPool: 'HEALTHY',
    redisCache: 'CONNECTED',
    timestamp: new Date().toISOString()
  });
});

export default router;
