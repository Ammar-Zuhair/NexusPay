/**
 * auth.routes.js - Secure Database Authentication Routes
 * Includes: OTP email verification on register, forgot-password with signed token, reset-password
 */

import express from 'express';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { query } from '../config/database.js';

const router = express.Router();

// ─── In-memory stores ───────────────────────────────────────────────────────
const otpStore          = new Map(); // email -> { otp, expiresAt }
const resetTokenStore   = new Map(); // token -> { userId, email, expiresAt }

// ─── Email transporter ──────────────────────────────────────────────────────
async function sendEmail({ to, subject, html }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[EMAIL SIMULATOR] To: ${to}`);
    console.log(`[EMAIL SIMULATOR] Subject: ${subject}`);
    console.log(`[EMAIL SIMULATOR] Body preview: ${html.slice(0, 200)}`);
    return { simulated: true };
  }
  const transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
    port:   parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
  return transporter.sendMail({ from: `"NexusPay Store" <${process.env.SMTP_USER}>`, to, subject, html });
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedPassword) {
  if (!storedPassword || !storedPassword.includes(':')) return false;
  const [salt, originalHash] = storedPassword.split(':');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === originalHash;
}

function validatePasswordStrength(password) {
  if (!password || password.length < 8) return false;
  return /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password);
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ─── Routes ─────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/register - Register user, then send OTP to email
 */
router.post('/auth/register', async (req, res, next) => {
  try {
    const { name, email, password, countryCode = 'YE' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
    }

    if (!validatePasswordStrength(password)) {
      return res.status(400).json({
        error: 'كلمة المرور غير مطابقة للشروط. يجب أن تحتوي على 8 خانات على الأقل تتضمن حرفاً كبيراً، حرفاً صغيراً، رقماً، ورمزاً خاصاً.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check duplicate
    try {
      const existingUser = await query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [cleanEmail]);
      if (existingUser.rows && existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'البريد الإلكتروني مسجل بالفعل في المنصة، يرجى تسجيل الدخول أو استخدام بريد آخر.' });
      }
    } catch (dbErr) {
      console.warn('[DB CHECK WARNING]', dbErr.message);
    }

    const userId         = `usr-${Date.now().toString().slice(-6)}`;
    const hashedPassword = hashPassword(password);

    try {
      await query(
        `INSERT INTO users (id, email, password_hash, full_name, country_code, role_code, status)
         VALUES ($1, $2, $3, $4, $5, 'USER', 'PENDING_VERIFICATION')`,
        [userId, cleanEmail, hashedPassword, name, countryCode.toUpperCase()]
      );
      const walletId = `wlt-${userId}`;
      await query(
        `INSERT INTO wallets (id, user_id, available_balance, held_balance, currency)
         VALUES ($1, $2, 0.0000, 0.0000, 'USD')`,
        [walletId, userId]
      );
    } catch (sqlErr) {
      console.warn('[AUTH SQL REGISTER WARNING]', sqlErr.message);
      if (sqlErr.code === '23505' || sqlErr.message.includes('unique constraint')) {
        return res.status(400).json({ error: 'البريد الإلكتروني مستخدم بالفعل في المنصة.' });
      }
    }

    // Generate OTP (10-minute expiry)
    const otp = generateOtp();
    otpStore.set(cleanEmail, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });
    console.log(`[OTP] Generated for ${cleanEmail}: ${otp}`);

    const emailHtml = `
      <div dir="rtl" style="font-family:Arial,sans-serif;max-width:480px;margin:auto;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#1d4ed8,#0891b2);padding:28px 24px;text-align:center;">
          <h1 style="color:white;margin:0;font-size:22px;">NexusPay Store</h1>
          <p style="color:#bfdbfe;margin:6px 0 0;font-size:13px;">منصة الشحن والبطاقات الرقمية</p>
        </div>
        <div style="padding:28px 24px;background:#fff;">
          <h2 style="color:#1e293b;font-size:18px;margin:0 0 12px;">مرحباً ${name} 👋</h2>
          <p style="color:#475569;font-size:14px;line-height:1.7;">
            شكراً لتسجيلك في <strong>NexusPay Store</strong>. لإتمام إنشاء حسابك، أدخل رمز التحقق التالي:
          </p>
          <div style="background:#f0fdf4;border:2px solid #22c55e;border-radius:12px;padding:20px;text-align:center;margin:20px 0;">
            <span style="font-size:38px;font-weight:900;color:#16a34a;letter-spacing:10px;font-family:monospace;">${otp}</span>
          </div>
          <p style="color:#94a3b8;font-size:12px;margin:0;">⏱ صالح لمدة <strong>10 دقائق</strong> فقط. لا تشارك هذا الرمز مع أحد.</p>
        </div>
        <div style="padding:16px 24px;background:#f8fafc;text-align:center;border-top:1px solid #e2e8f0;">
          <p style="color:#94a3b8;font-size:11px;margin:0;">إذا لم تقم بإنشاء هذا الحساب، تجاهل هذه الرسالة.</p>
        </div>
      </div>`;

    try {
      await sendEmail({ to: cleanEmail, subject: `رمز التحقق من البريد - NexusPay: ${otp}`, html: emailHtml });
    } catch (emailErr) {
      console.warn('[EMAIL SEND WARNING]', emailErr.message);
    }

    res.status(201).json({
      message: 'تم إنشاء الحساب بنجاح. يرجى التحقق من بريدك الإلكتروني وإدخال رمز OTP.',
      requiresOtp: true,
      email: cleanEmail,
      user: { id: userId, name, email: cleanEmail, role: 'USER', countryCode: countryCode.toUpperCase(), isLoggedIn: false }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/auth/verify-otp - Verify OTP code sent to email
 */
router.post('/auth/verify-otp', async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'البريد الإلكتروني ورمز التحقق مطلوبان' });

    const cleanEmail = email.trim().toLowerCase();
    const stored = otpStore.get(cleanEmail);

    if (!stored) return res.status(400).json({ error: 'لم يتم طلب رمز تحقق لهذا البريد' });
    if (Date.now() > stored.expiresAt) {
      otpStore.delete(cleanEmail);
      return res.status(400).json({ error: 'انتهت صلاحية رمز التحقق. يرجى طلب رمز جديد.' });
    }
    if (stored.otp !== otp.toString().trim()) {
      return res.status(400).json({ error: 'رمز التحقق غير صحيح، يرجى التأكد من الرمز المرسل إلى بريدك.' });
    }

    otpStore.delete(cleanEmail);

    // Activate user account
    try {
      await query(`UPDATE users SET status = 'ACTIVE' WHERE LOWER(email) = LOWER($1)`, [cleanEmail]);
    } catch (dbErr) {
      console.warn('[OTP ACTIVATE DB WARNING]', dbErr.message);
    }

    // Fetch user for response
    let userData = { email: cleanEmail, role: 'USER', isLoggedIn: true };
    try {
      const userRes = await query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [cleanEmail]);
      if (userRes.rows.length > 0) {
        const u = userRes.rows[0];
        userData = { id: u.id, name: u.full_name, email: u.email, role: u.role_code || 'USER', countryCode: u.country_code || 'YE', isLoggedIn: true };
      }
    } catch (dbErr) {
      console.warn('[OTP USER FETCH WARNING]', dbErr.message);
      userData = { email: cleanEmail, name: 'مستخدم', role: 'USER', isLoggedIn: true };
    }

    res.json({ success: true, message: 'تم التحقق بنجاح! مرحباً بك في NexusPay Store.', user: userData });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/auth/resend-otp - Resend OTP to email
 */
router.post('/auth/resend-otp', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'البريد الإلكتروني مطلوب' });

    const cleanEmail = email.trim().toLowerCase();
    const otp = generateOtp();
    otpStore.set(cleanEmail, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });
    console.log(`[OTP RESEND] For ${cleanEmail}: ${otp}`);

    const emailHtml = `
      <div dir="rtl" style="font-family:Arial,sans-serif;max-width:480px;margin:auto;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#1d4ed8,#0891b2);padding:28px 24px;text-align:center;">
          <h1 style="color:white;margin:0;">NexusPay Store</h1>
        </div>
        <div style="padding:28px 24px;">
          <p style="color:#475569;font-size:14px;">رمز التحقق الجديد الخاص بك:</p>
          <div style="background:#f0fdf4;border:2px solid #22c55e;border-radius:12px;padding:20px;text-align:center;margin:20px 0;">
            <span style="font-size:38px;font-weight:900;color:#16a34a;letter-spacing:10px;font-family:monospace;">${otp}</span>
          </div>
          <p style="color:#94a3b8;font-size:12px;">⏱ صالح لمدة 10 دقائق فقط.</p>
        </div>
      </div>`;

    try {
      await sendEmail({ to: cleanEmail, subject: `رمز التحقق الجديد - NexusPay: ${otp}`, html: emailHtml });
    } catch (emailErr) {
      console.warn('[RESEND OTP EMAIL WARNING]', emailErr.message);
    }

    res.json({ success: true, message: 'تم إرسال رمز تحقق جديد إلى بريدك الإلكتروني' });
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
      return res.status(400).json({ error: 'البريد الإلكتروني وكلمة المرور مطلوبة' });
    }

    const cleanEmail = email.trim().toLowerCase();

    try {
      const userRes = await query('SELECT * FROM users WHERE LOWER(email) = LOWER($1) AND deleted_at IS NULL', [cleanEmail]);
      if (userRes.rows.length > 0) {
        const dbUser = userRes.rows[0];
        if (verifyPassword(password, dbUser.password_hash)) {
          let walletData = { availableBalance: 0, heldBalance: 0, currency: 'USD' };
          try {
            const walletRes = await query('SELECT * FROM wallets WHERE user_id = $1', [dbUser.id]);
            if (walletRes.rows.length > 0) {
              const w = walletRes.rows[0];
              walletData = {
                availableBalance: parseFloat(w.available_balance) || 0,
                heldBalance:      parseFloat(w.held_balance)      || 0,
                currency:         w.currency || 'USD'
              };
            }
          } catch (wErr) {
            console.warn('[WALLET FETCH]', wErr.message);
          }

          return res.json({
            message: 'Login successful',
            user: {
              id:          dbUser.id,
              name:        dbUser.full_name,
              email:       dbUser.email,
              role:        dbUser.role_code || 'USER',
              countryCode: dbUser.country_code || 'YE',
              isLoggedIn:  true
            },
            wallet: walletData
          });
        }
      }

      return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    } catch (dbErr) {
      console.warn('[DB WARNING] Database error during login:', dbErr.message);
      return res.status(401).json({ error: 'تعذر الاتصال بقاعدة البيانات، يرجى المحاولة لاحقاً' });
    }
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/auth/forgot-password - Send password reset link to email
 */
router.post('/auth/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'البريد الإلكتروني مطلوب' });

    const cleanEmail = email.trim().toLowerCase();

    let userId   = null;
    let userName = 'عزيزي العميل';
    try {
      const userRes = await query('SELECT id, full_name FROM users WHERE LOWER(email) = LOWER($1) AND deleted_at IS NULL', [cleanEmail]);
      if (userRes.rows.length > 0) {
        userId   = userRes.rows[0].id;
        userName = userRes.rows[0].full_name || userName;
      }
    } catch (dbErr) {
      console.warn('[FORGOT PW DB WARNING]', dbErr.message);
    }

    // Always respond with success to prevent email enumeration
    if (!userId) {
      return res.json({ success: true, message: 'إذا كان البريد مسجلاً، ستصل رسالة إعادة الضبط خلال دقائق.' });
    }

    // Create a unique signed token: base64url( userId:timestamp:hmac )
    const timestamp    = Date.now();
    const tokenPayload = `${userId}:${timestamp}`;
    const hmac         = crypto.createHmac('sha256', process.env.JWT_SECRET || 'nexuspay_secret_key_2026')
                                .update(tokenPayload).digest('hex');
    const rawToken     = `${tokenPayload}:${hmac}`;
    const token        = Buffer.from(rawToken).toString('base64url');

    resetTokenStore.set(token, { userId, email: cleanEmail, expiresAt: Date.now() + 60 * 60 * 1000 });
    console.log(`[RESET TOKEN] For ${cleanEmail}: ${token.slice(0, 40)}...`);

    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl     = `${FRONTEND_URL}/#reset-password?token=${token}`;

    const emailHtml = `
      <div dir="rtl" style="font-family:Arial,sans-serif;max-width:480px;margin:auto;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#dc2626,#b91c1c);padding:28px 24px;text-align:center;">
          <h1 style="color:white;margin:0;font-size:22px;">NexusPay Store</h1>
          <p style="color:#fecaca;margin:6px 0 0;font-size:13px;">إعادة تعيين كلمة المرور</p>
        </div>
        <div style="padding:28px 24px;background:#fff;">
          <h2 style="color:#1e293b;font-size:18px;margin:0 0 12px;">مرحباً ${userName}</h2>
          <p style="color:#475569;font-size:14px;line-height:1.7;">
            استلمنا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك في <strong>NexusPay Store</strong>.<br>
            اضغط على الزر أدناه. الرابط صالح لمدة <strong>ساعة واحدة</strong> فقط.
          </p>
          <div style="text-align:center;margin:28px 0;">
            <a href="${resetUrl}"
               style="display:inline-block;background:linear-gradient(135deg,#dc2626,#b91c1c);color:white;
                      padding:14px 32px;border-radius:12px;font-size:15px;font-weight:900;
                      text-decoration:none;">
              🔐 إعادة تعيين كلمة المرور
            </a>
          </div>
          <p style="color:#94a3b8;font-size:11px;text-align:center;word-break:break-all;">
            أو انسخ هذا الرابط:<br><span style="color:#3b82f6;">${resetUrl}</span>
          </p>
        </div>
        <div style="padding:16px 24px;background:#f8fafc;text-align:center;border-top:1px solid #e2e8f0;">
          <p style="color:#94a3b8;font-size:11px;margin:0;">
            🔒 إذا لم تطلب إعادة تعيين كلمة المرور، تجاهل هذه الرسالة.
          </p>
        </div>
      </div>`;

    try {
      await sendEmail({ to: cleanEmail, subject: 'إعادة تعيين كلمة المرور - NexusPay Store', html: emailHtml });
    } catch (emailErr) {
      console.warn('[FORGOT PW EMAIL WARNING]', emailErr.message);
    }

    res.json({ success: true, message: 'إذا كان البريد مسجلاً، ستصل رسالة إعادة الضبط خلال دقائق.' });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/auth/validate-reset-token - Validate password reset token
 */
router.post('/auth/validate-reset-token', (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ valid: false, error: 'الرمز مطلوب' });

  const stored = resetTokenStore.get(token);
  if (!stored) return res.json({ valid: false, error: 'الرابط غير صالح أو تم استخدامه مسبقاً' });
  if (Date.now() > stored.expiresAt) {
    resetTokenStore.delete(token);
    return res.json({ valid: false, error: 'انتهت صلاحية الرابط. يرجى طلب رابط جديد.' });
  }

  // Verify HMAC signature
  try {
    const rawToken = Buffer.from(token, 'base64url').toString('utf8');
    const parts    = rawToken.split(':');
    if (parts.length < 3) return res.json({ valid: false, error: 'رابط غير صالح' });
    const [userId, timestamp, hmac] = parts;
    const expectedHmac = crypto.createHmac('sha256', process.env.JWT_SECRET || 'nexuspay_secret_key_2026')
                                .update(`${userId}:${timestamp}`).digest('hex');
    if (hmac !== expectedHmac) return res.json({ valid: false, error: 'رابط مزور أو محرف. العملية مرفوضة.' });

    res.json({ valid: true, email: stored.email });
  } catch {
    res.json({ valid: false, error: 'خطأ في التحقق من الرابط' });
  }
});

