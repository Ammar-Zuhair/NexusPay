import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { LogoMark } from './LogoMark';
import { TopUpModal } from './TopUpModal';
import { SUPPORTED_COUNTRIES } from '../data/mockData';
import { API_BASE_URL } from '../utils/api.js';
import { 
  Menu, X, Globe, DollarSign, User, Wallet, ShoppingBag, 
  LogOut, Sun, Moon, ShieldCheck, Home, Gamepad2, Plus 
} from 'lucide-react';

// Country data for registration
const COUNTRY_LIST = SUPPORTED_COUNTRIES;

// Payment methods by region
const PAYMENT_METHODS_CONFIG = {
  international: [
    { id: 'VISA_MC',   label: 'Visa / MasterCard',   labelAr: 'Visa / MasterCard',    icon: '💳', color: 'blue'   },
    { id: 'APPLE_PAY', label: 'Apple Pay',            labelAr: 'Apple Pay',             icon: '🍎', color: 'slate'  },
    { id: 'PAYPAL',    label: 'PayPal',               labelAr: 'PayPal',                icon: '🅿️', color: 'indigo' },
  ],
  yemen: [
    { id: 'KURAIMI',   label: 'Kuraimi',              labelAr: 'كريمي',                 icon: '🏦', color: 'green'  },
    { id: 'JEEB',      label: 'Jeeb Pay',             labelAr: 'جيب',                   icon: '📱', color: 'emerald'},
    { id: 'ONE_CASH',  label: 'OneCash',              labelAr: 'ون كاش',               icon: '💰', color: 'teal'   },
    { id: 'MFALOOS',   label: 'M-Faloos',             labelAr: 'مفلوس',                icon: '📲', color: 'cyan'   },
  ]
};

