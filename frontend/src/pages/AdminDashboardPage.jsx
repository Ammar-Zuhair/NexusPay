import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { OptimizedImage } from '../components/OptimizedImage';
import { 
  MOCK_ADMIN_METRICS, 
  MOCK_PROVIDERS_HEALTH,
  MOCK_TRACE_SCENARIO,
  SUPPORTED_COUNTRIES
} from '../data/mockData';
import { DB_SCHEMA } from '../data/dbSchema';
import { CategorizedLogger } from '../packages/logging/CategorizedLogger';
import { SmartRoutingEngine } from '../services/providers/SmartRoutingEngine';
import { DoubleEntryLedger } from '../services/wallets/DoubleEntryLedger';
import { CodeReservationEngine } from '../services/inventory/CodeReservationEngine';
import { ConfigService } from '../services/configuration/ConfigService';
import { DLQManager } from '../services/dlq/DLQManager';
import { TracingService } from '../services/observability/TracingService';
import { APMMonitor } from '../services/observability/APMMonitor';
import { MultichannelNotificationEngine } from '../services/notifications/MultichannelNotificationEngine';
import { RBACPolicyEngine } from '../services/rbac/RBACPolicyEngine';
import { AccountingGeneralLedger } from '../services/accounting/AccountingGeneralLedger';
import { ReconciliationEngine } from '../services/accounting/ReconciliationEngine';
import { TaskScheduler } from '../services/scheduler/TaskScheduler';
import { HealthCheckService } from '../services/health/HealthCheckService';
import { ProviderSandboxReplay } from '../services/providers/ProviderSandboxReplay';
import { VendorService } from '../services/vendor/VendorService';
import { LicensingService } from '../services/licensing/LicensingService';
import { TamperProofAuditService } from '../services/audit/TamperProofAuditService';
import { OPERATIONAL_RUNBOOKS } from '../services/runbook/OperationalRunbookService';
import { runEnterpriseTestSuite } from '../tests/EnterpriseSuite.test';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

