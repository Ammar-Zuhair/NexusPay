import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// Fallback in-memory storage if DB connection offline
const inMemoryComplaints = [
  {
    id: 'CMP-1001',
    name: 'أحمد علي العولقي',
    email: 'ahmed.alawlaqi@gmail.com',
    subject: 'TOPUP',
    message: 'قمت بتحويل مبلغ 20,000 ريال يمني عبر كريمي ورقم المرجع TX-881293 ولم يضاف الرصيد بعد محفظتي حتى الآن. يرجى التثبت والمساعدة.',
    status: 'PENDING',
    adminNotes: '',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'CMP-1002',
    name: 'مريم صلاح الدين',
    email: 'maryam.salah@yahoo.com',
    subject: 'ORDER',
    message: 'اشتريت كود تفعيل بلايستيشن 50 دولار، وعطاني الكود غير مستخدم بالمنطقة. أطلب استبداله بكود سعودي.',
    status: 'IN_PROGRESS',
    adminNotes: 'جاري التواصل مع المورد لتزويدها بكود بديل',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString()
  }
];

/**
 * POST /api/v1/complaints
 * Submit a customer complaint / contact message
 */
router.post('/complaints', async (req, res, next) => {
  try {
    const { name, email, subject = 'GENERAL', message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'الاسم، البريد الإلكتروني، ونص الرسالة حقول مطلوبة.' });
    }

    const complaintId = `CMP-${Math.floor(1000 + Math.random() * 9000)}`;
    const createdAt = new Date().toISOString();

    const newComplaint = {
      id: complaintId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject || 'GENERAL',
      message: message.trim(),
      status: 'PENDING',
      adminNotes: '',
      createdAt
    };

    // Save to Database
    try {
      await query(
        `INSERT INTO user_complaints (id, name, email, subject, message, status, created_at)
         VALUES ($1, $2, $3, $4, $5, 'PENDING', NOW())`,
        [newComplaint.id, newComplaint.name, newComplaint.email, newComplaint.subject, newComplaint.message]
      );
    } catch (dbErr) {
      console.warn('[COMPLAINTS DB] Saving to in-memory fallback:', dbErr.message);
    }

    inMemoryComplaints.unshift(newComplaint);

    res.status(201).json({
      success: true,
      message: 'تم إرسال شكواك/استفسارك بنجاح. سيتواصل معك الدعم الفني قريباً.',
      complaint: newComplaint
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/complaints
 * Fetch all complaints (for Admin Dashboard)
 */
router.get('/complaints', async (req, res, next) => {
  try {
    let complaints = [];
    try {
      const dbRes = await query(
        `SELECT id, name, email, subject, message, status, admin_notes AS "adminNotes", created_at AS "createdAt"
         FROM user_complaints
         ORDER BY created_at DESC`
      );
      if (dbRes.rows.length > 0) {
        complaints = dbRes.rows;
      }
    } catch (dbErr) {
      console.warn('[COMPLAINTS DB] Fetching from in-memory fallback:', dbErr.message);
    }

    if (complaints.length === 0) {
      complaints = inMemoryComplaints;
    }

    res.json({ success: true, count: complaints.length, complaints });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/v1/complaints/:id/status
 * Update complaint status & admin notes
 */
router.put('/complaints/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminNotes = '' } = req.body;

    if (!['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'حالة الشكوى غير صالحة' });
    }

    // Try DB update
    try {
      await query(
        `UPDATE user_complaints SET status = $1, admin_notes = $2 WHERE id = $3`,
        [status, adminNotes, id]
      );
    } catch (dbErr) {
      console.warn('[COMPLAINTS DB] Updating in-memory fallback:', dbErr.message);
    }

    // Update in-memory
    const idx = inMemoryComplaints.findIndex(c => c.id === id);
    if (idx !== -1) {
      inMemoryComplaints[idx].status = status;
      inMemoryComplaints[idx].adminNotes = adminNotes;
    }

    res.json({ success: true, message: 'تم تحديث حالة الشكوى بنجاح', id, status, adminNotes });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/v1/complaints/:id
 * Delete a complaint
 */
router.delete('/complaints/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    try {
      await query(`DELETE FROM user_complaints WHERE id = $1`, [id]);
    } catch (dbErr) {
      console.warn('[COMPLAINTS DB] Deleting from in-memory fallback:', dbErr.message);
    }

    const idx = inMemoryComplaints.findIndex(c => c.id === id);
    if (idx !== -1) inMemoryComplaints.splice(idx, 1);

    res.json({ success: true, message: 'تم حذف الشكوى', id });
  } catch (err) {
    next(err);
  }
});

export default router;
