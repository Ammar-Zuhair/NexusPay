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
    openTopUpModal,
    depositRequests = []
  } = useApp();

  const [copiedId, setCopiedId] = useState(null);

  const copyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    addToast(lang === 'ar' ? 'تم نسخ كود الشحن إلى الحافظة!' : 'Voucher code copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddBalance = () => {
    openTopUpModal();
  };

  const myDepositRequests = depositRequests.filter(r => r.userId === user?.id || r.userEmail === user?.email);

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
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{lang === 'ar' ? '+ شحن المحفظة' : '+ Add Credit'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Manual Deposit Requests Status Section */}
      {myDepositRequests.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>🇾🇪</span>
            <span>{lang === 'ar' ? 'حالة طلبات الإيداع المباشرة' : 'Direct Deposit Requests Status'}</span>
          </h3>
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right rtl:text-right ltr:text-left">
                <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-black border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-4">{lang === 'ar' ? 'رقم الإيداع' : 'Deposit ID'}</th>
                    <th className="p-4">{lang === 'ar' ? 'المبلغ' : 'Amount'}</th>
                    <th className="p-4">{lang === 'ar' ? 'البنك / التطبيق' : 'Bank / App'}</th>
                    <th className="p-4">{lang === 'ar' ? 'رقم الإشعار' : 'Reference'}</th>
                    <th className="p-4">{lang === 'ar' ? 'التاريخ' : 'Date'}</th>
                    <th className="p-4">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold">
                  {myDepositRequests.map((req) => (
                    <tr key={req.id}>
                      <td className="p-4 font-mono font-black text-blue-600 dark:text-cyan-400">{req.id}</td>
                      <td className="p-4 font-black text-emerald-600">{formatCurrency(req.amountUSD)}</td>
                      <td className="p-4 font-bold">{req.bankName}</td>
                      <td className="p-4 font-mono text-slate-600 dark:text-slate-300">{req.referenceNumber}</td>
                      <td className="p-4 text-[11px] text-slate-400">{new Date(req.createdAt).toLocaleDateString()}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          req.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400'
                            : req.status === 'REJECTED'
                              ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/80 dark:text-rose-400'
                              : 'bg-amber-100 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400'
                        }`}>
                          {req.status === 'COMPLETED'
                            ? (lang === 'ar' ? 'تمت إضافة الرصيد' : 'COMPLETED')
                            : req.status === 'REJECTED'
                              ? (lang === 'ar' ? 'تم الرفض' : 'REJECTED')
                              : (lang === 'ar' ? 'قيد التحقق والتأكيد' : 'PENDING')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

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
                    <td className="p-4">
                      {(() => {
                        const pid = (ord.productId || '').toLowerCase();
                        const pTitle = (ord.productTitle || ord.product || '').toLowerCase();
                        const targetId = ord.targetAccountId || ord.playerId || '';
                        
                        const isSubscription = pid.includes('netflix') || pid.includes('shahid') || pid.includes('spotify') || pTitle.includes('اشتراك') || targetId.includes('@');
                        const isGameDirect = !isSubscription && (pid.includes('pubg') || pid.includes('freefire') || pid.includes('roblox') || pid.includes('mobile-legends') || (targetId && targetId !== 'DIRECT_CODE' && targetId !== 'N/A' && !targetId.includes('@')));
                        
                        if (isGameDirect) {
                          return (
                            <span className="px-2.5 py-1 rounded-xl bg-blue-500/10 text-blue-600 dark:text-cyan-400 font-mono font-black border border-blue-500/20 inline-flex items-center gap-1">
                              🎮 ID: {targetId || '5412896301'}
                            </span>
                          );
                        }

                        if (isSubscription) {
                          return (
                            <span className="px-2.5 py-1 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 font-mono font-black border border-purple-500/20 inline-flex items-center gap-1">
                              📧 {targetId || user?.email || 'customer@email.com'}
                            </span>
                          );
                        }

                        return (
                          <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border border-slate-300 dark:border-slate-700 inline-flex items-center gap-1">
                            🎫 كود إلكتروني
                          </span>
                        );
                      })()}
                    </td>
                    <td className="p-4 font-black text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(ord.priceUSD || ord.amount || 9.99)}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        ord.status === 'COMPLETED' || ord.status === 'DELIVERED'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : ord.status === 'REJECTED'
                            ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                      }`}>
                        {ord.status === 'COMPLETED' || ord.status === 'DELIVERED'
                          ? (lang === 'ar' ? 'تم التسليم ✓' : 'DELIVERED')
                          : ord.status === 'REJECTED'
                            ? (lang === 'ar' ? 'مرفوض ✕' : 'REJECTED')
                            : (lang === 'ar' ? '⏳ قيد المراجعة والارسال' : 'PENDING REVIEW')}
                      </span>
                    </td>
                    <td className="p-4">
                      {(() => {
                        const pid = (ord.productId || '').toLowerCase();
                        const pTitle = (ord.productTitle || ord.product || '').toLowerCase();
                        const targetId = ord.targetAccountId || ord.playerId || '';
                        
                        const isSubscription = pid.includes('netflix') || pid.includes('shahid') || pid.includes('spotify') || pTitle.includes('اشتراك') || targetId.includes('@');
                        const isGameDirect = !isSubscription && (pid.includes('pubg') || pid.includes('freefire') || pid.includes('roblox') || pid.includes('mobile-legends') || (targetId && targetId !== 'DIRECT_CODE' && targetId !== 'N/A' && !targetId.includes('@')));
                        const isFulfilled = ord.status === 'COMPLETED' || ord.status === 'DELIVERED';

                        if (isGameDirect) {
                          return isFulfilled ? (
                            <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-xl font-bold text-[11px]">
                              {lang === 'ar' ? 'شحن مباشر للحساب ✓' : 'Direct Top-up Complete ✓'}
                            </span>
                          ) : (
                            <span className="px-3 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-xl font-bold text-[11px]">
                              {lang === 'ar' ? '⏳ جاري الشحن عبر ID' : 'Processing ID Top-up'}
                            </span>
                          );
                        }

                        if (isSubscription) {
                          return isFulfilled ? (
                            <span className="px-3 py-1.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 rounded-xl font-bold text-[11px]">
                              {lang === 'ar' ? 'تم تفعيل الاشتراك ✓' : 'Subscription Active ✓'}
                            </span>
                          ) : (
                            <span className="px-3 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-xl font-bold text-[11px]">
                              {lang === 'ar' ? '⏳ جاري تفعيل الاشتراك' : 'Processing Subscription'}
                            </span>
                          );
                        }

                        let activeCode = null;
                        if (isFulfilled) {
                          activeCode = ord.pin_code || ord.code;
                          if (!activeCode && ord.deliveredPayload && typeof ord.deliveredPayload === 'object') {
                            activeCode = ord.deliveredPayload.pinCode;
                          }
                          if (!activeCode && typeof ord.delivery_payload === 'string') {
                            try { activeCode = JSON.parse(ord.delivery_payload)?.pinCode; } catch (e) {}
                          }
                        }

                        if (isFulfilled && activeCode) {
                          return (
                            <button
                              onClick={() => copyCode(activeCode, ord.id)}
                              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-cyan-500 dark:hover:text-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-[11px] font-black flex items-center gap-1.5 transition cursor-pointer"
                            >
                              {copiedId === ord.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedId === ord.id ? (lang === 'ar' ? 'تم النسخ' : 'Copied') : activeCode}</span>
                            </button>
                          );
                        }

                        if (ord.status === 'REJECTED') {
                          return <span className="text-slate-400 text-[11px]">—</span>;
                        }

                        return (
                          <span className="px-3 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-xl font-bold text-[11px]">
                            {lang === 'ar' ? '⏳ قيد مراجعة وإرسال الكود' : 'Awaiting Review & Code'}
                          </span>
                        );
                      })()}
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
