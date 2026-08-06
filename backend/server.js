/**
 * server.js - Express.js Node Backend Server Entry point for CoinWestie
 * Initializes CORS, Correlation ID middleware, Database connections, and Express API Routes.
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { correlationIdMiddleware } from './middleware/correlationId.js';
import { errorHandlerMiddleware } from './middleware/errorHandler.js';
import healthRoutes from './routes/health.routes.js';
import ordersRoutes from './routes/orders.routes.js';
import productsRoutes from './routes/products.routes.js';
import providersRoutes from './routes/providers.routes.js';
import authRoutes from './routes/auth.routes.js';
import paymentsRoutes from './routes/payments.routes.js';
import reloadlyRoutes from './routes/reloadly.routes.js';
import reviewsRoutes from './routes/reviews.routes.js';
import { runMigrations } from './db/migrate.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Global Middlewares
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()) 
  : '*';

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID', 'Idempotency-Key']
}));

app.use(express.json());
app.use(correlationIdMiddleware);

// API v1 Router Registration
app.use('/api/v1', healthRoutes);
app.use('/api/v1', ordersRoutes);
app.use('/api/v1', productsRoutes);
app.use('/api/v1', providersRoutes);
app.use('/api/v1', authRoutes);
app.use('/api/v1', paymentsRoutes);
app.use('/api/v1', reloadlyRoutes);
app.use('/api/v1', reviewsRoutes);

// Error Handler Middleware (Must be registered last)
app.use(errorHandlerMiddleware);

// Server Startup Function
async function startServer() {
  try {
    console.log('[EXPRESS SERVER] Initializing CoinWestie Backend...');
    
    // Run DDL migrations in non-blocking try-catch mode
    runMigrations().catch((err) => {
      console.log('[DATABASE NOTICE] Running in standalone mock mode until DB connection is available.');
    });

    app.listen(PORT, () => {
      console.log(`[EXPRESS SERVER] Server running on http://localhost:${PORT}`);
      console.log(`[EXPRESS SERVER] Health probe: http://localhost:${PORT}/api/v1/health`);
    });
  } catch (err) {
    console.error('[EXPRESS SERVER CRITICAL FAIL]', err);
  }
}

startServer();
