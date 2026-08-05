import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, CreditCard, Zap, CheckCircle2, Lock, ArrowRight, ArrowLeft,
  Smartphone, Wallet, Globe, UserCheck, UserX, Mail, Phone, PlusCircle, Key, User
} from 'lucide-react';

export const CheckoutPage = () => {
  const { 
    lang, 
    cart, 
    executeOrderCheckout, 
    setActiveTab, 
    user, 
    userWallet, 
    addToast,
    formatCurrency 
  } = useApp();

  // If user is logged in, default to Registered mode & WALLET payment, else Guest mode & Credit Card
  const [isGuest, setIsGuest] = useState(!user);
  const [paymentMethod, setPaymentMethod] = useState(user ? 'WALLET' : 'CREDIT_CARD');
  
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [showTopUpPrompt, setShowTopUpPrompt] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  const subtotalUSD = cart.reduce((sum, item) => sum + ((item.priceUSD || 9.99) * item.quantity), 0);
  const totalUSD = subtotalUSD > 0 ? subtotalUSD : 9.99;

  const defaultItem = cart.length > 0 ? cart[0] : {
    id: 'pubg-mobile',
    title: 'PUBG Mobile UC (600 + 60 UC Extra)',
    priceUSD: 9.99,
    targetAccountId: '5412896301',
    quantity: 1
  };

  const hasSufficientWalletBalance = userWallet && userWallet.availableBalance >= totalUSD;

  const handlePayNow = async () => {
    if (isGuest && !guestEmail.trim()) {
      alert(lang === 'ar' ? 'يرجى إدخال البريد الإلكتروني لاستلام الكود والإيصال' : 'Please enter email address for delivery');
      return;
    }

    if (!isGuest && paymentMethod === 'WALLET' && !hasSufficientWalletBalance) {
      setShowTopUpPrompt(true);
      return;
    }

    setIsProcessing(true);
    try {
      const order = await executeOrderCheckout({
        productId: defaultItem.productId || defaultItem.id,
        productTitle: defaultItem.title,
        targetAccountId: defaultItem.targetAccountId || defaultItem.playerId || 'N/A',
        totalUSD: totalUSD,
        paymentMethod: paymentMethod,
        isGuest: isGuest,
        guestEmail: isGuest ? guestEmail : (user?.email || ''),
        guestPhone: isGuest ? guestPhone : (user?.phone || '')
      });
      setCompletedOrder(order);
    } catch (err) {
      console.error("Checkout execution error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Determine which payment methods to offer based on guest status
  const paymentMethodsList = [
    // Wallet Option ONLY for Registered Users (isGuest === false)
    ...(!isGuest ? [{
      id: 'WALLET', 
      title: lang === 'ar' ? 'رصيد محفظة الموقع (خصم مباشر)' : 'Site Wallet Balance (1-Click Instant)', 
      desc: `${lang === 'ar' ? 'الرصيد المتاح:' : 'Available Balance:'} ${formatCurrency(userWallet?.availableBalance || 0)}`, 
      icon: Wallet,
      badge: lang === 'ar' ? 'تأكيد فوري بضغطة واحدة' : 'Instant 1-Click'
    }] : []),
    { 
      id: 'CREDIT_CARD', 
      title: 'Credit Card / Visa / Mada / Apple Pay', 
      desc: lang === 'ar' ? 'دفع آمن ومشفر بالبطاقات البنكية' : 'Bank card encrypted payment', 
      icon: CreditCard 
    },
    { 
      id: 'STC_PAY', 
      title: 'STC Pay / Local Mobile Wallets', 
      desc: lang === 'ar' ? 'سداد فوري عبر المحافظ المحلية' : 'Local mobile wallet payment', 
      icon: Smartphone 
    },
    { 
      id: 'USDT', 
      title: 'Crypto USDT (TRC-20)', 
      desc: lang === 'ar' ? 'دفع آمن بالعملات الرقمية المشفرة' : 'TRC-20 Tether payment', 
      icon: Globe 
    }
  ];

  if (completedOrder) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6 animate-fade-in mt-12">
        <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-500 flex items-center justify-center mx-auto shadow-xl ring-8 ring-emerald-50 dark:ring-emerald-900/30">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">
            {lang === 'ar' ? 'تمت عملية التسليم والتنفيذ بنجاح!' : 'Order Executed Successfully!'}
          </h2>
          <p className="text-xs font-mono text-blue-600 dark:text-cyan-400 font-bold">
            رقم الطلب: {completedOrder.id} | CID: {completedOrder.correlationId}
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-right rtl:text-right text-xs space-y-3 shadow-md">
          <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2 font-bold text-slate-900 dark:text-white">
            <span>{lang === 'ar' ? 'نوع الطلب:' : 'Order Mode:'}</span>
            <span className="text-blue-600 dark:text-cyan-400 font-bold">
              {completedOrder.isGuest ? (lang === 'ar' ? 'طلب زائر (بدون حساب)' : 'Guest Checkout') : (lang === 'ar' ? 'مستخدم مسجل' : 'Registered User')}
            </span>
          </div>
          <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2 font-bold text-slate-900 dark:text-white">
            <span>{lang === 'ar' ? 'المنتج:' : 'Product:'}</span>
            <span>{completedOrder.productTitle}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="text-slate-500 dark:text-slate-400">{lang === 'ar' ? 'البريد / الحساب المستهدف:' : 'Recipient Account:'}</span>
            <span className="font-mono font-bold text-blue-600 dark:text-cyan-400">
              {completedOrder.targetAccountId || completedOrder.guestEmail}
            </span>
          </div>
          <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="text-slate-500 dark:text-slate-400">{lang === 'ar' ? 'حالة التنفيذ FSM:' : 'FSM State:'}</span>
            <span className="font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
              {completedOrder.status}
            </span>
          </div>
          <div className="flex justify-between font-black text-sm text-slate-900 dark:text-white pt-1">
            <span>{lang === 'ar' ? 'المبلغ المدفوع:' : 'Amount Paid:'}</span>
            <span className="text-blue-600 dark:text-cyan-400">{formatCurrency(completedOrder.priceUSD)}</span>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-black text-xs shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-colors"
          >
            {lang === 'ar' ? 'مراجعة الطلبات بالحساب' : 'Review My Account Orders'}
          </button>
          <button
            onClick={() => setActiveTab('home')}
            className="px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-black text-xs hover:bg-slate-200 transition-colors"
          >
            {lang === 'ar' ? 'العودة للمتجر' : 'Back to Store'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 mt-12">
      
      {/* Page Title */}
      <div>
        <span className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-cyan-400">
          {lang === 'ar' ? 'إتمام الشراء والدفع الآمن' : 'SECURE CHECKOUT v3.0'}
        </span>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
          {lang === 'ar' ? 'سداد قيمة المنتجات والخدمات الرقمية' : 'Complete Your Purchase'}
        </h1>
      </div>

      {/* Guest Mode Selection (Optional Choice) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className={`p-3.5 rounded-2xl border ${!isGuest ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}>
            {!isGuest ? <UserCheck className="w-6 h-6" /> : <UserX className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              {!isGuest 
                ? (lang === 'ar' ? `مسجل بالحساب كـ: ${user?.name}` : `Logged in as ${user?.name}`)
                : (lang === 'ar' ? 'الشراء كزائر بدون حساب (Guest Mode)' : 'Guest Checkout Mode')
              }
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {!isGuest 
                ? (lang === 'ar' ? 'يتم السداد والخصم من محفظة الموقع مع حفظ كامل لمشترياتك.' : 'Checkout using site wallet balance with order history saved.')
                : (lang === 'ar' ? 'يمكنك إتمام الشراء فوراً عبر البطاقات بدون الحاجة لإنشاء حساب بالمنصة.' : 'Complete purchase immediately using bank cards without registration.')
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <button
              onClick={() => {
                setIsGuest(!isGuest);
                setPaymentMethod(!isGuest ? 'CREDIT_CARD' : 'WALLET');
              }}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-black text-blue-600 dark:text-cyan-400 rounded-xl transition border border-slate-200 dark:border-slate-700"
            >
              {isGuest 
                ? (lang === 'ar' ? 'التحويل لحسابي المشحون' : 'Switch to Account')
                : (lang === 'ar' ? 'الشراء كزائر (بدون محفظة)' : 'Switch to Guest Mode')
              }
            </button>
          ) : (
            <div className="text-xs font-black text-slate-500">
              {lang === 'ar' ? 'تبي تسجيل الدخول؟' : 'Have an account?'}{' '}
              <button 
                onClick={() => {
                  // Direct to main register/login modal helper
                  addToast(lang === 'ar' ? 'يرجى النقر على زر "حسابي" في أعلى الصفحة لتسجيل الدخول.' : 'Please click on "My Account" at the top to sign in.', 'info');
                }}
                className="text-blue-600 dark:text-cyan-400 underline"
              >
                {lang === 'ar' ? 'دخول الحساب' : 'Login'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Form & Payment Gateway Selection */}
        <div className="lg:col-span-7 space-y-6">

          {/* Guest fields ONLY if Guest Mode is selected */}
          {isGuest && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Mail className="w-4 h-4 text-blue-500" />
                <span>{lang === 'ar' ? 'بيانات إرسال الكود والإيصال (زائر)' : 'Receipt & Delivery Email (Guest)'}</span>
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {lang === 'ar' ? 'البريد الإلكتروني لاستلام الكود *' : 'Email Address for Code Delivery *'}
                  </label>
                  <input 
                    type="email"
                    required
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {lang === 'ar' ? 'رقم الجوال للتنبيهات (اختياري)' : 'Mobile Phone Number (Optional)'}
                  </label>
                  <input 
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="05xxxxxxx"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Payment Method Options (Differentiated list) */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <CreditCard className="w-4 h-4 text-blue-500" />
              <span>{lang === 'ar' ? 'اختر طريقة وسداد الدفع' : 'Select Payment Method'}</span>
            </h3>

            <div className="space-y-3">
              {paymentMethodsList.map((pm) => {
                const Icon = pm.icon;
                const isSelected = paymentMethod === pm.id;
                return (
                  <div
                    key={pm.id}
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`p-4 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-blue-50/60 dark:bg-blue-950/40 border-2 border-blue-600 dark:border-cyan-400 shadow-xs'
                        : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-blue-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-slate-900 dark:text-white text-xs">{pm.title}</h4>
                          {pm.badge && (
                            <span className="bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                              {pm.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{pm.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Wallet Low Balance Warning */}
            {paymentMethod === 'WALLET' && !isGuest && !hasSufficientWalletBalance && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400">
                <span>{lang === 'ar' ? 'رصيد محفظتك غير كافٍ لإتمام السداد المباشر' : 'Insufficient wallet balance for instant checkout'}</span>
                <button 
                  onClick={() => addToast(
                    lang === 'ar' 
                      ? '💳 لشحن المحفظة، اضغط على زر "شحن" في الشريط العلوي'
                      : '💳 To top up, click the "TopUp" button in the header',
                    'info'
                  )}
                  className="px-3 py-1.5 bg-emerald-600 text-white font-extrabold rounded-lg hover:bg-emerald-500 transition flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'شحن المحفظة' : 'Top-Up Wallet'}</span>
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 text-white shadow-xl space-y-6 border border-slate-800">
            <h3 className="font-extrabold text-base border-b border-slate-800 pb-3 flex items-center justify-between">
              <span>{lang === 'ar' ? 'ملخص الفاتورة والطلب' : 'Order Summary'}</span>
              <span className="text-xs text-blue-400 font-mono">1 Item</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center text-slate-300 font-bold">
                <span>{defaultItem.title}</span>
                <span className="text-white font-black">{formatCurrency(totalUSD)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>{lang === 'ar' ? 'معرف الحساب المستهدف:' : 'Target Account:'}</span>
                <span className="font-mono text-cyan-400 font-bold">{defaultItem.targetAccountId || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-3 font-black text-sm text-white">
                <span>{lang === 'ar' ? 'الإجمالي النهائـي:' : 'Total Amount:'}</span>
                <span className="text-emerald-400 text-lg font-black">{formatCurrency(totalUSD)}</span>
              </div>
            </div>

            <button
              onClick={handlePayNow}
              disabled={isProcessing}
              className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-lg transition flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <span>{lang === 'ar' ? 'جاري تنفيذ وتلبية الطلب فوراً...' : 'Executing FSM Order Delivery...'}</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>{lang === 'ar' ? `تأكيد وسداد ${formatCurrency(totalUSD)}` : `Confirm & Pay ${formatCurrency(totalUSD)}`}</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