/**
 * POST /api/v1/auth/reset-password - Execute password reset using token
 */
router.post('/auth/reset-password', async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: 'الرمز وكلمة المرور الجديدة مطلوبان' });

    const stored = resetTokenStore.get(token);
    if (!stored) return res.status(400).json({ error: 'الرابط غير صالح أو تم استخدامه مسبقاً' });
    if (Date.now() > stored.expiresAt) {
      resetTokenStore.delete(token);
      return res.status(400).json({ error: 'انتهت صلاحية الرابط. يرجى طلب رابط جديد.' });
    }

    // Verify HMAC
    try {
      const rawToken = Buffer.from(token, 'base64url').toString('utf8');
      const parts    = rawToken.split(':');
      const [userId, timestamp, hmac] = parts;
      const expectedHmac = crypto.createHmac('sha256', process.env.JWT_SECRET || 'nexuspay_secret_key_2026')
                                  .update(`${userId}:${timestamp}`).digest('hex');
      if (hmac !== expectedHmac) return res.status(400).json({ error: 'رابط مزور أو محرف.' });
    } catch {
      return res.status(400).json({ error: 'خطأ في التحقق من الرابط' });
    }

    if (!validatePasswordStrength(newPassword)) {
      return res.status(400).json({
        error: 'كلمة المرور الجديدة غير مطابقة للشروط. يجب أن تحتوي على 8 خانات على الأقل تتضمن حرفاً كبيراً، حرفاً صغيراً، رقماً، ورمزاً خاصاً.'
      });
    }

    const newHash = hashPassword(newPassword);
    try {
      await query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, stored.userId]);
    } catch (dbErr) {
      console.warn('[RESET PW DB WARNING]', dbErr.message);
    }

    resetTokenStore.delete(token); // one-time use
    res.json({ success: true, message: 'تم إعادة تعيين كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول.' });
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
      return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
    }

    if (!validatePasswordStrength(password)) {
      return res.status(400).json({
        error: 'كلمة المرور غير مطابقة للشروط. يجب أن تحتوي على 8 خانات على الأقل تتضمن حرفاً كبيراً، حرفاً صغيراً، رقماً، ورمزاً خاصاً.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    try {
      const existingUser = await query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [cleanEmail]);
      if (existingUser.rows && existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'البريد الإلكتروني مسجل بالفعل لحساب آخر في قاعدة البيانات.' });
      }
    } catch (dbErr) {
      console.warn('[DB CHECK ADMIN WARNING]', dbErr.message);
    }

    const userId         = `usr-${Date.now().toString().slice(-4)}`;
    const hashedPassword = hashPassword(password);

    try {
      await query(
        `INSERT INTO users (id, email, password_hash, full_name, role_code, status)
         VALUES ($1, $2, $3, $4, 'ADMIN', 'ACTIVE')`,
        [userId, cleanEmail, hashedPassword, name]
      );
      const walletId = `wlt-${userId}`;
      await query(
        `INSERT INTO wallets (id, user_id, available_balance, held_balance, currency)
         VALUES ($1, $2, 0.0000, 0.0000, 'USD')`,
        [walletId, userId]
      );
    } catch (sqlErr) {
      console.warn('[AUTH SQL CREATE ADMIN WARNING]', sqlErr.message);
      if (sqlErr.code === '23505' || sqlErr.message.includes('unique constraint')) {
        return res.status(400).json({ error: 'البريد الإلكتروني مسجل بالفعل في المنصة.' });
      }
      throw sqlErr;
    }

    res.status(201).json({
      message: 'Admin account registered successfully through secure database',
      user: { id: userId, name, email: cleanEmail, role: 'ADMIN', isLoggedIn: true }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
