import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_GAMES, MOCK_USER_ORDERS, MOCK_NOTIFICATIONS, MOCK_FX_RATES, MOCK_PROVIDERS_HEALTH } from '../data/mockData';
import { EventBus, DOMAIN_EVENTS } from '../packages/events/EventBus';
import { CategorizedLogger } from '../packages/logging/CategorizedLogger';
import { DoubleEntryLedger } from '../services/wallets/DoubleEntryLedger';
import { OrderStateMachine, ORDER_STATES } from '../services/orders/OrderStateMachine';
import { CodeReservationEngine } from '../services/inventory/CodeReservationEngine';
import { ConfigService } from '../services/configuration/ConfigService';
import { SmartRoutingEngine } from '../services/providers/SmartRoutingEngine';
import { DLQManager } from '../services/dlq/DLQManager';
import { TracingService } from '../services/observability/TracingService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [lang, setLang] = useState('ar'); // Default language Arabic
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [currency, setCurrency] = useState('USD'); // USD, EUR, SAR, AED, YER, EGP
  const [activeTab, setActiveTabState] = useState('home');
  const [selectedGameId, setSelectedGameIdState] = useState('pubg-mobile');

  // Sync tab navigation with Browser History (Back / Forward button support)
  const changeTabWithHistory = (newTab, gameId = null, replace = false) => {
    const targetGameId = gameId || selectedGameId;
    setActiveTabState(newTab);
    if (gameId) {
      setSelectedGameIdState(gameId);
    }

    const stateObj = { tab: newTab, gameId: targetGameId };
    const hashStr = '#' + newTab + (newTab === 'product' && targetGameId ? `/${targetGameId}` : '');

    if (replace) {
      window.history.replaceState(stateObj, '', hashStr);
    } else {
      if (window.location.hash !== hashStr) {
        window.history.pushState(stateObj, '', hashStr);
      }
    }
  };

  const setActiveTab = (tab, gameId = null) => {
    changeTabWithHistory(tab, gameId);
  };

  const setSelectedGameId = (gameId) => {
    setSelectedGameIdState(gameId);
    if (activeTab === 'product') {
      changeTabWithHistory('product', gameId, true);
    }
  };

  // Browser History (Popstate) & URL Hash Listener for Back/Forward Buttons
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.tab) {
        setActiveTabState(event.state.tab);
        if (event.state.gameId) {
          setSelectedGameIdState(event.state.gameId);
        }
      } else if (window.location.hash) {
        const hash = window.location.hash.replace('#', '');
        const parts = hash.split('/');
        const tab = parts[0] || 'home';
        const gId = parts[1] || null;

        setActiveTabState(tab);
        if (gId) {
          setSelectedGameIdState(gId);
        }
      } else {
        setActiveTabState('home');
      }
    };

    if (window.location.hash) {
      handlePopState({});
    } else {
      window.history.replaceState({ tab: 'home', gameId: 'pubg-mobile' }, '', '#home');
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // User & Guest Checkout State — starts as guest (no hardcoded demo user)
  const [user, setUser] = useState(null);
  const [isGuestMode, setIsGuestMode] = useState(true);

  // Wallet & Ledger State — starts empty, populated after login
  const [userWallet, setUserWallet] = useState({ availableBalance: 0, heldBalance: 0, currency: 'USD' });
  const [userCountry, setUserCountry] = useState('SA');
  const [browsingCountry, setBrowsingCountry] = useState('SA'); // Default view country code
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isTopUpProcessing, setIsTopUpProcessing] = useState(false);

  // Dynamic Products & Providers State with Real-Time Backend API Sync
  const [products, setProducts] = useState(MOCK_GAMES);
  const [providersList, setProvidersList] = useState(MOCK_PROVIDERS_HEALTH);

  const fetchProducts = (countryCode) => {
    fetch(`${API_BASE_URL}/products?countryCode=${countryCode}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.products) {
          setProducts(data.products);
        }
      })
      .catch(() => console.log('[FRONTEND NOTICE] Backend products sync fallback...'));
  };

  useEffect(() => {
    fetchProducts(browsingCountry);
  }, [browsingCountry]);

  // Initial Fetch for providers only (products fetched via browsingCountry effect)
  useEffect(() => {
    fetch(`${API_BASE_URL}/providers`)
      .then(res => res.json())
      .then(data => {
        if (data && data.providers && data.providers.length > 0) {
          setProvidersList(data.providers);
        }
      })
      .catch(() => console.log('[FRONTEND NOTICE] Backend dev server syncing...'));
  }, []);

  const addProduct = async (newProd) => {
    setProducts(prev => [newProd, ...prev]);
    try {
      await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProd)
      });
    } catch (err) {
      console.warn('[BACKEND SYNC NOTICE]', err);
    }
    addToast(lang === 'ar' ? `تم إضافة المنتج وحفظه في السيرفر والقاعدة!` : `Product created & saved in Database!`);
  };

  const updateProduct = async (prodId, updatedFields) => {
    setProducts(prev => prev.map(p => p.id === prodId ? { ...p, ...updatedFields } : p));
    try {
      await fetch(`${API_BASE_URL}/products/${prodId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
    } catch (err) {
      console.warn('[BACKEND SYNC NOTICE]', err);
    }
    addToast(lang === 'ar' ? 'تم تحديث بيانات المنتج ورابط الصورة في السيرفر!' : 'Product & Image URL updated in Database!');
  };

  const deleteProduct = async (prodId) => {
    setProducts(prev => prev.filter(p => p.id !== prodId));
    try {
      await fetch(`${API_BASE_URL}/products/${prodId}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('[BACKEND SYNC NOTICE]', err);
    }
    addToast(lang === 'ar' ? 'تم حذف المنتج من السيرفر والقاعدة' : 'Product deleted from Database');
  };

  const addPackageToProduct = async (prodId, newPkg) => {
    setProducts(prev => prev.map(p => {
      if (p.id === prodId) {
        return {
          ...p,
          packages: [...(p.packages || []), newPkg]
        };
      }
      return p;
    }));
    try {
      await fetch(`${API_BASE_URL}/products/${prodId}/packages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPkg)
      });
    } catch (err) {
      console.warn('[BACKEND SYNC NOTICE]', err);
    }
    addToast(lang === 'ar' ? `تم إضافة الباقة وحفظها في قاعدة السيرفر: ${newPkg.name}` : `Package tier saved to Database: ${newPkg.name}`);
  };

  const updatePackageInProduct = async (prodId, pkgId, updatedPkgFields) => {
    setProducts(prev => prev.map(p => {
      if (p.id === prodId) {
        return {
          ...p,
          packages: (p.packages || []).map(pkg => pkg.id === pkgId ? { ...pkg, ...updatedPkgFields } : pkg)
        };
      }
      return p;
    }));
    try {
      await fetch(`${API_BASE_URL}/products/${prodId}/packages/${pkgId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPkgFields)
      });
    } catch (err) {
      console.warn('[BACKEND SYNC NOTICE]', err);
    }
    addToast(lang === 'ar' ? 'تم تحديث بيانات الباقة في السيرفر!' : 'Package tier updated in Database!');
  };

  const deletePackageFromProduct = async (prodId, pkgId) => {
    setProducts(prev => prev.map(p => {
      if (p.id === prodId) {
        return {
          ...p,
          packages: (p.packages || []).filter(pkg => pkg.id !== pkgId)
        };
      }
      return p;
    }));
    try {
      await fetch(`${API_BASE_URL}/products/${prodId}/packages/${pkgId}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('[BACKEND SYNC NOTICE]', err);
    }
    addToast(lang === 'ar' ? 'تم حذف الباقة من قاعدة السيرفر' : 'Package tier removed from Database');
  };

  const addProvider = async (newProv) => {
    setProvidersList(prev => [newProv, ...prev]);
    try {
      await fetch(`${API_BASE_URL}/providers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProv)
      });
    } catch (err) {
      console.warn('[BACKEND SYNC NOTICE]', err);
    }
    addToast(lang === 'ar' ? `تم ربط وتجهيز المورد في السيرفر: ${newProv.driver}` : `Provider driver saved to Database: ${newProv.driver}`);
  };

  const updateProvider = async (targetDriver, updatedProvFields) => {
    setProvidersList(prev => prev.map(pr => pr.driver === targetDriver ? { ...pr, ...updatedProvFields } : pr));
    try {
      await fetch(`${API_BASE_URL}/providers/${encodeURIComponent(targetDriver)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProvFields)
      });
    } catch (err) {
      console.warn('[BACKEND SYNC NOTICE]', err);
    }
    addToast(lang === 'ar' ? 'تم تحديث بيانات المورد ورابط الشعار في السيرفر!' : 'Provider & Logo URL updated in Database!');
  };

  const toggleProviderStatus = async (provDriver) => {
    setProvidersList(prev => prev.map(pr => {
      if (pr.driver === provDriver) {
        const nextStatus = pr.status === 'HEALTHY' ? 'MAINTENANCE' : 'HEALTHY';
        return { ...pr, status: nextStatus };
      }
      return pr;
    }));
    try {
      await fetch(`${API_BASE_URL}/providers/${encodeURIComponent(provDriver)}/toggle`, { method: 'PUT' });
    } catch (err) {
      console.warn('[BACKEND SYNC NOTICE]', err);
    }
    addToast(lang === 'ar' ? 'تم تحديث حالة المورد في السيرفر والقاعدة' : 'Provider status updated in Database');
  };

  // Auth & RBAC Operations
  const toggleUserRole = () => {
    if (!user) return;
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    setUser(prev => ({ ...prev, role: newRole }));
    addToast(
      lang === 'ar' 
        ? `تم تغيير الصلاحية إلى: ${newRole === 'ADMIN' ? 'مدير منصة (Admin)' : 'عميل عادي (User)'}` 
        : `Role updated to: ${newRole}`
    );
  };

  const validatePasswordStrength = (password) => {
    if (!password || password.length < 8) return false;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    return hasUppercase && hasLowercase && hasNumber && hasSpecial;
  };

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }
      setUser(data.user);
      setIsGuestMode(false);
      if (data.user.countryCode) {
        setUserCountry(data.user.countryCode);
        setBrowsingCountry(data.user.countryCode);
      }
      if (data.wallet) {
        setUserWallet(data.wallet);
      } else {
        setUserWallet({ availableBalance: 0, heldBalance: 0, currency: 'USD' });
      }
      addToast(lang === 'ar' ? `مرحباً بك ${data.user.name}!` : `Welcome, ${data.user.name}!`);
      return true;
    } catch (err) {
      addToast(lang === 'ar' ? `فشل تسجيل الدخول: ${err.message}` : `Login failed: ${err.message}`, 'error');
      return false;
    }
  };

  const register = async (name, email, password, countryCode = 'SA') => {
    if (!validatePasswordStrength(password)) {
      addToast(
        lang === 'ar' 
          ? 'يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل، تشمل حرفاً كبيراً، حرفاً صغيراً، رقماً، ورمزاً خاصاً.' 
          : 'Password must be at least 8 characters and include uppercase, lowercase, numbers, and symbols.',
        'error'
      );
      return false;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, countryCode })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      setUser(data.user);
      setUserCountry(data.user.countryCode || countryCode);
      setBrowsingCountry(data.user.countryCode || countryCode);
      setIsGuestMode(false);
      setUserWallet({ availableBalance: 0, heldBalance: 0, currency: 'USD' });
      addToast(lang === 'ar' ? `تم إنشاء حسابك بنجاح !` : `Account created successfully!`);
      return true;
    } catch (err) {
      addToast(lang === 'ar' ? `فشل إنشاء الحساب: ${err.message}` : `Registration failed: ${err.message}`, 'error');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsGuestMode(true);
    addToast(lang === 'ar' ? 'تم تسجيل الخروج بنجاح' : 'Logged out successfully', 'info');
  };

  const topUpWallet = async (amountUSD, paymentMethod, paymentData = {}) => {
    if (!user) {
      addToast(lang === 'ar' ? 'يجب تسجيل الدخول أولاً لشحن المحفظة' : 'You must be logged in to top up your wallet', 'error');
      return false;
    }
    setIsTopUpProcessing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/payments/topup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          amountUSD: parseFloat(amountUSD),
          paymentMethod,
          paymentData
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Payment failed');
      }
      // Update local wallet state
      const newBalance = (userWallet.availableBalance || 0) + parseFloat(amountUSD);
      setUserWallet(prev => ({ ...prev, availableBalance: newBalance }));
      addToast(
        lang === 'ar' 
          ? `تم شحن المحفظة بمبلغ ${formatCurrency(amountUSD)} بنجاح! رقم العملية: ${data.txId}` 
          : `Wallet topped up with ${formatCurrency(amountUSD)}! Ref: ${data.txId}`
      );
      return { success: true, txId: data.txId };
    } catch (err) {
      addToast(
        lang === 'ar' 
          ? `فشلت عملية الشحن: ${err.message}` 
          : `Top-up failed: ${err.message}`,
        'error'
      );
      return false;
    } finally {
      setIsTopUpProcessing(false);
    }
  };

  // Sync document direction and language
  useEffect(() => {
    const htmlEl = document.documentElement;
    htmlEl.dir = lang === 'ar' ? 'rtl' : 'ltr';
    htmlEl.lang = lang;
  }, [lang]);

  // Sync Theme across HTML and Body elements
  useEffect(() => {
    const htmlEl = document.documentElement;
    const bodyEl = document.body;
    if (theme === 'dark') {
      htmlEl.classList.add('dark');
      htmlEl.classList.remove('light');
      if (bodyEl) {
        bodyEl.classList.add('dark');
        bodyEl.classList.remove('light');
      }
      localStorage.setItem('theme', 'dark');
    } else {
      htmlEl.classList.add('light');
      htmlEl.classList.remove('dark');
      if (bodyEl) {
        bodyEl.classList.add('light');
        bodyEl.classList.remove('dark');
      }
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  // Subscribe to EventBus
  useEffect(() => {
    const unsubscribe = EventBus.subscribe(DOMAIN_EVENTS.NOTIFICATION_SENT, (evt) => {
      addToast(evt.payload?.message || 'Notification Received', 'info');
    });
    return () => unsubscribe();
  }, []);

  const toggleLang = () => setLang(prev => (prev === 'ar' ? 'en' : 'ar'));
  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  const formatCurrency = (amountUSD) => {
    const rate = MOCK_FX_RATES[currency] || 1.0;
    const converted = amountUSD * rate;
    const symbols = { USD: '$', EUR: '€', SAR: 'ر.س', AED: 'د.إ', YER: 'ر.ي', EGP: 'ج.م' };
    return `${symbols[currency] || '$'}${converted.toFixed(2)}`;
  };

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const addToCart = (item) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(i => i.id === item.id && i.targetAccountId === item.targetAccountId);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += (item.quantity || 1);
        return updated;
      }
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });
    addToast(
      lang === 'ar' 
        ? `تمت إضافة ${item.title} إلى عربة التسوق` 
        : `Added ${item.title} to cart`
    );
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(item => item.id !== id));
  const updateCartQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };
  const clearCart = () => setCart([]);

  // Enterprise Place Order Engine (Registered User or Guest Checkout)
  const executeOrderCheckout = async (orderDetails) => {
    const cid = `CID-${Math.floor(100000 + Math.random() * 900000)}`;
    const product = MOCK_GAMES.find(g => g.id === orderDetails.productId) || MOCK_GAMES[0];
    const totalUSD = orderDetails.totalUSD || 9.99;
    const currentUserId = user ? user.id : 'usr-demo-01';

    let newOrder = {
      id: `NP-${Date.now().toString().slice(-6)}`,
      correlationId: cid,
      productTitle: product.title[lang] || product.title.en,
      productId: product.id,
      targetAccountId: orderDetails.targetAccountId || orderDetails.playerId || 'N/A',
      isGuest: orderDetails.isGuest || !user,
      guestEmail: orderDetails.guestEmail || (user ? user.email : 'guest@example.com'),
      guestPhone: orderDetails.guestPhone || '',
      priceUSD: totalUSD,
      paymentMethod: orderDetails.paymentMethod || 'GATEWAY',
      status: ORDER_STATES.CREATED,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    try {
      // 1. FSM: CREATED -> VALIDATING_REQUEST
      OrderStateMachine.transition(newOrder, ORDER_STATES.VALIDATING_REQUEST, 'Validating customer request', cid);

      // 2. Financial Double-Entry Ledger: HOLD Funds if paying with Site Wallet
      if (orderDetails.paymentMethod === 'WALLET') {
        DoubleEntryLedger.hold(currentUserId, totalUSD, newOrder.id, cid);
        setUserWallet({ ...DoubleEntryLedger.getWallet(currentUserId) });
      }

      // 3. FSM: VALIDATING_REQUEST -> PAYMENT_PENDING -> PAYMENT_CONFIRMED
      OrderStateMachine.transition(newOrder, ORDER_STATES.PAYMENT_PENDING, 'Awaiting gateway confirmation', cid);
      OrderStateMachine.transition(newOrder, ORDER_STATES.PAYMENT_CONFIRMED, 'Payment confirmed via idempotency guard', cid);

      // 4. Smart Provider Selection Engine
      const { selectedDriver } = await SmartRoutingEngine.selectBestProvider(product, { correlationId: cid });

      // 5. FSM: WAITING_PROVIDER -> PROCESSING
      OrderStateMachine.transition(newOrder, ORDER_STATES.WAITING_PROVIDER, `Routing to ${selectedDriver.name}`, cid);
      OrderStateMachine.transition(newOrder, ORDER_STATES.PROCESSING, 'Executing provider API order delivery', cid);

      // 6. Provider Execution
      const providerRes = await selectedDriver.createOrder({ orderId: newOrder.id, forceFail: orderDetails.simulateFail });

      // 7. Code Reservation or Direct Delivery Confirmation
      if (product.productType === 'VOUCHER_CODE' || product.productType === 'LICENSE_KEY') {
        CodeReservationEngine.reserveCode(product.id, newOrder.id, cid);
        CodeReservationEngine.confirmSale(newOrder.id, cid);
      }

      // 8. Financial Capture
      if (orderDetails.paymentMethod === 'WALLET') {
        DoubleEntryLedger.capture(currentUserId, totalUSD, newOrder.id, cid);
        setUserWallet({ ...DoubleEntryLedger.getWallet(currentUserId) });
      }

      // 9. FSM: PROCESSING -> DELIVERED
      OrderStateMachine.transition(newOrder, ORDER_STATES.DELIVERED, `Fulfilled by ${selectedDriver.name}`, cid);
      newOrder.code = providerRes.deliveredPayload?.pinCode || 'DIRECT_TOPUP_FULFILLED';

      setOrders(prev => [newOrder, ...prev]);
      clearCart();

      // Emit Notification
      const newNotif = {
        id: `n-${Date.now()}`,
        category: 'orders',
        title: { en: `Order ${newOrder.id} Delivered`, ar: `تم تسليم الطلب ${newOrder.id}` },
        message: { en: `Order ${newOrder.id} completed. CID: ${cid}`, ar: `تم تلبية طلبك ${newOrder.id} بنجاح. معرف التتبع: ${cid}` },
        timestamp: 'Just now',
        read: false,
        type: 'success'
      };
      setNotifications(prev => [newNotif, ...prev]);

      addToast(
        lang === 'ar'
          ? `تم تنفيذ الطلب ${newOrder.id} بنجاح! CID: ${cid}`
          : `Order ${newOrder.id} delivered! CID: ${cid}`
      );
      return newOrder;

    } catch (err) {
      CategorizedLogger.log('ORDER', { correlationId: cid, orderId: newOrder.id, error: err.message });
      
      // Rollback Wallet Hold if applicable
      if (orderDetails.paymentMethod === 'WALLET') {
        DoubleEntryLedger.release(currentUserId, totalUSD, newOrder.id, cid);
        setUserWallet({ ...DoubleEntryLedger.getWallet(currentUserId) });
      }

      // Move to DLQ
      DLQManager.pushToDLQ(newOrder, err.message, cid);
      newOrder.status = ORDER_STATES.FAILED;
      setOrders(prev => [newOrder, ...prev]);

      addToast(
        lang === 'ar' ? `فشل تنفيذ الطلب: ${err.message}` : `Order failed: ${err.message}`,
        'error'
      );
      throw err;
    }
  };

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        toggleLang,
        theme,
        setTheme,
        toggleTheme,
        currency,
        setCurrency,
        formatCurrency,
        activeTab,
        setActiveTab,
        selectedGameId,
        setSelectedGameId,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        user,
        isGuestMode,
        setIsGuestMode,
        login,
        register,
        logout,
        toggleUserRole,
        userWallet,
        userCountry,
        setUserCountry,
        browsingCountry,
        setBrowsingCountry,
        isTopUpProcessing,
        topUpWallet,
        orders,
        executeOrderCheckout,
        notifications,
        unreadNotificationsCount: notifications.filter(n => !n.read).length,
        markNotificationAsRead: id => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n)),
        markAllNotificationsAsRead: () => setNotifications(prev => prev.map(n => ({ ...n, read: true }))),
        clearNotifications: () => setNotifications([]),
        products,
        setProducts,
        providersList,
        setProvidersList,
        addProduct,
        updateProduct,
        deleteProduct,
        addPackageToProduct,
        updatePackageInProduct,
        deletePackageFromProduct,
        addProvider,
        updateProvider,
        toggleProviderStatus,
        toasts,
        addToast,
        removeToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
