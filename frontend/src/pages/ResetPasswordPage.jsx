import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Eye, EyeOff, CheckCircle, XCircle, Loader2 } from 'lucide-react';

import { API_BASE_URL } from '../utils/api.js';

export const ResetPasswordPage = ({ token }) => {
  const { lang, addToast, setActiveTab } = useApp();

  const [status, setStatus]             = useState('validating'); // validating | valid | invalid | done
  const [email, setEmail]               = useState('');
  const [newPassword, setNewPassword]   = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw]             = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [loading, setLoading]           = useState(false);
  const [errorMsg, setErrorMsg]         = useState('');

  const pwStrength = {
    len:   newPassword.length >= 8,
    upper: /[A-Z]/.test(newPassword),
    lower: /[a-z]/.test(newPassword),
    num:   /[0-9]/.test(newPassword),
    sym:   /[^A-Za-z0-9]/.test(newPassword),
  };
  const pwValid = Object.values(pwStrength).every(Boolean);
  const pwMatch = newPassword && confirmPassword && newPassword === confirmPassword;

  // Validate the token on mount
  useEffect(() => {
    if (!token) { setStatus('invalid'); return; }
    const validate = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/validate-reset-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        const data = await res.json();
        if (data.valid) {
          setEmail(data.email || '');
          setStatus('valid');
        } else {
          setStatus('invalid');
          setErrorMsg(data.error || 'الرابط غير صالح');
        }
      } catch {
        setStatus('invalid');
        setErrorMsg('تعذر التحقق من الرابط. يرجى المحاولة مجدداً.');
      }
    };
    validate();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pwValid) { setErrorMsg('كلمة المرور لا تستوفي الشروط المطلوبة'); return; }
    if (!pwMatch) { setErrorMsg('كلمتا المرور غير متطابقتين'); return; }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('done');
        addToast(lang === 'ar' ? 'تم إعادة تعيين كلمة المرور بنجاح!' : 'Password reset successfully!');
      } else {
        setErrorMsg(data.error || 'فشل إعادة تعيين كلمة المرور');
      }
    } catch {
      setErrorMsg('تعذر الاتصال بالخادم. يرجى المحاولة مجدداً.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'validating') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
          <p className="text-slate-600 dark:text-slate-400 font-bold">
            {lang === 'ar' ? 'جاري التحقق من الرابط...' : 'Validating reset link...'}
          </p>
        </div>
      </div>
    );
  }

  if (status === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl space-y-5">
          <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto">
            <XCircle className="w-8 h-8 text-rose-500" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {lang === 'ar' ? 'رابط غير صالح أو منتهي الصلاحية' : 'Invalid or Expired Link'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {errorMsg || (lang === 'ar' ? 'الرابط المستخدم غير صالح أو انتهت صلاحيته. يرجى طلب رابط إعادة تعيين جديد.' : 'This link is invalid or expired.')}
          </p>
          <button
            onClick={() => setActiveTab('home')}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm rounded-xl transition shadow-lg"
          >
            {lang === 'ar' ? 'العودة للصفحة الرئيسية' : 'Back to Home'}
          </button>
        </div>
      </div>
    );
  }

  if (status === 'done') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl space-y-5">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {lang === 'ar' ? 'تم إعادة تعيين كلمة المرور بنجاح! 🎉' : 'Password Reset Successful!'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {lang === 'ar' ? 'يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.' : 'You can now sign in with your new password.'}
          </p>
          <button
            onClick={() => setActiveTab('home')}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-xl transition shadow-lg"
          >
            {lang === 'ar' ? 'الذهاب لتسجيل الدخول' : 'Go to Login'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4" dir="rtl">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto">
            <Shield className="w-7 h-7 text-blue-600" />
          </div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white">
            {lang === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Reset Your Password'}
          </h1>
          {email && (
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl inline-block">
              {email}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {lang === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
            </label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute inset-y-0 end-3 flex items-center text-slate-400 hover:text-slate-600">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Strength indicators */}
            {newPassword.length > 0 && (
              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 mt-2">
                {[
                  { ok: pwStrength.len,   ar: '8 أحرف على الأقل',   en: 'At least 8 chars' },
                  { ok: pwStrength.upper, ar: 'حرف كبير (A-Z)',      en: 'Uppercase letter' },
                  { ok: pwStrength.lower, ar: 'حرف صغير (a-z)',      en: 'Lowercase letter' },
                  { ok: pwStrength.num,   ar: 'رقم (0-9)',           en: 'Number (0-9)' },
                  { ok: pwStrength.sym,   ar: 'رمز خاص (@#$)',       en: 'Special char' },
                ].map((rule, i) => (
                  <span key={i} className={`text-[10px] font-semibold flex items-center gap-1 ${rule.ok ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {rule.ok ? '✓' : '○'} {lang === 'ar' ? rule.ar : rule.en}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {lang === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm font-bold text-slate-900 dark:text-white pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  confirmPassword
                    ? pwMatch ? 'border-emerald-400 dark:border-emerald-600' : 'border-rose-400 dark:border-rose-600'
                    : 'border-slate-300 dark:border-slate-700'
                }`}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute inset-y-0 end-3 flex items-center text-slate-400 hover:text-slate-600">
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword && !pwMatch && (
              <p className="text-[11px] text-rose-500 font-semibold">
                {lang === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match'}
              </p>
            )}
            {confirmPassword && pwMatch && (
              <p className="text-[11px] text-emerald-500 font-semibold">
                ✓ {lang === 'ar' ? 'كلمتا المرور متطابقتان' : 'Passwords match'}
              </p>
            )}
          </div>

          {/* Error */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-600 dark:text-rose-400 font-semibold">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !pwValid || !pwMatch}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-extrabold text-sm rounded-xl transition shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
            {loading
              ? (lang === 'ar' ? 'جاري تعيين كلمة المرور...' : 'Resetting...')
              : (lang === 'ar' ? 'تعيين كلمة المرور الجديدة' : 'Set New Password')}
          </button>
        </form>
      </div>
    </div>
  );
};
