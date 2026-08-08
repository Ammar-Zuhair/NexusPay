import { Pool as NeonPool } from '@neondatabase/serverless';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool: PgPool } = pg;

const hasCloudDbUrl = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.length > 10);

export const dbPool = hasCloudDbUrl
  ? new NeonPool({ connectionString: process.env.DATABASE_URL })
  : new PgPool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || 'coinwebsite_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
    });

let isDbAvailable = false;
let dbProbePromise = null;

export const ensureDbConnection = async (retries = 3) => {
  if (isDbAvailable) return true;
  if (dbProbePromise) return dbProbePromise;

  dbProbePromise = (async () => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await dbPool.query('SELECT 1');
        isDbAvailable = true;
        console.log('[DATABASE CONFIG] Neon Cloud PostgreSQL Database Connected & Healthy ✅');
        return true;
      } catch (err) {
        if (attempt === retries) {
          isDbAvailable = false;
          dbProbePromise = null;
          console.log('[DATABASE CONFIG] Cloud DB Probe Note:', err.message || err);
          return false;
        }
        await new Promise(res => setTimeout(res, 1500));
      }
    }
  })();

  return dbProbePromise;
};

// Initiate background probe immediately on import
ensureDbConnection();

dbPool.on('error', (err) => {
  isDbAvailable = false;
  console.warn('[DATABASE POOL ERROR]', err.message);
});

export const query = async (text, params) => {
  let lastErr = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await dbPool.query(text, params);
      isDbAvailable = true;
      return res;
    } catch (err) {
      lastErr = err;
      if (attempt < 3 && (err.code === 'ETIMEDOUT' || err.message?.includes('timeout') || err.message?.includes('terminated'))) {
        await new Promise(res => setTimeout(res, 1000));
        continue;
      }
      isDbAvailable = false;
      dbProbePromise = null;
      console.warn('[DATABASE QUERY WARN]', err.message);
      throw err;
    }
  }
  throw lastErr;
};

export const checkDbStatus = () => isDbAvailable;
