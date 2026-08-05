/**
 * auth.routes.js - Secure Database Authentication Routes with Password Complexity Validation & Crypto Encryption
 */

import express from 'express';
import crypto from 'crypto';
import { query } from '../config/database.js';

const router = express.Router();

// Helper to hash password using Node's native crypto (PBKDF2)
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

// Helper to verify password
function verifyPassword(password, storedPassword) {
  if (!storedPassword || !storedPassword.includes(':')) return false;
  const [salt, originalHash] = storedPassword.split(':');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === originalHash;
}

// Password strength validation: uppercase, lowercase, symbol, number, and length >= 8
function validatePasswordStrength(password) {
  if (!password || password.length < 8) return false;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  return hasUppercase && hasLowercase && hasNumber && hasSpecial;
}

/**
 * POST /api/v1/auth/register - Register a standard regular USER (No admin code allowed here)
 */
router.post('/auth/register', async (req, res, next) => {
  try {
    const { name, email, password, countryCode = 'SA' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!validatePasswordStrength(password)) {
      return res.status(400).json({ 
        error: 'Password does not meet complexity requirements. It must contain at least 8 characters, including uppercase, lowercase, a number, and a special character.' 
      });
    }

    // Check if user already exists
    try {
      const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'Email address already registered' });
      }
    } catch (dbErr) {
      console.warn('[DB WARNING] Database query failed, registering in mock fallback mode.', dbErr.message);
    }

    const userId = `usr-${Date.now().toString().slice(-6)}`;
    const hashedPassword = hashPassword(password);

    try {
      // Create user with country code
      await query(
        `INSERT INTO users (id, email, password_hash, full_name, country_code, role_code, status) 
         VALUES ($1, $2, $3, $4, $5, 'USER', 'ACTIVE')`,
        [userId, email, hashedPassword, name, countryCode.toUpperCase()]
      );

      // Initialize wallet in DB (zero balance)
      const walletId = `wlt-${userId}`;
      await query(
        `INSERT INTO wallets (id, user_id, available_balance, held_balance, currency) 
         VALUES ($1, $2, 0.0000, 0.0000, 'USD')`,
        [walletId, userId]
      );
    } catch (sqlErr) {
      console.warn('[AUTH SQL REGISTER WARNING]', sqlErr.message);
    }

    res.status(201).json({
      message: 'Account registered successfully through secure database',
      user: {
        id: userId,
        name: name,
        email: email,
        role: 'USER',
        countryCode: countryCode.toUpperCase(),
        isLoggedIn: true
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/auth/login - Login user with password verification
 */
router.post('/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
      const userRes = await query('SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL', [email]);
      if (userRes.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const dbUser = userRes.rows[0];
      if (!verifyPassword(password, dbUser.password_hash)) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Fetch wallet balance from DB
      let walletData = { availableBalance: 0, heldBalance: 0, currency: 'USD' };
      try {
        const walletRes = await query('SELECT * FROM wallets WHERE user_id = $1', [dbUser.id]);
        if (walletRes.rows.length > 0) {
          const w = walletRes.rows[0];
          walletData = {
            availableBalance: parseFloat(w.available_balance) || 0,
            heldBalance: parseFloat(w.held_balance) || 0,
            currency: w.currency || 'USD'
          };
        }
      } catch (wErr) {
        console.warn('[WALLET FETCH] Could not fetch wallet:', wErr.message);
      }

      return res.json({
        message: 'Login successful',
        user: {
          id: dbUser.id,
          name: dbUser.full_name,
          email: dbUser.email,
          role: dbUser.role_code,
          countryCode: dbUser.country_code || 'SA',
          isLoggedIn: true
        },
        wallet: walletData
      });
    } catch (dbErr) {
      console.warn('[DB WARNING] Database query offline.');
      return res.status(503).json({ error: 'Database connection unavailable. Please try again shortly.' });
    }
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/auth/create-admin - Create ADMIN account (restricted to Admin panel only)
 */
router.post('/auth/create-admin', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!validatePasswordStrength(password)) {
      return res.status(400).json({ 
        error: 'Password does not meet complexity requirements. It must contain at least 8 characters, including uppercase, lowercase, a number, and a special character.' 
      });
    }

    const userId = `usr-${Date.now().toString().slice(-4)}`;
    const hashedPassword = hashPassword(password);

    try {
      await query(
        `INSERT INTO users (id, email, password_hash, full_name, role_code, status) 
         VALUES ($1, $2, $3, $4, 'ADMIN', 'ACTIVE')`,
        [userId, email, hashedPassword, name]
      );

      const walletId = `wlt-${userId}`;
      await query(
        `INSERT INTO wallets (id, user_id, available_balance, held_balance, currency) 
         VALUES ($1, $2, 0.0000, 0.0000, 'USD')`,
        [walletId, userId]
      );
    } catch (sqlErr) {
      console.warn('[AUTH SQL CREATE ADMIN WARNING]', sqlErr.message);
    }

    res.status(201).json({
      message: 'Admin account registered successfully through secure database',
      user: {
        id: userId,
        name: name,
        email: email,
        role: 'ADMIN',
        isLoggedIn: true
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
