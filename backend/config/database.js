import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const hasCloudDbUrl = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.length > 10);
const isProduction = process.env.NODE_ENV === 'production' || hasCloudDbUrl;

// Support both DATABASE_URL (e.g. Neon Cloud Postgres) and discrete variables for local development
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 25,
      idleTimeoutMillis: 60000,
      connectionTimeoutMillis: 30000,
      keepAlive: true,
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || 'coinwebsite_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      ssl: isProduction ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    };

export const dbPool = new Pool(poolConfig);

let isDbAvailable = false;
let dbProbePromise = null;

export const ensureDbConnection = async () => {
  if (isDbAvailable) return true;
  if (dbProbePromise) return dbProbePromise;

  dbProbePromise = dbPool.query('SELECT 1')
    .then(() => {
      isDbAvailable = true;
      console.log('[DATABASE CONFIG] Neon Cloud PostgreSQL Database Connected & Healthy ✅');
      return true;
    })
    .catch((err) => {
      isDbAvailable = false;
      dbProbePromise = null; // Reset probe so next query re-attempts connection!
      console.log('[DATABASE CONFIG] Cloud DB Probe Note:', err.message);
      return false;
    });
  return dbProbePromise;
};

// Initiate background probe immediately on import
ensureDbConnection();

dbPool.on('error', (err) => {
  isDbAvailable = false;
  console.warn('[DATABASE POOL ERROR]', err.message);
});

export const query = async (text, params) => {
  try {
    const res = await dbPool.query(text, params);
    isDbAvailable = true;
    return res;
  } catch (err) {
    isDbAvailable = false;
    dbProbePromise = null;
    console.warn('[DATABASE QUERY WARN]', err.message);
    throw err;
  }
};

export const checkDbStatus = () => isDbAvailable;
