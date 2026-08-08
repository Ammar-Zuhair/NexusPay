import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Enterprise Email Transporter for NexusPay Store
 */
export function getEmailTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true';
  const user = process.env.SMTP_USER || 'pro.am.zuhair@gmail.com';
  const pass = process.env.SMTP_PASS || 'qqocdhuzyfudcfyu';

  return nodemailer.createTransport({
    host,
    port,
    secure, // true for 465, false for 587
    auth: {
      user: user.trim(),
      pass: pass.replace(/\s+/g, '') // Strip spaces from App Password if any
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}

/**
 * Generic Mail Sender
 */
export async function sendEmail({ to, subject, html, text }) {
  const user = process.env.SMTP_USER || 'pro.am.zuhair@gmail.com';
  const pass = process.env.SMTP_PASS || 'qqocdhuzyfudcfyu';

  if (!user || !pass) {
    console.log(`[EMAIL SIMULATOR] To: ${to}`);
    console.log(`[EMAIL SIMULATOR] Subject: ${subject}`);
    console.log(`[EMAIL SIMULATOR] Body: ${text || html.slice(0, 200)}`);
    return { simulated: true };
  }

  const transporter = getEmailTransporter();
  const mailOptions = {
    from: `"NexusPay Store" <${user}>`,
    to: to.trim(),
    subject: subject,
    html: html,
    text: text || html.replace(/<[^>]*>?/gm, '')
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`[EMAIL DISPATCH SUCCESS] Sent email to ${to}. MessageID: ${info.messageId}`);
  return info;
}

/**
 * 1. Send OTP Verification Email
 */
export async function sendOtpEmail(toEmail, otpCode, userName = 'عميلنا العزيز') {
  const subject = `🔑 رمز التحقق الخاص بك في منصة NexusPay: ${otpCode}`;
  const html = `
    <div dir="rtl" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; background-color: #f8fafc; border-radius: 24px; padding: 24px; color: #0f172a;">
      <div style="background: linear-gradient(135deg, #2563eb, #06b6d4); padding: 32px 24px; border-radius: 20px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 26px; font-weight: 900; letter-spacing: -0.5px;">NexusPay Store</h1>
        <p style="margin: 6px 0 0; font-size: 13px; opacity: 0.9; font-weight: 600;">منصة الخدمات والبطاقات الرقمية المعتمدة</p>
      </div>

      <div style="background-color: #ffffff; margin-top: 20px; padding: 28px 24px; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <h2 style="font-size: 18px; font-weight: 800; color: #1e293b; margin: 0 0 12px;">أهلاً بك ${userName} 👋</h2>
        <p style="font-size: 14px; color: #475569; line-height: 1.7; margin: 0 0 20px;">
          شكراً لتسجيلك في منصتنا. لإتمام تأكيد حسابك وأمان مشترياتك، يرجى إدخال رمز التحقق (OTP) التالي:
        </p>

        <div style="background: #f0fdf4; border: 2px dashed #22c55e; border-radius: 16px; padding: 20px; text-align: center; margin: 20px 0;">
          <span style="font-size: 36px; font-weight: 900; color: #16a34a; letter-spacing: 12px; font-family: monospace;">${otpCode}</span>
        </div>

        <p style="font-size: 12px; color: #94a3b8; margin: 16px 0 0; text-align: center;">
          ⏱ الرمز صالح لمدة <strong>10 دقائق</strong> فقط. يرجى عدم مشاركة الرمز مع أي شخص.
        </p>
      </div>

      <div style="text-align: center; margin-top: 20px; font-size: 11px; color: #94a3b8;">
        <p style="margin: 0;">© 2026 NexusPay Store. جميع الحقوق محفوظة.</p>
      </div>
    </div>
  `;

  return sendEmail({ to: toEmail, subject, html });
}

/**
 * 2. Send Digital Code / Voucher Fulfillment Email
 */
export async function sendDigitalCodeEmail({ toEmail, userName = 'العميل الكريم', orderId, productTitle, packageTitle, pinCode, serialNumber, emailSubject, emailBody }) {
  const subject = emailSubject || `📦 كود التفعيل المرفق بطلبك #${orderId} - NexusPay Store`;
  const codeDisplay = pinCode || 'شحن مباشر للحساب ✓';
  const customNotes = emailBody || 'مرحباً بك، نشكرك على شرائك من منصتنا. مرفق أدناه كود التفعيل الرقمي المرفق بطلبك.';

  const html = `
    <div dir="rtl" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 550px; margin: 0 auto; background-color: #f8fafc; border-radius: 24px; padding: 24px; color: #0f172a;">
      <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 32px 24px; border-radius: 20px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 26px; font-weight: 900;">NexusPay Store</h1>
        <p style="margin: 6px 0 0; font-size: 13px; opacity: 0.9; font-weight: 700;">تم إكمال وتسليم طلبك بنجاح! 🎉</p>
      </div>

      <div style="background-color: #ffffff; margin-top: 20px; padding: 28px 24px; border-radius: 20px; border: 1px solid #e2e8f0;">
        <h2 style="font-size: 17px; font-weight: 800; color: #1e293b; margin: 0 0 8px;">أهلاً بك ${userName} 👋</h2>
        <p style="font-size: 13px; color: #475569; line-height: 1.6; margin: 0 0 16px;">${customNotes}</p>

        <div style="background: #f1f5f9; border-radius: 14px; padding: 16px; margin-bottom: 20px; font-size: 13px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span style="color: #64748b; font-weight: 700;">رقم الطلب:</span>
            <span style="color: #2563eb; font-weight: 900; font-family: monospace;">#${orderId}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span style="color: #64748b; font-weight: 700;">المنتج:</span>
            <span style="color: #0f172a; font-weight: 800;">${productTitle || 'بطاقة رقمية'}</span>
          </div>
          ${packageTitle ? `
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #64748b; font-weight: 700;">الباقة:</span>
            <span style="color: #0891b2; font-weight: 800;">${packageTitle}</span>
          </div>` : ''}
        </div>

        <div style="background: #eff6ff; border: 2px solid #3b82f6; border-radius: 16px; padding: 20px; text-align: center; margin: 20px 0;">
          <span style="font-size: 12px; color: #1d4ed8; font-weight: 800; display: block; margin-bottom: 6px;">كود التفعيل الرقمي (Digital PIN):</span>
          <span style="font-size: 28px; font-weight: 900; color: #1e40af; letter-spacing: 4px; font-family: monospace;">${codeDisplay}</span>
          ${serialNumber ? `<span style="font-size: 11px; color: #64748b; display: block; margin-top: 8px; font-family: monospace;">الرقم التسلسلي S/N: ${serialNumber}</span>` : ''}
        </div>
      </div>

      <div style="text-align: center; margin-top: 20px; font-size: 11px; color: #94a3b8;">
        <p style="margin: 0;">nexuspaystore.com | الدعم الفني: support@nexuspaystore.com</p>
      </div>
    </div>
  `;

  return sendEmail({ to: toEmail, subject, html });
}

/**
 * 3. Send Support / Complaint Reply Email
 */
export async function sendSupportReplyEmail({ toEmail, userName = 'العميل العزيز', complaintId, responseNotes }) {
  const subject = `💬 رد فريق الدعم الفني على تذكرتك #${complaintId} - NexusPay Store`;
  const html = `
    <div dir="rtl" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; background-color: #f8fafc; border-radius: 24px; padding: 24px; color: #0f172a;">
      <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 30px 24px; border-radius: 20px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 900;">NexusPay Support</h1>
        <p style="margin: 4px 0 0; font-size: 12px; opacity: 0.9;">رد جديد من خدمة العملاء والتذاكر</p>
      </div>

      <div style="background-color: #ffffff; margin-top: 20px; padding: 26px 22px; border-radius: 20px; border: 1px solid #e2e8f0;">
        <h2 style="font-size: 16px; font-weight: 800; color: #1e293b; margin: 0 0 10px;">أهلاً بك ${userName} 👋</h2>
        <p style="font-size: 13px; color: #475569; margin: 0 0 16px;">تمت مراجعة استفسارك/شكواك رقم <strong>#${complaintId}</strong> من قبل فريق الدعم الفني.</p>

        <div style="background: #f8fafc; border-right: 4px solid #3b82f6; border-radius: 12px; padding: 16px; margin: 16px 0;">
          <span style="font-size: 11px; color: #64748b; font-weight: 700; display: block; margin-bottom: 6px;">رد الدعم الفني:</span>
          <p style="font-size: 13px; color: #0f172a; font-weight: 600; margin: 0; line-height: 1.6;">${responseNotes}</p>
        </div>
      </div>
    </div>
  `;

  return sendEmail({ to: toEmail, subject, html });
}