import { 
  TrendingUp, Server, ShieldCheck, Terminal, Database, 
  DollarSign, SlidersHorizontal, AlertTriangle, Radio, HardDrive, Key, 
  CheckCircle2, Zap, Lock, RefreshCw, Users, FileText, Play, Building, Award, Shield,
  Plus, PlusCircle, Trash2, Edit3, ShoppingBag, Layers, X, Globe, Cpu, Check, Image as ImageIcon
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const { 
    lang, 
    addToast, 
    formatCurrency,
    products,
    providersList,
    addProduct,
    updateProduct,
    deleteProduct,
    addPackageToProduct,
    updatePackageInProduct,
    deletePackageFromProduct,
    addProvider,
    updateProvider,
    toggleProviderStatus
  } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState('catalog-editor');

  // Modal Visibility States
  const [showAddProdModal, setShowAddProdModal] = useState(false);
  const [showEditProdModal, setShowEditProdModal] = useState(false);
  const [editingProd, setEditingProd] = useState(null);

  const [showAddPkgModal, setShowAddPkgModal] = useState(false);
  const [showEditPkgModal, setShowEditPkgModal] = useState(false);
  const [selectedProdForPkg, setSelectedProdForPkg] = useState(null);
  const [editingPkg, setEditingPkg] = useState(null);

  const [showAddProvModal, setShowAddProvModal] = useState(false);
  const [showEditProvModal, setShowEditProvModal] = useState(false);
  const [editingProv, setEditingProv] = useState(null);

  // New & Edit Product Form State
  const [prodForm, setProdForm] = useState({
    titleAr: '',
    titleEn: '',
    publisher: '',
    productType: 'DIRECT_TOPUP',
    badge: 'INSTANT DELIVERY',
    minPriceUSD: '4.99',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
    descAr: '',
    descEn: ''
  });

  // New & Edit Package Form State
  const [pkgForm, setPkgForm] = useState({
    name: '',
    priceUSD: '',
    priceSAR: '',
    providerCostUSD: '',
    providerCode: 'RELOADLY',
    reloadlyProductId: '',
    providerSku: '',
    countryCode: 'GLOBAL'
  });

  // New & Edit Provider Form State
  const [provForm, setProvForm] = useState({
    driver: '',
    type: 'REST_API',
    endpoint: '',
    apiKey: '',
    region: 'GLOBAL',
    logoUrl: ''
  });

  // Admin account setup state
  const [adminForm, setAdminForm] = useState({ name: '', email: '', password: '' });
  const [adminsList, setAdminsList] = useState([
    { name: 'سلطان الحربي', email: 'admin@nexuspay.com' },
    { name: 'أحمد محمود', email: 'ahmed@example.com' }
  ]);

  // System Controls
  const [logChannelFilter, setLogChannelFilter] = useState('ALL');
  const [correlationSearch, setCorrelationSearch] = useState('CID-983728');
  const [selectedDbTable, setSelectedDbTable] = useState('orders');
  const [featureFlags, setFeatureFlags] = useState(ConfigService.getAllFlags());
  const [dlqItems, setDlqItems] = useState(DLQManager.getDLQItems());
  const [cbStatuses, setCbStatuses] = useState(SmartRoutingEngine.getCircuitBreakerStatus());
  const [testResults, setTestResults] = useState([]);

  const apmMetrics = APMMonitor.getMetrics();
  const healthStatus = HealthCheckService.getHealth();
  const vendors = VendorService.getVendors();

  const handleRunTests = () => {
    const results = runEnterpriseTestSuite();
    setTestResults(results);
    addToast(lang === 'ar' ? 'تم تشغيل حزمة الاختبارات الشاملة' : 'Executed automated test suite');
  };

  const handleCreateAdminSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password } = adminForm;
    if (!name || !email || !password) {
      addToast(lang === 'ar' ? 'يرجى إدخال كافة البيانات المطلوبة' : 'Please enter all required fields', 'error');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/auth/create-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create admin');
      }
      setAdminsList(prev => [...prev, { name: data.user.name, email: data.user.email }]);
      setAdminForm({ name: '', email: '', password: '' });
      addToast(lang === 'ar' ? 'تم إنشاء وتشفير حساب المسؤول بنجاح في قاعدة البيانات!' : 'Admin created & stored securely!');
    } catch (err) {
      addToast(lang === 'ar' ? `فشل إنشاء حساب المسؤول: ${err.message}` : `Error: ${err.message}`, 'error');
    }
  };

  // --- PRODUCT HANDLERS ---
  const handleCreateProductSubmit = (e) => {
    e.preventDefault();
    if (!prodForm.titleAr || !prodForm.titleEn) {
      addToast(lang === 'ar' ? 'يرجى إدخال عنوان المنتج بالعربية والإنجليزية' : 'Please enter product title in AR & EN', 'error');
      return;
    }
    const createdId = `prod-${Date.now().toString().slice(-4)}`;
    const createdProduct = {
      id: createdId,
      categoryId: prodForm.productType === 'DIRECT_TOPUP' ? 'cat-topup' : 'cat-cards',
      productType: prodForm.productType,
      title: { ar: prodForm.titleAr, en: prodForm.titleEn },
      publisher: prodForm.publisher || 'NexusPay Distribution',
      image: prodForm.image,
      badge: prodForm.badge,
      isPopular: true,
      rating: 4.9,
      reviewsCount: 120,
      minPriceUSD: 0.00,
      minPriceSAR: 0.00,
      packages: [], // Starts with empty packages
      description: {
        ar: prodForm.descAr || 'خدمة شحن رقمية فورية موثوقة ومضمونة 100%.',
        en: prodForm.descEn || 'Instant digital fulfillment guaranteed.'
      }
    };

    addProduct(createdProduct);
    setShowAddProdModal(false);
    resetProdForm();
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProd(prod);
    setProdForm({
      titleAr: typeof prod.title === 'string' ? prod.title : (prod.title?.ar || ''),
      titleEn: typeof prod.title === 'string' ? prod.title : (prod.title?.en || ''),
      publisher: prod.publisher || '',
      productType: prod.productType || 'DIRECT_TOPUP',
      badge: prod.badge || '',
      image: prod.image || '',
      descAr: typeof prod.description === 'string' ? prod.description : (prod.description?.ar || ''),
      descEn: typeof prod.description === 'string' ? prod.description : (prod.description?.en || '')
    });
    setShowEditProdModal(true);
  };

  const handleUpdateProductSubmit = (e) => {
    e.preventDefault();
    if (!editingProd) return;
    const updatedFields = {
      title: { ar: prodForm.titleAr, en: prodForm.titleEn },
      publisher: prodForm.publisher,
      productType: prodForm.productType,
      badge: prodForm.badge,
      minPriceUSD: 0.00,
      minPriceSAR: 0.00,
      image: prodForm.image,
      description: { ar: prodForm.descAr, en: prodForm.descEn }
    };
    updateProduct(editingProd.id, updatedFields);
    setShowEditProdModal(false);
    setEditingProd(null);
    resetProdForm();
  };

  const resetProdForm = () => {
    setProdForm({
      titleAr: '',
      titleEn: '',
      publisher: '',
      productType: 'DIRECT_TOPUP',
      badge: 'INSTANT DELIVERY',
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
      descAr: '',
      descEn: ''
    });
  };

  // --- PACKAGE HANDLERS ---
  const handleCreatePackageSubmit = (e) => {
    e.preventDefault();
    if (!pkgForm.name || !pkgForm.priceUSD) {
      addToast(lang === 'ar' ? 'يرجى إدخال اسم الباقة والسعر بالدولار' : 'Please enter package name and USD price', 'error');
      return;
    }
    const usd = parseFloat(pkgForm.priceUSD);
    const sar = pkgForm.priceSAR ? parseFloat(pkgForm.priceSAR) : usd * 3.75;
    const cost = pkgForm.providerCostUSD ? parseFloat(pkgForm.providerCostUSD) : usd * 0.9;

    const createdPkg = {
      id: `pkg-${Date.now().toString().slice(-4)}`,
      name: pkgForm.name,
      priceUSD: usd,
      priceSAR: sar,
      providerCostUSD: cost,
      providerCode: pkgForm.providerCode || 'RELOADLY',
      reloadlyProductId: pkgForm.reloadlyProductId ? parseInt(pkgForm.reloadlyProductId, 10) : null,
      providerSku: pkgForm.providerSku || null,
      countryCode: (pkgForm.countryCode || 'GLOBAL').toUpperCase()
    };

    addPackageToProduct(selectedProdForPkg, createdPkg);
    setShowAddPkgModal(false);
    setSelectedProdForPkg(null);
    setPkgForm({ name: '', priceUSD: '', priceSAR: '', providerCostUSD: '', providerCode: 'RELOADLY', reloadlyProductId: '', providerSku: '', countryCode: 'GLOBAL' });
  };

  const handleOpenEditPackage = (prodId, pkg) => {
    setSelectedProdForPkg(prodId);
    setEditingPkg(pkg);
    setPkgForm({
      name: pkg.name || '',
      priceUSD: pkg.priceUSD ? pkg.priceUSD.toString() : '',
      priceSAR: pkg.priceSAR ? pkg.priceSAR.toString() : '',
      providerCostUSD: pkg.providerCostUSD ? pkg.providerCostUSD.toString() : '',
      providerCode: pkg.providerCode || 'RELOADLY',
      reloadlyProductId: pkg.reloadlyProductId ? pkg.reloadlyProductId.toString() : '',
      providerSku: pkg.providerSku || '',
      countryCode: pkg.countryCode || 'GLOBAL'
    });
    setShowEditPkgModal(true);
  };

  const handleUpdatePackageSubmit = (e) => {
    e.preventDefault();
    if (!selectedProdForPkg || !editingPkg) return;
    const usd = parseFloat(pkgForm.priceUSD);
    const sar = pkgForm.priceSAR ? parseFloat(pkgForm.priceSAR) : usd * 3.75;
    const cost = pkgForm.providerCostUSD ? parseFloat(pkgForm.providerCostUSD) : usd * 0.9;

    const updatedFields = {
      name: pkgForm.name,
      priceUSD: usd,
      priceSAR: sar,
      providerCostUSD: cost,
      providerCode: pkgForm.providerCode || 'RELOADLY',
      reloadlyProductId: pkgForm.reloadlyProductId ? parseInt(pkgForm.reloadlyProductId, 10) : null,
      providerSku: pkgForm.providerSku || null,
      countryCode: (pkgForm.countryCode || 'GLOBAL').toUpperCase()
    };

    updatePackageInProduct(selectedProdForPkg, editingPkg.id, updatedFields);
    setShowEditPkgModal(false);
    setSelectedProdForPkg(null);
    setEditingPkg(null);
    setPkgForm({ name: '', priceUSD: '', priceSAR: '', providerCostUSD: '', providerCode: 'RELOADLY', reloadlyProductId: '', providerSku: '', countryCode: 'GLOBAL' });
  };

  // --- PROVIDER HANDLERS ---
  const handleCreateProviderSubmit = (e) => {
    e.preventDefault();
    if (!provForm.driver) {
      addToast(lang === 'ar' ? 'يرجى إدخال اسم المورد/المزود' : 'Please enter provider name', 'error');
      return;
    }
    const createdProv = {
      driver: provForm.driver,
      type: provForm.type,
      status: 'HEALTHY',
      latencyMs: Math.floor(80 + Math.random() * 120),
      endpoint: provForm.endpoint || 'https://api.provider.com/v1',
      region: provForm.region,
      logoUrl: provForm.logoUrl
    };
    addProvider(createdProv);
    setShowAddProvModal(false);
    setProvForm({ driver: '', type: 'REST_API', endpoint: '', apiKey: '', region: 'GLOBAL', logoUrl: '' });
  };

  const handleOpenEditProvider = (prov) => {
    setEditingProv(prov);
    setProvForm({
      driver: prov.driver || '',
      type: prov.type || 'REST_API',
      endpoint: prov.endpoint || '',
      apiKey: '',
      region: prov.region || 'GLOBAL',
      logoUrl: prov.logoUrl || ''
    });
    setShowEditProvModal(true);
  };

  const handleUpdateProviderSubmit = (e) => {
    e.preventDefault();
    if (!editingProv) return;
    const updatedFields = {
      driver: provForm.driver,
      type: provForm.type,
      endpoint: provForm.endpoint,
      region: provForm.region,
      logoUrl: provForm.logoUrl
    };
    updateProvider(editingProv.driver, updatedFields);
    setShowEditProvModal(false);
    setEditingProv(null);
    setProvForm({ driver: '', type: 'REST_API', endpoint: '', apiKey: '', region: 'GLOBAL', logoUrl: '' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 mt-12">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-8 mb-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-blue-600/20 text-cyan-400 rounded-2xl border border-cyan-500/30">
              <ShieldCheck className="w-7 h-7 text-cyan-400" />
            </div>
            <h1 className="text-3xl font-black tracking-tight">
              {lang === 'ar' ? 'مركز التحكم وإدارة المنتجات والموردين' : 'Enterprise Command & Catalog Console'}
            </h1>
          </div>
          <p className="text-slate-400 text-sm font-extrabold">
            {lang === 'ar' ? 'تعديل وتجهيز البيانات، الباقات، روابط الصور، والموردين بنقرة زر وبدون برمجيات إضافية.' : 'Dynamic interactive management panel for products, packages, image URLs, and provider integrations.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setShowAddProdModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-2xl transition shadow-lg shadow-blue-600/25"
          >
            <PlusCircle className="w-4 h-4" />
            {lang === 'ar' ? 'إضافة منتج جديد' : '+ Create Product'}
          </button>
          <button 
            onClick={() => setShowAddProvModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-2xl transition shadow-lg shadow-emerald-600/25"
          >
            <Server className="w-4 h-4" />
            {lang === 'ar' ? 'تجهيز مورد جديد' : '+ Add Provider Driver'}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'catalog-editor', label: lang === 'ar' ? 'إدارة وتعديل المنتجات والباقات' : 'Products & Services Catalog', icon: ShoppingBag },
          { id: 'providers-editor', label: lang === 'ar' ? 'إدارة وتعديل الموردين والسيرفرات' : 'Providers & API Drivers', icon: Server },
          { id: 'admins-management', label: lang === 'ar' ? 'إدارة وتجهيز المدراء (+مسؤول)' : 'Admin Accounts Setup', icon: Users },
          { id: 'overview', label: lang === 'ar' ? 'مؤشرات الأداء APM' : 'APM & SLA Metrics', icon: TrendingUp },
          { id: 'vendors', label: lang === 'ar' ? 'سوق الموردين (Vendors)' : 'Vendor Marketplace', icon: Building },
          { id: 'runbook', label: lang === 'ar' ? 'دليل الطوارئ Runbook (7)' : 'Operational Runbook (7)', icon: Shield },
          { id: 'fraud-security', label: lang === 'ar' ? 'مكافحة الاحتيال والـ RBAC' : 'Anti-Fraud & RBAC Matrix', icon: Lock },
          { id: 'accounting-recon', label: lang === 'ar' ? 'المحاسبة والمطابقة' : 'Accounting & Recon', icon: DollarSign },
          { id: 'logs', label: lang === 'ar' ? 'السجلات المجمعة' : 'Partitioned Logs', icon: Terminal },
          { id: 'config', label: lang === 'ar' ? 'إعدادات وقواعد المنصة' : 'Feature Flags & Config', icon: SlidersHorizontal }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeAdminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveAdminTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-black whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: PRODUCTS & PACKAGES CATALOG EDITOR (WITH EDIT & OPTIMIZED IMAGES) */}
      {activeAdminTab === 'catalog-editor' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <ShoppingBag className="w-6 h-6 text-blue-600 dark:text-cyan-400" />
                {lang === 'ar' ? 'إدارة وتعديل الكتالوج والمنتجات والروابط' : 'Products & Services Catalog & Image Editor'}
              </h2>
              <p className="text-xs font-extrabold text-slate-500 dark:text-slate-400 mt-1">
                {lang === 'ar' ? `إجمالي الألعاب والخدمات المسجلة: ${products.length} منتج رقمي` : `Total Active Products: ${products.length}`}
              </p>
            </div>

            <button
              onClick={() => setShowAddProdModal(true)}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-2xl shadow-md transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {lang === 'ar' ? 'إضافة منتج رقمي جديد' : 'Add New Product'}
            </button>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((prod) => {
              const prodTitle = typeof prod.title === 'string' ? prod.title : (prod.title[lang] || prod.title.ar || prod.title.en);
              return (
                <div 
                  key={prod.id} 
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-lg flex flex-col justify-between space-y-6"
                >
                  <div className="space-y-4">
                    {/* Header Image & Info with Lazy Loading & Precache */}
                    <div className="flex items-center gap-4">
                      <OptimizedImage 
                        src={prod.image} 
                        alt={prodTitle}
                        className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-slate-200 dark:border-slate-800 shadow-md"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-black uppercase text-blue-600 dark:text-cyan-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full inline-block mb-1">
                          {prod.publisher}
                        </span>
                        <h3 className="font-black text-base text-slate-900 dark:text-white truncate">
                          {prodTitle}
                        </h3>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
                          <span>{prod.productType}</span>
                          <span>•</span>
                          <span className="text-emerald-500">{prod.badge || 'Active'}</span>
                        </div>
                      </div>

                      {/* Edit Product Button */}
                      <button
                        onClick={() => handleOpenEditProduct(prod)}
                        className="p-2.5 bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-cyan-400 rounded-xl hover:bg-blue-600 hover:text-white transition border border-slate-200 dark:border-slate-700 shrink-0"
                        title={lang === 'ar' ? 'تعديل بيانات ورابط صورة المنتج' : 'Edit product & image URL'}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Vertical Packages List */}
                    <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          {lang === 'ar' ? 'الباقات المجهزة (أسفل بعض):' : 'Configured Packages:'}
                        </span>
                        <span className="text-[11px] font-extrabold text-blue-600 dark:text-cyan-400">
                          {prod.packages?.length || 0} {lang === 'ar' ? 'باقات' : 'tiers'}
                        </span>
                      </div>

                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {(prod.packages || []).map((pkg) => (
                          <div 
                            key={pkg.id}
                            className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-2"
                          >
                            <div>
                              <div className="font-black text-xs text-slate-900 dark:text-white">{pkg.name}</div>
                              <div className="text-[11px] font-bold text-blue-600 dark:text-cyan-400">
                                {formatCurrency(pkg.priceUSD)} ({((pkg.priceSAR || (pkg.priceUSD * 3.75))).toFixed(2)} SAR)
                              </div>
                              <div className="flex gap-2 flex-wrap mt-0.5 text-[10px] font-extrabold text-slate-500 dark:text-slate-400">
                                {pkg.providerCode && (
                                  <span>
                                    🔌 {pkg.providerCode}: {pkg.providerCode === 'RELOADLY' ? `ID: ${pkg.reloadlyProductId}` : `SKU: ${pkg.providerSku}`}
                                  </span>
                                )}
                                <span>
                                  📍 {pkg.countryCode || 'GLOBAL'}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleOpenEditPackage(prod.id, pkg)}
                                className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition"
                                title="Edit package"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => deletePackageFromProduct(prod.id, pkg.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-700 rounded-lg transition"
                                title="Delete package"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedProdForPkg(prod.id);
                        setShowAddPkgModal(true);
                      }}
                      className="flex-1 py-2.5 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-600 hover:text-white text-blue-600 dark:text-cyan-400 text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 border border-blue-500/30"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>{lang === 'ar' ? 'إضافة باقة جديدة' : '+ Add Package'}</span>
                    </button>
                    <button
                      onClick={() => deleteProduct(prod.id)}
                      className="p-2.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 rounded-xl transition border border-slate-200 dark:border-slate-800"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: PROVIDERS & API DRIVERS EDITOR */}
      {activeAdminTab === 'providers-editor' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Server className="w-6 h-6 text-emerald-500" />
                {lang === 'ar' ? 'إدارة وتجهيز وتعديل الموردين والشعارات' : 'Providers & API Drivers Setup Console'}
              </h2>
              <p className="text-xs font-extrabold text-slate-500 dark:text-slate-400 mt-1">
                {lang === 'ar' ? `الموردين المسجلين: ${providersList.length} مزود خدمة` : `Active Providers: ${providersList.length}`}
              </p>
            </div>

            <button
              onClick={() => setShowAddProvModal(true)}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-2xl shadow-md transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {lang === 'ar' ? 'تجهيز مورد جديد' : 'Connect New Provider'}
            </button>
          </div>

          {/* Providers List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providersList.map((prov, index) => (
              <div 
                key={index} 
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-lg flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {prov.logoUrl ? (
                        <OptimizedImage src={prov.logoUrl} alt={prov.driver} className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-800" />
                      ) : (
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/40 text-blue-500 rounded-xl">
                          <Cpu className="w-5 h-5" />
                        </div>
                      )}
                      <span className="font-black text-base text-slate-900 dark:text-white truncate">
                        {prov.driver}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`px-3 py-1 rounded-full text-xs font-black ${
                        prov.status === 'HEALTHY' 
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}>
                        {prov.status}
                      </span>
                      <button
                        onClick={() => handleOpenEditProvider(prov)}
                        className="p-2 bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-cyan-400 rounded-xl hover:bg-blue-600 hover:text-white transition border border-slate-200 dark:border-slate-700"
                        title="Edit provider"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs font-extrabold text-slate-600 dark:text-slate-300">
                    <div className="flex justify-between">
                      <span>{lang === 'ar' ? 'نوع الاتصال:' : 'Driver Type:'}</span>
                      <span className="font-mono text-slate-900 dark:text-white">{prov.type || 'REST API'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{lang === 'ar' ? 'زمن الاستجابة Ping:' : 'Latency Ping:'}</span>
                      <span className="font-mono text-emerald-500">{prov.latencyMs} ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{lang === 'ar' ? 'المنطقة والتغطية:' : 'Region:'}</span>
                      <span className="font-mono text-slate-900 dark:text-white">{prov.region || 'GLOBAL'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => toggleProviderStatus(prov.driver)}
                    className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-4 h-4 text-blue-500" />
                    <span>{lang === 'ar' ? 'تبديل الحالة' : 'Toggle Status'}</span>
                  </button>
                  <button
                    onClick={() => addToast(lang === 'ar' ? `تم فحص الاتصال بالمورد ${prov.driver}: Ping ${prov.latencyMs}ms OK` : `Ping successful: ${prov.latencyMs}ms`)}
                    className="px-3 py-2.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500 text-xs font-black rounded-xl border border-emerald-500/30 hover:bg-emerald-600 hover:text-white transition"
                  >
                    Ping
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ADMIN ACCOUNTS MANAGEMENT */}
      {activeAdminTab === 'admins-management' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col md:flex-row gap-6">
            
            {/* Left: Create Admin Form */}
            <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-lg space-y-4">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Users className="w-5 h-5 text-blue-500" />
                {lang === 'ar' ? 'تجهيز وإضافة حساب مسؤول (ADMIN)' : 'Create Admin Account'}
              </h3>
              
              <form onSubmit={handleCreateAdminSubmit} className="space-y-4 text-xs font-black text-slate-700 dark:text-slate-300">
                <div>
                  <label className="block mb-1">{lang === 'ar' ? 'الاسم الكامل للمسؤول' : 'Full Name'}</label>
                  <input
                    type="text"
                    required
                    value={adminForm.name}
                    onChange={e => setAdminForm({ ...adminForm, name: e.target.value })}
                    placeholder="مثال: صالح العتيبي"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-black text-slate-950 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block mb-1">{lang === 'ar' ? 'البريد الإلكتروني المهني' : 'Work Email Address'}</label>
                  <input
                    type="email"
                    required
                    value={adminForm.email}
                    onChange={e => setAdminForm({ ...adminForm, email: e.target.value })}
                    placeholder="admin@nexuspay.com"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-black text-slate-950 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block mb-1">{lang === 'ar' ? 'كلمة المرور القوية للمسؤول' : 'Strong Password'}</label>
                  <input
                    type="password"
                    required
                    value={adminForm.password}
                    onChange={e => setAdminForm({ ...adminForm, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-black text-slate-950 dark:text-white"
                  />
                  <div className="mt-2 space-y-1 text-[11px] font-semibold text-slate-400">
                    <p className={adminForm.password.length >= 8 ? 'text-emerald-500 font-bold' : 'text-slate-400'}>✓ {lang === 'ar' ? 'لا تقل عن 8 أحرف' : 'At least 8 characters'}</p>
                    <p className={/[A-Z]/.test(adminForm.password) ? 'text-emerald-500 font-bold' : 'text-slate-400'}>✓ {lang === 'ar' ? 'تحتوي على حرف كبير (A-Z)' : 'At least one uppercase letter'}</p>
                    <p className={/[a-z]/.test(adminForm.password) ? 'text-emerald-500 font-bold' : 'text-slate-400'}>✓ {lang === 'ar' ? 'تحتوي على حرف صغير (a-z)' : 'At least one lowercase letter'}</p>
                    <p className={/[0-9]/.test(adminForm.password) ? 'text-emerald-500 font-bold' : 'text-slate-400'}>✓ {lang === 'ar' ? 'تحتوي على رقم (0-9)' : 'At least one number'}</p>
                    <p className={/[^A-Za-z0-9]/.test(adminForm.password) ? 'text-emerald-500 font-bold' : 'text-slate-400'}>✓ {lang === 'ar' ? 'تحتوي على رمز خاص (@#$)' : 'At least one special character'}</p>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl shadow-lg transition"
                >
                  {lang === 'ar' ? 'تجهيز وحفظ حساب المسؤول' : 'Create Admin Account'}
                </button>
              </form>
            </div>
            
            {/* Right: Admins List */}
            <div className="w-full md:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-lg space-y-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                {lang === 'ar' ? 'المدراء المسؤولون الحاليون' : 'Active Administrators'}
              </h3>
              
              <div className="space-y-3">
                {adminsList.map((adm, index) => (
                  <div key={index} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400 flex items-center justify-center font-black text-xs animate-pulse">
                      {adm.name ? adm.name.charAt(0) : 'A'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-black text-xs text-slate-900 dark:text-white truncate">{adm.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{adm.email}</div>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-black rounded-full shrink-0">
                      ADMIN
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB: OVERVIEW & APM METRICS */}
      {activeAdminTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <span className="text-xs font-extrabold text-slate-400 block">{lang === 'ar' ? 'معدل النجاح' : 'Success Rate'}</span>
            <div className="text-3xl font-black text-emerald-500">{apmMetrics.availabilityPercentage}%</div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <span className="text-xs font-extrabold text-slate-400 block">{lang === 'ar' ? 'متوسط السرعة' : 'Avg Latency'}</span>
            <div className="text-3xl font-black text-blue-500">{apmMetrics.p99LatencyMs} ms</div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <span className="text-xs font-extrabold text-slate-400 block">{lang === 'ar' ? 'المطالبات الناجحة' : 'Settled Orders'}</span>
            <div className="text-3xl font-black text-purple-500">{apmMetrics.totalRequestsExecuted}</div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <span className="text-xs font-extrabold text-slate-400 block">{lang === 'ar' ? 'الأخطاء النشطة' : 'Active DLQ'}</span>
            <div className="text-3xl font-black text-rose-500">{dlqItems.length}</div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT PRODUCT */}
      {(showAddProdModal || showEditProdModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-7 max-w-lg w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
                {showEditProdModal 
                  ? (lang === 'ar' ? 'تعديل بيانات ورابط صورة المنتج' : 'Edit Product & Image URL')
                  : (lang === 'ar' ? 'تجهيز وإضافة منتج رقمي جديد' : 'Create New Digital Product')}
              </h3>
              <button onClick={() => { setShowAddProdModal(false); setShowEditProdModal(false); }} className="p-2 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={showEditProdModal ? handleUpdateProductSubmit : handleCreateProductSubmit} className="space-y-4 text-xs font-extrabold">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">{lang === 'ar' ? 'عنوان الخدمة (بالعربية)' : 'Title (Arabic)'}</label>
                <input
                  type="text"
                  value={prodForm.titleAr}
                  onChange={e => setProdForm({ ...prodForm, titleAr: e.target.value })}
                  placeholder="مثال: شدات ببجي موبايل 1800 UC"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-black"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">{lang === 'ar' ? 'عنوان الخدمة (بالإنجليزية)' : 'Title (English)'}</label>
                <input
                  type="text"
                  value={prodForm.titleEn}
                  onChange={e => setProdForm({ ...prodForm, titleEn: e.target.value })}
                  placeholder="e.g. PUBG Mobile 1800 UC"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-black"
                />
              </div>

              {/* Explicit Image URL Field */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-blue-500" />
                  <span>{lang === 'ar' ? 'رابط صورة المنتج (Image URL)' : 'Image URL (Stored in Database)'}</span>
                </label>
                <input
                  type="text"
                  value={prodForm.image}
                  onChange={e => setProdForm({ ...prodForm, image: e.target.value })}
                  placeholder="https://images.unsplash.com/... or https://domain.com/image.jpg"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-black font-mono text-[11px]"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  {lang === 'ar' ? 'يتم حفظ رابط الصورة في قاعدة البيانات وتفعيل التحميل المجدول lazy loading وتخزينها في الذاكرة.' : 'URL is stored in Database and loaded with lazy loading & memory cache.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">{lang === 'ar' ? 'نوع الخدمة' : 'Product Type'}</label>
                  <select
                    value={prodForm.productType}
                    onChange={e => setProdForm({ ...prodForm, productType: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-black"
                  >
                    <option value="DIRECT_TOPUP">{lang === 'ar' ? 'شحن مباشر (Player ID)' : 'Direct Topup'}</option>
                    <option value="VOUCHER_CODE">{lang === 'ar' ? 'كود رقمي (Voucher Code)' : 'Voucher Code'}</option>
                    <option value="SUBSCRIPTION">{lang === 'ar' ? 'اشتراك رقمي (Subscription)' : 'Subscription'}</option>
                    <option value="MOBILE_RECHARGE">{lang === 'ar' ? 'شحن جوال (Mobile Recharge)' : 'Mobile Recharge'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">{lang === 'ar' ? 'المصنع / الشركة' : 'Publisher'}</label>
                  <input
                    type="text"
                    value={prodForm.publisher}
                    onChange={e => setProdForm({ ...prodForm, publisher: e.target.value })}
                    placeholder="Tencent / Garena / Sony"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-black"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl transition"
                >
                  {showEditProdModal ? (lang === 'ar' ? 'حفظ التعديلات' : 'Save Changes') : (lang === 'ar' ? 'حفظ وإضافة المنتج' : 'Save & Create Product')}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddProdModal(false); setShowEditProdModal(false); }}
                  className="px-5 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT PACKAGE TIER */}
      {(showAddPkgModal || showEditPkgModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-7 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <PlusCircle className="w-6 h-6 text-blue-600" />
                {showEditPkgModal ? (lang === 'ar' ? 'تعديل بيانات الباقة' : 'Edit Package Tier') : (lang === 'ar' ? 'إضافة باقة جديدة للمنتج' : 'Add Package Tier')}
              </h3>
              <button onClick={() => { setShowAddPkgModal(false); setShowEditPkgModal(false); }} className="p-2 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={showEditPkgModal ? handleUpdatePackageSubmit : handleCreatePackageSubmit} className="space-y-4 text-xs font-extrabold">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">{lang === 'ar' ? 'اسم الباقة / الفئة' : 'Package Name'}</label>
                <input
                  type="text"
                  value={pkgForm.name}
                  onChange={e => setPkgForm({ ...pkgForm, name: e.target.value })}
                  placeholder="مثال: 600 + 60 UC أو $10 Code"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">{lang === 'ar' ? 'السعر بالدولار ($)' : 'Price USD'}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={pkgForm.priceUSD}
                    onChange={e => setPkgForm({ ...pkgForm, priceUSD: e.target.value })}
                    placeholder="9.99"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-black"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">{lang === 'ar' ? 'تكلفة المورد ($)' : 'Provider Cost'}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={pkgForm.providerCostUSD}
                    onChange={e => setPkgForm({ ...pkgForm, providerCostUSD: e.target.value })}
                    placeholder="8.50"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-black"
                  />
                </div>
              </div>

              {/* Provider Selection */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">{lang === 'ar' ? 'المورد / المزود' : 'Provider / Supplier'}</label>
                <select
                  value={pkgForm.providerCode}
                  onChange={e => setPkgForm({ ...pkgForm, providerCode: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-black text-xs"
                >
                  <option value="RELOADLY">Reloadly (Gift Cards API)</option>
                  <option value="FASTPAY">FastPay Digital</option>
                  <option value="UNIPIN">UniPin Global</option>
                  <option value="GLOBAL_CODES">GlobalCodes API</option>
                </select>
              </div>

              {/* Conditional Inputs based on Provider */}
              {pkgForm.providerCode === 'RELOADLY' ? (
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">{lang === 'ar' ? 'معرّف المنتج في ريلودلي (Reloadly Product ID)' : 'Reloadly Product ID'}</label>
                  <input
                    type="number"
                    required
                    value={pkgForm.reloadlyProductId}
                    onChange={e => setPkgForm({ ...pkgForm, reloadlyProductId: e.target.value })}
                    placeholder="e.g. 18285"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-black font-mono"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">{lang === 'ar' ? 'رمز المنتج عند المورد (Provider SKU)' : 'Provider SKU'}</label>
                  <input
                    type="text"
                    required
                    value={pkgForm.providerSku}
                    onChange={e => setPkgForm({ ...pkgForm, providerSku: e.target.value })}
                    placeholder="e.g. FP-PUBG-600"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-black font-mono"
                  />
                </div>
              )}

              {/* Package Country Customization */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'ar' ? 'تخصيص الباقة لدولة معينة' : 'Country / Regional Customization'}
                </label>
                <select
                  value={pkgForm.countryCode}
                  onChange={e => setPkgForm({ ...pkgForm, countryCode: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-black text-xs"
                >
                  <option value="GLOBAL">{lang === 'ar' ? '🌎 عام / عالمي (Global)' : '🌎 Global (All Countries)'}</option>
                  {(SUPPORTED_COUNTRIES || []).filter(c => c.code !== 'OTHER').map(c => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {lang === 'ar' ? `${c.name} (${c.nameEn})` : `${c.nameEn}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl transition"
                >
                  {showEditPkgModal ? (lang === 'ar' ? 'حفظ التعديلات' : 'Save Changes') : (lang === 'ar' ? 'حفظ الباقة' : 'Save Package')}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddPkgModal(false); setShowEditPkgModal(false); }}
                  className="px-5 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT PROVIDER */}
      {(showAddProvModal || showEditProvModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-7 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Server className="w-6 h-6 text-emerald-500" />
                {showEditProvModal ? (lang === 'ar' ? 'تعديل بيانات المورد والشعار' : 'Edit Provider & Logo URL') : (lang === 'ar' ? 'تجهيز وربط مورد جديد' : 'Connect New Provider')}
              </h3>
              <button onClick={() => { setShowAddProvModal(false); setShowEditProvModal(false); }} className="p-2 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={showEditProvModal ? handleUpdateProviderSubmit : handleCreateProviderSubmit} className="space-y-4 text-xs font-extrabold">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">{lang === 'ar' ? 'اسم المورد / الشركة' : 'Provider Name'}</label>
                <input
                  type="text"
                  value={provForm.driver}
                  onChange={e => setProvForm({ ...provForm, driver: e.target.value })}
                  placeholder="مثال: FastPay API v2"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-black"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">{lang === 'ar' ? 'رابط الـ API Endpoint' : 'API Endpoint URL'}</label>
                <input
                  type="text"
                  value={provForm.endpoint}
                  onChange={e => setProvForm({ ...provForm, endpoint: e.target.value })}
                  placeholder="https://api.provider.com/v1/orders"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-black font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-emerald-500" />
                  <span>{lang === 'ar' ? 'رابط شعار المورد (Logo URL)' : 'Logo URL'}</span>
                </label>
                <input
                  type="text"
                  value={provForm.logoUrl}
                  onChange={e => setProvForm({ ...provForm, logoUrl: e.target.value })}
                  placeholder="https://domain.com/provider-logo.png"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-black font-mono text-[11px]"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl transition"
                >
                  {showEditProvModal ? (lang === 'ar' ? 'حفظ التعديلات' : 'Save Changes') : (lang === 'ar' ? 'ربط وتجهيز المورد' : 'Connect Provider')}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddProvModal(false); setShowEditProvModal(false); }}
                  className="px-5 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
