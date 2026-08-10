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
    updateUserProfile,
    depositRequests = []
  } = useApp();

  const [copiedId, setCopiedId] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [selectedOrderForItemsModal, setSelectedOrderForItemsModal] = useState(null);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || user?.phone_number || '',
    countryCode: user?.countryCode || '+967',
    currentPassword: '',
    newPassword: ''
  });

  const parseOrderItems = (ord) => {
    let list = [];

    if (ord.items && Array.isArray(ord.items) && ord.items.length > 0) {
      ord.items.forEach((it, idx) => {
        const targets = it.targetAccountIds || (it.targetAccountId ? it.targetAccountId.split('|').map(s => s.trim()) : []);
        if (targets.length > 0) {
          targets.forEach((tAcc, tIdx) => {
            const rawTarget = tAcc.replace(/\[حساب \d+\]:\s*/, '').trim();
            list.push({
              id: `${it.id || idx}-${tIdx}`,
              productTitle: it.productTitle || it.packageName || ord.productTitle || 'منتج رقمي',
              packageName: it.packageName || it.packageTitle || 'باقة رقمية',
              targetAccount: rawTarget,
              priceUSD: it.priceUSD || (ord.priceUSD / targets.length),
              status: ord.status,
              code: ord.deliveredPayload?.pinCode || ord.pin_code || null
            });
          });
        } else {
          const rawTarget = (it.targetAccountId || ord.targetAccountId || 'N/A').replace(/\[حساب \d+\]:\s*/, '').trim();
          list.push({
            id: `${it.id || idx}`,
            productTitle: it.productTitle || it.packageName || ord.productTitle || 'منتج رقمي',
            packageName: it.packageName || it.packageTitle || 'باقة رقمية',
            targetAccount: rawTarget,
            priceUSD: it.priceUSD || ord.priceUSD,
            status: ord.status,
            code: ord.deliveredPayload?.pinCode || ord.pin_code || null
          });
        }
      });
    } else if (ord.targetAccountId && ord.targetAccountId.includes('|')) {
      const parts = ord.targetAccountId.split('|').map(s => s.trim());
      parts.forEach((p, idx) => {
        const rawTarget = p.replace(/\[حساب \d+\]:\s*/, '').trim();
        list.push({
          id: `target-${idx}`,
          productTitle: ord.productTitle || 'منتج رقمي',
          packageName: `باقة #${idx+1}`,
          targetAccount: rawTarget,
          priceUSD: (ord.priceUSD / parts.length),
          status: ord.status,
          code: ord.deliveredPayload?.pinCode || ord.pin_code || null
        });
      });
    } else {
      const rawTarget = (ord.targetAccountId || 'N/A').replace(/\[حساب \d+\]:\s*/, '').trim();
      list.push({
        id: `item-1`,
        productTitle: ord.productTitle || ord.product || 'منتج رقمي',
        packageName: ord.packageTitle || 'باقة رقمية',
        targetAccount: rawTarget,
        priceUSD: ord.priceUSD || ord.amount,
        status: ord.status,
        code: ord.deliveredPayload?.pinCode || ord.pin_code || null
      });
    }

    return list;
  };

  const getOrderTitleDisplay = (ord, itemsList) => {
    if (itemsList.length > 1) {
      const firstTitle = itemsList[0].productTitle || ord.productTitle;
      const sameProduct = itemsList.every(i => (i.productTitle || ord.productTitle) === firstTitle);
      if (sameProduct) {
        return `باقات متنوعة - (${firstTitle})`;
      }
      return `باقات متنوعة (مجموعة خدمات - ${itemsList.length} باقات)`;
    }
    return ord.packageTitle || ord.productTitle || ord.product || 'منتج رقمي';
  };

  const copyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    addToast(lang === 'ar' ? 'تم نسخ كود الشحن إلى الحافظة!' : 'Voucher code copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddBalance = () => {
    openTopUpModal();
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    const success = await updateUserProfile(profileForm);
    setIsUpdatingProfile(false);
    if (success) {
      setShowProfileModal(false);
    }
  };

  const myDepositRequests = depositRequests.filter(r => r.userId === user?.id || r.userEmail === user?.email);

  const numericUserId = user ? (user.numericId || (user.id ? String(user.id).replace(/\D/g, '') : '') || String(user.id || 'N/A')) : 'N/A';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 mt-12">
      
      {/* Dashboard Top Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-900 via-slate-900 to-slate-950 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-cyan-300 text-xs font-bold border border-cyan-500/30">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>{user ? (lang === 'ar' ? `حساب مسجل موثق (ID: ${numericUserId})` : `Verified Gamer ID: ${numericUserId}`) : (lang === 'ar' ? 'وضع الزائر (Guest Checkout)' : 'Guest Mode')}</span>
          </div>
          <h1 className="text-3xl font-black">
            {user ? (lang === 'ar' ? `أهلاً بك، ${user.name}` : `Welcome back, ${user.name}`) : (lang === 'ar' ? 'حساب الزائر' : 'Guest Account')}
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            {user ? `ID: ${numericUserId} • ${user.email}${user.phone ? ` • ${user.countryCode || '+967'} ${user.phone}` : ''}` : (lang === 'ar' ? 'قم بتسجيل الدخول للحصول على مكافآت الشحن وحفظ المشتريات' : 'Sign in to save purchase history and unlock bonuses')}
          </p>

          <div className="flex items-center gap-3 pt-2">
            <span className="text-[11px] font-mono text-cyan-300 font-bold bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-500/20">
              ID: {numericUserId}
            </span>
            {user && (
              <button
                onClick={() => {
                  setProfileForm({
                    name: user.name || '',
                    phone: user.phone || user.phone_number || '',
                    countryCode: user.countryCode || '+967',
                    currentPassword: '',
                    newPassword: ''
                  });
                  setShowProfileModal(true);
                }}
                className="px-3 py-1 bg-blue-500/20 hover:bg-blue-600 hover:text-white text-cyan-300 rounded-lg text-xs font-bold border border-cyan-500/30 transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>✏️ تعديل البيانات الشخصية</span>
              </button>
            )}
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
                {orders.map((ord) => {
                  const itemsList = parseOrderItems(ord);
                  const titleDisplay = getOrderTitleDisplay(ord, itemsList);
                  const isMulti = itemsList.length > 1;

                  return (
                    <tr key={ord.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-4 font-mono font-black text-blue-600 dark:text-cyan-400">
                        {ord.id}
                      </td>
                      <td className="p-4 font-black text-slate-900 dark:text-white">
                        <div className="space-y-1.5">
                          <div>{titleDisplay}</div>
                          {isMulti && (
                            <button
                              onClick={() => setSelectedOrderForItemsModal(ord)}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-black transition shadow-xs flex items-center gap-1 cursor-pointer w-fit"
                            >
                              <span>📦 {lang === 'ar' ? `استعراض الباقات المشتراة (${itemsList.length})` : `Inspect Packages (${itemsList.length})`}</span>
                            </button>
                          )}
                        </div>
                      </td>
                    <td className="p-4">
                      {(() => {
                        const pid = (ord.productId || '').toLowerCase();
                        const pTitle = (ord.productTitle || ord.product || '').toLowerCase();
                        const targetId = ord.targetAccountId || ord.playerId || '';
                        
                        const isSubscription = pid.includes('netflix') || pid.includes('shahid') || pid.includes('spotify') || pTitle.includes('اشتراك') || targetId.includes('@');
                        const isGameDirect = !isSubscription && (pid.includes('pubg') || pid.includes('freefire') || pid.includes('roblox') || pid.includes('mobile-legends') || (targetId && targetId !== 'DIRECT_CODE' && targetId !== 'N/A' && !targetId.includes('@')));
                        
                        if (isGameDirect) {
                          const displayTargetId = (targetId && targetId !== 'DIRECT_CODE' && targetId !== 'N/A') ? targetId : numericUserId;
                          return (
                            <span className="px-2.5 py-1 rounded-xl bg-blue-500/10 text-blue-600 dark:text-cyan-400 font-mono font-black border border-blue-500/20 inline-flex items-center gap-1">
                              🎮 ID: {displayTargetId}
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
                );
              })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL: EDIT PROFILE DATA */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 text-right rtl:text-right">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {lang === 'ar' ? 'تعديل البيانات الشخصية' : 'Edit Profile Settings'}
                  </h3>
                  <span className="text-xs text-slate-400 font-bold">
                    ID: {numericUserId}
                  </span>
                </div>
              </div>
              <button onClick={() => setShowProfileModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Read-Only Email */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1 flex items-center justify-between">
                  <span>{lang === 'ar' ? 'البريد الإلكتروني (غير قابل للتعديل)' : 'Email Address (Read-Only)'}</span>
                  <span className="text-[10px] text-slate-500">🔒 محمي</span>
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-500 cursor-not-allowed"
                />
              </div>

              {/* Phone & Country Code */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'ar' ? 'رقم الهاتف والرمز الدولي' : 'Phone Number & Country Code'}
                </label>
                <div className="flex gap-2">
                  <select
                    value={profileForm.countryCode}
                    onChange={e => setProfileForm(p => ({ ...p, countryCode: e.target.value }))}
                    className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white"
                  >
                    <option value="+967">🇾🇪 اليمن (+967)</option>
                  </select>
                  <input
                    type="tel"
                    required
                    placeholder="784746159"
                    value={profileForm.phone}
                    onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                    className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Passwords */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-3">
                <span className="text-xs font-black text-slate-700 dark:text-slate-300 block">
                  🔐 {lang === 'ar' ? 'تغيير كلمة المرور (اختياري)' : 'Change Password (Optional)'}
                </span>

                <div>
                  <input
                    type="password"
                    placeholder={lang === 'ar' ? 'كلمة المرور الحالية' : 'Current Password'}
                    value={profileForm.currentPassword}
                    onChange={e => setProfileForm(p => ({ ...p, currentPassword: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <input
                    type="password"
                    placeholder={lang === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
                    value={profileForm.newPassword}
                    onChange={e => setProfileForm(p => ({ ...p, newPassword: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-lg transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isUpdatingProfile ? (lang === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (lang === 'ar' ? 'حفظ التعديلات' : 'Save Changes')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CUSTOMER INSPECT PACKAGES IN MULTI-ITEM ORDER */}
      {selectedOrderForItemsModal && (() => {
        const modalItems = parseOrderItems(selectedOrderForItemsModal);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-5 text-right rtl:text-right">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {lang === 'ar' ? `استعراض الباقات المطلوبة للطلب #${selectedOrderForItemsModal.id}` : `Packages for Order #${selectedOrderForItemsModal.id}`}
                    </h3>
                    <span className="text-xs font-bold text-blue-600 dark:text-cyan-400">
                      {getOrderTitleDisplay(selectedOrderForItemsModal, modalItems)}
                    </span>
                  </div>
                </div>
                <button onClick={() => setSelectedOrderForItemsModal(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                {modalItems.map((item, idx) => {
                  const isDelivered = item.status === 'COMPLETED' || item.status === 'DELIVERED';
                  const isRejected = item.status === 'REJECTED';
                  return (
                    <div key={item.id || idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black">{idx + 1}</span>
                          <span>{item.productTitle}</span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                          isDelivered ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                          isRejected ? 'bg-rose-500/20 text-rose-500' : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                        }`}>
                          {isDelivered ? (lang === 'ar' ? '🟢 تم التسليم والتفعيل' : 'DELIVERED') :
                           isRejected ? (lang === 'ar' ? '🔴 تم الرفض' : 'REJECTED') : (lang === 'ar' ? '⏳ قيد المعالجة والانتظار' : 'PENDING')}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold pt-1 border-t border-slate-200 dark:border-slate-700/60">
                        <div className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                          <span>🎯 الحساب/البريد المستهدف:</span>
                          <span className="font-mono text-slate-900 dark:text-white font-black">{item.targetAccount}</span>
                        </div>
                        <div className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                          <span>💵 السعر:</span>
                          <span className="font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(item.priceUSD)}</span>
                        </div>
                      </div>

                      {/* Voucher / Code Display */}
                      {isDelivered && item.code && (
                        <div className="mt-2 p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl flex items-center justify-between gap-2">
                          <div className="font-mono font-black text-xs text-emerald-800 dark:text-emerald-300 truncate">
                            🔑 {item.code}
                          </div>
                          <button
                            onClick={() => copyCode(item.code, item.id)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-black transition flex items-center gap-1 shrink-0 cursor-pointer"
                          >
                            {copiedId === item.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedId === item.id ? (lang === 'ar' ? 'تم النسخ' : 'Copied') : (lang === 'ar' ? 'نسخ الكود' : 'Copy')}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => setSelectedOrderForItemsModal(null)}
                  className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                >
                  {lang === 'ar' ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
};
