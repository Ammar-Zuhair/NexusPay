import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MOCK_GAMES } from '../data/mockData';
import {
  ShieldCheck, Zap, Star, User, Mail, Smartphone, Key,
  HelpCircle, ChevronLeft, ChevronRight, CheckCircle2, ShoppingBag, CreditCard
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const ProductDetailPage = () => {
  const {
    lang,
    selectedGameId,
    setSelectedGameId,
    addToCart,
    setActiveTab,
    addToast,
    formatCurrency,
    products,
    browsingCountry
  } = useApp();

  // Find the selected product dynamically
  const currentGame = (products || []).find(g => g.id === selectedGameId) || (products || [])[0] || MOCK_GAMES[0];

  const availablePackages = (currentGame.packages || []).filter(pkg =>
    !pkg.countryCode ||
    pkg.countryCode.toUpperCase() === 'GLOBAL' ||
    pkg.countryCode.toUpperCase() === (browsingCountry || 'SA').toUpperCase()
  );

  const [region, setRegion] = useState('global');
  const [selectedPackage, setSelectedPackage] = useState(availablePackages[0] || null);
  const [targetAccountInput, setTargetAccountInput] = useState('');
  const [qty, setQty] = useState(1);

  // ID Verification States
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedPlayerName, setVerifiedPlayerName] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [voucherMessage, setVoucherMessage] = useState('');

  // Update selected package when selected product or country changes
  useEffect(() => {
    if (availablePackages.length > 0) {
      setSelectedPackage(availablePackages[0]);
    } else {
      setSelectedPackage(null);
    }
    setTargetAccountInput('');
    setVerifiedPlayerName('');
    setVerificationError('');
    setVoucherMessage('');
  }, [currentGame.id, browsingCountry]);

  const handleVerifyPlayerId = async () => {
    if (!targetAccountInput.trim()) {
      addToast(lang === 'ar' ? 'يرجى إدخال معرف اللاعب أولاً' : 'Please enter Player ID first', 'error');
      return;
    }
    setIsVerifying(true);
    setVerifiedPlayerName('');
    setVerificationError('');
    setVoucherMessage('');
    try {
      const provCode = selectedPackage?.providerCode || 'RELOADLY';
      const rId = selectedPackage?.reloadlyProductId || '';
      const res = await fetch(`${API_BASE_URL}/players/lookup?playerId=${encodeURIComponent(targetAccountInput)}&gameId=${encodeURIComponent(currentGame.id)}&providerCode=${encodeURIComponent(provCode)}&reloadlyProductId=${encodeURIComponent(rId)}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Verification failed');
      }

      if (data.isVoucherProduct) {
        setVoucherMessage(data.message);
        addToast(data.message, 'info');
      } else if (data.playerName) {
        setVerifiedPlayerName(data.playerName);
        addToast(lang === 'ar' ? `تم التحقق بنجاح: ${data.playerName}` : `Verified successfully: ${data.playerName}`, 'success');
      }
    } catch (err) {
      setVerificationError(lang === 'ar' ? `الـ ID غير صحيح أو غير موجود: ${err.message}` : `Invalid ID or lookup failed: ${err.message}`);
      addToast(lang === 'ar' ? 'فشل التحقق من الـ ID' : 'Player ID verification failed', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const totalUSD = selectedPackage ? selectedPackage.priceUSD * qty : 0.00;

  // Determine field type & label based on product category/type
  const getAccountFieldConfig = () => {
    switch (currentGame.productType) {
      case 'DIRECT_TOPUP':
        return {
          icon: User,
          label: lang === 'ar' ? 'معرف اللاعب / ID اللعبة (Player ID)' : 'Player ID / Game Account ID',
          placeholder: lang === 'ar' ? 'أدخل معرف اللاعب الخاص بك (مثال: 5412896301)' : 'Enter your Player ID (e.g. 5412896301)',
          helpText: lang === 'ar' ? 'سيتم شحن الرصيد مباشرة إلى حسابك في اللعبة فور السداد.' : 'Credits will be sent directly to your game account.',
          errorMsg: lang === 'ar' ? 'يرجى إدخال معرف اللاعب (Player ID) أولاً' : 'Please enter your Player ID first'
        };
      case 'SUBSCRIPTION':
      case 'LICENSE_KEY':
      case 'VOUCHER_CODE':
        return {
          icon: Mail,
          label: lang === 'ar' ? 'البريد الإلكتروني لاستلام التفعيل / الكود (Email)' : 'Email Address for Code Delivery',
          placeholder: lang === 'ar' ? 'أدخل بريدك الإلكتروني (مثال: name@example.com)' : 'Enter your email address (e.g. name@example.com)',
          helpText: lang === 'ar' ? 'سيتم إرسال رابط التفعيل / الكود الرقمي مباشرة إلى بريدك الإلكتروني.' : 'Activation link / key will be delivered to this email.',
          errorMsg: lang === 'ar' ? 'يرجى إدخال البريد الإلكتروني لاستلام الخدمة' : 'Please enter your email address'
        };
      case 'MOBILE_RECHARGE':
        return {
          icon: Smartphone,
          label: lang === 'ar' ? 'رقم الجوال المراد شحنه (Mobile Number)' : 'Mobile Phone Number',
          placeholder: lang === 'ar' ? 'أدخل رقم الجوال (مثال: 05xxxxxxx)' : 'Enter mobile number (e.g. 05xxxxxxx)',
          helpText: lang === 'ar' ? 'سيتم شحن الرصيد مباشرة إلى رقم الشريحة الموضح.' : 'Airtime credit will be recharged to this mobile line.',
          errorMsg: lang === 'ar' ? 'يرجى إدخال رقم الجوال المراد شحنه' : 'Please enter mobile phone number'
        };
      default:
        return {
          icon: User,
          label: lang === 'ar' ? 'معرف الحساب / البريد' : 'Account ID / Email',
          placeholder: lang === 'ar' ? 'أدخل بيانات الحساب' : 'Enter account details',
          helpText: lang === 'ar' ? 'سيتم تزويدك بالخدمة فور التأكيد' : 'Service will be fulfilled upon confirmation',
          errorMsg: lang === 'ar' ? 'يرجى إدخال بيانات الحساب' : 'Please enter account details'
        };
    }
  };

  const fieldConfig = getAccountFieldConfig();
  const FieldIcon = fieldConfig.icon;

  const validateInput = () => {
    if (!targetAccountInput.trim()) {
      addToast(fieldConfig.errorMsg, 'error');
      return false;
    }
    return true;
  };

  const createCartItem = () => ({
    id: `${currentGame.id}-${selectedPackage.id || 'std'}`,
    productId: currentGame.id,
    title: `${typeof currentGame.title === 'string' ? currentGame.title : (currentGame.title[lang] || currentGame.title.ar || currentGame.title.en)} - ${selectedPackage.name}`,
    packageName: selectedPackage.name,
    priceUSD: selectedPackage.priceUSD,
    targetAccountId: targetAccountInput.trim(),
    productType: currentGame.productType,
    image: currentGame.image,
    quantity: qty
  });

  const handleBuyNow = () => {
    if (!validateInput()) return;
    addToCart(createCartItem());
    setActiveTab('checkout');
  };

  const handleAddToCart = () => {
    if (!validateInput()) return;
    addToCart(createCartItem());
  };

  const relatedProducts = (products || []).filter(g => g.id !== currentGame.id).slice(0, 4);

  const productTitleText = typeof currentGame.title === 'string' ? currentGame.title : (currentGame.title[lang] || currentGame.title.ar || currentGame.title.en);
  const productDescText = typeof currentGame.description === 'string' ? currentGame.description : (currentGame.description[lang] || currentGame.description.ar || currentGame.description.en);

  return (
    <main className="mt-20 pt-8 max-w-7xl mx-auto px-4 mb-16">

      {/* Breadcrumb Navigation - Large & High Contrast */}
      <nav className="flex items-center gap-2 mb-6 text-sm text-slate-600 dark:text-slate-300 font-extrabold">
        <button onClick={() => setActiveTab('home')} className="hover:text-blue-600 dark:hover:text-cyan-400 transition">
          {lang === 'ar' ? 'الرئيسية' : 'Home'}
        </button>
        <span>/</span>
        <button onClick={() => setActiveTab('browse')} className="hover:text-blue-600 dark:hover:text-cyan-400 transition">
          {lang === 'ar' ? 'المنتجات الرقمية' : 'Digital Catalog'}
        </button>
        <span>/</span>
        <span className="text-blue-600 dark:text-cyan-400 font-black">
          {productTitleText}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column: Product Visuals & Detailed Description */}
        <div className="lg:col-span-7 space-y-6">

          {/* Main Visual Banner */}
          <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 bg-slate-900">
            <img
              className="w-full h-full object-cover"
              alt={productTitleText}
              src={currentGame.image}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

            <div className="absolute top-4 left-4 flex gap-2">
              <span className="bg-emerald-600 text-white font-black text-xs tracking-wider px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                <Zap className="w-4 h-4 fill-current" />
                {currentGame.badge || 'INSTANT DELIVERY'}
              </span>
              <span className="bg-blue-600 text-white font-black text-xs tracking-wider px-3.5 py-1.5 rounded-full shadow-lg">
                {currentGame.publisher}
              </span>
            </div>

            <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-4 py-1.5 rounded-2xl text-amber-400 text-sm font-black border border-white/10">
              <Star className="w-4 h-4 fill-current text-amber-400" />
              <span>{currentGame.rating} / 5.0 ({currentGame.reviewsCount} {lang === 'ar' ? 'تقييم موثق' : 'verified reviews'})</span>
            </div>
          </div>

          {/* Product Description Box - Large & Bold Typography */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <h2 className="font-black text-slate-900 dark:text-white text-xl">
                {lang === 'ar' ? 'تفاصيل الخدمة ومميزات الشراء' : 'Service Description & Details'}
              </h2>
              <div className="flex items-center gap-1.5 text-emerald-500 text-sm font-black">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <span>{lang === 'ar' ? 'شريك رقمي معتمد' : 'Verified Official Distribution'}</span>
              </div>
            </div>

            <p className="text-base text-slate-800 dark:text-slate-200 font-extrabold leading-relaxed">
              {productDescText}
            </p>

            <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-800 dark:text-slate-200 font-black">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl flex items-center gap-3 border border-slate-200/80 dark:border-slate-700/60">
                <Zap className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>{lang === 'ar' ? 'تسليم فوري (خلال دقيقتين)' : 'Instant Delivery (< 2 mins)'}</span>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl flex items-center gap-3 border border-slate-200/80 dark:border-slate-700/60">
                <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0" />
                <span>{lang === 'ar' ? 'دفع آمن ومجهّز 100%' : '100% Secure Encrypted Pay'}</span>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl flex items-center gap-3 border border-slate-200/80 dark:border-slate-700/60">
                <CheckCircle2 className="w-5 h-5 text-purple-500 shrink-0" />
                <span>{lang === 'ar' ? 'ضمان التفعيل الرسمي' : 'Official Guarantee'}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Custom Vertical Package Selector & Form */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-7 shadow-2xl space-y-6">

              <div>
                <span className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-cyan-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full inline-block mb-2">
                  {currentGame.publisher}
                </span>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">
                  {productTitleText}
                </h1>
                <p className="text-sm font-extrabold text-slate-600 dark:text-slate-300 mt-2">
                  {lang === 'ar' ? 'اختر الباقة المطلوبة وسجل بيانات حسابك لتأكيد الشحن الفوري' : 'Select your desired package and enter your account details.'}
                </p>
              </div>

              {/* STEP 1: Package / Service Tier Selector (VERTICAL STACKED LAYOUT) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <label className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider block">
                    {lang === 'ar' ? '1. اختر الفئة أو الباقة المطلوبة:' : '1. Select Package / Service Tier:'}
                  </label>
                  <span className="text-xs font-black text-blue-600 dark:text-cyan-400 bg-blue-50 dark:bg-blue-900/40 px-3 py-1 rounded-full">
                    {availablePackages.length} {lang === 'ar' ? 'باقات متوفرة' : 'Available Tiers'}
                  </span>
                </div>

                {/* Vertical Stacked Cards */}
                <div className="flex flex-col space-y-3.5">
                  {availablePackages.length === 0 ? (
                    <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-center">
                      <p className="text-sm font-bold text-amber-800 dark:text-amber-200 leading-relaxed">
                        {lang === 'ar'
                          ? '⚠️ لا توجد باقات متوفرة لبلدك الحالي. يمكنك تغيير الدولة من شريط المتجر العلوي لعرض باقات الدول الأخرى.'
                          : '⚠️ No packages are currently available for your country. You can change your country from the storefront header to view packages for other regions.'}
                      </p>
                    </div>
                  ) : (
                    availablePackages.map((pkg) => {
                      const isSelected = selectedPackage && selectedPackage.id === pkg.id;
                      return (
                        <div
                          key={pkg.id}
                          onClick={() => setSelectedPackage(pkg)}
                          className={`p-4 rounded-2xl cursor-pointer transition-all border flex items-center justify-between gap-4 ${isSelected
                              ? 'border-2 border-blue-600 bg-blue-50/80 dark:bg-blue-950/60 shadow-md ring-2 ring-blue-500/20'
                              : 'border-slate-200 dark:border-slate-800 hover:border-blue-500/60 bg-slate-50/60 dark:bg-slate-800/40'
                            }`}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            {/* Radio Check Circle */}
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${isSelected
                                ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                                : 'border-slate-300 dark:border-slate-600 bg-transparent'
                              }`}>
                              {isSelected && <CheckCircle2 className="w-4 h-4 text-white stroke-[3]" />}
                            </div>

                            <div>
                              <div className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
                                <span>{pkg.name}</span>
                                {isSelected && (
                                  <span className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full">
                                    {lang === 'ar' ? 'محدد حالياً' : 'Selected'}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs font-extrabold text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                                <Zap className="w-3.5 h-3.5 text-amber-500 fill-current" />
                                <span>{lang === 'ar' ? 'تفعيل وإرسال فوري' : 'Instant Automated Delivery'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-left rtl:text-right shrink-0">
                            <div className="font-black text-xl text-blue-600 dark:text-cyan-400">
                              {formatCurrency(pkg.priceUSD)}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* STEP 2: Contextual Account Input (Player ID / Email / Phone) */}
              <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <label className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <FieldIcon className="w-5 h-5 text-blue-500" />
                  <span>2. {fieldConfig.label}</span>
                </label>

                <input
                  type={currentGame.productType === 'SUBSCRIPTION' || currentGame.productType === 'LICENSE_KEY' ? 'email' : 'text'}
                  value={targetAccountInput}
                  onChange={(e) => {
                    setTargetAccountInput(e.target.value);
                    setVerifiedPlayerName('');
                    setVerificationError('');
                  }}
                  placeholder={fieldConfig.placeholder}
                  className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-2xl text-sm font-black text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 transition shadow-inner"
                />

                {/* Player ID verification action */}
                {currentGame.productType === 'DIRECT_TOPUP' && (
                  <div className="flex flex-col gap-2 mt-2">
                    <button
                      type="button"
                      onClick={handleVerifyPlayerId}
                      disabled={isVerifying || !targetAccountInput}
                      className="w-fit px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white dark:bg-cyan-500/10 dark:hover:bg-cyan-500 dark:text-cyan-400 dark:hover:text-slate-900 border border-blue-600/30 dark:border-cyan-500/20 rounded-xl font-black text-xs transition disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                    >
                      {isVerifying ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white dark:border-slate-900 border-t-transparent rounded-full animate-spin"></span>
                          <span>{lang === 'ar' ? 'جاري التحقق...' : 'Verifying...'}</span>
                        </>
                      ) : (
                        <span>{lang === 'ar' ? '🔍 تحقق من اسم الحساب' : '🔍 Verify Account Name'}</span>
                      )}
                    </button>

                    {verifiedPlayerName && (
                      <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl text-emerald-800 dark:text-emerald-200 font-extrabold text-xs flex items-center gap-2 animate-fade-in shadow-inner">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          {lang === 'ar'
                            ? `اسم صاحب الحساب: ${verifiedPlayerName} (يرجى التأكد من مطابقة الاسم قبل الدفع)`
                            : `Account Name: ${verifiedPlayerName} (Please verify before checkout)`}
                        </span>
                      </div>
                    )}

                    {voucherMessage && (
                      <div className="p-3.5 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded-xl text-blue-800 dark:text-blue-200 font-extrabold text-xs flex items-center gap-2 animate-fade-in shadow-inner">
                        <span className="shrink-0 text-base">🎫</span>
                        <span>{voucherMessage}</span>
                      </div>
                    )}

                    {verificationError && (
                      <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-xl text-rose-800 dark:text-rose-200 font-extrabold text-xs flex items-center gap-2 animate-fade-in shadow-inner">
                        <span className="shrink-0 text-base">⚠️</span>
                        <span>{verificationError}</span>
                      </div>
                    )}
                  </div>
                )}

                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {fieldConfig.helpText}
                </p>
              </div>

              {/* STEP 3: Quantity & Dynamic Total Calculation */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-2xl p-1.5 border border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-9 h-9 flex items-center justify-center font-black text-base text-slate-800 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition shadow-xs"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-black text-lg text-slate-900 dark:text-white">{qty}</span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="w-9 h-9 flex items-center justify-center font-black text-base text-slate-800 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition shadow-xs"
                  >
                    +
                  </button>
                </div>

                <div className="text-left rtl:text-right">
                  <span className="text-xs font-bold text-slate-400 uppercase block">
                    {lang === 'ar' ? 'الإجمالي النهائي' : 'Total Amount'}
                  </span>
                  <span className="text-2xl font-black text-blue-600 dark:text-cyan-400">
                    {formatCurrency(totalUSD)}
                  </span>
                </div>
              </div>

              {/* Action CTA Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleBuyNow}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-black text-base rounded-2xl shadow-xl shadow-blue-600/30 transition flex items-center justify-center gap-2.5"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>{lang === 'ar' ? 'الشراء الآن والانتقال للدفع' : 'Buy Now & Proceed to Pay'}</span>
                </button>
                <button
                  onClick={handleAddToCart}
                  className="w-full py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-black text-sm rounded-2xl transition flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-700"
                >
                  <ShoppingBag className="w-5 h-5 text-blue-500" />
                  <span>{lang === 'ar' ? 'إضافة إلى عربة التسوق' : 'Add to Cart'}</span>
                </button>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Related Games / Services */}
      <section className="mt-16 border-t border-slate-200 dark:border-slate-800 pt-10">
        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6">
          {lang === 'ar' ? 'خدمات وألعاب أخرى قد تهمك' : 'Other Popular Games & Services'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedProducts.map((relGame) => {
            const relTitle = typeof relGame.title === 'string' ? relGame.title : (relGame.title[lang] || relGame.title.ar || relGame.title.en);
            return (
              <div
                key={relGame.id}
                onClick={() => { setSelectedGameId(relGame.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="group rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-sm hover:shadow-xl transition cursor-pointer flex items-center gap-4"
              >
                <img
                  src={relGame.image}
                  alt={relTitle}
                  className="w-16 h-16 rounded-2xl object-cover group-hover:scale-105 transition"
                />
                <div>
                  <h4 className="font-black text-sm text-slate-900 dark:text-white group-hover:text-blue-500 transition line-clamp-1">
                    {relTitle}
                  </h4>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
                    {lang === 'ar' ? 'يبدأ من' : 'From'} {formatCurrency(
                      relGame.packages && relGame.packages.length > 0
                        ? Math.min(...relGame.packages.map(p => p.priceUSD || 0))
                        : (relGame.minPriceUSD || 0.99)
                    )}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </main>
  );
};