export const Header = () => {
  const { 
    lang, 
    toggleLang, 
    theme, 
    toggleTheme, 
    currency,
    setCurrency,
    formatCurrency,
    activeTab, 
    setActiveTab, 
    cart, 
    setIsCartOpen,
    user,
    userCountry,
    setUserCountry,
    browsingCountry,
    setBrowsingCountry,
    userWallet,
    topUpWallet,
    isTopUpProcessing,
    isTopUpModalOpen,
    openTopUpModal,
    closeTopUpModal,
    addToast,
    login,
    register,
    logout
  } = useApp();

  const handleCountryChange = (newCountry) => {
    setBrowsingCountry(newCountry);
    setUserCountry(newCountry);
    addToast(
      lang === 'ar'
        ? `تم تحديث دولة المتجر والتصفح إلى: ${COUNTRY_LIST.find(c => c.code === newCountry)?.name || newCountry}`
        : `Store region updated to ${newCountry}`,
      'info'
    );
  };

  // Mobile navigation drawer toggle
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Auth modal state
  const [showAuthModal, setShowAuthModal]   = useState(false);
  const [authMode, setAuthMode]             = useState('login');
  const [emailInput, setEmailInput]         = useState('');
  const [nameInput, setNameInput]           = useState('');
  const [passwordInput, setPasswordInput]   = useState('');
  const [confirmPwInput, setConfirmPwInput] = useState('');
  const [countryInput, setCountryInput]     = useState('YE');
  const [phoneInput, setPhoneInput]         = useState('');
  const [countryCodeInput, setCountryCodeInput] = useState('+967');
  const [showPassword, setShowPassword]     = useState(false);
  const [showConfirmPw, setShowConfirmPw]   = useState(false);
  const [authError, setAuthError]           = useState('');

  // OTP step after registration
  const [authStep, setAuthStep]     = useState('form');  // 'form' | 'otp' | 'forgot_sent'
  const [otpInput, setOtpInput]     = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  // Password strength
  const [pwStrength, setPwStrength] = useState({ len: false, upper: false, lower: false, num: false, sym: false });
  useEffect(() => {
    const p = passwordInput;
    setPwStrength({
      len:   p.length >= 8,
      upper: /[A-Z]/.test(p),
      lower: /[a-z]/.test(p),
      num:   /[0-9]/.test(p),
      sym:   /[^A-Za-z0-9]/.test(p)
    });
  }, [passwordInput]);

  // Top-up modal: multi-step
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpStep, setTopUpStep]           = useState(1); // 1=amount, 2=method, 3=details, 4=success
  const [topUpAmount, setTopUpAmount]       = useState(25);
  const [topUpMethod, setTopUpMethod]       = useState(null);
  const [topUpResult, setTopUpResult]       = useState(null);

  // Card details state (for VISA_MC)
  const [cardNum, setCardNum]     = useState('');
  const [cardExp, setCardExp]     = useState('');
  const [cardCvv, setCardCvv]     = useState('');
  const [cardName, setCardName]   = useState('');

  // Mobile wallet state (for Yemeni wallets + PayPal)
  const [mobilePhone, setMobilePhone] = useState('');
  const [txRefNum, setTxRefNum]       = useState('');

  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Detect available payment methods for the user's country
  const isYemen = (userCountry || countryInput || 'SA').toUpperCase() === 'YE';
  const availableMethods = [
    ...PAYMENT_METHODS_CONFIG.international,
    ...(isYemen ? PAYMENT_METHODS_CONFIG.yemen : [])
  ];

  const resetTopUpModal = () => {
    setTopUpStep(1);
    setTopUpAmount(25);
    setTopUpMethod(null);
    setTopUpResult(null);
    setCardNum(''); setCardExp(''); setCardCvv(''); setCardName('');
    setMobilePhone(''); setTxRefNum('');
  };

  const handleOpenTopUp = () => {
    openTopUpModal();
  };

  const handleTopUpConfirm = async () => {
    const paymentData = topUpMethod === 'VISA_MC'
      ? { masked: `${cardNum.slice(-4)}`, cardName }
      : topUpMethod === 'PAYPAL' || ['KURAIMI','JEEB','ONE_CASH','MFALOOS'].includes(topUpMethod)
        ? { reference: txRefNum || mobilePhone, masked: mobilePhone.slice(-4) }
        : { reference: `APPLE_PAY_${Date.now()}`, masked: 'DEVICE' };

    const result = await topUpWallet(topUpAmount, topUpMethod, paymentData);
    setTopUpResult(result);
    setTopUpStep(4);
  };



  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!emailInput.trim()) return;

    if (authMode === 'login') {
      const success = await login(emailInput, passwordInput);
      if (success) {
        setShowAuthModal(false);
        setEmailInput('');
        setPasswordInput('');
        setConfirmPwInput('');
        setAuthStep('form');
      } else {
        setAuthError(lang === 'ar' ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : 'Invalid email or password');
      }
    } else {
      // Register: client-side confirm check
      if (passwordInput !== confirmPwInput) {
        setAuthError(lang === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: nameInput || 'مستخدم جديد', email: emailInput, password: passwordInput, phone: phoneInput, countryCode: countryCodeInput || '+967' })
        });
        const data = await res.json();
        if (res.ok && data.requiresOtp) {
          setPendingEmail(emailInput);
          setAuthStep('otp');
        } else if (data.error) {
          setAuthError(data.error);
        }
      } catch {
        setAuthError(lang === 'ar' ? 'تعذر الاتصال بالخادم' : 'Cannot connect to server');
      }
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpLoading(true);
    setAuthError('');
    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingEmail, otp: otpInput })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Auto-login after OTP
        const loginRes = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: pendingEmail, password: passwordInput })
        });
        const loginData = await loginRes.json();
        if (loginRes.ok && loginData.user) {
          await login(pendingEmail, passwordInput);
        }
        setShowAuthModal(false);
        setAuthStep('form');
        setOtpInput('');
        setEmailInput('');
        setPasswordInput('');
        setConfirmPwInput('');
        setNameInput('');
        addToast(lang === 'ar' ? 'تم التحقق وتسجيل الدخول بنجاح! مرحباً بك 🎉' : 'Email verified! Welcome aboard! 🎉');
      } else {
        setAuthError(data.error || 'رمز التحقق غير صحيح');
      }
    } catch {
      setAuthError(lang === 'ar' ? 'تعذر الاتصال بالخادم' : 'Cannot connect to server');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingEmail })
      });
      addToast(lang === 'ar' ? 'تم إرسال رمز جديد إلى بريدك' : 'New OTP sent to your email');
    } catch {
      addToast(lang === 'ar' ? 'فشل إرسال الرمز' : 'Failed to resend OTP', 'error');
    }
  };

  const handleForgotPassword = async () => {
    if (!emailInput.trim()) {
      setAuthError(lang === 'ar' ? 'يرجى إدخال بريدك الإلكتروني أولاً' : 'Enter your email first');
      return;
    }
    setAuthError('');
    try {
      await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput })
      });
      setAuthStep('forgot_sent');
    } catch {
      setAuthError(lang === 'ar' ? 'تعذر إرسال الطلب' : 'Failed to send request');
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <div onClick={() => handleTabClick('home')} className="cursor-pointer">
            <LogoMark />
          </div>

          {/* Navigation Links (Desktop lg) */}
          <nav className="hidden lg:flex items-center space-x-6 rtl:space-x-reverse font-extrabold text-base">
            <button 
              onClick={() => handleTabClick('home')}
              className={activeTab === 'home' 
                ? "text-blue-600 dark:text-cyan-400 font-black border-b-2 border-blue-600 dark:border-cyan-400 pb-1"
                : "text-slate-800 dark:text-slate-100 hover:text-blue-600 dark:hover:text-cyan-400 font-extrabold transition"}
            >
              {lang === 'ar' ? 'الرئيسية' : 'Home'}
            </button>
            <button 
              onClick={() => handleTabClick('browse')}
              className={activeTab === 'browse'
                ? "text-blue-600 dark:text-cyan-400 font-black border-b-2 border-blue-600 dark:border-cyan-400 pb-1"
                : "text-slate-800 dark:text-slate-100 hover:text-blue-600 dark:hover:text-cyan-400 font-extrabold transition"}
            >
              {lang === 'ar' ? 'المنتجات الرقمية' : 'Products'}
            </button>
            {user && (
              <button 
                onClick={() => handleTabClick('dashboard')}
                className={activeTab === 'dashboard'
                  ? "text-blue-600 dark:text-cyan-400 font-black border-b-2 border-blue-600 dark:border-cyan-400 pb-1"
                  : "text-slate-800 dark:text-slate-100 hover:text-blue-600 dark:hover:text-cyan-400 font-extrabold transition"}
              >
                {lang === 'ar' ? 'محفظتي وحسابي' : 'Wallet & Account'}
              </button>
            )}
            {user && user.role === 'ADMIN' && (
              <button 
                onClick={() => handleTabClick('admin')}
                className={activeTab === 'admin'
                  ? "text-blue-600 dark:text-cyan-400 font-black border-b-2 border-blue-600 dark:border-cyan-400 pb-1 flex items-center gap-1.5"
                  : "text-slate-800 dark:text-slate-100 hover:text-blue-600 dark:hover:text-cyan-400 font-extrabold transition flex items-center gap-1.5"}
              >
                <span className="px-1.5 py-0.5 bg-rose-500/10 text-rose-500 rounded text-[10px] font-black">HQ</span>
                {lang === 'ar' ? 'مركز التحكم' : 'Admin Console'}
              </button>
            )}
          </nav>

          {/* Action Controls */}
          <div className="flex items-center gap-2">
            
            {/* Wallet Balance Badge (Desktop lg) */}
            {user && (
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-600/10 via-cyan-500/10 to-emerald-500/10 border border-blue-500/30 rounded-xl">
                <div className="text-right rtl:text-right">
                  <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase block">
                    {lang === 'ar' ? 'رصيد المحفظة' : 'Wallet Balance'}
                  </span>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(userWallet?.availableBalance || 0)}
                  </span>
                </div>
                <button 
                  onClick={handleOpenTopUp}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] rounded-lg shadow-sm transition flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'شحن' : 'TopUp'}</span>
                </button>
              </div>
            )}

            {/* Locked Country & Currency Badge (Yemen & USD $) */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-xl text-xs font-black text-slate-800 dark:text-slate-200">
              <span>🇾🇪</span>
              <span>$ USD</span>
            </div>

            {/* Language Switcher (Desktop lg) */}
            <button 
              className="hidden lg:block px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-black text-slate-900 dark:text-white border-2 border-slate-300 dark:border-slate-700 transition shadow-xs"
              onClick={toggleLang}
            >
              {lang === 'ar' ? 'EN' : 'AR'}
            </button>

            {/* Theme Switcher (Desktop lg) */}
            <button 
              className="hidden lg:flex p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 border-2 border-slate-300 dark:border-slate-700 transition shadow-xs items-center justify-center"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* User Account / Auth Toggle (Desktop lg) */}
            <div className="hidden lg:flex items-center">
              {user ? (
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => handleTabClick('dashboard')}
                    className="px-3 py-1.5 rounded-xl bg-blue-600/10 text-blue-600 dark:text-cyan-400 font-extrabold text-xs border border-blue-500/30 flex items-center gap-1"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>{user.name.split(' ')[0]}</span>
                  </button>
                  <button 
                    onClick={logout}
                    title={lang === 'ar' ? 'تسجيل الخروج' : 'Logout'}
                    className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-500/10 transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white font-extrabold text-xs shadow-md hover:bg-blue-500 transition"
                >
                  {lang === 'ar' ? 'تسجيل الدخول' : 'Login'}
                </button>
              )}
            </div>

            {/* Cart Icon (Visible on ALL Devices) */}
            <button 
              className="relative p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition shadow-md flex items-center justify-center"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag className="w-5 h-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black border-2 border-white dark:border-slate-900 shadow-xs">
                  {cartItemsCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Hamburger Toggle (Visible on Mobile `< lg`) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-2 border-slate-300 dark:border-slate-700 transition shadow-xs flex items-center justify-center"
              aria-label="Toggle Mobile Navigation"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 text-rose-500" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ===== MOBILE NAVIGATION DRAWER OVERLAY ===== */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-x-0 top-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-b border-slate-200 dark:border-slate-800 shadow-2xl overflow-y-auto max-h-[calc(100vh-5rem)] animate-fade-in z-40">
            <div className="p-5 space-y-6">

              {/* 1. User & Wallet Profile Banner */}
              {user ? (
                <div className="p-4 bg-gradient-to-r from-blue-600/10 via-cyan-500/10 to-emerald-500/10 border border-blue-500/30 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-base shadow-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-black text-sm text-slate-900 dark:text-white block">
                          {user.name}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                          {user.email}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                      className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition"
                      title={lang === 'ar' ? 'تسجيل الخروج' : 'Logout'}
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="pt-3 border-t border-slate-200/50 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase block">
                        {lang === 'ar' ? 'رصيد المحفظة المتاح' : 'Available Balance'}
                      </span>
                      <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(userWallet?.availableBalance || 0)}
                      </span>
                    </div>
                    <button 
                      onClick={() => { setIsMobileMenuOpen(false); handleOpenTopUp(); }}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{lang === 'ar' ? 'شحن المحفظة' : 'Top Up Wallet'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl text-center space-y-3">
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    {lang === 'ar' ? 'سجل دخولك الآن للوصول إلى محفظتك وسجل الطلبات' : 'Sign in to access your wallet & order history'}
                  </p>
                  <button 
                    onClick={() => { setIsMobileMenuOpen(false); setShowAuthModal(true); }}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-sm shadow-md transition flex items-center justify-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    <span>{lang === 'ar' ? 'تسجيل الدخول / إنشاء حساب' : 'Login / Register'}</span>
                  </button>
                </div>
              )}

              {/* 2. Navigation Links */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-black text-slate-400 uppercase px-2 tracking-wider">
                  {lang === 'ar' ? 'أقسام الموقع' : 'Navigation'}
                </span>
                <div className="grid grid-cols-1 gap-1.5 font-black text-sm">
                  <button 
                    onClick={() => handleTabClick('home')}
                    className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 transition ${activeTab === 'home' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100'}`}
                  >
                    <Home className="w-5 h-5" />
                    <span>{lang === 'ar' ? 'الرئيسية' : 'Home'}</span>
                  </button>

                  <button 
                    onClick={() => handleTabClick('browse')}
                    className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 transition ${activeTab === 'browse' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100'}`}
                  >
                    <Gamepad2 className="w-5 h-5" />
                    <span>{lang === 'ar' ? 'المنتجات والألعاب الرقمية' : 'Digital Products'}</span>
                  </button>

                  {user && (
                    <button 
                      onClick={() => handleTabClick('dashboard')}
                      className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 transition ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100'}`}
                    >
                      <Wallet className="w-5 h-5" />
                      <span>{lang === 'ar' ? 'محفظتي وحسابي' : 'Wallet & Account'}</span>
                    </button>
                  )}

                  {user && user.role === 'ADMIN' && (
                    <button 
                      onClick={() => handleTabClick('admin')}
                      className={`w-full px-4 py-3 rounded-xl flex items-center justify-between transition ${activeTab === 'admin' ? 'bg-rose-600 text-white' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}
                    >
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5" />
                        <span>{lang === 'ar' ? 'مركز التحكم والتحليل' : 'Admin Console'}</span>
                      </div>
                      <span className="px-2 py-0.5 bg-rose-500 text-white text-[10px] font-black rounded-md">HQ</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 3. Preferences Bar (Country, Currency, Language, Theme) */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
                <span className="text-[10px] font-black text-slate-400 uppercase px-2 tracking-wider">
                  {lang === 'ar' ? 'إعدادات المتجر والدولة' : 'Store Settings'}
                </span>

                <div className="p-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-between text-xs font-black text-slate-800 dark:text-slate-200">
                  <span className="flex items-center gap-2">
                    <span>🇾🇪</span>
                    <span>{lang === 'ar' ? 'منطقة المتجر: اليمن' : 'Store Region: Yemen'}</span>
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono font-black">$ USD</span>
                </div>

                {/* Quick Toggles: Language & Theme */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button 
                    onClick={toggleLang}
                    className="py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition"
                  >
                    <Globe className="w-4 h-4 text-blue-500" />
                    <span>{lang === 'ar' ? 'English (EN)' : 'العربية (AR)'}</span>
                  </button>

                  <button 
                    onClick={toggleTheme}
                    className="py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition"
                  >
                    {theme === 'dark' ? (
                      <>
                        <Sun className="w-4 h-4 text-amber-400" />
                        <span>{lang === 'ar' ? 'الوضع الفاتح' : 'Light Mode'}</span>
                      </>
                    ) : (
                      <>
                        <Moon className="w-4 h-4 text-slate-700" />
                        <span>{lang === 'ar' ? 'الوضع الداكن' : 'Dark Mode'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
      </header>

      {/* ===== MULTI-STEP TOP-UP WALLET MODAL ===== */}
      {showTopUpModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-base">
                  {topUpStep === 1 && (lang === 'ar' ? '💰 اختر مبلغ الشحن' : '💰 Select Top-Up Amount')}
                  {topUpStep === 2 && (lang === 'ar' ? '💳 اختر وسيلة الدفع' : '💳 Select Payment Method')}
                  {topUpStep === 3 && (lang === 'ar' ? '📋 تفاصيل الدفع' : '📋 Payment Details')}
                  {topUpStep === 4 && (lang === 'ar' ? (topUpResult?.success ? '✅ تمت العملية بنجاح' : '❌ فشلت العملية') : (topUpResult?.success ? '✅ Payment Successful' : '❌ Payment Failed'))}
                </h3>
                {topUpStep <= 3 && (
                  <div className="flex items-center gap-1 mt-1.5">
                    {[1,2,3].map(s => (
                      <div key={s} className={`h-1 rounded-full transition-all ${s <= topUpStep ? 'w-8 bg-emerald-500' : 'w-4 bg-slate-200 dark:bg-slate-700'}`} />
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => { setShowTopUpModal(false); resetTopUpModal(); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xl font-bold">✕</button>
            </div>

            <div className="px-6 py-5 space-y-4">

              {/* STEP 1: Amount */}
              {topUpStep === 1 && (
                <>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    {lang === 'ar' ? 'اختر مبلغ الشحن أو أدخل مبلغاً مخصصاً' : 'Select a preset amount or enter a custom value'}
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {[10, 25, 50, 100].map(amt => (
                      <button key={amt} onClick={() => setTopUpAmount(amt)}
                        className={`py-3 rounded-xl font-black text-sm transition border-2 ${topUpAmount === amt ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-400'}`}>
                        ${amt}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{lang === 'ar' ? 'أو أدخل مبلغ مخصص (بالدولار $)' : 'Or custom amount ($)'}</label>
                    <input type="number" min="1" max="10000" value={topUpAmount}
                      onChange={e => setTopUpAmount(Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-black text-slate-900 dark:text-white" />
                  </div>
                  <div className="pt-2 flex gap-2">
                    <button onClick={() => { setShowTopUpModal(false); resetTopUpModal(); }} className="w-1/3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300">{lang === 'ar' ? 'إلغاء' : 'Cancel'}</button>
                    <button onClick={() => setTopUpStep(2)} disabled={!topUpAmount || topUpAmount < 1} className="w-2/3 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-lg transition">
                      {lang === 'ar' ? `التالي — ${formatCurrency(topUpAmount)}` : `Next — ${formatCurrency(topUpAmount)}`}
                    </button>
                  </div>
                </>
              )}

              {/* STEP 2: Method */}
              {topUpStep === 2 && (
                <>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    {lang === 'ar' ? `المبلغ المختار: ${formatCurrency(topUpAmount)} — اختر وسيلة الدفع` : `Amount: ${formatCurrency(topUpAmount)} — Choose payment method`}
                  </p>
                  <div className="space-y-2">
                    {availableMethods.map(method => (
                      <button key={method.id} onClick={() => setTopUpMethod(method.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-start transition font-bold text-sm
                          ${topUpMethod === method.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400'}`}>
                        <span className="text-xl">{method.icon}</span>
                        <span>{lang === 'ar' ? method.labelAr : method.label}</span>
                        {topUpMethod === method.id && <span className="mr-auto text-blue-500">✓</span>}
                      </button>
                    ))}
                  </div>
                  <div className="pt-2 flex gap-2">
                    <button onClick={() => setTopUpStep(1)} className="w-1/3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300">{lang === 'ar' ? 'رجوع' : 'Back'}</button>
                    <button onClick={() => setTopUpStep(3)} disabled={!topUpMethod} className="w-2/3 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-lg transition">
                      {lang === 'ar' ? 'التالي — تفاصيل الدفع' : 'Next — Payment Details'}
                    </button>
                  </div>
                </>
              )}

              {/* STEP 3: Payment Details */}
              {topUpStep === 3 && (
                <>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {lang === 'ar' ? `أدخل تفاصيل ${availableMethods.find(m => m.id === topUpMethod)?.labelAr || ''}` : `Enter ${availableMethods.find(m => m.id === topUpMethod)?.label || ''} details`}
                  </p>

                  {/* Visa/MC Fields */}
                  {topUpMethod === 'VISA_MC' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">{lang === 'ar' ? 'رقم البطاقة' : 'Card Number'}</label>
                        <input value={cardNum} onChange={e => setCardNum(e.target.value.replace(/\D/g,'').slice(0,16))}
                          placeholder="1234 5678 9012 3456" maxLength={16}
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono font-bold text-slate-900 dark:text-white" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">{lang === 'ar' ? 'تاريخ الانتهاء' : 'Expiry (MM/YY)'}</label>
                          <input value={cardExp} onChange={e => setCardExp(e.target.value)} placeholder="MM/YY"
                            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono font-bold text-slate-900 dark:text-white" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">CVV</label>
                          <input value={cardCvv} onChange={e => setCardCvv(e.target.value.replace(/\D/g,'').slice(0,4))} placeholder="•••"
                            type="password" maxLength={4}
                            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono font-bold text-slate-900 dark:text-white" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">{lang === 'ar' ? 'اسم حامل البطاقة' : 'Cardholder Name'}</label>
                        <input value={cardName} onChange={e => setCardName(e.target.value)} placeholder="AHMED MAHMOUD"
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white" />
                      </div>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1">🔒 {lang === 'ar' ? 'بيانات محاكاة — لن يتم خصم أي مبلغ فعلي' : 'Simulation only — no real charge'}</p>
                    </div>
                  )}

                  {/* Apple Pay */}
                  {topUpMethod === 'APPLE_PAY' && (
                    <div className="text-center space-y-4 py-4">
                      <div className="text-6xl">🍎</div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{lang === 'ar' ? 'سيتم فتح Apple Pay على جهازك' : 'Apple Pay will be triggered on your device'}</p>
                      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-500 font-semibold">
                        {lang === 'ar' ? '(محاكاة — لا تتطلب Touch ID في هذه المرحلة)' : '(Simulation — Touch ID not required at this stage)'}
                      </div>
                    </div>
                  )}

                  {/* PayPal */}
                  {topUpMethod === 'PAYPAL' && (
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">{lang === 'ar' ? 'البريد الإلكتروني لحساب PayPal' : 'PayPal Account Email'}</label>
                      <input value={mobilePhone} onChange={e => setMobilePhone(e.target.value)} placeholder="name@paypal.com"
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white" />
                      <p className="text-[10px] text-slate-400 flex items-center gap-1">🔒 {lang === 'ar' ? 'محاكاة — لن يتم تحويل أي مبلغ فعلي' : 'Simulation only — no real charge'}</p>
                    </div>
                  )}

                  {/* Yemeni Mobile Wallets */}
                  {['KURAIMI','JEEB','ONE_CASH','MFALOOS'].includes(topUpMethod) && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">{lang === 'ar' ? 'رقم الهاتف المسجل في المحفظة' : 'Registered Phone Number'}</label>
                        <input value={mobilePhone} onChange={e => setMobilePhone(e.target.value)} placeholder="+967 7XX XXX XXX"
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">{lang === 'ar' ? 'رقم مرجع التحويل (اختياري)' : 'Transfer Reference Number (optional)'}</label>
                        <input value={txRefNum} onChange={e => setTxRefNum(e.target.value)} placeholder="TX-XXXXXXXX"
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono font-bold text-slate-900 dark:text-white" />
                      </div>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1">🔒 {lang === 'ar' ? 'محاكاة — سيضاف الرصيد تلقائياً بعد المعالجة' : 'Simulation — balance will be credited after processing'}</p>
                    </div>
                  )}

                  <div className="pt-2 flex gap-2">
                    <button onClick={() => setTopUpStep(2)} className="w-1/3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300">{lang === 'ar' ? 'رجوع' : 'Back'}</button>
                    <button onClick={handleTopUpConfirm} disabled={isTopUpProcessing}
                      className="w-2/3 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2">
                      {isTopUpProcessing
                        ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>{lang === 'ar' ? 'جاري المعالجة...' : 'Processing...'}</>
                        : lang === 'ar' ? `تأكيد الدفع — ${formatCurrency(topUpAmount)}` : `Confirm Payment — ${formatCurrency(topUpAmount)}`}
                    </button>
                  </div>
                </>
              )}

              {/* STEP 4: Result */}
              {topUpStep === 4 && (
                <div className="text-center space-y-4 py-2">
                  {topUpResult?.success ? (
                    <>
                      <div className="text-5xl">✅</div>
                      <div>
                        <p className="text-base font-black text-emerald-600 dark:text-emerald-400">{lang === 'ar' ? 'تمت عملية الشحن بنجاح!' : 'Top-Up Successful!'}</p>
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mt-1">{lang === 'ar' ? `تم إضافة ${formatCurrency(topUpAmount)} إلى محفظتك` : `${formatCurrency(topUpAmount)} added to your wallet`}</p>
                        {topUpResult.txId && <p className="text-[10px] text-slate-400 mt-1 font-mono">Ref: {topUpResult.txId}</p>}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-5xl">❌</div>
                      <p className="text-base font-black text-rose-600">{lang === 'ar' ? 'فشلت عملية الدفع' : 'Payment Failed'}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{lang === 'ar' ? 'يرجى التحقق من بياناتك والمحاولة مجدداً' : 'Please check your details and try again'}</p>
                    </>
                  )}
                  <button onClick={() => { setShowTopUpModal(false); resetTopUpModal(); }}
                    className="w-full py-2.5 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white font-black text-xs rounded-xl transition">
                    {lang === 'ar' ? 'إغلاق' : 'Close'}
                  </button>
                  {!topUpResult?.success && (
                    <button onClick={() => setTopUpStep(3)} className="w-full py-2 text-xs font-bold text-blue-500 hover:underline">
                      {lang === 'ar' ? 'حاول مجدداً' : 'Try Again'}
                    </button>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ===== AUTH LOGIN / REGISTER MODAL ===== */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">

            {/* ── Tab header (hidden during OTP / forgot_sent steps) ── */}
            {authStep === 'form' && (
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex gap-4">
                  <button onClick={() => { setAuthMode('login'); setAuthError(''); }}
                    className={`font-black text-base transition ${authMode === 'login' ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'text-slate-400'}`}>
                    {lang === 'ar' ? 'تسجيل الدخول' : 'Login'}
                  </button>
                  <button onClick={() => { setAuthMode('register'); setAuthError(''); }}
                    className={`font-black text-base transition ${authMode === 'register' ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'text-slate-400'}`}>
                    {lang === 'ar' ? 'إنشاء حساب جديد' : 'Register'}
                  </button>
                </div>
                <button onClick={() => { setShowAuthModal(false); setAuthStep('form'); setAuthError(''); }} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>
            )}

            {/* ── OTP Verification Step ── */}
            {authStep === 'otp' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h3 className="font-black text-base text-slate-900 dark:text-white">
                    {lang === 'ar' ? '📧 تأكيد البريد الإلكتروني' : '📧 Email Verification'}
                  </h3>
                  <button onClick={() => { setShowAuthModal(false); setAuthStep('form'); setAuthError(''); }} className="text-slate-400 hover:text-slate-600">✕</button>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {lang === 'ar'
                    ? `تم إرسال رمز تحقق مؤلف من 6 أرقام إلى بريدك: `
                    : 'A 6-digit verification code has been sent to: '}
                  <strong className="text-blue-600 dark:text-cyan-400 font-mono">{pendingEmail}</strong>
                </p>
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {lang === 'ar' ? 'رمز التحقق (OTP)' : 'Verification Code (OTP)'}
                    </label>
                    <input
                      type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required
                      value={otpInput} onChange={e => setOtpInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="_ _ _ _ _ _"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-blue-400 dark:border-blue-600 rounded-xl text-center text-2xl font-black font-mono text-slate-900 dark:text-white tracking-[10px] focus:outline-none"
                    />
                  </div>
                  {authError && (
                    <p className="text-xs text-rose-600 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl px-3 py-2 font-semibold">{authError}</p>
                  )}
                  <button type="submit" disabled={otpLoading || otpInput.length !== 6}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2">
                    {otpLoading
                      ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{lang === 'ar' ? 'جاري التحقق...' : 'Verifying...'}</>
                      : (lang === 'ar' ? '✓ تأكيد الرمز وإكمال إنشاء الحساب' : '✓ Verify & Activate Account')}
                  </button>
                </form>
                <div className="text-center">
                  <span className="text-xs text-slate-400">{lang === 'ar' ? 'لم تستلم الرمز؟ ' : "Didn't receive the code? "}</span>
                  <button onClick={handleResendOtp} className="text-xs text-blue-600 dark:text-cyan-400 font-bold hover:underline">
                    {lang === 'ar' ? 'إعادة الإرسال' : 'Resend'}
                  </button>
                </div>
              </div>
            )}

            {/* ── Forgot Password Sent Step ── */}
            {authStep === 'forgot_sent' && (
              <div className="space-y-5 text-center py-4">
                <button onClick={() => { setShowAuthModal(false); setAuthStep('form'); setAuthError(''); }} className="absolute top-4 end-4 text-slate-400 hover:text-slate-600">✕</button>
                <div className="text-5xl">📬</div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {lang === 'ar' ? 'تم إرسال رابط إعادة التعيين!' : 'Reset Link Sent!'}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {lang === 'ar'
                    ? `إذا كان البريد "${emailInput}" مسجلاً لدينا، ستصلك رسالة تحتوي على رابط إعادة تعيين كلمة المرور. تحقق من صندوق الوارد أو مجلد الرسائل المزعجة.`
                    : `If "${emailInput}" is registered, a reset link has been sent. Check your inbox or spam folder.`}
                </p>
                <button
                  onClick={() => { setShowAuthModal(false); setAuthStep('form'); setAuthError(''); }}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition"
                >
                  {lang === 'ar' ? 'حسناً، تم الفهم' : 'Got it, close'}
                </button>
              </div>
            )}

            {/* ── Main Login / Register Form ── */}
            {authStep === 'form' && (
              <form onSubmit={handleAuthSubmit} className="space-y-3">
                {authMode === 'register' && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{lang === 'ar' ? 'الاسم الكامل' : 'Full Name'}</label>
                    <input type="text" required value={nameInput} onChange={e => setNameInput(e.target.value)}
                      placeholder={lang === 'ar' ? 'مثال: أحمد محمود' : 'e.g. John Smith'}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white" />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}</label>
                  <input type="email" required value={emailInput} onChange={e => setEmailInput(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{lang === 'ar' ? 'كلمة المرور' : 'Password'}</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} required value={passwordInput}
                      onChange={e => setPasswordInput(e.target.value)} placeholder="••••••••"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white pr-10" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 end-3 flex items-center text-slate-400 hover:text-slate-600 text-sm">
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {/* Password strength hints (on register) */}
                  {authMode === 'register' && passwordInput.length > 0 && (
                    <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 mt-2">
                      {[
                        { ok: pwStrength.len,   ar: '8 أحرف على الأقل',      en: 'At least 8 chars' },
                        { ok: pwStrength.upper, ar: 'حرف كبير (A-Z)',         en: 'Uppercase letter' },
                        { ok: pwStrength.lower, ar: 'حرف صغير (a-z)',         en: 'Lowercase letter' },
                        { ok: pwStrength.num,   ar: 'رقم (0-9)',              en: 'Number (0-9)' },
                        { ok: pwStrength.sym,   ar: 'رمز خاص (@#$)',          en: 'Special char' },
                      ].map((rule, i) => (
                        <span key={i} className={`text-[10px] font-semibold flex items-center gap-1 ${rule.ok ? 'text-emerald-500' : 'text-slate-400'}`}>
                          {rule.ok ? '✓' : '○'} {lang === 'ar' ? rule.ar : rule.en}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Confirm Password (register only) */}
                {authMode === 'register' && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{lang === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}</label>
                    <div className="relative">
                      <input type={showConfirmPw ? 'text' : 'password'} required value={confirmPwInput}
                        onChange={e => setConfirmPwInput(e.target.value)} placeholder="••••••••"
                        className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-bold text-slate-900 dark:text-white pr-10 ${
                          confirmPwInput
                            ? confirmPwInput === passwordInput ? 'border-emerald-400' : 'border-rose-400'
                            : 'border-slate-300 dark:border-slate-700'
                        }`} />
                      <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)}
                        className="absolute inset-y-0 end-3 flex items-center text-slate-400 hover:text-slate-600 text-sm">
                        {showConfirmPw ? '🙈' : '👁️'}
                      </button>
                    </div>
                    {confirmPwInput && confirmPwInput !== passwordInput && (
                      <p className="text-[11px] text-rose-500 font-semibold">{lang === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match'}</p>
                    )}
                    {confirmPwInput && confirmPwInput === passwordInput && (
                      <p className="text-[11px] text-emerald-500 font-semibold">✓ {lang === 'ar' ? 'متطابقتان' : 'Passwords match'}</p>
                    )}
                  </div>
                )}

                {/* Country automatically defaulted to Yemen */}

                {/* Error message */}
                {authError && (
                  <p className="text-xs text-rose-600 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl px-3 py-2 font-semibold">{authError}</p>
                )}

                <button type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition mt-2">
                  {authMode === 'login'
                    ? (lang === 'ar' ? 'دخول الحساب' : 'Sign In')
                    : (lang === 'ar' ? 'إنشاء الحساب' : 'Create Account')}
                </button>

                {/* Forgot Password (login only) */}
                {authMode === 'login' && (
                  <div className="text-center pt-1">
                    <button type="button" onClick={handleForgotPassword}
                      className="text-xs text-blue-600 dark:text-cyan-400 hover:underline font-bold">
                      {lang === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
                    </button>
                  </div>
                )}
              </form>
            )}

            {authStep === 'form' && (
              <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400">
                  🔒 {lang === 'ar' ? 'بيانات مشفرة وآمنة بالكامل' : 'Data encrypted & stored securely'}
                </span>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Global Interactive TopUp Modal */}
      <TopUpModal isOpen={isTopUpModalOpen} onClose={closeTopUpModal} />
    </>
  );
};
