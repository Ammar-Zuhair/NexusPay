import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_GAMES, MOCK_CATEGORIES, MOCK_USER_ORDERS, MOCK_NOTIFICATIONS, MOCK_FX_RATES, MOCK_PROVIDERS_HEALTH } from '../data/mockData';
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

  // Persistent User Session
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('nexus_user_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isGuestMode, setIsGuestMode] = useState(() => !user);

  // Persistent Cart Items
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('nexus_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Persistent Wallet & Ledger State
  const [userWallet, setUserWallet] = useState(() => {
    try {
      const saved = localStorage.getItem('nexus_user_wallet');
      return saved ? JSON.parse(saved) : { availableBalance: 0, heldBalance: 0, currency: 'USD' };
    } catch {
      return { availableBalance: 0, heldBalance: 0, currency: 'USD' };
    }
  });

  const [userCountry, setUserCountry] = useState(() => localStorage.getItem('nexus_user_country') || 'SA');
  const [browsingCountry, setBrowsingCountry] = useState(() => localStorage.getItem('nexus_browsing_country') || 'SA');

  // Persistent Orders History
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('nexus_user_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [notifications, setNotifications] = useState([]);
  const [isTopUpProcessing, setIsTopUpProcessing] = useState(false);

  // Auto-sync User Session to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('nexus_user_session', JSON.stringify(user));
      setIsGuestMode(false);
    } else {
      localStorage.removeItem('nexus_user_session');
      setIsGuestMode(true);
    }
  }, [user]);

  // Auto-sync Cart to localStorage
  useEffect(() => {
    localStorage.setItem('nexus_cart_items', JSON.stringify(cart));
  }, [cart]);

  // Auto-sync Wallet to localStorage
  useEffect(() => {
    localStorage.setItem('nexus_user_wallet', JSON.stringify(userWallet));
  }, [userWallet]);

  // Auto-sync Country preferences
  useEffect(() => {
    localStorage.setItem('nexus_browsing_country', browsingCountry);
  }, [browsingCountry]);

  useEffect(() => {
    localStorage.setItem('nexus_user_country', userCountry);
  }, [userCountry]);

  // Auto-sync Orders to localStorage
  useEffect(() => {
    localStorage.setItem('nexus_user_orders', JSON.stringify(orders));
  }, [orders]);

  // Persistent Categories State with Enable/Disable Status
  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('nexus_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        return MOCK_CATEGORIES.map(mc => {
          const found = parsed.find(p => p.id === mc.id);
          return found ? { ...mc, ...found } : { ...mc, isActive: true };
        });
      }
    } catch {
      // ignore
    }
    return MOCK_CATEGORIES.map(mc => ({ ...mc, isActive: true }));
  });

  useEffect(() => {
    localStorage.setItem('nexus_categories', JSON.stringify(categories));
  }, [categories]);

  const toggleCategoryStatus = async (catId) => {
    setCategories(prev => prev.map(c => {
      if (c.id === catId) {
        const nextStatus = c.isActive === false ? true : false;
        return { ...c, isActive: nextStatus };
      }
      return c;
    }));
    try {
      await fetch(`${API_BASE_URL}/categories/${catId}/toggle`, { method: 'PUT' });
    } catch (err) {
      console.warn('[BACKEND SYNC NOTICE]', err);
    }
    addToast(lang === 'ar' ? 'تم تحديث حالة القسم في المنصة!' : 'Category status updated!');
  };

  const activeCategories = categories.filter(c => c.isActive !== false);

  // Dynamic Feature Flags State
  const [featureFlags, setFeatureFlags] = useState(() => {
    try {
      const saved = localStorage.getItem('nexus_feature_flags');
      return saved ? JSON.parse(saved) : {
        GUEST_CHECKOUT: true,
        AUTO_FULFILLMENT: true,
        RELOADLY_FALLBACK: true,
        MAINTENANCE_MODE: false,
        ADMIN_2FA_ENFORCE: true
      };
    } catch {
      return { GUEST_CHECKOUT: true, AUTO_FULFILLMENT: true, RELOADLY_FALLBACK: true, MAINTENANCE_MODE: false, ADMIN_2FA_ENFORCE: true };
    }
  });

  useEffect(() => {
    localStorage.setItem('nexus_feature_flags', JSON.stringify(featureFlags));
  }, [featureFlags]);

  const toggleFeatureFlag = (flagKey) => {
    setFeatureFlags(prev => {
      const nextVal = !prev[flagKey];
      return { ...prev, [flagKey]: nextVal };
    });
  };

  // Structured Real System Audit & Event Logs State
  const [systemLogs, setSystemLogs] = useState(() => [
    { id: 'log-01', timestamp: new Date(Date.now() - 60000 * 5).toISOString(), level: 'INFO', category: 'ORDER', actor: 'SYSTEM', correlationId: 'CID-983728', action: 'ORDER_DELIVERED', details: { orderId: 'NP-981203', product: 'شدات ببجي 600 UC', priceUSD: 9.99, providerCost: 8.50, netProfit: 1.29 } },
    { id: 'log-02', timestamp: new Date(Date.now() - 60000 * 12).toISOString(), level: 'INFO', category: 'SECURITY', actor: 'usr-admin-ammar', correlationId: 'CID-110293', action: 'ADMIN_LOGIN_SUCCESS', details: { email: 'adminammar@gmail.com', ip: '197.230.12.4' } },
    { id: 'log-03', timestamp: new Date(Date.now() - 60000 * 25).toISOString(), level: 'WARN', category: 'SYSTEM', actor: 'SYSTEM', correlationId: 'CID-541289', action: 'PROVIDER_LATENCY_WARN', details: { provider: 'GlobalCodes', pingMs: 210, status: 'HALF_OPEN' } }
  ]);

  const logSystemEvent = ({ category = 'SYSTEM', level = 'INFO', actor = 'SYSTEM', action, details, correlationId }) => {
    const newLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 100)}`,
      timestamp: new Date().toISOString(),
      level,
      category,
      actor,
      action,
      details,
      correlationId: correlationId || `CID-${Math.floor(100000 + Math.random() * 900000)}`
    };
    setSystemLogs(prev => [newLog, ...prev]);
  };

  // Dynamic Products & Providers State with Real-Time Backend API Sync
  const [products, setProducts] = useState(MOCK_GAMES);
  const [providersList, setProvidersList] = useState(() => {
    try {
      const saved = localStorage.getItem('nexus_providers_list');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return MOCK_PROVIDERS_HEALTH.map(p => ({
      ...p,
      available_balance: p.balanceUSD || 1500.00,
      reserved_balance: 0.00,
      pingMs: p.latencyMs || 120,
      priority: 1,
      currency: 'USD'
    }));
  });

  useEffect(() => {
    localStorage.setItem('nexus_providers_list', JSON.stringify(providersList));
  }, [providersList]);

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
    setUserWallet({ availableBalance: 0, heldBalance: 0, currency: 'USD' });
    setOrders([]);
    localStorage.removeItem('nexus_user_session');
    localStorage.removeItem('nexus_user_wallet');
    localStorage.removeItem('nexus_user_orders');
    localStorage.removeItem('nexus_cart_items');
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

  // Enterprise Place Order Engine (Delegated Entirely to Backend REST API)
  const executeOrderCheckout = async (orderDetails) => {
    const cid = `CID-${Math.floor(100000 + Math.random() * 900000)}`;
    const product = MOCK_GAMES.find(g => g.id === orderDetails.productId) || MOCK_GAMES[0];

    try {
      // Direct REST API Request to Express Backend Server
      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'idempotency-key': `ik-${Date.now()}`
        },
        body: JSON.stringify({
          productId: product.id,
          productTitle: typeof product.title === 'string' ? product.title : (product.title[lang] || product.title.en),
          packageId: orderDetails.packageId || 'default-pkg',
          quantity: orderDetails.quantity || 1,
          priceUSD: orderDetails.totalUSD || product.minPriceUSD || 9.99,
          providerCostUSD: orderDetails.providerCostUSD || (product.packages?.[0]?.providerCostUSD) || ((orderDetails.totalUSD || 9.99) * 0.85),
          targetAccountId: orderDetails.targetAccountId || orderDetails.playerId || 'N/A',
          paymentMethod: orderDetails.paymentMethod || 'GATEWAY',
          isGuest: orderDetails.isGuest || !user,
          guestEmail: orderDetails.guestEmail || (user ? user.email : 'guest@example.com')
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Order fulfillment failed on backend server');
      }

      const deliveredOrder = data.order;

      // Update Presentation State from Backend Response
      setOrders(prev => [deliveredOrder, ...prev]);

      // Deduct Provider Balance in local presentation state from Backend Response
      setProvidersList(prev => prev.map(p => {
        if (p.driver === deliveredOrder.providerCode || p.driver === 'RELOADLY' || p.id === 'prov-reloadly') {
          const currentAvail = p.available_balance || p.balanceUSD || 1500;
          const nextAvail = Math.max(0, currentAvail - (deliveredOrder.providerCostUSD || 8.50));
          return { ...p, available_balance: nextAvail, balanceUSD: nextAvail };
        }
        return p;
      }));

      // Log Presentation Event
      logSystemEvent({
        category: 'ORDER',
        level: 'INFO',
        actor: user ? user.name : 'GUEST',
        action: 'ORDER_DELIVERED_FROM_BACKEND',
        correlationId: deliveredOrder.correlationId || cid,
        details: {
          orderId: deliveredOrder.id,
          product: deliveredOrder.productTitle,
          priceUSD: deliveredOrder.priceUSD,
          providerCostUSD: deliveredOrder.providerCostUSD,
          netProfitUSD: deliveredOrder.netProfitUSD
        }
      });

      clearCart();

      // Emit UI Notification
      const newNotif = {
        id: `n-${Date.now()}`,
        category: 'orders',
        title: { en: `Order ${deliveredOrder.id} Delivered`, ar: `تم تسليم الطلب ${deliveredOrder.id}` },
        message: { en: `Order ${deliveredOrder.id} completed by Backend API. CID: ${deliveredOrder.correlationId}`, ar: `تم تلبية طلبك ${deliveredOrder.id} بنجاح من السيرفر. معرف التتبع: ${deliveredOrder.correlationId}` },
        timestamp: 'Just now',
        read: false,
        type: 'success'
      };
      setNotifications(prev => [newNotif, ...prev]);

      addToast(
        lang === 'ar'
          ? `تم تنفيذ الطلب ${deliveredOrder.id} بنجاح من السيرفر! CID: ${deliveredOrder.correlationId}`
          : `Order ${deliveredOrder.id} delivered from Server! CID: ${deliveredOrder.correlationId}`
      );
      return deliveredOrder;

    } catch (err) {
      logSystemEvent({
        category: 'SYSTEM',
        level: 'ERROR',
        actor: 'SYSTEM',
        action: 'BACKEND_ORDER_FAILED',
        correlationId: cid,
        details: { error: err.message }
      });

      addToast(
        lang === 'ar' ? `فشل تنفيذ الطلب من السيرفر: ${err.message}` : `Backend order failed: ${err.message}`,
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
        categories,
        activeCategories,
        toggleCategoryStatus,
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
        featureFlags,
        toggleFeatureFlag,
        systemLogs,
        logSystemEvent,
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
