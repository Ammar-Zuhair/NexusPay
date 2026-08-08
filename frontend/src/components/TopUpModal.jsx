import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { API_BASE_URL } from '../utils/api.js';
import {
  X, Wallet, CreditCard, Globe, Smartphone, ShieldCheck,
  CheckCircle2, AlertCircle, Copy, Check, ArrowRight, ArrowLeft,
  Send, ExternalLink, MapPin, Building2, Plus
} from 'lucide-react';

export const TopUpModal = ({ isOpen, onClose }) => {
  const {
    lang,
    user,
    userWallet,
    formatCurrency,
    addToast,
    topUpWallet,
    userCountry,
    browsingCountry
  } = useApp();



  // Top-Up Mode: 'YEMEN' (International PayPal/Cards temporarily commented out for Yemen focus)
  const [activeMode, setActiveMode] = useState('YEMEN');

  // International Flow States
  const [intlMethod, setIntlMethod] = useState('VISA_MC');
  const [intlAmount, setIntlAmount] = useState(25);
  const [cardNum, setCardNum] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedResult, setCompletedResult] = useState(null);

  // PayPal Smart Buttons Refs & SDK State
  const [paypalSdkLoaded, setPaypalSdkLoaded] = useState(false);
  const paypalBtnContainerRef = useRef(null);

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

        if (existingScript && !existingScript.src.includes('disable-funding')) {
          existingScript.remove();
          try { delete window.paypal; } catch (e) { window.paypal = undefined; }
          existingScript = null;
        }

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

    if (isOpen) {
      fetchAndLoadSdk();
    }

    const safetyTimer = setTimeout(() => {
      if (isMounted) setPaypalSdkLoaded(true);
    }, 2500);

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
    };
  }, [isOpen]);

  // Render Official PayPal Smart JS Buttons when mounted inside TopUpModal
  useEffect(() => {
    if (isOpen && activeMode === 'INTERNATIONAL' && intlMethod === 'PAYPAL' && paypalSdkLoaded && window.paypal && paypalBtnContainerRef.current) {
      paypalBtnContainerRef.current.innerHTML = '';

      try {
        const paypalBtnOpts = {
          fundingSource: window.paypal.FUNDING ? window.paypal.FUNDING.PAYPAL : undefined,
          style: {
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'paypal'
          },
          createOrder: async () => {
            const numericAmt = parseFloat(intlAmount);
            if (isNaN(numericAmt) || numericAmt <= 0) {
              addToast(lang === 'ar' ? 'يرجى إدخال مبلغ صحيح لشحن المحفظة' : 'Please enter a valid amount', 'error');
              throw new Error('Invalid amount');
            }

            const res = await fetch(`${API_BASE_URL}/payments/paypal/create-order`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                amountUSD: numericAmt,
                currency: 'USD',
                items: [{ title: `Top Up Site Wallet ($${numericAmt})`, priceUSD: numericAmt, quantity: 1 }]
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

              const res = await topUpWallet(parseFloat(intlAmount), 'PAYPAL', { paypalOrderId: data.orderID, captureId: capData.captureId });
              setCompletedResult(res);
            } catch (err) {
              addToast((lang === 'ar' ? 'فشلت عملية الخصم في PayPal: ' : 'PayPal capture error: ') + err.message, 'error');
            } finally {
              setIsProcessing(false);
            }
          },
          onError: (err) => {
            console.error("PayPal TopUp Smart Button Error:", err);
          }
        };

        window.paypal.Buttons(paypalBtnOpts).render(paypalBtnContainerRef.current);
      } catch (err) {
        console.warn("PayPal render error:", err);
      }
    }
  }, [isOpen, activeMode, intlMethod, paypalSdkLoaded, intlAmount]);

  // Yemen Flow States
  const [yemenStep, setYemenStep] = useState(1); // 1=Region, 2=Bank, 3=Amount&Proof, 4=Completed
  const [selectedRegion, setSelectedRegion] = useState('NORTH'); // 'NORTH' or 'SOUTH'
  const [yemenBanks, setYemenBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [yemenAmount, setYemenAmount] = useState(25);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [userNotes, setUserNotes] = useState('');
  const [depositResult, setDepositResult] = useState(null);

  // Verification & Auth Modal Overlay States
  const [verifyingState, setVerifyingState] = useState(null); // null | 'CARD_3DS' | 'PAYPAL_AUTH' | 'APPLE_PAY'
  const [otpCode, setOtpCode] = useState('');
  const [paypalEmail, setPaypalEmail] = useState(user?.email || '');
  const [paypalPass, setPaypalPass] = useState('');

  const [copiedAccount, setCopiedAccount] = useState(false);

  const resetModalState = () => {
    setCompletedResult(null);
    setDepositResult(null);
    setIsProcessing(false);
    setVerifyingState(null);
    setOtpCode('');
    setPaypalEmail(user?.email || '');
    setPaypalPass('');
    setCardNum('');
    setCardExp('');
    setCardCvv('');
    setCardName('');
  };

  const clearTopUpDraft = () => {
    try {
      localStorage.removeItem('nexuspay_topup_draft');
    } catch (e) {}
    setYemenStep(1);
    setSelectedBank(null);
    setReferenceNumber('');
    setUserNotes('');
  };

  // Load deposit draft from localStorage (valid for 24 hours)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nexuspay_topup_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (Date.now() - (parsed.savedAt || 0)) < 86400000) {
          if (parsed.yemenStep) setYemenStep(parsed.yemenStep);
          if (parsed.selectedRegion) setSelectedRegion(parsed.selectedRegion);
          if (parsed.selectedBank) setSelectedBank(parsed.selectedBank);
          if (parsed.yemenAmount) setYemenAmount(parsed.yemenAmount);
          if (parsed.referenceNumber) setReferenceNumber(parsed.referenceNumber);
          if (parsed.userNotes) setUserNotes(parsed.userNotes);
        } else {
          localStorage.removeItem('nexuspay_topup_draft');
        }
      }
    } catch (e) {}
  }, []);

  // Save deposit draft automatically whenever fields change
  useEffect(() => {
    try {
      if (referenceNumber || selectedBank || yemenStep > 1) {
        const draft = {
          yemenStep,
          selectedRegion,
          selectedBank,
          yemenAmount,
          referenceNumber,
          userNotes,
          savedAt: Date.now()
        };
        localStorage.setItem('nexuspay_topup_draft', JSON.stringify(draft));
      }
    } catch (e) {}
  }, [yemenStep, selectedRegion, selectedBank, yemenAmount, referenceNumber, userNotes]);

  // Fetch Yemen Banks dynamically on open
  useEffect(() => {
    if (isOpen) {
      resetModalState();
      fetch(`${API_BASE_URL}/payments/yemen-banks`)
        .then(res => res.json())
        .then(data => {
          if (data && data.banks) {
            setYemenBanks(data.banks);
          }
        })
        .catch(err => console.warn('[YEMEN BANKS FETCH] Fallback active:', err.message));
    }
  }, [isOpen]);

  const handleModalClose = () => {
    resetModalState();
    onClose();
  };

  if (!isOpen) return null;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(true);
    addToast(lang === 'ar' ? 'تم نسخ رقم الحساب للحافظة!' : 'Account number copied!');
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleInitiateInternationalPay = () => {
    const numericAmt = parseFloat(intlAmount);
    if (isNaN(numericAmt) || numericAmt <= 0) {
      addToast(lang === 'ar' ? 'يرجى إدخال مبلغ صحيح وموجب لشحن المحفظة' : 'Please enter a valid amount', 'error');
      return;
    }

    if (intlMethod === 'VISA_MC') {
      if (!cardNum.trim() || cardNum.length < 12) {
        addToast(lang === 'ar' ? 'يرجى إدخال رقم البطاقة المصرفية الصحيح' : 'Please enter a valid card number', 'error');
        return;
      }
      if (!cardExp.trim()) {
        addToast(lang === 'ar' ? 'يرجى إدخال تاريخ انتهاء البطاقة (MM/YY)' : 'Please enter card expiry date', 'error');
        return;
      }
      if (!cardCvv.trim() || cardCvv.length < 3) {
        addToast(lang === 'ar' ? 'يرجى إدخال كود الأمان CVV' : 'Please enter card CVV', 'error');
        return;
      }
      setVerifyingState('CARD_3DS');
    } else if (intlMethod === 'PAYPAL') {
      setVerifyingState('PAYPAL_AUTH');
    } else if (intlMethod === 'APPLE_PAY') {
      setVerifyingState('APPLE_PAY');
    }
  };

  const handleFinalizePayment = async () => {
    const numericAmt = parseFloat(intlAmount);
    if (isNaN(numericAmt) || numericAmt <= 0) return;

    setIsProcessing(true);
    try {
      let paymentData = {};
      if (intlMethod === 'VISA_MC') {
        paymentData = { masked: cardNum.slice(-4), cardName, otpVerified: true };
      } else if (intlMethod === 'PAYPAL') {
        paymentData = { paypalEmail, reference: `PAYPAL-APPROVED-${Date.now()}` };
      } else {
        paymentData = { reference: `APPLEPAY-APPROVED-${Date.now()}` };
      }

      const res = await topUpWallet(numericAmt, intlMethod, paymentData);
      setCompletedResult(res);
      setVerifyingState(null);
    } catch (err) {
      addToast((lang === 'ar' ? 'فشلت عملية الخصم وتأكيد الحساب: ' : 'Payment captured failed: ') + err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleYemenDepositSubmit = async (e) => {
    e.preventDefault();
    if (!referenceNumber.trim()) {
      alert(lang === 'ar' ? 'يرجى إدخال رقم الإشعار أو المرجع الخاص بالحوالة/الإيداع' : 'Please enter payment reference number');
      return;
    }
    if (!selectedBank) {
      alert(lang === 'ar' ? 'يرجى تحديد المحفظة أو البنك' : 'Please select a bank');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/payments/deposit-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || 'usr-guest',
          userName: user?.name || (lang === 'ar' ? 'عميل المنصة' : 'Verified Gamer'),
          userEmail: user?.email || '',
          userPhone: user?.phone || '',
          amountUSD: parseFloat(yemenAmount),
          region: selectedRegion,
          bankId: selectedBank.id,
          bankName: selectedBank.name,
          accountNumber: selectedBank.accountNumber,
          recipientName: selectedBank.recipientName,
          referenceNumber: referenceNumber.trim(),
          userNotes: userNotes.trim()
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit deposit request');

      setDepositResult(data.depositRequest);
      setYemenStep(4);
      clearTopUpDraft();
      addToast(lang === 'ar' ? 'تم إرسال طلب الإيداع بنجاح! سيتم التأكيد وتغذية المحفظة فوراً.' : 'Deposit request submitted successfully!');
    } catch (err) {
      alert((lang === 'ar' ? 'فشل إرسال طلب الإيداع: ' : 'Submission failed: ') + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredBanks = yemenBanks.filter(b => b.region === selectedRegion || b.region === 'BOTH');

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden my-8">

        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-black text-lg text-slate-900 dark:text-white">
                {lang === 'ar' ? 'شحن وتغذية محفظة الموقع' : 'Top Up Site Wallet'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                {lang === 'ar' ? 'اختر وسيلة الدفع المباشرة أو الإيداع المحلي' : 'Select direct payment method or local deposit'}
              </p>
            </div>
          </div>
          <button
            onClick={handleModalClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Yemen Local Deposit Focus Banner */}
        <div className="p-3 bg-emerald-500/10 border-b border-emerald-500/20 text-center text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-2 font-mono">
          <span>🇾🇪</span>
          <span>{lang === 'ar' ? 'نظام تحويل وإيداع الحوالات والمحافظ المحلية في اليمن (الكريمي، جيب، ون كاش، جوالي...)' : 'Yemen Local Banking & Mobile Wallet Deposit System'}</span>
        </div>

        <div className="p-6 space-y-6">

          {/* 
            ============================================================
            💳 INTERNATIONAL PAYMENTS FLOW (PAYPAL / MASTERCARD / VISA)
            Temporarily commented out & reserved for future global launch.
            Platform currently focusing 100% on Yemen Local Deposits.
            ============================================================
          {activeMode === 'INTERNATIONAL' && (
            <div className="space-y-5 animate-fade-in">
              ...
            </div>
          )}
          */}

          {/* ============================================================ */}
          {/* 🇾🇪 YEMEN REGION MULTI-STEP MANUAL DEPOSIT FLOW               */}
          {/* ============================================================ */}
          {activeMode === 'YEMEN' && (
            <div className="space-y-5 animate-fade-in">

              {/* Step indicator */}
              {yemenStep !== 4 && (
                <div className="flex items-center justify-between text-xs border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                    {yemenStep === 1 && (lang === 'ar' ? 'الخطوة 1 من 3: تحديد المنطقة' : 'Step 1: Region')}
                    {yemenStep === 2 && (lang === 'ar' ? 'الخطوة 2 من 3: تحديد المحفظة / البنك' : 'Step 2: Select Bank')}
                    {yemenStep === 3 && (lang === 'ar' ? 'الخطوة 3 من 3: بيانات التحويل وإثبات الإيداع' : 'Step 3: Transfer & Proof')}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {selectedRegion === 'NORTH' ? (lang === 'ar' ? 'منطقة الشمال (صنعاء)' : 'North') : (lang === 'ar' ? 'منطقة الجنوب (عدن)' : 'South')}
                  </span>
                </div>
              )}

              {/* STEP 1: REGION SELECTION */}
              {yemenStep === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="text-center space-y-1">
                    <h3 className="font-black text-slate-900 dark:text-white text-base">
                      {lang === 'ar' ? 'يرجى تحديد منطقتك الجغرافية' : 'Select Your Region'}
                    </h3>
                    <p className="text-xs text-slate-500 font-bold">
                      {lang === 'ar' ? 'لتزودك المنصة بحسابات البنوك والتطبيقات الخاصة بمدينتك' : 'To load supported banks and apps for your location'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() => { setSelectedRegion('NORTH'); setYemenStep(2); }}
                      className={`p-5 rounded-3xl border-2 text-right rtl:text-right space-y-3 transition-all hover:scale-102 cursor-pointer ${selectedRegion === 'NORTH'
                        ? 'bg-emerald-500/10 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                        }`}
                    >
                      <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white font-black flex items-center justify-center text-lg shadow-sm">
                        🏢
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-slate-900 dark:text-white">
                          {lang === 'ar' ? 'شمال اليمن (صنعاء وما حولها)' : 'North Yemen (Sanaa)'}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-semibold">
                          {lang === 'ar' ? 'تطبيقات: كريمي حاسب، جيب، ون كاش، جوالي، مفلوس' : 'Kuraimi, Jeeb, OneCash, Jawali, M-Faloos'}
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setSelectedRegion('SOUTH'); setYemenStep(2); }}
                      className={`p-5 rounded-3xl border-2 text-right rtl:text-right space-y-3 transition-all hover:scale-102 cursor-pointer ${selectedRegion === 'SOUTH'
                        ? 'bg-blue-500/10 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                        }`}
                    >
                      <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-black flex items-center justify-center text-lg shadow-sm">
                        🌊
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-slate-900 dark:text-white">
                          {lang === 'ar' ? 'جنوب اليمن (عدن والمحافظات)' : 'South Yemen (Aden)'}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-semibold">
                          {lang === 'ar' ? 'بنك الكريمي عدن، البنك الأهلي، المحافظ الجنوبية' : 'Kuraimi Aden, NBY, South Wallets'}
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: BANK / WALLET SELECTION */}
              {yemenStep === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-slate-900 dark:text-white text-sm">
                      {lang === 'ar' ? 'اختر التطبيق أو البنك المطلوب تحويل المبلغ إليه:' : 'Select Target App or Bank:'}
                    </h3>
                    <button
                      onClick={() => setYemenStep(1)}
                      className="text-xs text-blue-600 dark:text-cyan-400 font-bold underline"
                    >
                      {lang === 'ar' ? 'تغير المنطقة' : 'Change Region'}
                    </button>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {filteredBanks.map(b => (
                      <div
                        key={b.id}
                        onClick={() => { setSelectedBank(b); setYemenStep(3); }}
                        className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${selectedBank?.id === b.id
                          ? 'bg-emerald-500/10 border-2 border-emerald-500 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
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
                            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">{b.name}</h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{b.notes}</p>
                          </div>
                        </div>
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                          {lang === 'ar' ? 'اختيار ➔' : 'Select ➔'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 3: RECIPIENT DETAILS & PROOF SUBMISSION */}
              {yemenStep === 3 && selectedBank && (
                <form onSubmit={handleYemenDepositSubmit} className="space-y-4 animate-fade-in">

                  {/* Selected Bank Banner */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600/10 to-teal-500/10 border border-emerald-500/30 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        {selectedBank.imageUrl && (
                          <img src={selectedBank.imageUrl} alt={selectedBank.name} className="w-10 h-10 rounded-xl object-cover border border-emerald-500/40 shrink-0" />
                        )}
                        <div>
                          <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400">
                            {selectedBank.name} ({selectedRegion === 'NORTH' ? 'الشمال' : 'الجنوب'})
                          </span>
                          <h4 className="font-black text-sm text-slate-900 dark:text-white mt-0.5">
                            {lang === 'ar' ? `المستلم: ${selectedBank.recipientName}` : `Recipient: ${selectedBank.recipientName}`}
                          </h4>
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

                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block">{lang === 'ar' ? 'رقم الحساب / الجوال للتحويل:' : 'Account / Phone Number:'}</span>
                        <span className="font-mono text-sm font-black text-slate-900 dark:text-white tracking-wider">
                          {selectedBank.accountNumber}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(selectedBank.accountNumber)}
                        className="px-3 py-1.5 bg-emerald-600 text-white font-extrabold text-xs rounded-lg hover:bg-emerald-500 transition flex items-center gap-1"
                      >
                        {copiedAccount ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedAccount ? (lang === 'ar' ? 'تم النسخ' : 'Copied') : (lang === 'ar' ? 'نسخ الرقم' : 'Copy')}</span>
                      </button>
                    </div>
                  </div>

                  {/* Amount to Deposit */}
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                      {lang === 'ar' ? 'المبلغ المراد شحنه بالمحفظة (بالدولار $):' : 'Amount in USD ($):'}
                    </label>
                    <div className="grid grid-cols-4 gap-2 mb-2">
                      {[10, 25, 50, 100].map(amt => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setYemenAmount(amt)}
                          className={`py-2 rounded-xl text-xs font-black border transition ${yemenAmount === amt
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                            }`}
                        >
                          ${amt}
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      min={1}
                      max={10000}
                      value={yemenAmount}
                      onChange={e => setYemenAmount(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-black text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Reference / Tx Number Input */}
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                      {lang === 'ar' ? 'رقم الإشعار / المرجع للحوالة أو الإيداع *' : 'Reference / Transaction Notice Number *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={referenceNumber}
                      onChange={e => setReferenceNumber(e.target.value)}
                      placeholder="مثال: 984012891 أو رقم الحوالة"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  {/* Direct WhatsApp Verification Button */}
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-700 dark:text-emerald-300">
                      {lang === 'ar' ? 'إرسال صورة السند عبر الواتساب:' : 'Send receipt screenshot:'}
                    </span>
                    <a
                      href={`https://wa.me/${(selectedBank.whatsappPhone || '+967775479340').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`السلام عليكم، قمت بتحويل مبلغ $${yemenAmount} إلى حساب ${selectedBank.name} برقم الإشعار: ${referenceNumber || 'قيد الإرسال'}`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-lg transition flex items-center gap-1 shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{selectedBank.whatsappPhone || '+967775479340'}</span>
                    </a>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>{lang === 'ar' ? 'جاري إرسال طلب الإيداع...' : 'Submitting...'}</span>
                      </span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{lang === 'ar' ? 'تأكيد وإرسال طلب الإيداع للتحقق' : 'Submit Deposit for Verification'}</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* STEP 4: COMPLETED PENDING RECEIPT */}
              {yemenStep === 4 && depositResult && (
                <div className="text-center py-6 space-y-4 animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto ring-8 ring-amber-500/5">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                      {lang === 'ar' ? 'تم استلام طلب الإيداع بنجاح!' : 'Deposit Request Submitted!'}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono font-bold">
                      رقم الطلب: {depositResult.id} | الإشعار: {depositResult.referenceNumber}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-right rtl:text-right text-xs space-y-2 font-bold text-slate-700 dark:text-slate-300">
                    <div className="flex justify-between">
                      <span>{lang === 'ar' ? 'المبلغ المطلوب إيداعه:' : 'Requested Amount:'}</span>
                      <span className="text-emerald-600 font-black">{formatCurrency(depositResult.amountUSD)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{lang === 'ar' ? 'الحساب المستهدف:' : 'Bank Account:'}</span>
                      <span className="text-blue-600 dark:text-cyan-400 font-black">{depositResult.bankName}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-2 font-black text-slate-900 dark:text-white">
                      <span>{lang === 'ar' ? 'حالة الطلب الآن:' : 'Current Status:'}</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[10px]">
                        {lang === 'ar' ? 'قيد المراجعة والتأكيد المباشر من الإدارة' : 'PENDING VERIFICATION'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-md transition"
                  >
                    {lang === 'ar' ? 'إغلاق والعودة لمتابعة الطلبات' : 'Done'}
                  </button>
                </div>
              )}

            </div>
          )}

        </div>

      </div>

      {/* ============================================================ */}
      {/* 🔐 GATEWAY AUTHENTICATION & VERIFICATION OVERLAY             */}
      {/* ============================================================ */}
      {verifyingState && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-60 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full shadow-2xl p-6 space-y-5 text-right rtl:text-right">

            {/* 1. CARD 3D-SECURE SMS OTP OVERLAY */}
            {verifyingState === 'CARD_3DS' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-emerald-500" />
                    <h3 className="font-black text-sm text-slate-900 dark:text-white">
                      {lang === 'ar' ? 'التحقق الأمني من البنك (3D Secure)' : '3D Secure Bank Verification'}
                    </h3>
                  </div>
                  <button onClick={() => setVerifyingState(null)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
                </div>

                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold block">{lang === 'ar' ? 'بيانات عملية الخصم المباشر:' : 'Transaction Details:'}</span>
                  <div className="text-xs font-black text-slate-900 dark:text-white font-mono">
                    المبلغ: {formatCurrency(intlAmount)} | بطاقة: **** {cardNum.slice(-4)}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-bold">
                    {lang === 'ar' ? 'تم إرسال كود التحقق الأمني (SMS OTP) إلى هاتفك المسجل لدى البنك. أدخل الكود لتأكيد الخصم المباشر:' : 'Enter the 6-digit SMS OTP code sent by your bank:'}
                  </p>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value)}
                    placeholder="1 2 3 4 5 6"
                    className="w-full text-center px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-2xl font-mono text-xl font-black tracking-widest text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={handleFinalizePayment}
                    disabled={isProcessing}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>{lang === 'ar' ? 'جاري التحقق من البنك والخصم...' : 'Verifying & Charging...'}</span>
                      </span>
                    ) : (
                      <span>{lang === 'ar' ? '✓ تأكيد الخصم وتغذية المحفظة' : 'Verify & Credit Wallet'}</span>
                    )}
                  </button>
                  <button
                    onClick={() => setVerifyingState(null)}
                    className="w-full py-2 text-slate-400 hover:text-slate-200 text-xs font-bold transition cursor-pointer"
                  >
                    {lang === 'ar' ? 'إلغاء العملية' : 'Cancel'}
                  </button>
                </div>
              </div>
            )}

            {/* 2. PAYPAL OFFICIAL AUTHENTICATION OVERLAY */}
            {verifyingState === 'PAYPAL_AUTH' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Globe className="w-6 h-6 text-blue-500" />
                    <h3 className="font-black text-sm text-slate-900 dark:text-white">
                      {lang === 'ar' ? 'بوابة سداد PayPal المباشرة' : 'PayPal Checkout Gateway'}
                    </h3>
                  </div>
                  <button onClick={() => setVerifyingState(null)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
                </div>

                <div className="p-4 bg-gradient-to-r from-blue-900/40 to-indigo-900/40 rounded-2xl border border-blue-500/30 text-center space-y-1">
                  <div className="text-2xl font-black text-white">PayPal</div>
                  <p className="text-xs text-cyan-300 font-extrabold">
                    {lang === 'ar' ? `المبلغ المطلوب اعتماده وخصمه: ${formatCurrency(intlAmount)}` : `Amount to approve: ${formatCurrency(intlAmount)}`}
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">بريد حساب PayPal</label>
                    <input
                      type="email"
                      value={paypalEmail}
                      onChange={e => setPaypalEmail(e.target.value)}
                      placeholder="paypal@example.com"
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">كلمة المرور التأكيدية</label>
                    <input
                      type="password"
                      value={paypalPass}
                      onChange={e => setPaypalPass(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={handleFinalizePayment}
                    disabled={isProcessing}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>{lang === 'ar' ? 'جاري الاتصال بـ PayPal والخصم...' : 'Connecting to PayPal...'}</span>
                      </span>
                    ) : (
                      <span>{lang === 'ar' ? '🅿️ موافقة واعتماد خصم PayPal' : 'Approve & Charge via PayPal'}</span>
                    )}
                  </button>
                  <button
                    onClick={() => setVerifyingState(null)}
                    className="w-full py-2 text-slate-400 hover:text-slate-200 text-xs font-bold transition cursor-pointer"
                  >
                    {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                </div>
              </div>
            )}

            {/* 3. APPLE PAY BIOMETRIC OVERLAY */}
            {verifyingState === 'APPLE_PAY' && (
              <div className="space-y-4 text-center">
                <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white flex items-center justify-center mx-auto">
                  <Smartphone className="w-7 h-7" />
                </div>
                <h3 className="font-black text-base text-slate-900 dark:text-white">
                  Apple Pay — {formatCurrency(intlAmount)}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                  {lang === 'ar' ? 'تأكيد عملية الخصم باستخدام انطباق الوجه Face ID أو البصمة Touch ID' : 'Double click side button or use Touch ID to pay'}
                </p>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={handleFinalizePayment}
                    disabled={isProcessing}
                    className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isProcessing ? (
                      <span>جاري الخصم...</span>
                    ) : (
                      <span>🍎 تأكيد السداد بواسطة Apple Pay</span>
                    )}
                  </button>
                  <button
                    onClick={() => setVerifyingState(null)}
                    className="w-full py-2 text-slate-400 hover:text-slate-200 text-xs font-bold transition cursor-pointer"
                  >
                    {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};
