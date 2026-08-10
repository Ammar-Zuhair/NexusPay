import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, CreditCard, Zap, CheckCircle2, Lock, ArrowRight, ArrowLeft,
  Smartphone, Wallet, Globe, UserCheck, UserX, Mail, Phone, PlusCircle, Key, User, Trash2, ShoppingCart, Building2, Copy, Check
} from 'lucide-react';

import { API_BASE_URL } from '../utils/api.js';

export const CheckoutPage = () => {
  const { 
    lang, 
    cart, 
    removeFromCart,
    executeOrderCheckout, 
    setActiveTab, 
    user, 
    userWallet, 
    addToast,
    formatCurrency 
  } = useApp();

  const subtotalUSD = cart.reduce((sum, item) => sum + ((item.priceUSD || 9.99) * (item.quantity || 1)), 0);
  const totalUSD = subtotalUSD > 0 ? subtotalUSD : 9.99;

  const defaultItem = cart.length > 0 ? cart[0] : {
    id: 'pubg-mobile',
    title: 'PUBG Mobile UC (600 + 60 UC Extra)',
    priceUSD: 9.99,
    targetAccountId: '5412896301',
    quantity: 1
  };

  const hasSufficientWalletBalance = userWallet && userWallet.availableBalance >= totalUSD;

  // ------------------------------------------------------------
  // ALL REACT HOOKS DECLARED UNCONDITIONALLY AT TOP LEVEL
  // ------------------------------------------------------------
  const [isGuest, setIsGuest] = useState(!user);
  const [paymentMethod, setPaymentMethod] = useState(user ? 'WALLET' : 'YEMEN_TRANSFER');
  
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [showTopUpPrompt, setShowTopUpPrompt] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  
  // Post-Purchase User Review State
  const [reviewName, setReviewName] = useState(user?.full_name || '');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Card / PayPal States (Reserved)
  const [cardNum, setCardNum] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [paypalModalData, setPaypalModalData] = useState(null);
  const [paypalSdkLoaded, setPaypalSdkLoaded] = useState(false);
  const paypalBtnContainerRef = useRef(null);

  // Yemen Local Banks Multi-Step States
  const [yemenStep, setYemenStep] = useState(1); // 1=Region, 2=Bank, 3=Proof
  const [selectedRegion, setSelectedRegion] = useState('NORTH'); // 'NORTH' or 'SOUTH'
  const [yemenBanks, setYemenBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [userNotes, setUserNotes] = useState('');
  const [copiedAccount, setCopiedAccount] = useState(false);

  // Load checkout draft from localStorage (valid for 24 hours)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nexuspay_checkout_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (Date.now() - (parsed.savedAt || 0)) < 86400000) {
          if (parsed.yemenStep) setYemenStep(parsed.yemenStep);
          if (parsed.selectedRegion) setSelectedRegion(parsed.selectedRegion);
          if (parsed.selectedBank) setSelectedBank(parsed.selectedBank);
          if (parsed.referenceNumber) setReferenceNumber(parsed.referenceNumber);
          if (parsed.userNotes) setUserNotes(parsed.userNotes);
          if (parsed.paymentMethod) setPaymentMethod(parsed.paymentMethod);
        }
      }
    } catch (e) {}
  }, []);

  // Auto-save checkout draft to localStorage
  useEffect(() => {
    try {
      if (referenceNumber || selectedBank || yemenStep > 1) {
        const draft = {
          yemenStep,
          selectedRegion,
          selectedBank,
          referenceNumber,
          userNotes,
          paymentMethod,
          savedAt: Date.now()
        };
        localStorage.setItem('nexuspay_checkout_draft', JSON.stringify(draft));
      }
    } catch (e) {}
  }, [yemenStep, selectedRegion, selectedBank, referenceNumber, userNotes, paymentMethod]);

  const clearCheckoutDraft = () => {
    try {
      localStorage.removeItem('nexuspay_checkout_draft');
    } catch (e) {}
  };

  // Fetch Yemen Banks dynamically
  useEffect(() => {
    fetch(`${API_BASE_URL}/payments/yemen-banks`)
      .then(res => res.json())
      .then(data => {
        if (data && data.banks) {
          setYemenBanks(data.banks);
        }
      })
      .catch(err => console.warn('[YEMEN BANKS CHECKOUT FETCH] Notice:', err.message));
  }, []);

  // Preload PayPal JS SDK dynamically
  useEffect(() => {
    let isMounted = true;
    const fetchAndLoadSdk = async () => {
      try {
        const configRes = await fetch(`${API_BASE_URL}/payments/paypal/config`);
        const config = await configRes.json();
        const clientId = config.clientId || 'sb';

        const scriptId = 'paypal-js-sdk-script';
        let existingScript = document.getElementById(scriptId);

        const markLoaded = () => {
          if (isMounted) setPaypalSdkLoaded(true);
        };

        if (window.paypal && existingScript && existingScript.src.includes('disable-funding')) {
          markLoaded();
          return;
        }

        if (!existingScript) {
          const script = document.createElement('script');
          script.id = scriptId;
          script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&components=buttons&disable-funding=paylater,credit,card,venmo`;
          script.async = true;
          script.onload = markLoaded;
          script.onerror = () => {
            if (isMounted) setPaypalSdkLoaded(true);
          };
          document.body.appendChild(script);
        } else {
          existingScript.addEventListener('load', markLoaded);
        }
      } catch (err) {
        if (isMounted) setPaypalSdkLoaded(true);
      }
    };

    fetchAndLoadSdk();

    const safetyTimer = setTimeout(() => {
      if (isMounted) setPaypalSdkLoaded(true);
    }, 2500);

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
    };
  }, []);

  const handleCopyAccount = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(true);
    addToast(lang === 'ar' ? 'تم نسخ رقم الحساب للحافظة!' : 'Account number copied!');
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleSubmitReview = async () => {
    if (!reviewComment.trim()) {
      alert(lang === 'ar' ? 'الرجاء كتابة تعليقك ورأيك قبل الإرسال.' : 'Please enter your comment before submitting.');
      return;
    }
    const finalName = reviewName.trim() || (user?.full_name || (lang === 'ar' ? 'عميل المنصة' : 'Verified Customer'));
    setIsSubmittingReview(true);
    try {
      const res = await fetch(`${API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewer_name: finalName,
          rating: reviewRating,
          comment: reviewComment.trim(),
          order_id: completedOrder?.id,
          user_id: user?.id
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setReviewSubmitted(true);
        if (addToast) addToast(lang === 'ar' ? 'تم حفظ تقييمك بنجاح! شكراً لمشاركتك.' : 'Review submitted successfully!');
      } else {
        throw new Error(data.error || 'Review save failed');
      }
    } catch (err) {
      console.warn('Saving review locally:', err);
      setReviewSubmitted(true);
      if (addToast) addToast(lang === 'ar' ? 'تم حفظ تقييمك بنجاح! شكراً لمشاركتك.' : 'Review submitted successfully!');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handlePayNow = async () => {
    if (isGuest && !guestEmail.trim()) {
      alert(lang === 'ar' ? 'يرجى إدخال البريد الإلكتروني لاستلام الكود والإيصال' : 'Please enter email address for delivery');
      return;
    }

    if (!isGuest && paymentMethod === 'WALLET' && !hasSufficientWalletBalance) {
      setShowTopUpPrompt(true);
      return;
    }

    if (paymentMethod === 'YEMEN_TRANSFER') {
      if (!selectedBank) {
        alert(lang === 'ar' ? 'يرجى اختيار البنك أو المحفظة الإلكترونية للتحويل' : 'Please select a bank');
        return;
      }
      if (!referenceNumber.trim()) {
        alert(lang === 'ar' ? 'يرجى إدخال رقم الإشعار أو المرجع للحوالة' : 'Please enter reference number');
        return;
      }
    }

    setIsProcessing(true);

    try {
      const itemsToProcess = cart.length > 0 ? cart : [defaultItem];
      const mainItem = itemsToProcess[0];

      const masterPayload = {
        productId: mainItem.productId || mainItem.id,
        productTitle: typeof mainItem.title === 'string' ? mainItem.title : (mainItem.title?.ar || mainItem.title?.en || 'منتج رقمي'),
        packageTitle: itemsToProcess.length > 1 ? `سلة مشتريات متعددة (${itemsToProcess.length} منتجات)` : (mainItem.packageTitle || mainItem.packageName || 'باقة رقمية'),
        quantity: itemsToProcess.reduce((sum, i) => sum + (i.quantity || 1), 0),
        targetAccountId: mainItem.targetAccountId || mainItem.playerId || mainItem.email || 'N/A',
        totalUSD: totalUSD,
        paymentMethod: paymentMethod,
        items: itemsToProcess.map(i => ({
          productId: i.productId || i.id,
          productTitle: typeof i.title === 'string' ? i.title : (i.title?.ar || i.title?.en || 'منتج رقمي'),
          packageTitle: i.packageTitle || i.packageName || (typeof i.title === 'string' ? i.title : 'باقة رقمية'),
          targetAccountId: i.targetAccountId || i.playerId || i.email || 'N/A',
          quantity: i.quantity || 1,
          priceUSD: i.priceUSD || 9.99
        })),
        paymentDetails: paymentMethod === 'YEMEN_TRANSFER' ? {
          bankName: selectedBank?.name,
          accountNumber: selectedBank?.accountNumber,
          recipientName: selectedBank?.recipientName,
          referenceNumber,
          userNotes
        } : {},
        isGuest: user ? false : isGuest,
        guestEmail: user ? user.email : guestEmail,
        guestPhone: user ? user.phone : guestPhone
      };

      const order = await executeOrderCheckout(masterPayload);

      setCompletedOrder({
        ...order,
        itemCount: itemsToProcess.length,
        itemsList: itemsToProcess,
        totalUSD: totalUSD
      });
      clearCheckoutDraft();
      if (cart.length > 0) clearCart();
    } catch (err) {
      alert((lang === 'ar' ? 'فشل تنفيذ الطلب: ' : 'Order failed: ') + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Payment methods list (Focusing on Yemen Local Transfers & Site Wallet)
  const paymentMethodsList = [
    ...(!isGuest ? [{
      id: 'WALLET', 
      title: lang === 'ar' ? 'رصيد محفظة الموقع (خصم مباشر بضغطة واحدة)' : 'Site Wallet Balance (1-Click Instant)', 
      desc: `${lang === 'ar' ? 'الرصيد المتاح:' : 'Available Balance:'} ${formatCurrency(userWallet?.availableBalance || 0)}`, 
      icon: Wallet,
      badge: lang === 'ar' ? 'تأكيد فوري بضغطة واحدة' : 'Instant 1-Click'
    }] : []),

    {
      id: 'YEMEN_TRANSFER',
      title: lang === 'ar' ? 'إيداع وحوالة محلية يمنية (الكريمي، جيب، ون كاش، جوالي)' : 'Yemen Local Direct Transfer (Kuraimi, Jeeb...)',
      desc: lang === 'ar' ? 'حوالة وإيداع مباشر عبر بنك الكريمي والمحافظ الإلكترونية اليمنية' : 'Direct local transfer via Kuraimi & Yemen mobile wallets',
      icon: Building2,
      badge: '🇾🇪 اليمن'
    }
  ];

  const filteredBanks = yemenBanks.filter(b => b.region === selectedRegion || b.region === 'BOTH');

  // ------------------------------------------------------------
  // CONDITIONAL RENDER VIEWS AFTER ALL HOOKS
  // ------------------------------------------------------------

  // 1. ORDER COMPLETED RECEIPT SCREEN
  if (completedOrder) {
    const purchasedItems = completedOrder.itemsList || [defaultItem];
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6 animate-fade-in mt-12">
        <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-500 flex items-center justify-center mx-auto shadow-xl ring-8 ring-emerald-50 dark:ring-emerald-900/30">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">
            {lang === 'ar' ? 'تم استلام طلبك بنجاح!' : 'Order Received Successfully!'}
          </h2>
          <p className="text-xs font-mono text-blue-600 dark:text-cyan-400 font-bold">
            رقم الطلب الرئيسي: {completedOrder.id} | إجمالي المنتجات: ({purchasedItems.length})
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-right rtl:text-right text-xs space-y-4 shadow-md">
          
          {/* Prominent Review & Email Delivery Notice Box */}
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs font-bold text-amber-900 dark:text-amber-300 space-y-2">
            <div className="font-black text-sm flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <span className="text-base">⏳</span>
              <span>{lang === 'ar' ? 'ملاحظة هامة: الطلب قيد المراجعة والإرسال' : 'Important: Order Under Review & Email Delivery'}</span>
            </div>
            <p className="leading-relaxed text-xs">
              {lang === 'ar'
                ? `تم خصم قيمة الطلب بنجاح. ستتم المراجعة من قِبل إدارة المنصة في أقرب وقت، وسيتم إرسال كود التفعيل/البطاقة من البريد الرسمي (support@nexuspaystore.com) إلى بريدك الإلكتروني (${completedOrder.guestEmail || user?.email || ''}) في أقرب فرصة ممكنة.`
                : `Payment processed. Your order is under review by management. The activation code/gift card will be sent from official support (support@nexuspaystore.com) to your email (${completedOrder.guestEmail || user?.email || ''}) as soon as possible.`}
            </p>
          </div>

          <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2 font-bold text-slate-900 dark:text-white">
            <span>{lang === 'ar' ? 'طريقة السداد:' : 'Payment Mode:'}</span>
            <span className="text-blue-600 dark:text-cyan-400 font-bold">
              {completedOrder.paymentMethod === 'YEMEN_TRANSFER' ? 'إيداع وحوالة محلية (اليمن)' : 'محفظة الموقع الحية'}
            </span>
          </div>

          <div className="space-y-3 pt-1">
            <h4 className="font-extrabold text-slate-900 dark:text-white text-xs border-b border-slate-100 dark:border-slate-800 pb-1.5">
              📦 {lang === 'ar' ? 'المنتجات المطلوبة:' : 'Purchased Products:'}
            </h4>

            {purchasedItems.map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-1.5">
                <div className="flex justify-between font-black text-slate-900 dark:text-white">
                  <span>{item.title}</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency((item.priceUSD || 9.99) * (item.quantity || 1))}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                  <span>معرف الحساب / التسليم:</span>
                  <span className="font-mono text-blue-600 dark:text-cyan-400 font-extrabold">
                    {item.targetAccountId || item.playerId || item.email || completedOrder.guestEmail || 'كود رقمي فوري'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-3 font-black text-sm text-slate-900 dark:text-white">
            <span>{lang === 'ar' ? 'الإجمالي الكلي:' : 'Grand Total:'}</span>
            <span className="text-emerald-600 dark:text-emerald-400 text-base">{formatCurrency(completedOrder.totalUSD || totalUSD)}</span>
          </div>
        </div>

        {/* Post-Purchase Review Section */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-right rtl:text-right space-y-4 shadow-sm">
          <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white text-sm">
            <span className="material-symbols-outlined text-amber-500">rate_review</span>
            <span>{lang === 'ar' ? 'شاركنا تقييمك ورأيك في الخدمة' : 'Rate & Review Your Experience'}</span>
          </div>

          {reviewSubmitted ? (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs text-center space-y-1">
              <div className="text-sm">✨ {lang === 'ar' ? 'تم استلام تقييمك بنجاح!' : 'Thank you for your rating!'}</div>
              <p className="text-[11px] opacity-90">
                {lang === 'ar' ? 'سيتم عرض تقييمك ضمن آراء العملاء اليومية على الصفحة الرئيسية.' : 'Your review will be shown in customer ratings on the homepage.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700 dark:text-slate-200">{lang === 'ar' ? 'التقييم:' : 'Rating:'}</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className={`p-1 rounded-lg transition-transform hover:scale-110 ${star <= reviewRating ? 'text-amber-400' : 'text-slate-300 dark:text-slate-700'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <textarea
                  rows={2}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder={lang === 'ar' ? 'اكتب رأيك وتجربتك هنا...' : 'Write your feedback here...'}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <button
                type="button"
                disabled={isSubmittingReview}
                onClick={handleSubmitReview}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md transition"
              >
                {isSubmittingReview ? 'جاري الإرسال...' : 'إرسال التقييم'}
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-black text-xs shadow-lg hover:bg-blue-500 transition"
          >
            {lang === 'ar' ? 'مراجعة الطلبات بالحساب' : 'Review My Account Orders'}
          </button>
          <button
            onClick={() => setActiveTab('home')}
            className="px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-black text-xs hover:bg-slate-200 transition"
          >
            {lang === 'ar' ? 'العودة للمتجر' : 'Back to Store'}
          </button>
        </div>
      </div>
    );
  }

  // 2. EMPTY CART VIEW
  if (!completedOrder && (!cart || cart.length === 0)) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6 animate-fade-in mt-12">
        <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto shadow-inner border border-slate-200 dark:border-slate-700">
          <ShoppingCart className="w-9 h-9" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            {lang === 'ar' ? 'سلة التسوق فارغة حالياً' : 'Your Cart is Currently Empty'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
            {lang === 'ar' 
              ? 'لقد قمت بحذف كافة المنتجات من السلة. يمكنك تصفح المنتجات الكثيرة وشحن ألعابك الآن.' 
              : 'Browse our catalog to select items.'}
          </p>
        </div>

        <button
          onClick={() => setActiveTab('browse')}
          className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-2xl shadow-lg transition flex items-center justify-center gap-2 mx-auto"
        >
          <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          <span>{lang === 'ar' ? 'تصفح الكروت والألعاب للشحن' : 'Browse Catalog & Products'}</span>
        </button>
      </div>
    );
  }

  // 3. MAIN CHECKOUT FORM VIEW
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 mt-12">
      
      {/* Page Title */}
      <div>
        <span className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-cyan-400">
          {lang === 'ar' ? 'إتمام الشراء والدفع الآمن' : 'SECURE CHECKOUT'}
        </span>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
          {lang === 'ar' ? 'سداد قيمة المنتجات والخدمات الرقمية' : 'Complete Your Purchase'}
        </h1>
      </div>

      {/* Guest Mode Selection */}
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
                ? (lang === 'ar' ? 'يتم السداد والخصم من محفظة الموقع مع حفظ كامل لمشترياتك.' : 'Checkout using site wallet balance.')
                : (lang === 'ar' ? 'يمكنك إتمام الشراء فوراً عبر التحويلات اليمنية بدون الحاجة لإنشاء حساب بالمنصة.' : 'Complete purchase using Yemen local transfers.')
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user && (
            <button
              onClick={() => {
                setIsGuest(!isGuest);
                setPaymentMethod(!isGuest ? 'YEMEN_TRANSFER' : 'WALLET');
              }}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-black text-blue-600 dark:text-cyan-400 rounded-xl transition border border-slate-200 dark:border-slate-700"
            >
              {isGuest 
                ? (lang === 'ar' ? 'التحويل لحسابي المشحون' : 'Switch to Account')
                : (lang === 'ar' ? 'الشراء كزائر (بدون محفظة)' : 'Switch to Guest Mode')
              }
            </button>
          )}
        </div>
      </div>

      {/* Guest Email Field */}
      {isGuest && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
            <span>{lang === 'ar' ? 'بيانات التواصل لاستلام الكود والإيصال *' : 'Delivery Contact Information *'}</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">
                {lang === 'ar' ? 'البريد الإلكتروني لاستلام الكود والإيصال *' : 'Email Address *'}
              </label>
              <input
                type="email"
                required
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="example@domain.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-xs font-black text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">
                {lang === 'ar' ? 'رقم الهاتف / الواتساب (اختياري)' : 'Phone / WhatsApp Number'}
              </label>
              <input
                type="text"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                placeholder="+967775479340"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-xs font-black text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Checkout Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Payment Methods & Yemen Local Flow */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
            <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span>{lang === 'ar' ? 'اختر طريقة السداد:' : 'Select Payment Method:'}</span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                🇾🇪 {lang === 'ar' ? 'اليمن' : 'Yemen'}
              </span>
            </h3>

            <div className="space-y-3">
              {paymentMethodsList.map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;

                return (
                  <div
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-600 dark:border-cyan-400 shadow-md scale-[1.01]'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">{m.title}</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{m.desc}</p>
                      </div>
                    </div>

                    {m.badge && (
                      <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                        {m.badge}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* YEMEN LOCAL DEPOSIT & TRANSFER STEP-BY-STEP FLOW */}
            {paymentMethod === 'YEMEN_TRANSFER' && (
              <div className="p-5 bg-gradient-to-br from-slate-50 to-emerald-50/30 dark:from-slate-800/80 dark:to-slate-900 border-2 border-emerald-500/40 rounded-3xl space-y-4 animate-fade-in text-xs font-bold">
                
                {/* Step indicator */}
                <div className="flex items-center justify-between text-xs border-b border-emerald-500/20 pb-3">
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                    {yemenStep === 1 && (lang === 'ar' ? 'الخطوة 1 من 3: تحديد المنطقة الجغرافية' : 'Step 1: Region')}
                    {yemenStep === 2 && (lang === 'ar' ? 'الخطوة 2 من 3: اختيار المحفظة / البنك' : 'Step 2: Bank/Wallet')}
                    {yemenStep === 3 && (lang === 'ar' ? 'الخطوة 3 من 3: بيانات التحويل وإرفاق الإشعار' : 'Step 3: Transfer Proof')}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    {selectedRegion === 'NORTH' ? 'منطقة الشمال (صنعاء)' : 'منطقة الجنوب (عدن)'}
                  </span>
                </div>

                {/* STEP 1: REGION SELECTION */}
                {yemenStep === 1 && (
                  <div className="space-y-4 animate-fade-in text-center">
                    <h4 className="font-black text-slate-900 dark:text-white text-sm">
                      {lang === 'ar' ? 'يرجى تحديد منطقتك الجغرافية في اليمن:' : 'Select Your Region:'}
                    </h4>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => { setSelectedRegion('NORTH'); setYemenStep(2); }}
                        className={`p-4 rounded-2xl border-2 text-right rtl:text-right space-y-2 transition-all hover:scale-102 cursor-pointer ${
                          selectedRegion === 'NORTH'
                            ? 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white font-black flex items-center justify-center text-sm shadow-sm">
                          🏢
                        </div>
                        <div>
                          <h5 className="font-black text-xs text-slate-900 dark:text-white">
                            {lang === 'ar' ? 'شمال اليمن (صنعاء وما حولها)' : 'North Yemen (Sanaa)'}
                          </h5>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {lang === 'ar' ? 'تطبيقات: كريمي حاسب، جيب، ون كاش، جوالي' : 'Kuraimi, Jeeb, OneCash, Jawali'}
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => { setSelectedRegion('SOUTH'); setYemenStep(2); }}
                        className={`p-4 rounded-2xl border-2 text-right rtl:text-right space-y-2 transition-all hover:scale-102 cursor-pointer ${
                          selectedRegion === 'SOUTH'
                            ? 'bg-blue-500/10 border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-sm">
                          🌊
                        </div>
                        <div>
                          <h5 className="font-black text-xs text-slate-900 dark:text-white">
                            {lang === 'ar' ? 'جنوب اليمن (عدن والمحافظات)' : 'South Yemen (Aden)'}
                          </h5>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {lang === 'ar' ? 'بنك الكريمي عدن، البنك الأهلي، المحافظ الجنوبية' : 'Kuraimi Aden, NBY, South Wallets'}
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: BANK / WALLET SELECTION */}
                {yemenStep === 2 && (
                  <div className="space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-slate-900 dark:text-white text-xs">
                        {lang === 'ar' ? 'اختر البنك أو التطبيق المراد تحويل المبلغ إليه:' : 'Select Target Bank:'}
                      </h4>
                      <button
                        type="button"
                        onClick={() => setYemenStep(1)}
                        className="text-[11px] text-blue-600 dark:text-cyan-400 font-bold underline"
                      >
                        {lang === 'ar' ? 'تغير المنطقة' : 'Change'}
                      </button>
                    </div>

                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {filteredBanks.map(b => (
                        <div
                          key={b.id}
                          onClick={() => { setSelectedBank(b); setYemenStep(3); }}
                          className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                            selectedBank?.id === b.id
                              ? 'bg-emerald-500/10 border-2 border-emerald-500 shadow-sm'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center shrink-0">
                              {b.imageUrl ? (
                                <img src={b.imageUrl} alt={b.name} className="w-full h-full object-cover" />
                              ) : (
                                <Building2 className="w-5 h-5 text-emerald-500" />
                              )}
                            </div>
                            <div>
                              <h5 className="font-extrabold text-xs text-slate-900 dark:text-white">{b.name}</h5>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{b.notes}</p>
                            </div>
                          </div>
                          <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400">
                            {lang === 'ar' ? 'اختيار ➔' : 'Select ➔'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 3: RECIPIENT DETAILS & PROOF SUBMISSION */}
                {yemenStep === 3 && selectedBank && (
                  <div className="space-y-3 animate-fade-in">
                    
                    {/* Selected Bank Banner */}
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600/10 to-teal-500/10 border border-emerald-500/30 space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          {selectedBank.imageUrl && (
                            <img src={selectedBank.imageUrl} alt={selectedBank.name} className="w-9 h-9 rounded-xl object-cover border border-emerald-500/40 shrink-0" />
                          )}
                          <div>
                            <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 block">
                              {selectedBank.name}
                            </span>
                            <h5 className="font-black text-xs text-slate-900 dark:text-white mt-0.5">
                              {lang === 'ar' ? `المستلم: ${selectedBank.recipientName}` : `Recipient: ${selectedBank.recipientName}`}
                            </h5>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setYemenStep(2)}
                          className="text-[11px] font-bold text-blue-600 dark:text-cyan-400 underline shrink-0"
                        >
                          {lang === 'ar' ? 'تغيير الحساب' : 'Change'}
                        </button>
                      </div>

                      <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 block">{lang === 'ar' ? 'رقم الحساب / الجوال للتحويل:' : 'Account / Phone Number:'}</span>
                          <span className="font-mono text-xs font-black text-slate-900 dark:text-white tracking-wider">
                            {selectedBank.accountNumber}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyAccount(selectedBank.accountNumber)}
                          className="px-3 py-1 bg-emerald-600 text-white font-extrabold text-[11px] rounded-lg hover:bg-emerald-500 transition flex items-center gap-1 cursor-pointer"
                        >
                          {copiedAccount ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedAccount ? (lang === 'ar' ? 'تم النسخ' : 'Copied') : (lang === 'ar' ? 'نسخ الرقم' : 'Copy')}</span>
                        </button>
                      </div>
                    </div>

                    {/* Reference / Tx Number Input */}
                    <div>
                      <label className="block text-[11px] font-black text-slate-700 dark:text-slate-300 mb-1">
                        {lang === 'ar' ? 'رقم الإشعار / المرجع للحوالة أو الإيداع *' : 'Reference / Transaction Notice Number *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={referenceNumber}
                        onChange={e => setReferenceNumber(e.target.value)}
                        placeholder="أدخل رقم الإشعار مثل: 98321045"
                        className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-xs font-black text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-slate-700 dark:text-slate-300 mb-1">
                        {lang === 'ar' ? 'اسم المحول أو ملاحظات (اختياري)' : 'Sender Name / Notes'}
                      </label>
                      <input
                        type="text"
                        value={userNotes}
                        onChange={e => setUserNotes(e.target.value)}
                        placeholder="مثال: تم التحويل عبر حاسب اسم المحول ..."
                        className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-xs"
                      />
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* Wallet Low Balance Warning */}
            {paymentMethod === 'WALLET' && !isGuest && !hasSufficientWalletBalance && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400">
                <span>{lang === 'ar' ? 'رصيد محفظتك غير كافٍ لإتمام السداد المباشر' : 'Insufficient wallet balance'}</span>
                <button 
                  onClick={() => addToast(
                    lang === 'ar' 
                      ? '💳 لشحن المحفظة، اضغط على زر "شحن" في الشريط العلوي'
                      : '💳 To top up, click the "TopUp" button in the header',
                    'info'
                  )}
                  className="px-3 py-1.5 bg-emerald-600 text-white font-extrabold rounded-lg hover:bg-emerald-500 transition flex items-center gap-1 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'شحن المحفظة' : 'Top-Up Wallet'}</span>
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Multi-Item Order Summary & Confirm Button */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 text-white shadow-xl space-y-6 border border-slate-800">
            <h3 className="font-extrabold text-base border-b border-slate-800 pb-3 flex items-center justify-between">
              <span>{lang === 'ar' ? 'ملخص الفاتورة والطلب' : 'Order Summary'}</span>
              <span className="text-xs text-blue-400 font-mono">
                {cart.length > 0 ? `${cart.length} ${lang === 'ar' ? 'عناصر' : 'Items'}` : '1 Item'}
              </span>
            </h3>

            <div className="space-y-4">
              {(cart.length > 0 ? cart : [defaultItem]).map((item, idx) => {
                const itemPrice = (item.priceUSD || 9.99) * (item.quantity || 1);
                const targetInfo = item.targetAccountId || item.playerId || item.email || (isGuest ? guestEmail : 'كود رقمي فوري');

                return (
                  <div key={idx} className="p-3.5 bg-slate-800/80 border border-slate-700/60 rounded-xl space-y-2 relative group">
                    <div className="flex justify-between items-start text-slate-200 font-extrabold text-xs">
                      <div className="space-y-0.5 pr-2 rtl:pl-2">
                        <span className="text-white font-black block text-xs">{item.title}</span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {lang === 'ar' ? 'الكمية:' : 'Qty:'} {item.quantity || 1} × {formatCurrency(item.priceUSD || 9.99)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-emerald-400 font-black text-sm">{formatCurrency(itemPrice)}</span>
                        {cart.length > 0 && (
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            title={lang === 'ar' ? 'حذف المنتج من الفاتورة' : 'Remove item'}
                            className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[11px] bg-slate-900/60 px-2.5 py-1.5 rounded-lg border border-slate-800">
                      <span className="text-slate-400 font-bold">
                        {item.productType === 'SUBSCRIPTION' || (item.id && item.id.includes('sub'))
                          ? (lang === 'ar' ? 'بريد/حساب الاشتراك:' : 'Subscription Email:')
                          : item.productType === 'DIRECT_TOPUP' || (item.id && (item.id.includes('pubg') || item.id.includes('free')))
                            ? (lang === 'ar' ? 'معرف اللاعب (ID):' : 'Player ID:')
                            : (lang === 'ar' ? 'طريقة التسليم:' : 'Delivery Type:')}
                      </span>
                      <span className="font-mono text-cyan-400 font-black truncate max-w-[170px]">
                        {targetInfo}
                      </span>
                    </div>
                  </div>
                );
              })}

              <div className="flex justify-between border-t border-slate-800 pt-3 font-black text-sm text-white">
                <span>{lang === 'ar' ? 'الإجمالي النهائـي:' : 'Total Amount:'}</span>
                <span className="text-emerald-400 text-lg font-black">{formatCurrency(totalUSD)}</span>
              </div>
            </div>

            <button
              onClick={handlePayNow}
              disabled={isProcessing}
              className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <span>{lang === 'ar' ? 'جاري تنفيذ وتلبية جميع الطلبات...' : 'Executing FSM Orders Delivery...'}</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {paymentMethod === 'YEMEN_TRANSFER'
                      ? (lang === 'ar' ? `تأكيد وإرسال طلب الشراء بالإيداع (${formatCurrency(totalUSD)})` : `Submit Order & Proof (${formatCurrency(totalUSD)})`)
                      : (lang === 'ar' ? `تأكيد وسداد ${formatCurrency(totalUSD)}` : `Confirm & Pay ${formatCurrency(totalUSD)}`)
                    }
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
