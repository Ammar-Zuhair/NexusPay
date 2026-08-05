import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Wallet, 
  Clock, 
  Key, 
  Copy, 
  Check, 
  PlusCircle, 
  ShieldCheck, 
  User, 
  ShoppingBag,
  ExternalLink,
  UserCheck,
  UserX,
  Mail,
  Phone
} from 'lucide-react';

export const UserDashboardPage = () => {
  const { 
    lang, 
    user, 
    userWallet, 
    orders, 
    formatCurrency, 
    addToast,
    setActiveTab 
  } = useApp();

  const [copiedId, setCopiedId] = useState(null);

  const copyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    addToast(lang === 'ar' ? 'تم نسخ كود الشحن إلى الحافظة!' : 'Voucher code copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddBalance = () => {
    // Redirect user to use the top-up button in the header (with full payment method flow)
    addToast(
      lang === 'ar' 
        ? '💳 لشحن المحفظة، اضغط على زر "شحن" في الشريط العلوي واختر وسيلة الدفع المناسبة' 
        : '💳 To top up your wallet, click the "TopUp" button in the header and select a payment method',
      'info'
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 mt-12">
      
      {/* Dashboard Top Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-900 via-slate-900 to-slate-950 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-cyan-300 text-xs font-bold border border-cyan-500/30">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>{user ? (lang === 'ar' ? 'حساب مسجل موثق - NexusPay VIP' : 'Verified VIP Gamer Account') : (lang === 'ar' ? 'وضع الزائر (Guest Checkout)' : 'Guest Mode')}</span>
          </div>
          <h1 className="text-3xl font-black">
            {user ? (lang === 'ar' ? `أهلاً بك، ${user.name}` : `Welcome back, ${user.name}`) : (lang === 'ar' ? 'حساب الزائر' : 'Guest Account')}
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            {user ? `${user.email} • ${user.phone}` : (lang === 'ar' ? 'قم بتسجيل الدخول للحصول على مكافآت الشحن وحفظ المشتريات' : 'Sign in to save purchase history and unlock bonuses')}
          </p>

          <div className="flex items-center gap-2 pt-1">
            <span className="text-[11px] font-mono text-cyan-300 font-bold">
              {lang === 'ar' ? `نوع الحساب والصلاحية: ${user?.role === 'ADMIN' ? 'مدير المنصة (ADMIN)' : 'عميل عادي (USER)'}` : `Account Role: ${user?.role || 'GUEST'}`}
            </span>
          </div>
        </div>

        {/* Wallet Balance Box */}
        <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-right rtl:text-right space-y-2 shrink-0 relative z-10 w-full md:w-auto">
          <span className="text-xs text-slate-300 font-semibold block">
            {lang === 'ar' ? 'رصيد محفظة الموقع المتاح' : 'Available Site Wallet Balance'}
          </span>
          <div className="flex items-center justify-between md:justify-start gap-4">
            <span className="text-3xl font-black text-cyan-400">
              {formatCurrency(userWallet?.availableBalance || 0)}
            </span>
            <button
              onClick={handleAddBalance}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{lang === 'ar' ? '+ شحن المحفظة' : '+ Add Credit'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Orders History & Digital Codes Vault */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-600 dark:text-cyan-400" />
            <span>{lang === 'ar' ? 'سجل المشتريات وأكواد التفعيل' : 'Orders History & Digital Keys'}</span>
          </h2>
          <span className="text-xs font-bold text-slate-500">
            {orders.length} {lang === 'ar' ? 'طلبات منفذة' : 'executed orders'}
          </span>
        </div>

        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right rtl:text-right ltr:text-left">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 uppercase font-black border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">{lang === 'ar' ? 'رقم الطلب' : 'Order ID'}</th>
                  <th className="p-4">{lang === 'ar' ? 'المنتج / الخدمة' : 'Product / Service'}</th>
                  <th className="p-4">{lang === 'ar' ? 'الحساب المستهدف' : 'Target Account'}</th>
                  <th className="p-4">{lang === 'ar' ? 'السعر' : 'Amount'}</th>
                  <th className="p-4">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                  <th className="p-4">{lang === 'ar' ? 'كود التفعيل / الإجراء' : 'Delivery Code'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200 font-bold">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-mono font-black text-blue-600 dark:text-cyan-400">
                      {ord.id}
                    </td>
                    <td className="p-4 font-black text-slate-900 dark:text-white">
                      {ord.productTitle || ord.product}
                    </td>
                    <td className="p-4 font-mono text-slate-600 dark:text-slate-300">
                      {ord.targetAccountId || ord.playerId || 'N/A'}
                    </td>
                    <td className="p-4 font-black text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(ord.priceUSD || ord.amount || 9.99)}
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        {ord.status || 'DELIVERED'}
                      </span>
                    </td>
                    <td className="p-4">
                      {ord.code ? (
                        <button
                          onClick={() => copyCode(ord.code, ord.id)}
                          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-cyan-500 dark:hover:text-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-[11px] font-black flex items-center gap-1.5 transition"
                        >
                          {copiedId === ord.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedId === ord.id ? (lang === 'ar' ? 'تم النسخ' : 'Copied') : ord.code}</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">{lang === 'ar' ? 'شحن فوري مباشر' : 'Direct Instant Top-up'}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};
