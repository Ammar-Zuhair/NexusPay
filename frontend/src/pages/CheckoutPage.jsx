import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, CreditCard, Zap, CheckCircle2, Lock, ArrowRight, ArrowLeft,
  Smartphone, Wallet, Globe, UserCheck, UserX, Mail, Phone, PlusCircle, Key, User, Trash2, ShoppingCart
} from 'lucide-react';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

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

  // If user is logged in, default to Registered mode & WALLET payment, else Guest mode & VISA_MC
  const [isGuest, setIsGuest] = useState(!user);
  const [paymentMethod, setPaymentMethod] = useState(user ? 'WALLET' : 'VISA_MC');
  
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

  if (completedOrder) {
    const purchasedItems = completedOrder.itemsList || [defaultItem];
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6 animate-fade-in mt-12">
        <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-500 flex items-center justify-center mx-auto shadow-xl ring-8 ring-emerald-50 dark:ring-emerald-900/30">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">
            {lang === 'ar' ? 'تمت عملية التسليم والتنفيذ بنجاح!' : 'Order Executed Successfully!'}
          </h2>
          <p className="text-xs font-mono text-blue-600 dark:text-cyan-400 font-bold">
            رقم الطلب الرئيسي: {completedOrder.id} | إجمالي المنتجات: ({purchasedItems.length})
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-right rtl:text-right text-xs space-y-4 shadow-md">
          <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2 font-bold text-slate-900 dark:text-white">
            <span>{lang === 'ar' ? 'نوع الطلب:' : 'Order Mode:'}</span>
            <span className="text-blue-600 dark:text-cyan-400 font-bold">
              {completedOrder.isGuest ? (lang === 'ar' ? 'طلب زائر (بدون حساب)' : 'Guest Checkout') : (lang === 'ar' ? 'مستخدم مسجل' : 'Registered User')}
            </span>
          </div>

          {/* List of all purchased products */}
          <div className="space-y-3 pt-1">
            <h4 className="font-extrabold text-slate-900 dark:text-white text-xs border-b border-slate-100 dark:border-slate-800 pb-1.5">
              📦 {lang === 'ar' ? 'المنتجات المنفذة والمستلمة:' : 'Fulfilled Products:'}
            </h4>

            {purchasedItems.map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-1.5">
                <div className="flex justify-between font-black text-slate-900 dark:text-white">
                  <span>{item.title}</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency((item.priceUSD || 9.99) * (item.quantity || 1))}</span>
                </div>

                <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                  <span>
                    {item.productType === 'SUBSCRIPTION' || (item.id && item.id.includes('sub'))
                      ? (lang === 'ar' ? 'بريد/حساب الاشتراك:' : 'Subscription Email:')
                      : item.productType === 'DIRECT_TOPUP' || (item.id && (item.id.includes('pubg') || item.id.includes('free')))
                        ? (lang === 'ar' ? 'معرف اللاعب (ID):' : 'Player ID:')
                        : (lang === 'ar' ? 'طريقة التسليم:' : 'Delivery Type:')}
                  </span>
                  <span className="font-mono text-blue-600 dark:text-cyan-400 font-extrabold">
                    {item.targetAccountId || item.playerId || item.email || completedOrder.guestEmail || 'كود رقمي فوري'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-3 font-black text-sm text-slate-900 dark:text-white">
            <span>{lang === 'ar' ? 'المبلغ الإجمالي المدفوع:' : 'Total Amount Paid:'}</span>
            <span className="text-emerald-600 dark:text-emerald-400 text-base">{formatCurrency(completedOrder.totalUSD || totalUSD)}</span>
          </div>
        </div>

        {/* 🌟 Post-Purchase Customer Review Form */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-transparent border border-amber-500/30 text-right rtl:text-right space-y-4 shadow-lg">
          <div className="flex items-center gap-2 text-amber-500 font-extrabold text-sm">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
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
              <p className="text-slate-600 dark:text-slate-300">
                {lang === 'ar'
                  ? 'يسعدنا سماع رأيك وتجربتك بعد نجاح عملية الطلب لتطوير المنصة باستمرار.'
                  : 'We would love to get your feedback on your purchase experience.'}
              </p>

              {/* Star Rating Buttons */}
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700 dark:text-slate-200">{lang === 'ar' ? 'التقييم:' : 'Rating:'}</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className={`p-1 rounded-lg transition-transform hover:scale-110 ${
                        star <= reviewRating ? 'text-amber-400' : 'text-slate-300 dark:text-slate-700'
                      }`}
                    >
                      <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: star <= reviewRating ? "'FILL' 1" : "'FILL' 0" }}>
                        star
                      </span>
                    </button>
                  ))}
                </div>
                <span className="text-amber-500 font-bold font-mono">({reviewRating}/5)</span>
              </div>

              {/* Name Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  {lang === 'ar' ? 'الاسم الظاهر:' : 'Your Display Name:'}
                </label>
                <input
                  type="text"
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  placeholder={lang === 'ar' ? 'أدخل اسمك أو اسمك المستعار' : 'Enter your name'}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              {/* Comment Textarea */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  {lang === 'ar' ? 'تعليقك ورأيك:' : 'Your Comment:'}
                </label>
                <textarea
                  rows={2}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder={lang === 'ar' ? 'اكتب رأيك وتجربتك هنا...' : 'Write your feedback here...'}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <button
                type="button"
                disabled={isSubmittingReview}
                onClick={handleSubmitReview}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">send</span>
                <span>{isSubmittingReview ? (lang === 'ar' ? 'جاري الإرسال...' : 'Submitting...') : (lang === 'ar' ? 'إرسال التقييم والتعليق' : 'Submit Review')}</span>
              </button>
            </div>
          )}
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
  const [cardNum, setCardNum] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [paypalModalData, setPaypalModalData] = useState(null);

  const [paypalSdkLoaded, setPaypalSdkLoaded] = useState(false);
  const paypalBtnContainerRef = useRef(null);

  // 1. Preload PayPal JS SDK Script dynamically using backend config
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

        if (window.paypal) {
          markLoaded();
          return;
        }

        if (!existingScript) {
          const script = document.createElement('script');
          script.id = scriptId;
          script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&components=buttons`;
          script.async = true;
          script.onload = markLoaded;
          document.body.appendChild(script);
        } else {
          existingScript.addEventListener('load', markLoaded);
        }
      } catch (err) {
        console.error("Failed to load PayPal config:", err);
      }
    };

    fetchAndLoadSdk();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Render Official PayPal Smart JS Buttons when mounted
  useEffect(() => {
    if (paymentMethod === 'PAYPAL' && paypalSdkLoaded && window.paypal && paypalBtnContainerRef.current) {
      paypalBtnContainerRef.current.innerHTML = '';

      window.paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'paypal'
        },
        createOrder: async () => {
          const res = await fetch(`${API_BASE_URL}/payments/paypal/create-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              amountUSD: totalUSD, 
              currency: 'USD',
              items: cart.length > 0 ? cart : [defaultItem]
            })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to create PayPal order');
          return data.id;
        },
        onApprove: async (data) => {
          setIsProcessing(true);
          try {
            const capRes = await fetch(`${API_BASE_URL}/payments/paypal/capture-order`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId: data.orderID })
            });
            const capData = await capRes.json();
            if (!capRes.ok) throw new Error(capData.error || 'Failed to capture PayPal payment');

            const itemsToProcess = cart.length > 0 ? cart : [defaultItem];
            const processedOrders = [];

            for (const item of itemsToProcess) {
              const itemTotal = (item.priceUSD || 9.99) * (item.quantity || 1);
              const order = await executeOrderCheckout({
                productId: item.productId || item.id,
                productTitle: item.title,
                targetAccountId: item.targetAccountId || item.playerId || item.email || 'N/A',
                totalUSD: itemTotal,
                paymentMethod: 'PAYPAL',
                paymentDetails: { paypalOrderId: data.orderID, captureId: capData.captureId },
                isGuest: isGuest,
                guestEmail: isGuest ? guestEmail : (user?.email || ''),
                guestPhone: isGuest ? guestPhone : (user?.phone || '')
              });
              processedOrders.push(order);
            }

            setCompletedOrder({
              ...processedOrders[0],
              itemCount: itemsToProcess.length,
              itemsList: itemsToProcess,
              processedOrders: processedOrders,
              totalUSD: totalUSD
            });
          } catch (err) {
            alert((lang === 'ar' ? 'فشلت عملية الخصم في PayPal: ' : 'PayPal capture error: ') + err.message);
          } finally {
            setIsProcessing(false);
          }
        },
        onError: (err) => {
          console.error("PayPal Smart Button Error:", err);
        }
      }).render(paypalBtnContainerRef.current);
    }
  }, [paymentMethod, paypalSdkLoaded, totalUSD, cart, isGuest, guestEmail, guestPhone]);

  const handlePayNow = async () => {
    if (isGuest && !guestEmail.trim()) {
      alert(lang === 'ar' ? 'يرجى إدخال البريد الإلكتروني لاستلام الكود والإيصال' : 'Please enter email address for delivery');
      return;
    }

    if (paymentMethod === 'VISA_MC' && !cardNum.trim()) {
      alert(lang === 'ar' ? 'يرجى إدخال رقم بطاقة MasterCard / Visa المصرفية' : 'Please enter your MasterCard / Visa card number');
      return;
    }

    if (!isGuest && paymentMethod === 'WALLET' && !hasSufficientWalletBalance) {
      setShowTopUpPrompt(true);
      return;
    }

    setIsProcessing(true);

    // PAYPAL EXPRESS CHECKOUT FLOW
    if (paymentMethod === 'PAYPAL') {
      try {
        const res = await fetch(`${API_BASE_URL}/payments/paypal/create-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            amountUSD: totalUSD, 
            currency: 'USD',
            items: cart.length > 0 ? cart : [defaultItem]
          })
        });
        const paypalOrder = await res.json();

        if (!res.ok) {
          throw new Error(paypalOrder.error || 'Failed to create PayPal order');
        }

        if (paypalOrder.mode === 'LIVE_PAYPAL' && paypalOrder.approvalUrl) {
          window.location.href = paypalOrder.approvalUrl;
          return;
        }

        // Open PayPal Approval & Capture Modal
        setPaypalModalData(paypalOrder);
        setIsProcessing(false);
        return;
      } catch (err) {
        alert((lang === 'ar' ? 'فشل الاتصال بـ PayPal: ' : 'PayPal connection error: ') + err.message);
        setIsProcessing(false);
        return;
      }
    }

    // REGULAR CHECKOUT (WALLET, VISA_MC)
    try {
      const itemsToProcess = cart.length > 0 ? cart : [defaultItem];
      const processedOrders = [];

      for (const item of itemsToProcess) {
        const itemTotal = (item.priceUSD || 9.99) * (item.quantity || 1);
        const order = await executeOrderCheckout({
          productId: item.productId || item.id,
          productTitle: item.title,
          targetAccountId: item.targetAccountId || item.playerId || item.email || 'N/A',
          totalUSD: itemTotal,
          paymentMethod: paymentMethod,
          paymentDetails: paymentMethod === 'VISA_MC' 
            ? { maskedCard: cardNum.slice(-4), cardName } 
            : {},
          isGuest: isGuest,
          guestEmail: isGuest ? guestEmail : (user?.email || ''),
          guestPhone: isGuest ? guestPhone : (user?.phone || '')
        });
        processedOrders.push(order);
      }

      const primaryOrder = processedOrders[0];
      setCompletedOrder({
        ...primaryOrder,
        itemCount: itemsToProcess.length,
        itemsList: itemsToProcess,
        processedOrders: processedOrders,
        totalUSD: totalUSD
      });
    } catch (err) {
      console.error("Checkout execution error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmPayPalApproval = async () => {
    if (!paypalModalData) return;
    setIsProcessing(true);
    try {
      const capRes = await fetch(`${API_BASE_URL}/payments/paypal/capture-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: paypalModalData.id })
      });
      const capData = await capRes.json();

      if (!capRes.ok) {
        throw new Error(capData.error || 'Failed to capture PayPal payment');
      }

      const itemsToProcess = cart.length > 0 ? cart : [defaultItem];
      const processedOrders = [];

      for (const item of itemsToProcess) {
        const itemTotal = (item.priceUSD || 9.99) * (item.quantity || 1);
        const order = await executeOrderCheckout({
          productId: item.productId || item.id,
          productTitle: item.title,
          targetAccountId: item.targetAccountId || item.playerId || item.email || 'N/A',
          totalUSD: itemTotal,
          paymentMethod: 'PAYPAL',
          paymentDetails: { paypalOrderId: paypalModalData.id, captureId: capData.captureId },
          isGuest: isGuest,
          guestEmail: isGuest ? guestEmail : (user?.email || ''),
          guestPhone: isGuest ? guestPhone : (user?.phone || '')
        });
        processedOrders.push(order);
      }

      setPaypalModalData(null);
      setCompletedOrder({
        ...processedOrders[0],
        itemCount: itemsToProcess.length,
        itemsList: itemsToProcess,
        processedOrders: processedOrders,
        totalUSD: totalUSD
      });
    } catch (err) {
      alert((lang === 'ar' ? 'فشلت عملية الخصم في PayPal: ' : 'PayPal capture error: ') + err.message);
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
      id: 'VISA_MC', 
      title: lang === 'ar' ? 'بطاقة ماستركارد / فيزا البنكية (MasterCard / Visa)' : 'MasterCard / Visa Card', 
      desc: lang === 'ar' ? 'سداد مباشر وتشفير آمن ببطاقات ماستركارد وفيزا المصرفية' : 'Direct encrypted credit card payment', 
      icon: CreditCard,
      badge: 'MasterCard / Visa'
    },
    { 
      id: 'PAYPAL', 
      title: lang === 'ar' ? 'بايبال العالمي (PayPal Checkout)' : 'PayPal Instant Checkout', 
      desc: lang === 'ar' ? 'الدفع السريع والمباشر عبر حساب PayPal' : 'Instant PayPal account checkout', 
      icon: Globe,
      badge: 'PayPal'
    },
    { 
      id: 'APPLE_PAY', 
      title: 'Apple Pay (أبل باي)', 
      desc: lang === 'ar' ? 'سداد فوري بنقرة واحدة عبر أجهزة أبل' : 'Instant 1-click device checkout', 
      icon: Smartphone 
    }
  ];

  if (completedOrder) {
    const purchasedItems = completedOrder.itemsList || [defaultItem];
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6 animate-fade-in mt-12">
        <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-500 flex items-center justify-center mx-auto shadow-xl ring-8 ring-emerald-50 dark:ring-emerald-900/30">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">
            {lang === 'ar' ? 'تمت عملية التسليم والتنفيذ بنجاح!' : 'Order Executed Successfully!'}
          </h2>
          <p className="text-xs font-mono text-blue-600 dark:text-cyan-400 font-bold">
            رقم الطلب الرئيسي: {completedOrder.id} | إجمالي المنتجات: ({purchasedItems.length})
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-right rtl:text-right text-xs space-y-4 shadow-md">
          <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2 font-bold text-slate-900 dark:text-white">
            <span>{lang === 'ar' ? 'نوع الطلب:' : 'Order Mode:'}</span>
            <span className="text-blue-600 dark:text-cyan-400 font-bold">
              {completedOrder.isGuest ? (lang === 'ar' ? 'طلب زائر (بدون حساب)' : 'Guest Checkout') : (lang === 'ar' ? 'مستخدم مسجل' : 'Registered User')}
            </span>
          </div>

          {/* List of all purchased products */}
          <div className="space-y-3 pt-1">
            <h4 className="font-extrabold text-slate-900 dark:text-white text-xs border-b border-slate-100 dark:border-slate-800 pb-1.5">
              📦 {lang === 'ar' ? 'المنتجات المنفذة والمستلمة:' : 'Fulfilled Products:'}
            </h4>

            {purchasedItems.map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-1.5">
                <div className="flex justify-between font-black text-slate-900 dark:text-white">
                  <span>{item.title}</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency((item.priceUSD || 9.99) * (item.quantity || 1))}</span>
                </div>

                <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                  <span>
                    {item.productType === 'SUBSCRIPTION' || (item.id && item.id.includes('sub'))
                      ? (lang === 'ar' ? 'بريد/حساب الاشتراك:' : 'Subscription Email:')
                      : item.productType === 'DIRECT_TOPUP' || (item.id && (item.id.includes('pubg') || item.id.includes('free')))
                        ? (lang === 'ar' ? 'معرف اللاعب (ID):' : 'Player ID:')
                        : (lang === 'ar' ? 'طريقة التسليم:' : 'Delivery Type:')}
                  </span>
                  <span className="font-mono text-blue-600 dark:text-cyan-400 font-extrabold">
                    {item.targetAccountId || item.playerId || item.email || completedOrder.guestEmail || 'كود رقمي فوري'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-3 font-black text-sm text-slate-900 dark:text-white">
            <span>{lang === 'ar' ? 'المبلغ الإجمالي المدفوع:' : 'Total Amount Paid:'}</span>
            <span className="text-emerald-600 dark:text-emerald-400 text-base">{formatCurrency(completedOrder.totalUSD || totalUSD)}</span>
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
              : 'You have removed all products from your cart. Browse our store to select items.'}
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

            {/* MasterCard / Visa Interactive Details Input Form */}
            {paymentMethod === 'VISA_MC' && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <span>💳 {lang === 'ar' ? 'تفاصيل بطاقة ماستركارد / فيزا (MasterCard / Visa)' : 'MasterCard / Visa Card Details'}</span>
                  </span>
                  <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    SSL 256-Bit Encrypted
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      {lang === 'ar' ? 'رقم بطاقة ماستركارد / فيزا *' : 'Card Number *'}
                    </label>
                    <input
                      type="text"
                      maxLength={19}
                      value={cardNum}
                      onChange={(e) => setCardNum(e.target.value)}
                      placeholder="5412 8931 0924 1109  أو  4532 9901 2341 8921"
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-xs font-black text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        {lang === 'ar' ? 'تاريخ الانتهاء (MM/YY)' : 'Expiry Date (MM/YY)'}
                      </label>
                      <input
                        type="text"
                        maxLength={5}
                        value={cardExp}
                        onChange={(e) => setCardExp(e.target.value)}
                        placeholder="12/28"
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-xs font-black text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        {lang === 'ar' ? 'رمز الأمان (CVC / CVV)' : 'Security Code (CVC)'}
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="•••"
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-xs font-black text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      {lang === 'ar' ? 'اسم صاحب البطاقة' : 'Cardholder Name'}
                    </label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="AMMAR ZUHAIR"
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-black text-slate-900 dark:text-white uppercase"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Official PayPal Smart JS Buttons */}
            {paymentMethod === 'PAYPAL' && (
              <div className="p-3 bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/30 rounded-2xl animate-fade-in">
                <div ref={paypalBtnContainerRef} className="min-h-[50px] flex items-center justify-center">
                  {!paypalSdkLoaded && (
                    <div className="flex items-center gap-2 text-xs font-black text-amber-800 dark:text-amber-300 py-3">
                      <span className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></span>
                      <span>{lang === 'ar' ? 'جاري فتح زر PayPal...' : 'Loading PayPal...'}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

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

        {/* Right Column: Multi-Item Order Summary */}
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
                            className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 rounded-lg transition"
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
              className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-lg transition flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <span>{lang === 'ar' ? 'جاري تنفيذ وتلبية جميع الطلبات...' : 'Executing FSM Orders Delivery...'}</span>
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

      {/* PayPal Official Login & Approval Popup Modal */}
      {paypalModalData && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 text-center rtl:text-right text-right">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-extrabold italic text-xl tracking-tighter text-[#003087]">Pay<span className="text-[#0079c1]">Pal</span></span>
                <span className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-0.5 rounded-full font-black">
                  PayPal Checkout Window
                </span>
              </div>
              <button 
                onClick={() => setPaypalModalData(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 text-xs space-y-2">
              <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                <span>{lang === 'ar' ? 'المستفيد:' : 'Merchant:'}</span>
                <span className="font-black text-slate-900 dark:text-white">NexusPay Store</span>
              </div>
              <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                <span>{lang === 'ar' ? 'معرف طلب PayPal:' : 'PayPal Order ID:'}</span>
                <span className="font-mono text-blue-600 dark:text-cyan-400 font-bold">{paypalModalData.id}</span>
              </div>
              <div className="flex justify-between font-black text-sm text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                <span>{lang === 'ar' ? 'المبلغ المطلوب خصمه:' : 'Amount to Charge:'}</span>
                <span className="text-emerald-600 dark:text-emerald-400 text-base">{formatCurrency(totalUSD)}</span>
              </div>
            </div>

            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {lang === 'ar'
                ? 'اضغط على زر الخصم أدناه للموافقة على عملية الدفع وخصم المبلغ رسمياً من حساب PayPal الخاص بك وتأكيد الطلب.'
                : 'Click below to approve payment and capture funds from your PayPal account.'}
            </p>

            <div className="space-y-2">
              <button
                onClick={handleConfirmPayPalApproval}
                disabled={isProcessing}
                className="w-full py-3.5 bg-[#ffc439] hover:bg-[#f2ba32] text-[#003087] font-black text-sm rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-[#003087] border-t-transparent rounded-full animate-spin"></span>
                    <span>{lang === 'ar' ? 'جاري السحب والخصم من PayPal...' : 'Capturing PayPal Payment...'}</span>
                  </span>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5 text-[#003087]" />
                    <span>{lang === 'ar' ? `الموافقة والدفع برصيد PayPal (${formatCurrency(totalUSD)})` : `Approve & Pay via PayPal (${formatCurrency(totalUSD)})`}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setPaypalModalData(null)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                {lang === 'ar' ? 'إلغاء وتعديل طريقة الدفع' : 'Cancel'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
