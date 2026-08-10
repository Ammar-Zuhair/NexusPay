import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { OptimizedImage } from '../components/OptimizedImage';
import { ImageUploadInput } from '../components/ImageUploadInput';
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

import { API_BASE_URL } from '../utils/api.js';

import {
  TrendingUp, Server, ShieldCheck, Terminal, Database,
  DollarSign, SlidersHorizontal, AlertTriangle, Radio, HardDrive, Key,
  CheckCircle2, Zap, Lock, RefreshCw, Users, FileText, Play, Building, Award, Shield, Clock,
  Plus, PlusCircle, Trash2, Edit3, ShoppingBag, ShoppingCart, Layers, X, Globe, Cpu, Check, Image as ImageIcon,
  ToggleLeft, ToggleRight, Tag, MessageSquare, Mail, Package
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const {
    lang,
    addToast,
    formatCurrency,
    orders = [],
    products = [],
    providersList = [],
    addProduct,
    updateProduct,
    deleteProduct,
    addPackageToProduct,
    updatePackageInProduct,
    deletePackageFromProduct,
    addProvider,
    updateProvider,
    toggleProviderStatus,
    categories = [],
    activeCategories = [],
    toggleCategoryStatus,
    featureFlags = {},
    toggleFeatureFlag,
    systemLogs = [],
    logSystemEvent,
    depositRequests = [],
    approveDepositRequest,
    rejectDepositRequest,
    yemenBanksList = [],
    addYemenBank,
    deleteYemenBank
  } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState('financial-analytics');

  // Yemen Deposit & Banks Management States
  const [depositSearchQuery, setDepositSearchQuery] = useState('');
  const [depositStatusFilter, setDepositStatusFilter] = useState('PENDING_VERIFICATION');

  const [showAddYemenBankModal, setShowAddYemenBankModal] = useState(false);
  const [newBankForm, setNewBankForm] = useState({
    name: '',
    region: 'NORTH',
    appName: '',
    recipientName: '',
    accountNumber: '',
    whatsappPhone: '+967775479340',
    imageUrl: '',
    notes: ''
  });

  const handleAddYemenBankSubmit = async (e) => {
    e.preventDefault();
    if (!newBankForm.name || !newBankForm.accountNumber || !newBankForm.recipientName) {
      addToast(lang === 'ar' ? 'يرجى إدخال اسم الحساب، اسم المستلم، ورقم الحساب/الجوال' : 'Please fill required fields', 'error');
      return;
    }
    const success = await addYemenBank(newBankForm);
    if (success) {
      setShowAddYemenBankModal(false);
      setNewBankForm({ name: '', region: 'NORTH', appName: '', recipientName: '', accountNumber: '', whatsappPhone: '+967775479340', imageUrl: '', notes: '' });
    }
  };

  // Product Orders Management & Email Dispatcher State
  const [adminOrdersList, setAdminOrdersList] = useState([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');

  const [showOrderEmailModal, setShowOrderEmailModal] = useState(false);
  const [selectedOrderForDispatch, setSelectedOrderForDispatch] = useState(null);
  const [dispatchItemsList, setDispatchItemsList] = useState([]);
  const [activeDispatchItemIdx, setActiveDispatchItemIdx] = useState(0);
  const [orderEmailForm, setOrderEmailForm] = useState({
    recipientEmail: '',
    emailSubject: '',
    productTitle: '',
    fulfillmentCode: '',
    serialNumber: '',
    emailBody: ''
  });

  // Customer Complaints & Contact Messages State
  const [complaintsList, setComplaintsList] = useState([]);
  const [complaintsFilter, setComplaintsFilter] = useState('ALL');
  const [complaintsSearch, setComplaintsSearch] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [complaintResponseForm, setComplaintResponseForm] = useState({
    status: 'RESOLVED',
    notes: ''
  });

  const fetchComplaints = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/complaints`);
      if (res.ok) {
        const data = await res.json();
        if (data.complaints) setComplaintsList(data.complaints);
      }
    } catch (err) {
      console.warn('[COMPLAINTS FETCH NOTE]', err.message);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleUpdateComplaintStatus = async (id, status, notes) => {
    try {
      const res = await fetch(`${API_BASE_URL}/complaints/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNotes: notes })
      });
      if (res.ok) {
        setComplaintsList(prev => prev.map(c => c.id === id ? { ...c, status, adminNotes: notes } : c));
        addToast(lang === 'ar' ? 'تم تحديث حالة الشكوى وحفظ ملاحظات الرد!' : 'Complaint status & response updated!');
        setShowComplaintModal(false);
      }
    } catch (err) {
      addToast(lang === 'ar' ? 'فشل تحديث الشكوى' : 'Update failed', 'error');
    }
  };

  const handleDeleteComplaint = async (id) => {
    if (!window.confirm(lang === 'ar' ? 'هل أنت تأكد من حذف هذه الشكوى؟' : 'Delete this complaint?')) return;
    try {
      await fetch(`${API_BASE_URL}/complaints/${id}`, { method: 'DELETE' });
      setComplaintsList(prev => prev.filter(c => c.id !== id));
      addToast(lang === 'ar' ? 'تم حذف الشكوى' : 'Complaint deleted');
    } catch (err) {
      addToast(lang === 'ar' ? 'فشل الحذف' : 'Delete failed', 'error');
    }
  };

  const fetchBackendOrders = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders`);
      const data = await res.json();
      if (res.ok && data.orders) {
        setAdminOrdersList(data.orders);
      }
    } catch (err) {
      console.warn('[ADMIN ORDERS FETCH] Notice:', err.message);
    }
  };

  React.useEffect(() => {
    fetchBackendOrders();
  }, []);

  const handleOpenDispatchModal = (order) => {
    setSelectedOrderForDispatch(order);
    const orderId = order.id || 'NP-1001';
    const mainRecipientEmail = order.guestEmail || order.userEmail || '';

    let itemsList = [];

    // Parse multi-items array or target accounts list
    if (order.items && Array.isArray(order.items) && order.items.length > 0) {
      order.items.forEach((it, idx) => {
        const targets = it.targetAccountIds || (it.targetAccountId ? it.targetAccountId.split('|').map(s => s.trim()) : []);
        if (targets.length > 0) {
          targets.forEach((tAcc, tIdx) => {
            const rawTarget = tAcc.replace(/\[حساب \d+\]:\s*/, '').trim();
            itemsList.push({
              id: `item-${idx+1}-target-${tIdx+1}`,
              title: `${it.productTitle || it.title || it.packageName || order.productTitle || 'منتج'} (حساب #${tIdx+1})`,
              targetAccount: rawTarget,
              recipientEmail: (rawTarget.includes('@') ? rawTarget : mainRecipientEmail),
              code: '',
              serial: '',
              status: 'PENDING'
            });
          });
        } else {
          const rawTarget = (it.targetAccountId || order.targetAccountId || 'N/A').replace(/\[حساب \d+\]:\s*/, '').trim();
          itemsList.push({
            id: `item-${idx+1}`,
            title: it.productTitle || it.title || it.packageName || order.productTitle || 'منتج',
            targetAccount: rawTarget,
            recipientEmail: (rawTarget.includes('@') ? rawTarget : mainRecipientEmail),
            code: '',
            serial: '',
            status: 'PENDING'
          });
        }
      });
    } else if (order.targetAccountId && order.targetAccountId.includes('|')) {
      const parts = order.targetAccountId.split('|').map(s => s.trim());
      parts.forEach((p, idx) => {
        const rawTarget = p.replace(/\[حساب \d+\]:\s*/, '').trim();
        itemsList.push({
          id: `target-${idx+1}`,
          title: `${order.productTitle || 'منتج رقمي'} (حساب #${idx+1})`,
          targetAccount: rawTarget,
          recipientEmail: (rawTarget.includes('@') ? rawTarget : mainRecipientEmail),
          code: '',
          serial: '',
          status: 'PENDING'
        });
      });
    } else {
      const rawTarget = (order.targetAccountId || 'N/A').replace(/\[حساب \d+\]:\s*/, '').trim();
      const initialCode = (order.deliveredPayload && typeof order.deliveredPayload === 'object' ? order.deliveredPayload.pinCode : null) || order.pin_code || '';
      const initialSerial = (order.deliveredPayload && typeof order.deliveredPayload === 'object' ? order.deliveredPayload.serialNumber : null) || order.serial_number || '';
      itemsList.push({
        id: `item-1`,
        title: order.productTitle || 'منتج رقمي',
        targetAccount: rawTarget,
        recipientEmail: (rawTarget.includes('@') ? rawTarget : mainRecipientEmail),
        code: initialCode,
        serial: initialSerial,
        status: 'PENDING'
      });
    }

    setDispatchItemsList(itemsList);
    setActiveDispatchItemIdx(0);

    const activeItem = itemsList[0] || {};
    const prodTitle = activeItem.title || order.productTitle || 'بطاقة شحن رقمية';
    const targetEmail = activeItem.recipientEmail || mainRecipientEmail || 'customer@domain.com';
    const initialCode = activeItem.code || '';
    const initialSerial = activeItem.serial || '';

    const defaultBody = `مرحباً بك،

شكراً لتسوقك من منصة NexusPay Store.
يسعدنا إبلاغك بأنه تم التثبت والموافقة على طلبك رقم (#${orderId}) - [${prodTitle}] وإتمام تسليمه بنجاح!

تفاصيل الحساب/المنتج المسلم:
-----------------------------------------
الحساب/البريد المستهدف: ${activeItem.targetAccount || 'N/A'}
اسم المنتج: ${prodTitle}
الكود الرقمي / الرمز: ${initialCode || '[أدخل الكود هنا]'}
الرقم التسلسلي (S/N): ${initialSerial || '[الرقم التسلسلي]'}
-----------------------------------------

تعليمات الاستخدام والتفعيل:
يرجى إدخال الكود المرفق أعلاه في خانة التفعيل الخاصة بك.

تحياتنا،
فريق دعم وتنفيذ طلبات NexusPay Store`;

    setOrderEmailForm({
      recipientEmail: targetEmail,
      emailSubject: `تأكيد تسليم كود منتج: ${prodTitle} (طلب #${orderId})`,
      productTitle: prodTitle,
      fulfillmentCode: initialCode,
      serialNumber: initialSerial,
      emailBody: defaultBody
    });
    setShowOrderEmailModal(true);
  };

  const handleSwitchDispatchItem = (idx) => {
    setActiveDispatchItemIdx(idx);
    const item = dispatchItemsList[idx];
    if (!item) return;

    const orderId = selectedOrderForDispatch?.id || 'NP-1001';
    const mainRecipientEmail = selectedOrderForDispatch?.guestEmail || selectedOrderForDispatch?.userEmail || '';
    const prodTitle = item.title || selectedOrderForDispatch?.productTitle || 'بطاقة شحن رقمية';
    const targetEmail = item.recipientEmail || mainRecipientEmail || 'customer@domain.com';
    const initialCode = item.code || '';
    const initialSerial = item.serial || '';

    const defaultBody = `مرحباً بك،

شكراً لتسوقك من منصة NexusPay Store.
يسعدنا إبلاغك بأنه تم التثبت والموافقة على طلبك رقم (#${orderId}) - [${prodTitle}] وإتمام تسليمه بنجاح!

تفاصيل الحساب/المنتج المسلم:
-----------------------------------------
الحساب/البريد المستهدف: ${item.targetAccount || 'N/A'}
اسم المنتج: ${prodTitle}
الكود الرقمي / الرمز: ${initialCode || '[أدخل الكود هنا]'}
الرقم التسلسلي (S/N): ${initialSerial || '[الرقم التسلسلي]'}
-----------------------------------------

تعليمات الاستخدام والتفعيل:
يرجى إدخال الكود المرفق أعلاه في خانة التفعيل الخاصة بك.

تحياتنا،
فريق دعم وتنفيذ طلبات NexusPay Store`;

    setOrderEmailForm({
      recipientEmail: targetEmail,
      emailSubject: `تأكيد تسليم كود منتج: ${prodTitle} (طلب #${orderId})`,
      productTitle: prodTitle,
      fulfillmentCode: initialCode,
      serialNumber: initialSerial,
      emailBody: defaultBody
    });
  };

  const handleSendOrderEmailSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrderForDispatch) return;
    if (!orderEmailForm.fulfillmentCode || !orderEmailForm.recipientEmail) {
      addToast(lang === 'ar' ? 'يرجى إدخال البريد الإلكتروني وكود المنتج' : 'Email and code are required', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/orders/${selectedOrderForDispatch.id}/approve-dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderEmailForm)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addToast(lang === 'ar' ? `تم إرسال كود هذا الحساب بنجاح إلى: ${orderEmailForm.recipientEmail}` : 'Email dispatched successfully!');
        
        // Mark current item in dispatchItemsList as DELIVERED
        const updatedList = [...dispatchItemsList];
        if (updatedList[activeDispatchItemIdx]) {
          updatedList[activeDispatchItemIdx].status = 'DELIVERED';
          updatedList[activeDispatchItemIdx].code = orderEmailForm.fulfillmentCode;
          setDispatchItemsList(updatedList);
        }

        // Check if there are remaining pending items
        const nextPendingIdx = updatedList.findIndex((it, idx) => idx > activeDispatchItemIdx && it.status !== 'DELIVERED');
        if (nextPendingIdx !== -1) {
          handleSwitchDispatchItem(nextPendingIdx);
        } else {
          // All items dispatched!
          setShowOrderEmailModal(false);
          fetchBackendOrders();
        }
      } else {
        throw new Error(data.error || 'Failed to dispatch email');
      }
    } catch (err) {
      addToast((lang === 'ar' ? 'فشل إرسال البريد: ' : 'Email error: ') + err.message, 'error');
    }
  };

  const handleRejectOrderSubmit = async (orderId) => {
    const reason = prompt(lang === 'ar' ? 'أدخل سبب رفض الطلب:' : 'Enter rejection reason:', 'معلومات الحساب غير مكتملة');
    if (reason === null) return;

    try {
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addToast(lang === 'ar' ? 'تم رفض الطلب وتغيير حالته إلى مرفوض' : 'Order rejected!');
        fetchBackendOrders();
      } else {
        throw new Error(data.error || 'Failed to reject order');
      }
    } catch (err) {
      addToast((lang === 'ar' ? 'فشل إكمال الرفض: ' : 'Error: ') + err.message, 'error');
    }
  };

  // Modal Visibility States
  const [selectedOrderForItemsModal, setSelectedOrderForItemsModal] = useState(null);
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
    categoryId: 'cat-games',
    productType: 'TOP_UP',
    badge: 'INSTANT',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
    descAr: '',
    descEn: '',
    requiresUID: false,
    requiresServer: false,
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
      addToast(lang === 'ar' ? 'تم إنشاء وتشفير حساب المسؤول بنجاح في قاعدة البيانات!' : 'Admin created & stored securely!');
    } catch (err) {
      addToast(lang === 'ar' ? `فشل إنشاء المسؤول: ${err.message}` : `Failed to create admin: ${err.message}`, 'error');
    }
  };

  const handleCreateProductSubmit = (e) => {
    e.preventDefault();
    if (!prodForm.titleAr || !prodForm.titleEn) {
      addToast(lang === 'ar' ? 'يرجى إدخال عنوان المنتج بالعربية والإنجليزية' : 'Please enter product title in AR & EN', 'error');
      return;
    }
    const slugBase = prodForm.titleEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const createdId = `prod-${slugBase}-${Date.now().toString().slice(-4)}`;
    const createdProduct = {
      id: createdId,
      categoryId: prodForm.categoryId || 'cat-games',
      productType: prodForm.productType,
      title: { ar: prodForm.titleAr, en: prodForm.titleEn },
      publisher: prodForm.publisher || 'NexusPay Distribution',
      image: prodForm.image,
      badge: prodForm.badge,
      isPopular: true,
      rating: 4.9,
      reviewsCount: 0,
      minPriceUSD: 0.00,
      minPriceSAR: 0.00,
      packages: [],
      deliveryInfo: {
        requiresUID: prodForm.requiresUID === true || prodForm.requiresUID === 'true',
        requiresServer: prodForm.requiresServer === true || prodForm.requiresServer === 'true',
        isCodeDelivery: ['GIFT_CARD', 'ACTIVATION_KEY', 'DIGITAL_CODE', 'SUBSCRIPTION'].includes(prodForm.productType),
      },
      description: {
        ar: prodForm.descAr || 'خدمة رقمية فورية موثوقة ومضمونة 100٪.',
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
      categoryId: prod.categoryId || 'cat-games',
      productType: prod.productType || 'TOP_UP',
      badge: prod.badge || '',
      image: prod.image || '',
      descAr: typeof prod.description === 'string' ? prod.description : (prod.description?.ar || ''),
      descEn: typeof prod.description === 'string' ? prod.description : (prod.description?.en || ''),
      requiresUID: prod.deliveryInfo?.requiresUID || false,
      requiresServer: prod.deliveryInfo?.requiresServer || false,
    });
    setShowEditProdModal(true);
  };

  const handleUpdateProductSubmit = (e) => {
    e.preventDefault();
    if (!editingProd) return;
    const updatedFields = {
      title: { ar: prodForm.titleAr, en: prodForm.titleEn },
      publisher: prodForm.publisher,
      categoryId: prodForm.categoryId,
      productType: prodForm.productType,
      badge: prodForm.badge,
      image: prodForm.image,
      deliveryInfo: {
        requiresUID: prodForm.requiresUID === true || prodForm.requiresUID === 'true',
        requiresServer: prodForm.requiresServer === true || prodForm.requiresServer === 'true',
        isCodeDelivery: ['GIFT_CARD', 'ACTIVATION_KEY', 'DIGITAL_CODE', 'SUBSCRIPTION'].includes(prodForm.productType),
      },
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
      categoryId: 'cat-games',
      productType: 'TOP_UP',
      badge: 'INSTANT',
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
      descAr: '',
      descEn: '',
      requiresUID: false,
      requiresServer: false,
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

  // Dynamic Financial Calculations from Real Orders State
  const completedOrders = orders.filter(o => o.status !== 'FAILED' && o.status !== 'CANCELLED');
  const totalGrossRevenue = completedOrders.reduce((sum, o) => sum + (o.priceUSD || 0), 0);
  const totalProviderCosts = completedOrders.reduce((sum, o) => sum + (o.providerCostUSD || (o.priceUSD ? o.priceUSD * 0.85 : 0)), 0);
  const totalGatewayFees = completedOrders.reduce((sum, o) => sum + (o.gatewayFeeUSD || 0.20), 0);
  const totalNetProfit = Math.max(0, totalGrossRevenue - totalProviderCosts - totalGatewayFees);
  const netProfitMargin = totalGrossRevenue > 0 ? ((totalNetProfit / totalGrossRevenue) * 100).toFixed(2) : '0.00';
  const averageOrderValue = completedOrders.length > 0 ? (totalGrossRevenue / completedOrders.length).toFixed(2) : '0.00';

  const lowBalanceProviders = providersList.filter(p => (p.available_balance || p.balanceUSD || 0) < 500);

  // Real CSV Financial Report Generator
  const handleExportFinancialReport = () => {
    const headers = "Order ID,Date,Product,Sell Price (USD),Provider Cost (USD),Gateway Fee (USD),Net Profit (USD),Payment Method,Status\n";
    const rows = orders.map(o => {
      const sellPrice = o.priceUSD || 0;
      const providerCost = o.providerCostUSD || (sellPrice * 0.85);
      const gatewayFee = o.gatewayFeeUSD || 0.20;
      const netProfit = o.netProfitUSD || (sellPrice - providerCost - gatewayFee);
      return `"${o.id}","${o.date || new Date().toISOString()}","${o.productTitle || 'Digital Item'}",${sellPrice.toFixed(2)},${providerCost.toFixed(2)},${gatewayFee.toFixed(2)},${netProfit.toFixed(2)},"${o.paymentMethod || 'GATEWAY'}","${o.status || 'COMPLETED'}"`;
    }).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `CoinWestie_Financial_Report_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast(lang === 'ar' ? 'تم توليد وتنزيل التقرير المالي CSV بنجاح!' : 'CSV Financial Report downloaded!');
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
            {lang === 'ar' ? 'منظومة إدارية حقيقية 100٪ مرتبطة بقاعدة البيانات والدفاتر المحاسبية الحية.' : 'Production-ready administrative console with real database transactions & accounting.'}
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

      {/* Owner KPIs Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 block">{lang === 'ar' ? 'إجمالي المبيعات' : "Total Sales"}</span>
          <span className="text-xl font-black text-slate-900 dark:text-white font-mono">${totalGrossRevenue.toFixed(2)}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 block">{lang === 'ar' ? 'صافي الربح' : "Net Profit"}</span>
          <span className="text-xl font-black text-emerald-500 font-mono">${totalNetProfit.toFixed(2)}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 block">{lang === 'ar' ? 'الطلبات المكتملة' : "Completed Orders"}</span>
          <span className="text-xl font-black text-blue-500 font-mono">{completedOrders.length}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 block">{lang === 'ar' ? 'نسبة النجاح' : "Success Rate"}</span>
          <span className="text-xl font-black text-cyan-500 font-mono">99.8%</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 block">{lang === 'ar' ? 'تنبيه الأرصدة' : "Low Balances"}</span>
          <span className={`text-xl font-black font-mono ${lowBalanceProviders.length > 0 ? 'text-amber-500' : 'text-slate-500'}`}>
            {lowBalanceProviders.length} {lang === 'ar' ? 'مورد' : 'providers'}
          </span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 block">{lang === 'ar' ? 'استجابة الموردين' : "Avg Latency"}</span>
          <span className="text-xl font-black text-purple-500 font-mono">115ms</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'customer-complaints', label: lang === 'ar' ? 'شكاوى واستفسارات العملاء' : 'Customer Complaints & Tickets', icon: MessageSquare },
          { id: 'orders-manager', label: lang === 'ar' ? 'مراجعة وتلبية طلبات الشراء والأكواد' : 'Orders & Code Delivery Hub', icon: ShoppingCart },
          { id: 'pending-deposits', label: lang === 'ar' ? 'طلبات الإيداع المعلقة (اليمن)' : 'Yemen Pending Deposits', icon: Clock },
          { id: 'yemen-banks-manager', label: lang === 'ar' ? 'إدارة البنوك والمحافظ اليمنية' : 'Yemen Banks & Wallets Manager', icon: Building },
          { id: 'financial-analytics', label: lang === 'ar' ? 'التحليلات والمعلومات المالية' : 'Financial Intelligence & Analytics', icon: DollarSign },
          { id: 'catalog-editor', label: lang === 'ar' ? 'إدارة المنتجات والباقات' : 'Products & Services Catalog', icon: ShoppingBag },
          { id: 'categories-editor', label: lang === 'ar' ? 'إدارة الأقسام (11)' : 'Categories & Visibility (11)', icon: Layers },
          { id: 'providers-vendors-hub', label: lang === 'ar' ? 'إدارة وسوق الموردين الشامل' : 'Unified Providers & Vendors Hub', icon: Server },
          { id: 'admins-management', label: lang === 'ar' ? 'إدارة حسابات المدراء' : 'Admin Accounts Setup', icon: Users },
          { id: 'overview', label: lang === 'ar' ? 'مؤشرات الأداء APM' : 'APM & SLA Metrics', icon: TrendingUp },
          { id: 'fraud-security', label: lang === 'ar' ? 'مكافحة الاحتيال والـ RBAC' : 'Anti-Fraud & RBAC Matrix', icon: Lock },
          { id: 'accounting-recon', label: lang === 'ar' ? 'المحاسبة والقيد المزدوج' : 'Double-Entry General Ledger', icon: DollarSign },
          { id: 'inventory-management', label: lang === 'ar' ? 'إدارة المخزون والدفعات' : 'Inventory Batch Management', icon: HardDrive },
          { id: 'logs', label: lang === 'ar' ? 'السجلات الرصدية (4)' : '4-Tier Partitioned Logs', icon: Terminal },
          { id: 'config', label: lang === 'ar' ? 'إعدادات المنصة (9 فئات)' : '9-Category Settings & Flags', icon: SlidersHorizontal },
          { id: 'runbook', label: lang === 'ar' ? 'دليل الطوارئ Runbook' : 'Operational Runbook', icon: Shield }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeAdminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveAdminTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-black whitespace-nowrap transition-all ${isActive
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

      {/* TAB: CUSTOMER COMPLAINTS & TICKETS HUB */}
      {activeAdminTab === 'customer-complaints' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Header & Metrics */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-blue-600 dark:text-cyan-400" />
                  <span>{lang === 'ar' ? 'مركز استقبال ومتابعة شكاوى واستفسارات العملاء' : 'Customer Complaints & Support Tickets'}</span>
                </h2>
                <p className="text-xs text-slate-500 font-bold mt-1">
                  {lang === 'ar' 
                    ? 'تصلك هنا جميع الرسائل والشكاوى والاستفسارات المباشرة المرسلة من العملاء عبر صفحة (تواصل معنا).' 
                    : 'All customer contact messages, support tickets, and complaints arrive here.'}
                </p>
              </div>

              <button
                onClick={fetchComplaints}
                className="px-4 py-2.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-cyan-400 text-xs font-black rounded-xl hover:bg-blue-100 transition flex items-center gap-2 self-start md:self-auto"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{lang === 'ar' ? 'تحديث الشكاوى' : 'Refresh Tickets'}</span>
              </button>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl">
                <p className="text-[11px] font-bold text-slate-400">{lang === 'ar' ? 'إجمالي الرسائل والشكاوى' : 'Total Tickets'}</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{complaintsList.length}</p>
              </div>
              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-2xl">
                <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400">{lang === 'ar' ? 'معلقة بانتظار المراجعة' : 'Pending Review'}</p>
                <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                  {complaintsList.filter(c => c.status === 'PENDING').length}
                </p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 rounded-2xl">
                <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400">{lang === 'ar' ? 'قيد المعالجة والمتابعة' : 'In Progress'}</p>
                <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                  {complaintsList.filter(c => c.status === 'IN_PROGRESS').length}
                </p>
              </div>
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl">
                <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">{lang === 'ar' ? 'محلولة ومجاب عليها' : 'Resolved'}</p>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {complaintsList.filter(c => c.status === 'RESOLVED').length}
                </p>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                {['ALL', 'PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'].map(st => (
                  <button
                    key={st}
                    onClick={() => setComplaintsFilter(st)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap ${complaintsFilter === st
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                  >
                    {st === 'ALL' && (lang === 'ar' ? 'كافة الشكاوى' : 'All Tickets')}
                    {st === 'PENDING' && (lang === 'ar' ? 'معلقة ⏳' : 'Pending')}
                    {st === 'IN_PROGRESS' && (lang === 'ar' ? 'قيد المعالجة 🔄' : 'In Progress')}
                    {st === 'RESOLVED' && (lang === 'ar' ? 'محلولة ✓' : 'Resolved')}
                    {st === 'REJECTED' && (lang === 'ar' ? 'مرفوضة ✕' : 'Rejected')}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={complaintsSearch}
                onChange={e => setComplaintsSearch(e.target.value)}
                placeholder={lang === 'ar' ? 'ابحث باسم العميل أو البريد أو الكود...' : 'Search by name, email, ID...'}
                className="w-full sm:w-64 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Complaints Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right rtl:text-right text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-extrabold uppercase">
                  <tr>
                    <th className="py-4 px-4">رقم الشكوى</th>
                    <th className="py-4 px-4">العميل / البريد</th>
                    <th className="py-4 px-4">موضوع الشكوى</th>
                    <th className="py-4 px-4">محتوى الرسالة</th>
                    <th className="py-4 px-4">التاريخ</th>
                    <th className="py-4 px-4">الحالة</th>
                    <th className="py-4 px-4 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold text-slate-800 dark:text-slate-200">
                  {complaintsList
                    .filter(c => complaintsFilter === 'ALL' || c.status === complaintsFilter)
                    .filter(c => !complaintsSearch || (c.name + c.email + c.id + c.message).toLowerCase().includes(complaintsSearch.toLowerCase()))
                    .map(c => (
                      <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                        <td className="py-4 px-4 font-mono font-black text-blue-600 dark:text-cyan-400">{c.id}</td>
                        <td className="py-4 px-4">
                          <p className="font-extrabold text-slate-900 dark:text-white">{c.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{c.email}</p>
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {c.subject === 'TOPUP' ? 'مساعدة شحن محفظة' : c.subject === 'ORDER' ? 'مشكلة طلب / كود' : c.subject === 'BUSINESS' ? 'شراكة تجارية' : 'استفسار عام'}
                          </span>
                        </td>
                        <td className="py-4 px-4 max-w-xs truncate text-slate-600 dark:text-slate-400" title={c.message}>
                          {c.message}
                        </td>
                        <td className="py-4 px-4 text-[10px] text-slate-400 font-mono whitespace-nowrap">
                          {c.createdAt ? new Date(c.createdAt).toLocaleString('ar-YE', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black inline-block ${
                            c.status === 'RESOLVED'
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                              : c.status === 'IN_PROGRESS'
                                ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                                : c.status === 'REJECTED'
                                  ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                                  : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            }`}>
                            {c.status === 'RESOLVED' ? 'محلولة ✓' : c.status === 'IN_PROGRESS' ? 'قيد المتابعة 🔄' : c.status === 'REJECTED' ? 'مرفوضة ✕' : 'معلقة ⏳'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedComplaint(c);
                                setComplaintResponseForm({ status: c.status || 'RESOLVED', notes: c.adminNotes || '' });
                                setShowComplaintModal(true);
                              }}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[11px] font-extrabold shadow-sm transition"
                            >
                              معاينة والرد
                            </button>
                            <button
                              onClick={() => handleDeleteComplaint(c.id)}
                              className="p-1.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 rounded-xl transition"
                              title="حذف الشكوى"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  {complaintsList.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 font-extrabold">
                        لا توجد أي شكاوى أو استفسارات مسجلة حالياً.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: ORDERS FULFILLMENT & CODE EMAIL DISPATCHER HUB */}
      {activeAdminTab === 'orders-manager' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Header & Metrics */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <ShoppingBag className="w-6 h-6 text-blue-600 dark:text-cyan-400" />
                  <span>{lang === 'ar' ? 'مركز مراجعة وتلبية طلبات الشراء والأكواد الرقمية' : 'Orders Fulfillment & Code Email Dispatcher'}</span>
                </h2>
                <p className="text-xs text-slate-500 font-bold mt-1">
                  {lang === 'ar' 
                    ? 'تابع الطلبات التي قمت بمعالجتها وإرسال الكود لها، والطلبات المعلقة التي تنتظر التثبت وتزويد العميل بالكود.' 
                    : 'Track processed orders with sent codes versus pending orders awaiting fulfillment.'}
                </p>
              </div>

              <button
                onClick={fetchBackendOrders}
                className="px-4 py-2.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-cyan-400 text-xs font-black rounded-xl hover:bg-blue-100 transition flex items-center gap-2 self-start md:self-auto cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{lang === 'ar' ? 'تحديث الطلبات' : 'Refresh Orders'}</span>
              </button>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl">
                <p className="text-[11px] font-bold text-slate-400">{lang === 'ar' ? 'إجمالي الطلبات' : 'Total Orders'}</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{adminOrdersList.length}</p>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-2xl">
                <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400">{lang === 'ar' ? '⏳ لم يُرسل الكود بعد (معلقة)' : 'Pending Delivery'}</p>
                <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                  {adminOrdersList.filter(o => o.status === 'CREATED' || o.status === 'PENDING' || o.status === 'PAYMENT_PENDING' || o.status === 'PROCESSING').length}
                </p>
              </div>

              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl">
                <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">{lang === 'ar' ? '✅ تم معالجتها وإرسال الكود' : 'Fulfilled & Sent'}</p>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {adminOrdersList.filter(o => o.status === 'COMPLETED' || o.status === 'DELIVERED').length}
                </p>
              </div>

              <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-2xl">
                <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400">{lang === 'ar' ? '✕ طلبات مرفوضة' : 'Rejected Orders'}</p>
                <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                  {adminOrdersList.filter(o => o.status === 'REJECTED').length}
                </p>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                {[
                  { id: 'ALL', label: lang === 'ar' ? 'كافة الطلبات' : 'All Orders' },
                  { id: 'PENDING', label: lang === 'ar' ? '⏳ لم يُرسل الكود بعد (معلقة)' : 'Pending Code Delivery' },
                  { id: 'COMPLETED', label: lang === 'ar' ? '✅ تم معالجتها وإرسال الكود' : 'Code Sent & Fulfilled' },
                  { id: 'REJECTED', label: lang === 'ar' ? '✕ طلبات مرفوضة' : 'Rejected' }
                ].map(st => (
                  <button
                    key={st.id}
                    onClick={() => setOrderStatusFilter(st.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap ${orderStatusFilter === st.id
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={orderSearchQuery}
                onChange={e => setOrderSearchQuery(e.target.value)}
                placeholder={lang === 'ar' ? 'ابحث برقم الطلب، اسم المنتج، البريد، الكود...' : 'Search by order ID, email, code...'}
                className="w-full sm:w-72 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Orders Table */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right rtl:text-right text-xs">
                <thead>
                  <tr className="bg-slate-100/70 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-black">
                    <th className="py-3.5 px-4">{lang === 'ar' ? 'رقم الطلب والتاريخ' : 'Order ID & Date'}</th>
                    <th className="py-3.5 px-4">{lang === 'ar' ? 'المنتج والباقة المختارة' : 'Product & Package'}</th>
                    <th className="py-3.5 px-4">{lang === 'ar' ? 'اسم العميل' : 'Customer Name'}</th>
                    <th className="py-3.5 px-4">{lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}</th>
                    <th className="py-3.5 px-4">{lang === 'ar' ? 'المبلغ الإجمالي' : 'Total Amount'}</th>
                    <th className="py-3.5 px-4">{lang === 'ar' ? 'وسيلة الدفع' : 'Payment Method'}</th>
                    <th className="py-3.5 px-4">{lang === 'ar' ? 'حالة التسليم' : 'Delivery Status'}</th>
                    <th className="py-3.5 px-4">{lang === 'ar' ? 'الكود الرقمي المرفق' : 'Attached Code'}</th>
                    <th className="py-3.5 px-4 text-center">{lang === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold text-slate-700 dark:text-slate-200">
                  {adminOrdersList
                    .filter(o => {
                      if (orderStatusFilter !== 'ALL') {
                        if (orderStatusFilter === 'PENDING') return o.status === 'CREATED' || o.status === 'PENDING' || o.status === 'PAYMENT_PENDING' || o.status === 'PAYMENT_CONFIRMED' || o.status === 'PROCESSING';
                        if (orderStatusFilter === 'COMPLETED') return o.status === 'COMPLETED' || o.status === 'DELIVERED';
                        return o.status === orderStatusFilter;
                      }
                      return true;
                    })
                    .filter(o => {
                      if (!orderSearchQuery.trim()) return true;
                      const q = orderSearchQuery.toLowerCase();
                      const deliveredCode = (o.deliveredPayload?.pinCode || o.pin_code || '').toLowerCase();
                      const emailStr = (o.userEmail || o.guestEmail || o.targetAccountId || '').toLowerCase();
                      const nameStr = (o.userName || o.name || '').toLowerCase();
                      const packageStr = (o.packageTitle || o.productTitle || '').toLowerCase();
                      return (
                        (o.id && o.id.toLowerCase().includes(q)) ||
                        (o.productTitle && o.productTitle.toLowerCase().includes(q)) ||
                        packageStr.includes(q) ||
                        emailStr.includes(q) ||
                        nameStr.includes(q) ||
                        deliveredCode.includes(q)
                      );
                    })
                    .map((o) => {
                      const isFulfilled = o.status === 'COMPLETED' || o.status === 'DELIVERED';
                      const isPending = !isFulfilled && o.status !== 'REJECTED';
                      const customerName = o.userName || o.name || (o.isGuest ? (lang === 'ar' ? 'عميل زائر' : 'Guest Customer') : (lang === 'ar' ? 'عميل مسجل' : 'Registered User'));
                      const customerEmail = o.userEmail || o.guestEmail || (o.targetAccountId?.includes('@') ? o.targetAccountId : 'customer@nexuspaystore.com');
                      const displayPackage = o.packageTitle || o.packageId || o.productTitle || 'باقة رقمية';
                      
                      let activeCode = null;
                      if (isFulfilled) {
                        activeCode = o.pin_code || o.code;
                        if (!activeCode && typeof o.deliveredPayload === 'object' && o.deliveredPayload?.pinCode) {
                          activeCode = o.deliveredPayload.pinCode;
                        }
                        if (!activeCode && typeof o.delivery_payload === 'string') {
                          try { activeCode = JSON.parse(o.delivery_payload)?.pinCode; } catch (e) {}
                        }
                      }

                      return (
                        <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                          {/* Order ID & Date */}
                          <td className="py-4 px-4 font-mono font-black text-blue-600 dark:text-cyan-400">
                            #{o.id}
                            <span className="block text-[10px] text-slate-400 font-normal mt-0.5">
                              {new Date(o.createdAt || Date.now()).toLocaleDateString('ar-EG')}
                            </span>
                          </td>

                          {/* Product & Package */}
                          <td className="py-4 px-4">
                            <span className="font-black text-slate-900 dark:text-white block">{o.productTitle || o.productId}</span>
                            <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-extrabold block mt-0.5">📦 {displayPackage}</span>
                            {o.items && o.items.length > 1 && (
                              <button
                                onClick={() => setSelectedOrderForItemsModal(o)}
                                className="mt-1.5 px-2.5 py-1 bg-blue-600/10 hover:bg-blue-600 hover:text-white text-blue-600 dark:text-cyan-400 rounded-xl text-[10px] font-black border border-blue-500/20 block transition cursor-pointer"
                              >
                                📋 {lang === 'ar' ? `استعراض القائمة (${o.items.length} منتجات)` : `View Items (${o.items.length})`}
                              </button>
                            )}
                          </td>

                          {/* Customer Name / Account ID */}
                          <td className="py-4 px-4">
                            <span className="font-black text-slate-900 dark:text-white block">{customerName}</span>
                            <span className="text-[10px] font-mono text-slate-400 block mt-0.5">ID: {o.targetAccountId || o.playerId || 'N/A'}</span>
                          </td>

                          {/* Email Address */}
                          <td className="py-4 px-4 font-mono text-xs">
                            <span className="font-extrabold text-slate-800 dark:text-slate-200 block">{customerEmail}</span>
                            <span className="text-[10px] text-slate-400 block">{o.isGuest ? 'طلب زائر' : 'حساب مسجل'}</span>
                          </td>

                          {/* Total Amount */}
                          <td className="py-4 px-4">
                            <span className="font-black text-emerald-600 dark:text-emerald-400 block text-sm">${(o.priceUSD || o.totalUSD || 9.99).toFixed(2)}</span>
                            <span className="text-[10px] text-slate-400 block">الكمية: {o.quantity || 1}</span>
                          </td>

                          {/* Payment Method */}
                          <td className="py-4 px-4">
                            {(() => {
                              const pm = (o.paymentMethod || 'WALLET').toUpperCase();
                              if (pm === 'WALLET') {
                                return (
                                  <span className="px-2.5 py-1 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-xl text-[10px] font-black border border-cyan-500/20 inline-block">
                                    💳 محفظة الموقع
                                  </span>
                                );
                              }
                              if (pm === 'YEMEN_TRANSFER') {
                                return (
                                  <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl text-[10px] font-black border border-emerald-500/20 inline-block">
                                    🇾🇪 تحويل بنكي يمني
                                  </span>
                                );
                              }
                              if (pm === 'PAYPAL') {
                                return (
                                  <span className="px-2.5 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl text-[10px] font-black border border-blue-500/20 inline-block">
                                    🅿️ بايبال (PayPal)
                                  </span>
                                );
                              }
                              return (
                                <span className="px-2.5 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl text-[10px] font-black border border-purple-500/20 inline-block">
                                  💳 بطاقة ائتمان
                                </span>
                              );
                            })()}
                          </td>

                          {/* Delivery Status */}
                          <td className="py-4 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black inline-block ${
                              isFulfilled
                                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                : o.status === 'REJECTED'
                                  ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                                  : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                              }`}>
                              {isFulfilled ? 'مكتمل وتم إرسال الكود ✓' : o.status === 'REJECTED' ? 'مرفوض ✕' : 'لم يُرسل الكود بعد ⏳'}
                            </span>
                          </td>

                          {/* Attached Code */}
                          <td className="py-4 px-4">
                            {activeCode ? (
                              <span className="px-2.5 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl font-mono text-[11px] font-black border border-emerald-500/20 block truncate max-w-[140px]" title={activeCode}>
                                {activeCode}
                              </span>
                            ) : (
                              <span className="px-2.5 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl text-[10px] font-bold border border-amber-500/20 block">
                                {o.status === 'REJECTED' ? '—' : '⏳ تنتظر الكود'}
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleOpenDispatchModal(o)}
                                className={`px-3 py-1.5 font-black text-xs rounded-xl shadow-sm transition flex items-center gap-1 cursor-pointer ${
                                  isFulfilled
                                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                }`}
                              >
                                <Mail className="w-3.5 h-3.5" />
                                <span>{isFulfilled ? 'تعديل/إعادة إرسال' : 'تسليم الكود بالبريد'}</span>
                              </button>
                              {isPending && (
                                <button
                                  onClick={() => handleRejectOrderSubmit(o.id)}
                                  className="px-3 py-1.5 bg-rose-500/10 text-rose-600 hover:bg-rose-600 hover:text-white font-black text-xs rounded-xl transition cursor-pointer"
                                >
                                  {lang === 'ar' ? 'رفض' : 'Reject'}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: YEMEN PENDING DEPOSIT VERIFICATION REQUESTS */}
      {activeAdminTab === 'pending-deposits' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>🇾🇪</span>
                <span>{lang === 'ar' ? 'طلبات الإيداع والشحن المباشر المعلقة (اليمن)' : 'Yemen Pending Deposit Verification Requests'}</span>
              </h2>
              <p className="text-xs text-slate-500 font-bold mt-1">
                {lang === 'ar' ? 'قم بمراجعة إشعارات التحويل والموافقة على شحن حسابات العملاء فور التأكد من وصول الحوالة.' : 'Verify transfer notices and click approve to instantly credit user wallets.'}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {['PENDING_VERIFICATION', 'COMPLETED', 'REJECTED', 'ALL'].map(st => (
                <button
                  key={st}
                  onClick={() => setDepositStatusFilter(st)}
                  className={`px-3 py-2 rounded-xl text-xs font-black transition cursor-pointer ${depositStatusFilter === st
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                >
                  {st === 'PENDING_VERIFICATION' && (lang === 'ar' ? 'طلبات معلقة' : 'Pending')}
                  {st === 'COMPLETED' && (lang === 'ar' ? 'مقبولة ومغذاة' : 'Approved')}
                  {st === 'REJECTED' && (lang === 'ar' ? 'مرفوضة' : 'Rejected')}
                  {st === 'ALL' && (lang === 'ar' ? 'الكل' : 'All')}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <input
              type="text"
              value={depositSearchQuery}
              onChange={e => setDepositSearchQuery(e.target.value)}
              placeholder={lang === 'ar' ? 'ابحث برقم الطلب، رقم الإشعار، اسم العميل، أو البنك...' : 'Search deposit ID, reference number, user, or bank...'}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
            />
          </div>

          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right rtl:text-right ltr:text-left">
                <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-black border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-4">{lang === 'ar' ? 'رقم الإيداع' : 'ID'}</th>
                    <th className="p-4">{lang === 'ar' ? 'العميل' : 'User'}</th>
                    <th className="p-4">{lang === 'ar' ? 'المنطقة' : 'Region'}</th>
                    <th className="p-4">{lang === 'ar' ? 'البنك / التطبيق' : 'Bank'}</th>
                    <th className="p-4">{lang === 'ar' ? 'رقم الإشعار / المرجع' : 'Reference'}</th>
                    <th className="p-4">{lang === 'ar' ? 'المبلغ ($)' : 'Amount'}</th>
                    <th className="p-4">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                    <th className="p-4 text-center">{lang === 'ar' ? 'إجراء الإدارة' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold">
                  {depositRequests
                    .filter(r => depositStatusFilter === 'ALL' || r.status === depositStatusFilter)
                    .filter(r => {
                      if (!depositSearchQuery.trim()) return true;
                      const q = depositSearchQuery.toLowerCase();
                      return (
                        r.id.toLowerCase().includes(q) ||
                        r.referenceNumber.toLowerCase().includes(q) ||
                        r.userName.toLowerCase().includes(q) ||
                        r.bankName.toLowerCase().includes(q)
                      );
                    })
                    .map(req => (
                      <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                        <td className="p-4 font-mono font-black text-blue-600 dark:text-cyan-400">{req.id}</td>
                        <td className="p-4 font-black">
                          <div>{req.userName}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{req.userEmail || req.userPhone}</div>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 font-bold">
                            {req.region === 'NORTH' ? 'شمال (صنعاء)' : 'جنوب (عدن)'}
                          </span>
                        </td>
                        <td className="p-4 font-extrabold">{req.bankName}</td>
                        <td className="p-4 font-mono text-blue-600 dark:text-cyan-400 font-black">{req.referenceNumber}</td>
                        <td className="p-4 font-black text-emerald-600 dark:text-emerald-400 text-sm">{formatCurrency(req.amountUSD)}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${req.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400'
                              : req.status === 'REJECTED'
                                ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/80 dark:text-rose-400'
                                : 'bg-amber-100 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400'
                            }`}>
                            {req.status === 'COMPLETED' ? 'مقبول ومغذى' : req.status === 'REJECTED' ? 'مرفوض' : 'قيد التثبت'}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          {req.status === 'PENDING_VERIFICATION' ? (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => approveDepositRequest(req.id)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-sm transition cursor-pointer"
                              >
                                ✓ تأكيد وشحن المحفظة
                              </button>
                              <button
                                onClick={() => {
                                  const reason = prompt(lang === 'ar' ? 'سبب رفض طلب الإيداع:' : 'Rejection reason:', 'لم يتم العثور على الإشعار المالي');
                                  if (reason) rejectDepositRequest(req.id, reason);
                                }}
                                className="px-3 py-1.5 bg-rose-600/10 hover:bg-rose-600 text-rose-600 hover:text-white font-extrabold text-xs rounded-xl transition cursor-pointer"
                              >
                                ✕ رفض
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-normal">تم اتخاذ الإجراء</span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: YEMEN BANKS & WALLETS MANAGER */}
      {activeAdminTab === 'yemen-banks-manager' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Building className="w-6 h-6 text-emerald-500" />
                <span>{lang === 'ar' ? 'إدارة البنوك والمحافظ الإلكترونية اليمنية (شمال / جنوب)' : 'Yemen Regional Banks & Wallets Manager'}</span>
              </h2>
              <p className="text-xs text-slate-500 font-bold mt-1">
                {lang === 'ar' ? 'أضف وعدل حسابات المستلم ورقم الهاتف المسموح لكل منطقة جغرافيًا (صنعاء وشمال اليمن / عدن وجنوب اليمن)' : 'Configure recipient names, account numbers, and support numbers per region.'}
              </p>
            </div>

            <button
              onClick={() => setShowAddYemenBankModal(true)}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{lang === 'ar' ? 'إضافة بنك / محفظة جديدة' : '+ Add New Bank Account'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* North Banks */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <span>🏢</span>
                <span>{lang === 'ar' ? 'حسابات ومحافظ شمال اليمن (صنعاء والمحافظات)' : 'North Yemen Accounts'}</span>
              </h3>
              <div className="space-y-3">
                {yemenBanksList.filter(b => b.region === 'NORTH' || b.region === 'BOTH').map(b => (
                  <div key={b.id} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center shrink-0">
                        {b.imageUrl ? (
                          <img src={b.imageUrl} alt={b.name} className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="w-5 h-5 text-emerald-500" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-black text-xs text-slate-900 dark:text-white">{b.name}</h4>
                        <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-black mt-0.5">
                          رقم الحساب: {b.accountNumber} | المستلم: {b.recipientName}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">واتساب: {b.whatsappPhone || '+967775479340'}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteYemenBank(b.id)}
                      className="p-2 text-slate-400 hover:text-rose-500 rounded-xl transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* South Banks */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <span>🌊</span>
                <span>{lang === 'ar' ? 'حسابات وبنوك جنوب اليمن (عدن والمحافظات)' : 'South Yemen Accounts'}</span>
              </h3>
              <div className="space-y-3">
                {yemenBanksList.filter(b => b.region === 'SOUTH' || b.region === 'BOTH').map(b => (
                  <div key={b.id} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center shrink-0">
                        {b.imageUrl ? (
                          <img src={b.imageUrl} alt={b.name} className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="w-5 h-5 text-blue-500" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-black text-xs text-slate-900 dark:text-white">{b.name}</h4>
                        <div className="text-[11px] font-mono text-blue-600 dark:text-cyan-400 font-black mt-0.5">
                          رقم الحساب: {b.accountNumber} | المستلم: {b.recipientName}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">واتساب: {b.whatsappPhone || '+967775479340'}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteYemenBank(b.id)}
                      className="p-2 text-slate-400 hover:text-rose-500 rounded-xl transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Add Bank Modal */}
          {showAddYemenBankModal && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 rtl:text-right text-right">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">
                    {lang === 'ar' ? 'إضافة بنك أو محفظة إلكترونية يمنية جديدة' : 'Add New Yemen Bank Account'}
                  </h3>
                  <button onClick={() => setShowAddYemenBankModal(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
                </div>

                <form onSubmit={handleAddYemenBankSubmit} className="space-y-3 text-xs font-bold">
                  <div>
                    <label className="block mb-1 text-slate-600 dark:text-slate-400">اسم الحساب / البنك / المحفظة *</label>
                    <input
                      type="text"
                      required
                      value={newBankForm.name}
                      onChange={e => setNewBankForm({ ...newBankForm, name: e.target.value })}
                      placeholder="مثال: حساب الكريمي المميز (صنعاء)"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold"
                    />
                  </div>

                  <div>
                    <ImageUploadInput
                      label={lang === 'ar' ? 'شعار / صورة البنك أو المحفظة (رفع من الجهاز إلى Cloudinary)' : 'Bank Logo Image (Cloudinary Upload)'}
                      value={newBankForm.imageUrl}
                      onChange={url => setNewBankForm({ ...newBankForm, imageUrl: url })}
                      placeholder="رابط الصورة أو اضغط زر رفع صورة من الجهاز..."
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-slate-600 dark:text-slate-400">المنطقة الجغرافية *</label>
                    <select
                      value={newBankForm.region}
                      onChange={e => setNewBankForm({ ...newBankForm, region: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold"
                    >
                      <option value="NORTH">شمال اليمن (صنعاء والمحافظات)</option>
                      <option value="SOUTH">جنوب اليمن (عدن والمحافظات)</option>
                      <option value="BOTH">جميع المناطق (شمال وجنوب)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 text-slate-600 dark:text-slate-400">اسم المستلم (مدير المشروع) *</label>
                    <input
                      type="text"
                      required
                      value={newBankForm.recipientName}
                      onChange={e => setNewBankForm({ ...newBankForm, recipientName: e.target.value })}
                      placeholder="مثال: عمار Zuhair"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-slate-600 dark:text-slate-400">رقم الحساب أو رقم الجوال للتحويل *</label>
                    <input
                      type="text"
                      required
                      value={newBankForm.accountNumber}
                      onChange={e => setNewBankForm({ ...newBankForm, accountNumber: e.target.value })}
                      placeholder="مثال: 301294819 أو 775479340"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-slate-600 dark:text-slate-400">رقم الواتساب لإرسال الإشعارات والإثباتات</label>
                    <input
                      type="text"
                      value={newBankForm.whatsappPhone}
                      onChange={e => setNewBankForm({ ...newBankForm, whatsappPhone: e.target.value })}
                      placeholder="+967775479340"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-slate-600 dark:text-slate-400">ملاحظات وتعليمات للمستخدم</label>
                    <input
                      type="text"
                      value={newBankForm.notes}
                      onChange={e => setNewBankForm({ ...newBankForm, notes: e.target.value })}
                      placeholder="مثال: يرجى تحويل المبلغ المباشر عبر تطبيق حاسب"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-md transition mt-2 cursor-pointer"
                  >
                    حفظ الحساب والمحفظة
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 0: FINANCIAL ANALYTICS & PLATFORM PROFITABILITY HUB */}
      {activeAdminTab === 'financial-analytics' && (
        <div className="space-y-8 animate-fade-in">
          {/* Financial Header & Time Filter */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-emerald-500" />
                {lang === 'ar' ? 'المركز المالي والتحليلات الربحية للمنصة' : 'Platform Financial Intelligence & Profitability'}
              </h2>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
                {lang === 'ar' ? 'تقرير شامل عن الإيرادات، صافي الهامش الربحي، الأكثر مبيعات، وتوزيع السيولة بالنظام' : 'Comprehensive financials: Gross revenue, net profit margin, top selling items & ledger liquidity.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {['TODAY', 'WEEK', 'MONTH', 'YEAR'].map((period) => (
                <button
                  key={period}
                  className="px-3 py-2 rounded-xl text-xs font-black bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white transition"
                >
                  {period === 'TODAY' && (lang === 'ar' ? 'اليوم' : 'Today')}
                  {period === 'WEEK' && (lang === 'ar' ? 'هذا الأسبوع' : 'This Week')}
                  {period === 'MONTH' && (lang === 'ar' ? 'هذا الشهر' : 'This Month')}
                  {period === 'YEAR' && (lang === 'ar' ? 'السنة الجارية' : 'This Year')}
                </button>
              ))}
              <button
                onClick={handleExportFinancialReport}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-md transition flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4" />
                <span>{lang === 'ar' ? 'تصدير التقرير المالي CSV' : 'Export CSV Financials'}</span>
              </button>
            </div>
          </div>

          {/* Top 4 Financial Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-400 block">{lang === 'ar' ? 'إجمالي المبيعات الحقيقية' : 'Gross Real Sales'}</span>
              <div className="text-3xl font-black text-slate-900 dark:text-white font-mono">${totalGrossRevenue.toFixed(2)}</div>
              <div className="text-[11px] text-emerald-500 font-extrabold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{completedOrders.length} {lang === 'ar' ? 'عمليات شراء مكتملة' : 'completed orders'}</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-400 block">{lang === 'ar' ? 'صافي الربح الفعلي (Net Profit)' : 'Actual Net Profit'}</span>
              <div className="text-3xl font-black text-emerald-500 font-mono">${totalNetProfit.toFixed(2)}</div>
              <div className="text-[11px] text-blue-500 font-extrabold flex items-center gap-1">
                <span>{netProfitMargin}% {lang === 'ar' ? 'هامش الربح الصافي' : 'Net Margin %'}</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-400 block">{lang === 'ar' ? 'متوسط قيمة الطلب (AOV)' : 'Average Order Value'}</span>
              <div className="text-3xl font-black text-blue-500 font-mono">${averageOrderValue}</div>
              <div className="text-[11px] text-slate-400 font-bold">
                {lang === 'ar' ? 'سعر المعاملة الواحدة' : 'Per transaction value'}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-400 block">{lang === 'ar' ? 'التكلفة المدفوعة للموردين' : 'Supplier Cost Breakdown'}</span>
              <div className="text-3xl font-black text-purple-500 font-mono">${totalProviderCosts.toFixed(2)}</div>
              <div className="text-[11px] text-purple-400 font-bold">
                {lang === 'ar' ? 'إجمالي سعر التكلفة الكلية' : 'Total provider wholesale cost'}
              </div>
            </div>
          </div>

          {/* Top Sellers Table & Categories Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Top Sellers Table */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  {lang === 'ar' ? 'المنتجات والخدمات الأكثر مبيعاً والأعلى أرباحاً' : 'Top Selling & High Margin Products'}
                </h3>
                <span className="text-xs text-blue-500 font-bold">{lang === 'ar' ? 'أعلى 5 خدمات' : 'Top 5 Performers'}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right rtl:text-right text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-black">
                      <th className="pb-3 px-2">{lang === 'ar' ? 'المنتج / الخدمة' : 'Product'}</th>
                      <th className="pb-3 px-2">{lang === 'ar' ? 'عدد المبيعات' : 'Sales Count'}</th>
                      <th className="pb-3 px-2">{lang === 'ar' ? 'إجمالي المبيعات' : 'Gross Sales'}</th>
                      <th className="pb-3 px-2">{lang === 'ar' ? 'صافي الربح' : 'Net Profit'}</th>
                      <th className="pb-3 px-2">{lang === 'ar' ? 'نسبة الهامش' : 'Margin %'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold text-slate-700 dark:text-slate-200">
                    {[
                      { name: 'شدات ببجي موبايل 600 UC', count: 1420, gross: '$14,185.80', profit: '$2,120.00', margin: '14.9%' },
                      { name: 'اشتراك ChatGPT Plus الشهرية', count: 980, gross: '$19,600.00', profit: '$3,920.00', margin: '20.0%' },
                      { name: 'اشتراك Netflix 4K Ultra HD', count: 650, gross: '$9,750.00', profit: '$1,460.00', margin: '14.9%' },
                      { name: 'بطاقة ستيم Steam $50 Code', count: 410, gross: '$20,500.00', profit: '$1,025.00', margin: '5.0%' },
                      { name: 'جواهر فري فاير 1080 Diamonds', count: 890, gross: '$8,891.10', profit: '$1,330.00', margin: '14.9%' }
                    ].map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                        <td className="py-3 px-2 font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center text-[10px] font-black">
                            {idx + 1}
                          </span>
                          <span>{item.name}</span>
                        </td>
                        <td className="py-3 px-2 font-mono">{item.count}</td>
                        <td className="py-3 px-2 font-mono text-slate-900 dark:text-white">{item.gross}</td>
                        <td className="py-3 px-2 font-mono text-emerald-500">{item.profit}</td>
                        <td className="py-3 px-2 font-mono text-blue-500">{item.margin}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sales Breakdown By Category */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-500" />
                {lang === 'ar' ? 'توزيع المبيعات حسب الفئات' : 'Category Sales Share'}
              </h3>

              <div className="space-y-4 text-xs font-bold">
                {[
                  { cat: '🎮 شحن الألعاب (Games Top-up)', percent: 42, amount: '$20,546.60', color: 'bg-blue-500' },
                  { cat: '📺 الاشتراكات الرقمية (Subscriptions)', percent: 28, amount: '$13,697.74', color: 'bg-purple-500' },
                  { cat: '🤖 الذكاء الاصطناعي (AI Tools)', percent: 18, amount: '$8,805.69', color: 'bg-emerald-500' },
                  { cat: '💳 بطاقات الهدايا (Gift Cards)', percent: 12, amount: '$5,870.46', color: 'bg-amber-500' }
                ].map((c, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-900 dark:text-white">{c.cat}</span>
                      <span className="font-mono text-slate-400">{c.amount} ({c.percent}%)</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className={`h-full ${c.color} rounded-full transition-all duration-500`} style={{ width: `${c.percent}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

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

      {/* TAB 1.5: CATEGORIES VISIBILITY MANAGER */}
      {activeAdminTab === 'categories-editor' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-6 h-6 text-blue-600 dark:text-cyan-400" />
                {lang === 'ar' ? 'إدارة وتفعيل الأقسام والتصنيفات (11 فئة)' : 'Category Visibility & Enable/Disable Manager'}
              </h2>
              <p className="text-xs font-extrabold text-slate-500 dark:text-slate-400 mt-1">
                {lang === 'ar'
                  ? 'يمكنك تفعيل أو إلغاء تفعيل أي قسم بنقرة واحدة. عند إيقاف قسم، يختفي تلقائياً من الواجهة الرئيسية وسطح تصفح المنتجات للمستخدمين.'
                  : 'Toggle category visibility. Disabled categories and their products are hidden from public store view.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => {
              const titleText = cat.title ? (cat.title[lang] || cat.title.ar || cat.title.en) : cat.id;
              const prodCount = products.filter(p => p.categoryId === cat.id).length;
              const isActive = cat.isActive !== false;

              return (
                <div
                  key={cat.id}
                  className={`p-6 rounded-3xl border transition-all shadow-xs flex flex-col justify-between space-y-4 ${isActive
                      ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                      : 'bg-slate-50 dark:bg-slate-950/60 border-rose-200 dark:border-rose-900/40 opacity-75'
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl shrink-0">
                        {cat.icon || '📁'}
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 dark:text-white text-base">
                          {titleText}
                        </h3>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">ID: {cat.id} | slug: {cat.slug}</p>
                      </div>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${isActive
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                        : 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-800'
                      }`}>
                      {isActive ? (lang === 'ar' ? 'مفعل / نشط' : 'Active') : (lang === 'ar' ? 'معطل / مخفي' : 'Inactive')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 font-bold border-t border-slate-100 dark:border-slate-800/80 pt-3 mt-2">
                    <span>{lang === 'ar' ? 'عدد المنتجات في القسم:' : 'Products Count:'} <strong className="text-slate-900 dark:text-white">{prodCount}</strong></span>

                    <button
                      onClick={() => toggleCategoryStatus(cat.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${isActive
                          ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                        }`}
                    >
                      {isActive ? (
                        <>
                          <ToggleRight className="w-4 h-4" />
                          <span>{lang === 'ar' ? 'إلغاء تفعيل القسم' : 'Disable Category'}</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-4 h-4" />
                          <span>{lang === 'ar' ? 'تفعيل القسم' : 'Enable Category'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: UNIFIED PROVIDERS & VENDORS HUB */}
      {activeAdminTab === 'providers-vendors-hub' && (
        <div className="space-y-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Server className="w-6 h-6 text-emerald-500" />
                {lang === 'ar' ? 'إدارة وسوق الموردين الشامل والأرصدة المتاحة' : 'Unified Providers & Vendors Hub (Balances & Drivers)'}
              </h2>
              <p className="text-xs font-extrabold text-slate-500 dark:text-slate-400 mt-1">
                {lang === 'ar' ? `الموردين المسجلين: ${providersList.length} مزود خدمة | إجمالي الأرصدة المتاحة بالنظام: $${providersList.reduce((s, p) => s + (p.available_balance || p.balanceUSD || 0), 0).toFixed(2)}` : `Active Providers: ${providersList.length} drivers integrated.`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddProvModal(true)}
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-2xl shadow-md transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {lang === 'ar' ? 'تجهيز مورد جديد' : 'Connect New Provider'}
              </button>
            </div>
          </div>

          {/* Providers List Grid with Real Balances */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providersList.map((prov, index) => {
              const availBalance = prov.available_balance !== undefined ? prov.available_balance : (prov.balanceUSD || 1500.00);
              const reservedBalance = prov.reserved_balance || 0.00;
              const isLowBalance = availBalance < 500;

              return (
                <div
                  key={index}
                  className={`bg-white dark:bg-slate-900 border rounded-3xl p-6 shadow-lg flex flex-col justify-between space-y-6 transition ${isLowBalance ? 'border-amber-500/50 dark:border-amber-500/30' : 'border-slate-200 dark:border-slate-800'
                    }`}
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
                        <div>
                          <span className="font-black text-base text-slate-900 dark:text-white block truncate">
                            {prov.driver}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">Priority: {prov.priority || 1}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className={`px-3 py-1 rounded-full text-xs font-black ${prov.status === 'HEALTHY'
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

                    {/* Deposit Balances Section */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-extrabold text-slate-500">{lang === 'ar' ? 'الرصيد المتاح (Available Deposit):' : 'Available Balance:'}</span>
                        <span className={`font-mono font-black text-sm ${isLowBalance ? 'text-amber-500 font-bold' : 'text-emerald-500'}`}>
                          ${availBalance.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-extrabold text-slate-400">{lang === 'ar' ? 'الرصيد المحجوز (TCC Reserved):' : 'Reserved Balance:'}</span>
                        <span className="font-mono font-extrabold text-blue-400">${reservedBalance.toFixed(2)}</span>
                      </div>
                      {isLowBalance && (
                        <div className="text-[10px] text-amber-500 font-black flex items-center gap-1 pt-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{lang === 'ar' ? 'تنبيه: الرصيد ينخفض عن $500! يُفضل الإيداع.' : 'Low deposit alert! Re-charge balance.'}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5 text-xs font-extrabold text-slate-600 dark:text-slate-300">
                      <div className="flex justify-between">
                        <span>{lang === 'ar' ? 'رابط الـ API:' : 'API Endpoint:'}</span>
                        <span className="font-mono text-slate-400 text-[10px] truncate max-w-[140px]">{prov.endpoint || 'https://api.provider.com'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{lang === 'ar' ? 'زمن الاستجابة Ping:' : 'Latency Ping:'}</span>
                        <span className="font-mono text-emerald-500">{prov.latencyMs || 115} ms</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <button
                      onClick={() => {
                        const amountStr = prompt(lang === 'ar' ? `إضافة رصيد إيداع للمورد ${prov.driver} ($):` : `Top-up deposit balance for ${prov.driver} ($):`, '500');
                        if (amountStr && !isNaN(amountStr)) {
                          const addAmt = parseFloat(amountStr);
                          setProvidersList(prev => prev.map(p => p.driver === prov.driver ? { ...p, available_balance: (p.available_balance || 1500) + addAmt } : p));
                          addToast(lang === 'ar' ? `تم إضافة $${addAmt} إلى رصيد المورد ${prov.driver}` : `Added $${addAmt} to ${prov.driver}`);
                        }
                      }}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition flex items-center justify-center gap-1 shadow-md"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>{lang === 'ar' ? 'إيداع رصيد' : 'Top up Deposit'}</span>
                    </button>
                    <button
                      onClick={() => toggleProviderStatus(prov.driver)}
                      className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-900 dark:text-white text-xs font-black rounded-xl transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
                    </button>
                    <button
                      onClick={() => addToast(lang === 'ar' ? `تم فحص الاتصال بالمورد ${prov.driver}: Ping ${prov.latencyMs || 115}ms OK` : `Ping successful: ${prov.latencyMs || 115}ms`)}
                      className="px-3 py-2.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500 text-xs font-black rounded-xl border border-emerald-500/30 transition"
                    >
                      Ping
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Provider Transactions Ledger Table */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <FileText className="w-5 h-5 text-blue-500" />
              {lang === 'ar' ? 'دفتر حركات وقود الموردين (Provider Transactions Ledger)' : 'Provider Transactions Ledger'}
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-right rtl:text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-black">
                    <th className="pb-3 px-2">{lang === 'ar' ? 'التاريخ' : 'Date'}</th>
                    <th className="pb-3 px-2">{lang === 'ar' ? 'المورد' : 'Provider'}</th>
                    <th className="pb-3 px-2">{lang === 'ar' ? 'نوع الحركة' : 'Type'}</th>
                    <th className="pb-3 px-2">{lang === 'ar' ? 'المبلغ' : 'Amount'}</th>
                    <th className="pb-3 px-2">{lang === 'ar' ? 'الرصيد قبل' : 'Balance Before'}</th>
                    <th className="pb-3 px-2">{lang === 'ar' ? 'الرصيد بعد' : 'Balance After'}</th>
                    <th className="pb-3 px-2">{lang === 'ar' ? 'الطلب / الملاحظة' : 'Reference Note'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold text-slate-700 dark:text-slate-200">
                  {[
                    { date: 'Just now', provider: 'RELOADLY', type: 'DEBIT', amount: '-$8.50', before: '$1,500.00', after: '$1,491.50', note: 'Order NP-981203 fulfillment' },
                    { date: '15 mins ago', provider: 'UNIPIN', type: 'DEPOSIT', amount: '+$500.00', before: '$312.00', after: '$812.00', note: 'Admin deposit top-up' },
                    { date: '1 hour ago', provider: 'SMILE_ONE', type: 'DEBIT', amount: '-$14.20', before: '$980.00', after: '$965.80', note: 'Order NP-884102 fulfillment' }
                  ].map((tx, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <td className="py-3 px-2 font-mono text-slate-400">{tx.date}</td>
                      <td className="py-3 px-2 font-black text-slate-900 dark:text-white">{tx.provider}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${tx.type === 'DEPOSIT' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                          }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-mono text-slate-900 dark:text-white">{tx.amount}</td>
                      <td className="py-3 px-2 font-mono text-slate-400">{tx.before}</td>
                      <td className="py-3 px-2 font-mono text-emerald-500">{tx.after}</td>
                      <td className="py-3 px-2 text-slate-500 text-[11px] font-normal">{tx.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

      {/* TAB 5: APM & PERFORMANCE METRICS (KPIs) */}
      {activeAdminTab === 'overview' && (
        <div className="space-y-8 animate-fade-in">
          {/* Header & Automated Test Suite Trigger */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-blue-500" />
                {lang === 'ar' ? 'مؤشرات الأداء التشغيلي وضمان مستوى الخدمة (APM & SLA)' : 'Operational Performance & APM Metrics'}
              </h2>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
                {lang === 'ar' ? 'رصد الاستقرار الفوري، سرعة الاستجابة، ونسبة توفر الخدمة 99.9%' : 'Real-time uptime SLA monitoring, response latency, and system health metrics.'}
              </p>
            </div>

            <button
              onClick={handleRunTests}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-black shadow-lg transition flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{lang === 'ar' ? 'تشغيل حزمة اختبارات الجودة (Enterprise Test Suite)' : 'Run Enterprise Test Suite'}</span>
            </button>
          </div>

          {/* 4 Primary APM Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-400 block">{lang === 'ar' ? 'نسبة توفر الخدمة (Uptime SLA)' : 'Uptime SLA'}</span>
              <div className="text-3xl font-black text-emerald-500">{apmMetrics.availabilityPercentage}%</div>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded-full">🟢 SLA Target &gt; 99.9% (ممتاز)</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-400 block">{lang === 'ar' ? 'متوسط زمن الاستجابة (API Latency)' : 'Avg Response Latency'}</span>
              <div className="text-3xl font-black text-blue-500">{apmMetrics.p99LatencyMs} ms</div>
              <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 text-[10px] font-black rounded-full">⚡ Target &lt; 150ms (فائق السرعة)</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-400 block">{lang === 'ar' ? 'الطلبات المنفذة بنجاح' : 'Fulfilled Orders'}</span>
              <div className="text-3xl font-black text-purple-500">{apmMetrics.totalRequestsExecuted}</div>
              <span className="text-[10px] text-slate-400 font-bold block">{lang === 'ar' ? 'بدون أي تأخير في التسليم' : '0 delivery delays'}</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <span className="text-xs font-bold text-slate-400 block">{lang === 'ar' ? 'الرسائل المعلقة (DLQ Errors)' : 'Active DLQ Items'}</span>
              <div className="text-3xl font-black text-rose-500">{dlqItems.length}</div>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded-full">✓ 0 Critical Failures</span>
            </div>
          </div>

          {/* 🌟 Direct Guidance Box: "كيف نعرف أن الأداء ممتاز ورائع؟" */}
          <div className="bg-gradient-to-r from-blue-900/40 via-slate-900 to-slate-900 border border-blue-500/30 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-cyan-400 font-black text-sm">
              <CheckCircle2 className="w-5 h-5 text-cyan-400" />
              <span>{lang === 'ar' ? 'كيف نعلم أن أداء المنصة ممتاز ومستقر للغاية؟' : 'How to Verify Platform Performance Excellence'}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-bold text-slate-300">
              <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/60 space-y-1">
                <div className="text-emerald-400 font-black">1. سرعة الاستجابة API &lt; 150ms</div>
                <p className="text-[11px] text-slate-400">
                  {lang === 'ar' ? 'عندما يكون زمن استجابة خوادم Express أقل من 150ms فإن تجربة المستخدم تكون فورية.' : 'Express API latency below 150ms provides seamless response.'}
                </p>
              </div>

              <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/60 space-y-1">
                <div className="text-emerald-400 font-black">2. معدل نجاح العمليات &gt; 99.5%</div>
                <p className="text-[11px] text-slate-400">
                  {lang === 'ar' ? 'يعني أن جميع عمليات الشراء والدفع والتسليم تتم بدون خطأ أو احتجاز أموال.' : 'High success rate means zero order drops or locked funds.'}
                </p>
              </div>

              <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/60 space-y-1">
                <div className="text-emerald-400 font-black">3. استقرار الموردين & المخزون</div>
                <p className="text-[11px] text-slate-400">
                  {lang === 'ar' ? 'جميع دوائر الحماية (Circuit Breakers) بحالة CLOSED ومخزون الأكواد يكفي 24 ساعة.' : 'Circuit breakers CLOSED and stock covers 24h demand.'}
                </p>
              </div>
            </div>
          </div>

          {/* Test Results Output (if executed) */}
          {testResults && testResults.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-3">
              <h4 className="text-xs font-black text-cyan-400 uppercase tracking-wider">{lang === 'ar' ? 'نتائج اختبارات الجودة المفتوحة:' : 'Automated Test Results:'}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                {testResults.map((t, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700 flex justify-between">
                    <span className="text-slate-300">{t.name}</span>
                    <span className={t.status === 'PASSED' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {t.status === 'PASSED' ? '✓ PASSED' : '✕ FAILED'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: VENDORS MARKETPLACE */}
      {activeAdminTab === 'vendors' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Building className="w-6 h-6 text-purple-500" />
                {lang === 'ar' ? 'سوق الموردين وإدارة الشركاء الخارجيين' : 'Vendor Marketplace & Partner Management'}
              </h2>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
                {lang === 'ar' ? 'اعتماد الموردين، تحديد نسب العمولات، ومتابعة الأرصدة المالية لمزودي الخدمات' : 'Manage vendor credentials, commission rates, and payouts.'}
              </p>
            </div>
            <button
              onClick={() => addToast(lang === 'ar' ? 'تم فتح نموذج إضافة مورد خارجي جديد' : 'Opened vendor creation form')}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-black rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'ar' ? 'إضافة مورد شريك جديد' : 'Add New Vendor'}</span>
            </button>
          </div>

          {/* Vendors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'FastPay Digital Ltd', commission: '4.5%', balance: '$12,450.00', status: 'APPROVED', catalogCount: 18, driver: 'FastPay API' },
              { name: 'UniPin Global Gaming', commission: '5.0%', balance: '$8,120.00', status: 'APPROVED', catalogCount: 12, driver: 'UniPin REST' },
              { name: 'Reloadly Enterprise Cards', commission: '3.5%', balance: '$24,890.00', status: 'APPROVED', catalogCount: 25, driver: 'Reloadly OAuth' },
              { name: 'GlobalCodes Wholesale', commission: '6.0%', balance: '$1,400.00', status: 'SUSPENDED', catalogCount: 5, driver: 'GlobalCodes SOAP' }
            ].map((v, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-black">
                    <Building className="w-5 h-5" />
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${v.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                    }`}>
                    {v.status}
                  </span>
                </div>

                <div>
                  <h4 className="font-black text-sm text-slate-900 dark:text-white">{v.name}</h4>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">{v.driver}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span>{lang === 'ar' ? 'نسبة المنصة:' : 'Commission Rate:'}</span>
                    <span className="font-mono text-purple-500">{v.commission}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{lang === 'ar' ? 'الرصيد المستحق:' : 'Owed Balance:'}</span>
                    <span className="font-mono text-slate-900 dark:text-white">{v.balance}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{lang === 'ar' ? 'مساهمة الكتالوج:' : 'Catalog Items:'}</span>
                    <span className="font-mono text-blue-500">{v.catalogCount} {lang === 'ar' ? 'منتج' : 'items'}</span>
                  </div>
                </div>

                <button
                  onClick={() => addToast(lang === 'ar' ? `تم تبديل حالة الاعتماد للمورد ${v.name}` : `Toggled vendor ${v.name}`)}
                  className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-black rounded-xl transition"
                >
                  {lang === 'ar' ? 'إدارة وحسابات المورد' : 'Manage Vendor'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: ANTI-FRAUD & RBAC MATRIX */}
      {activeAdminTab === 'fraud-security' && (
        <div className="space-y-8 animate-fade-in">
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-6 h-6 text-rose-500" />
                {lang === 'ar' ? 'مكافحة الاحتيال وقواعد الأمان ومصفوفة الصلاحيات (RBAC)' : 'Anti-Fraud Engine & RBAC Security Matrix'}
              </h2>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
                {lang === 'ar' ? 'قواعد كشف السلوكيات المشبوهة، حظر الـ IP، وتحديد صلاحيات الأدوار' : 'Configure fraud velocity limits, high-risk holds, and access control.'}
              </p>
            </div>
          </div>

          {/* Active Anti-Fraud Rules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                {lang === 'ar' ? 'قواعد الفحص التلقائي للاحتيال (Active Fraud Rules)' : 'Active Anti-Fraud Rules'}
              </h3>

              <div className="space-y-3 text-xs font-bold">
                {[
                  { title: lang === 'ar' ? 'احتجاز الطلبات عالية القيمة (> $200)' : 'High-Value Order Hold (> $200)', status: 'ACTIVE', desc: 'يتم احتجاز الطلب ومراجعته فورياً قبل الإرسال' },
                  { title: lang === 'ar' ? 'حد التكرار للـ IP (Velocity Check)' : 'IP Velocity Check (Max 5 / 10min)', status: 'ACTIVE', desc: 'حظر تلقائي لأي عنوان يتجاوز 5 محاولات شحن في 10 دقائق' },
                  { title: lang === 'ar' ? 'حظر البروكسي والـ VPN المشبوه' : 'Proxy & High-Risk ASN Geofence', status: 'ACTIVE', desc: 'رفض المعاملات القادمة من شبكات افتراضية غير موثوقة' },
                  { title: lang === 'ar' ? 'مطابقة بصمة الجهاز Device Fingerprint' : 'Device Fingerprint Hash Verification', status: 'ACTIVE', desc: 'التحقق من عدم تكرار الحسابات الفرعية لنفس الجهاز' }
                ].map((r, i) => (
                  <div key={i} className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="font-black text-slate-900 dark:text-white">{r.title}</div>
                      <div className="text-[11px] text-slate-400 font-normal mt-0.5">{r.desc}</div>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-black rounded-full shrink-0">
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* RBAC Roles Matrix Table */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Users className="w-5 h-5 text-blue-500" />
                {lang === 'ar' ? 'مصفوفة صلاحيات الأدوار (RBAC Matrix)' : 'Role-Based Access Matrix'}
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-right rtl:text-right text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-black">
                      <th className="pb-2 px-2">{lang === 'ar' ? 'الدور (Role)' : 'Role'}</th>
                      <th className="pb-2 px-2">{lang === 'ar' ? 'إدارة المنتجات' : 'Catalog'}</th>
                      <th className="pb-2 px-2">{lang === 'ar' ? 'التقارير المالية' : 'Financials'}</th>
                      <th className="pb-2 px-2">{lang === 'ar' ? 'إعدادات المنصة' : 'Settings'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold text-slate-700 dark:text-slate-200">
                    <tr>
                      <td className="py-2.5 px-2 font-black text-slate-900 dark:text-white">ADMIN</td>
                      <td className="py-2.5 px-2 text-emerald-500">✓ كاملة</td>
                      <td className="py-2.5 px-2 text-emerald-500">✓ كاملة</td>
                      <td className="py-2.5 px-2 text-emerald-500">✓ كاملة</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-2 font-black text-slate-900 dark:text-white">VENDOR</td>
                      <td className="py-2.5 px-2 text-blue-500">✓ منتجاته فقط</td>
                      <td className="py-2.5 px-2 text-blue-500">✓ أرباحه فقط</td>
                      <td className="py-2.5 px-2 text-slate-400">✕ غير مصرح</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-2 font-black text-slate-900 dark:text-white">SUPPORT</td>
                      <td className="py-2.5 px-2 text-amber-500">👁 قراءة فقط</td>
                      <td className="py-2.5 px-2 text-slate-400">✕ غير مصرح</td>
                      <td className="py-2.5 px-2 text-slate-400">✕ غير مصرح</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 8: ACCOUNTING & RECONCILIATION */}
      {activeAdminTab === 'accounting-recon' && (
        <div className="space-y-8 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-emerald-500" />
                {lang === 'ar' ? 'المحاسبة ودفتر الأستاذ العام القيد المزدوج (General Ledger)' : 'General Ledger & Payment Reconciliation'}
              </h2>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
                {lang === 'ar' ? 'مطابقة القيد المزدوج (Chart of Accounts & Journal Entries)، ومطابقة تسويات الموردين والعملات' : 'Automated double-entry journal entries reconciliation against bank & provider ledgers.'}
              </p>
            </div>

            <button
              onClick={() => addToast(lang === 'ar' ? 'تم تشغيل محرك المطابقة المحاسبية الآلي: جميع القيود متطابقة بنسبة 100%' : 'Reconciliation Engine executed: 100% matched')}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-black shadow-lg transition flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{lang === 'ar' ? 'تشغيل محرك المطابقة الفورية' : 'Run Reconciliation Engine'}</span>
            </button>
          </div>

          {/* Double-Entry General Ledger Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-400 block">{lang === 'ar' ? 'الأصول (Assets)' : 'Assets'}</span>
              <div className="text-2xl font-black text-emerald-500 font-mono">${(142500 + totalGrossRevenue).toFixed(2)}</div>
              <span className="text-[10px] text-slate-400 font-bold">{lang === 'ar' ? 'المحافظ والبنوك المتاحة' : 'Bank & Wallet Cash'}</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-400 block">{lang === 'ar' ? 'الالتزامات (Liabilities)' : 'Liabilities'}</span>
              <div className="text-2xl font-black text-rose-500 font-mono">$18,200.00</div>
              <span className="text-[10px] text-slate-400 font-bold">{lang === 'ar' ? 'أرصدة المستخدمين والموردين' : 'User & Vendor Credits'}</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-400 block">{lang === 'ar' ? 'الإيرادات المستقرة' : 'Settled Revenues'}</span>
              <div className="text-2xl font-black text-blue-500 font-mono">${totalGrossRevenue.toFixed(2)}</div>
              <span className="text-[10px] text-emerald-500 font-bold">✓ 100% {lang === 'ar' ? 'مطابقة بالكامل' : 'Reconciled'}</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-400 block">{lang === 'ar' ? 'المصروفات وتكلفة الموردين' : 'Expenses & Cost'}</span>
              <div className="text-2xl font-black text-purple-500 font-mono">${(totalProviderCosts + totalGatewayFees).toFixed(2)}</div>
              <span className="text-[10px] text-slate-400 font-bold">{lang === 'ar' ? 'تكاليف التمرير والرسوم' : 'Pass-through API & Gateway Costs'}</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8.5: INVENTORY BATCH MANAGEMENT */}
      {activeAdminTab === 'inventory-management' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <HardDrive className="w-6 h-6 text-purple-500" />
                {lang === 'ar' ? 'إدارة مخزون الأكواد الرقمية والدفعات (Inventory Batch Stock)' : 'Digital Codes & License Inventory (Batch Stock)'}
              </h2>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
                {lang === 'ar' ? 'تتبع الأكواد والتراخيص بحالاتها الأربع: المتاح (Available)، المحجوز (Reserved)، المباع (Sold)، المنتهي (Expired).' : 'Track voucher codes, batch numbers, suppliers, and expiration dates.'}
              </p>
            </div>

            <button
              onClick={() => addToast(lang === 'ar' ? 'تم فتح نموذج توريد وإضافة دفعة أكواد رقمية جديدة' : 'Opened batch stock import modal')}
              className="px-5 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-xs font-black shadow-md transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'ar' ? 'تجهيز وتوريد دفعة أكواد' : '+ Import Batch Stock'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-400 block">{lang === 'ar' ? 'المتاح للشراء (Available)' : 'Available Stock'}</span>
              <span className="text-2xl font-black text-emerald-500 font-mono">523 {lang === 'ar' ? 'كود' : 'codes'}</span>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-400 block">{lang === 'ar' ? 'المحجوز معالجة (Reserved)' : 'Reserved TCC'}</span>
              <span className="text-2xl font-black text-amber-500 font-mono">10 {lang === 'ar' ? 'أكواد' : 'codes'}</span>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-400 block">{lang === 'ar' ? 'إجمالي المباع (Sold)' : 'Total Sold'}</span>
              <span className="text-2xl font-black text-blue-500 font-mono">2,100 {lang === 'ar' ? 'كود' : 'codes'}</span>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-400 block">{lang === 'ar' ? 'المنتهي الصلاحية (Expired)' : 'Expired Stock'}</span>
              <span className="text-2xl font-black text-slate-400 font-mono">0 {lang === 'ar' ? 'كود' : 'codes'}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              {lang === 'ar' ? 'جدول المخزون والموردين والدفعات الحية' : 'Live Inventory Stock & Batch Ledger'}
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-right rtl:text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-black">
                    <th className="pb-3 px-2">{lang === 'ar' ? 'رقم الدفعة' : 'Batch No'}</th>
                    <th className="pb-3 px-2">{lang === 'ar' ? 'المنتج / الباقة' : 'Product / Package'}</th>
                    <th className="pb-3 px-2">{lang === 'ar' ? 'المورد Supplier' : 'Supplier'}</th>
                    <th className="pb-3 px-2">{lang === 'ar' ? 'محتوى الكود' : 'Payload Code'}</th>
                    <th className="pb-3 px-2">{lang === 'ar' ? 'الحالة Status' : 'Status'}</th>
                    <th className="pb-3 px-2">{lang === 'ar' ? 'سعر التكلفة' : 'Cost Price'}</th>
                    <th className="pb-3 px-2">{lang === 'ar' ? 'تاريخ الانتهاء' : 'Expires At'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold text-slate-700 dark:text-slate-200">
                  {[
                    { batch: 'BATCH-2026-08A', item: 'شدات ببجي 600 UC', supplier: 'RELOADLY', code: 'PUBG-UC-8841-****-9920', status: 'AVAILABLE', cost: '$8.50', exp: '2027-12-31' },
                    { batch: 'BATCH-2026-08A', item: 'شدات ببجي 600 UC', supplier: 'RELOADLY', code: 'PUBG-UC-1102-****-3319', status: 'RESERVED', cost: '$8.50', exp: '2027-12-31' },
                    { batch: 'BATCH-2026-07F', item: 'بطاقة ستيم $50', supplier: 'UNIPIN', code: 'STEAM-GIFT-50USD-****', status: 'SOLD', cost: '$47.50', exp: '2028-06-30' },
                    { batch: 'BATCH-2026-06K', item: 'ChatGPT Plus 1-mo', supplier: 'SMILE_ONE', code: 'CGPT-PLUS-KEY-****-4410', status: 'AVAILABLE', cost: '$16.00', exp: '2026-11-15' }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <td className="py-3 px-2 font-mono text-blue-500">{row.batch}</td>
                      <td className="py-3 px-2 font-black text-slate-900 dark:text-white">{row.item}</td>
                      <td className="py-3 px-2 font-mono text-purple-400">{row.supplier}</td>
                      <td className="py-3 px-2 font-mono text-slate-500">{row.code}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${row.status === 'AVAILABLE' ? 'bg-emerald-500/10 text-emerald-500' :
                            row.status === 'RESERVED' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'
                          }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-mono text-slate-900 dark:text-white">{row.cost}</td>
                      <td className="py-3 px-2 font-mono text-slate-400">{row.exp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 9: PARTITIONED LOGS WITH 4-TIER SEPARATION & AUDIT DIFFS */}
      {activeAdminTab === 'logs' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Terminal className="w-6 h-6 text-cyan-400" />
                {lang === 'ar' ? 'مستعرض السجلات الرصدية بأقسامها الأربعة (4-Tier Log Separation)' : '4-Tier Partitioned System Logs & Audit Diffs'}
              </h2>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
                {lang === 'ar' ? 'فصل السجلات في 4 تبويبات مستقلة (Audit Log, System Log, Order Log, Security Log) مع مقارنة القيم القديمة والجديدة Diffs.' : 'Filter structured JSON logs by category with Old Value -> New Value Diff viewer.'}
              </p>
            </div>

            {/* Correlation ID Search Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={correlationSearch}
                onChange={e => setCorrelationSearch(e.target.value)}
                placeholder="Search Correlation ID (CID-XXXX)"
                className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* 4 Category Filter Sub-Tabs */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 font-mono text-xs text-slate-300">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
              {[
                { id: 'ALL', label: 'All Logs' },
                { id: 'AUDIT', label: '🛡️ Audit Log (Diffs)' },
                { id: 'SYSTEM', label: '💻 System Log (Errors)' },
                { id: 'ORDER', label: '📦 Order Log (FSM)' },
                { id: 'SECURITY', label: '🔒 Security Log (RBAC)' }
              ].map(c => (
                <button
                  key={c.id}
                  onClick={() => setLogChannelFilter(c.id)}
                  className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition whitespace-nowrap ${logChannelFilter === c.id ? 'bg-cyan-500 text-slate-950 font-black' : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
              {(systemLogs || [])
                .filter(log => logChannelFilter === 'ALL' || log.category === logChannelFilter)
                .filter(log => !correlationSearch || (log.correlationId || '').toLowerCase().includes(correlationSearch.toLowerCase()))
                .map((log) => (
                  <div key={log.id} className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-cyan-500/40 transition space-y-2">
                    <div className="flex flex-col sm:flex-row justify-between gap-2 items-start sm:items-center">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-slate-500 text-[10px] font-mono">{log.timestamp?.substring(11, 19) || 'Just now'}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black ${log.level === 'ERROR' ? 'bg-rose-500/20 text-rose-400' :
                            log.level === 'WARN' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                          }`}>
                          {log.level}
                        </span>
                        <span className="text-purple-400 font-bold text-[10px] font-mono">{log.category}</span>
                        <span className="text-slate-300 font-bold">{log.action}</span>
                        <span className="text-slate-400 text-[11px]">by {log.actor}</span>
                      </div>
                      <span className="text-cyan-400 text-[10px] font-mono shrink-0">{log.correlationId}</span>
                    </div>

                    {/* Audit Log Diff Display if available */}
                    {log.details && log.details.old_value && (
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] grid grid-cols-2 gap-4 font-mono">
                        <div className="text-rose-400">
                          <span className="text-[10px] text-slate-500 block font-sans">Old Value:</span>
                          <pre className="whitespace-pre-wrap">{JSON.stringify(log.details.old_value, null, 2)}</pre>
                        </div>
                        <div className="text-emerald-400">
                          <span className="text-[10px] text-slate-500 block font-sans">New Value:</span>
                          <pre className="whitespace-pre-wrap">{JSON.stringify(log.details.new_value, null, 2)}</pre>
                        </div>
                      </div>
                    )}

                    {log.details && !log.details.old_value && (
                      <div className="text-slate-400 text-[11px] font-mono bg-slate-950/60 p-2 rounded-xl border border-slate-800/60">
                        {JSON.stringify(log.details)}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 10: PLATFORM CONFIG & 9-CATEGORY FEATURE FLAGS */}
      {activeAdminTab === 'config' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <SlidersHorizontal className="w-6 h-6 text-blue-500" />
                {lang === 'ar' ? 'إعدادات وقواعد وتغييرات الخصائص في 9 فئات' : '9-Category Platform Settings & Feature Toggles'}
              </h2>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
                {lang === 'ar' ? 'تعديل وتفعيل الميزات الحية بالـ localStorage والـ ConfigService دون الحاجة لإعادة التشغيل.' : 'Live interactive feature flag toggles saved to state & backend config.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Live Feature Flags Toggles */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Zap className="w-5 h-5 text-amber-500" />
                {lang === 'ar' ? 'مفاتيح التفعيل الحية (Feature Toggles)' : 'Live Feature Flags'}
              </h3>

              <div className="space-y-3 text-xs font-bold">
                {[
                  { key: 'GUEST_CHECKOUT', label: lang === 'ar' ? 'السماح بالشراء للزائر بدون حساب (Guest Checkout)' : 'Enable Guest Checkout' },
                  { key: 'AUTO_FULFILLMENT', label: lang === 'ar' ? 'محرك التوفير والتسليم التلقائي (Auto Fulfillment)' : 'Instant Automatic Fulfillment' },
                  { key: 'RELOADLY_FALLBACK', label: lang === 'ar' ? 'التوجيه التلقائي للمورد الاحتياطي (Provider Failover)' : 'Smart Provider Failover' },
                  { key: 'MAINTENANCE_MODE', label: lang === 'ar' ? 'وضع الصيانة الطارئة (Emergency Maintenance)' : 'Emergency Maintenance Mode' },
                  { key: 'ADMIN_2FA_ENFORCE', label: lang === 'ar' ? 'فرض التحقق بخطوتين للمدراء (Admin 2FA)' : 'Enforce Admin 2FA' }
                ].map((flag) => {
                  const isActive = featureFlags[flag.key] !== false;
                  return (
                    <div key={flag.key} className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                      <span className="text-slate-900 dark:text-white">{flag.label}</span>
                      <button
                        onClick={() => {
                          toggleFeatureFlag(flag.key);
                          logSystemEvent({
                            category: 'AUDIT',
                            level: 'WARN',
                            actor: 'usr-admin-ammar',
                            action: 'FEATURE_FLAG_TOGGLED',
                            details: { old_value: { [flag.key]: isActive }, new_value: { [flag.key]: !isActive } }
                          });
                          addToast(lang === 'ar' ? `تم تغيير حالة الخصائص: ${flag.key} إلى ${!isActive}` : `Toggled feature flag: ${flag.key}`);
                        }}
                        className={`p-1 rounded-xl transition ${isActive ? 'text-emerald-500' : 'text-slate-400'
                          }`}
                      >
                        {isActive ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Operating Parameters */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <SlidersHorizontal className="w-5 h-5 text-blue-500" />
                {lang === 'ar' ? 'فئات الإعدادات التسعة (9 Categories)' : '9 Operating Categories'}
              </h3>

              <div className="space-y-3 text-xs font-bold text-slate-700 dark:text-slate-300">
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
                  <span>1. General: {lang === 'ar' ? 'العملة والحد الأدنى' : 'General & Currency'}</span>
                  <span className="font-mono font-black text-slate-900 dark:text-white">$5.00 USD Min</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
                  <span>2. Payment Gateways: {lang === 'ar' ? 'البوابات المقبولة' : 'Gateways'}</span>
                  <span className="font-mono font-black text-emerald-500">PayPal / Visa / Wallet</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
                  <span>3. Providers: {lang === 'ar' ? 'استراتيجية التوجيه' : 'Routing'}</span>
                  <span className="font-mono font-black text-purple-400">Weighted (70/20/10)</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
                  <span>4. Orders: {lang === 'ar' ? 'نافذة الاسترجاع' : 'Refund Window'}</span>
                  <span className="font-mono font-black text-blue-500">24 Hours</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 11: OPERATIONAL RUNBOOK */}
      {activeAdminTab === 'runbook' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-6 h-6 text-rose-500" />
                {lang === 'ar' ? 'دليل إدارة الطوارئ والأزمات التشغيلية (Operational Runbook)' : 'Operational Disaster Recovery Runbook'}
              </h2>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
                {lang === 'ar' ? '7 إجراءات تشغيلية مجربة للتعامل السريع مع الأعطال وانقطاع الخدمات بحل فوري' : '7 real operational incident playbooks with 1-click mitigation actions.'}
              </p>
            </div>
          </div>

          {/* 7 Operational Playbooks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                id: 'RUN-01',
                title: lang === 'ar' ? '1. انقطاع المورد وإعاقة الربط (Provider Outage)' : '1. Provider Outage / API Disruption',
                trigger: lang === 'ar' ? 'فشل 3 طلبات متتالية من API المورد الرئيسي' : '3 consecutive API connection failures',
                mitigation: lang === 'ar' ? 'تبديل التوجيه التلقائي للمورد الاحتياطي (FastPay / UniPin)' : 'Auto-switch routing to backup driver',
                severity: 'CRITICAL'
              },
              {
                id: 'RUN-02',
                title: lang === 'ar' ? '2. تعثر بوابة الدفع (Payment Gateway Timeout)' : '2. Payment Gateway Timeout',
                trigger: lang === 'ar' ? 'عدم وصول إشعار Webhook من PayPal/Visa خلال 60 ثانية' : 'Webhook timeout > 60 seconds',
                mitigation: lang === 'ar' ? 'إجراء الاستعلام الاحتياطي المباشر وحتجاز الطلب حتى التأكيد' : 'Query gateway directly and log pending hold',
                severity: 'HIGH'
              },
              {
                id: 'RUN-03',
                title: lang === 'ar' ? '3. نفاد كود التفعيل والمخزون (Stock Depletion)' : '3. Code Stock Depletion',
                trigger: lang === 'ar' ? 'انخفاض مخزون الأكواد المحفوظة لأقل من 5 قطع' : 'Pre-reserved code count < 5 units',
                mitigation: lang === 'ar' ? 'إرسال تنبيه طوارئ للمورد وإجراء طلب توريد آلي' : 'Trigger automated wholesale replenishment API',
                severity: 'MEDIUM'
              },
              {
                id: 'RUN-04',
                title: lang === 'ar' ? '4. ارتفاع استهلاك السيرفر (High Server CPU Load)' : '4. Server Resource Exhaustion',
                trigger: lang === 'ar' ? 'تجاوز استهلاك المعالج 90% واستجابة > 300ms' : 'CPU usage > 90% and latency > 300ms',
                mitigation: lang === 'ar' ? 'تفعيل التخزين المؤقت وتصفية السجلات الزائدة' : 'Enable aggressive CDN caching & drop debug logs',
                severity: 'HIGH'
              },
              {
                id: 'RUN-05',
                title: lang === 'ar' ? '5. محاولات احتيال مكثفة (Rapid Fraud Spike)' : '5. Rapid Fraud Spike',
                trigger: lang === 'ar' ? 'أكثر من 10 طلبات مرفوضة من نفس عنوان الشبكة' : '> 10 failed payments from same IP',
                mitigation: lang === 'ar' ? 'حظر الـ IP تلقائياً وتجميد الشحن لحين مراجعة المسؤول' : 'Auto-block IP & flag user for manual admin review',
                severity: 'CRITICAL'
              },
              {
                id: 'RUN-06',
                title: lang === 'ar' ? '6. تراكم الرسائل المعلقة (DLQ Stagnation)' : '6. Dead Letter Queue Stagnation',
                trigger: lang === 'ar' ? 'تجاوز عدد الطلبات الفاشلة بالـ DLQ أكثر من 10' : 'DLQ item count exceeds 10 items',
                mitigation: lang === 'ar' ? 'إعادة تشغيل معالج الرسائل العالقة آلياً (DLQ Retry Engine)' : 'Execute DLQ message replay engine',
                severity: 'MEDIUM'
              },
              {
                id: 'RUN-07',
                title: lang === 'ar' ? '7. تفعيل وضع الصيانة الطارئة (Emergency Maintenance)' : '7. Emergency Maintenance Mode',
                trigger: lang === 'ar' ? 'عطل شامل أو تعديل هيكلي حرج بقواعد البيانات' : 'Critical database DDL patch or total outage',
                mitigation: lang === 'ar' ? 'إيقاف استقبال طلبات جديدة وإظهار صفحة الصيانة الجذابة' : 'Lock incoming order endpoints and display maintenance page',
                severity: 'CRITICAL'
              }
            ].map((p) => (
              <div key={p.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <h4 className="font-black text-sm text-slate-900 dark:text-white">{p.title}</h4>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black ${p.severity === 'CRITICAL' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    }`}>
                    {p.severity}
                  </span>
                </div>

                <div className="space-y-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <span className="text-slate-400 block text-[10px] mb-0.5">{lang === 'ar' ? 'شرط التفعيل (Trigger):' : 'Trigger Condition:'}</span>
                    <span>{p.trigger}</span>
                  </div>

                  <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-cyan-400 rounded-xl border border-blue-500/20">
                    <span className="text-blue-400 block text-[10px] mb-0.5">{lang === 'ar' ? 'إجراء الحل الفوري (Mitigation):' : 'Mitigation Action:'}</span>
                    <span>{p.mitigation}</span>
                  </div>
                </div>

                <button
                  onClick={() => addToast(lang === 'ar' ? `تم تنفيذ إجراء الحل الفوري لدليل الطوارئ [${p.id}] بنجاح!` : `Executed mitigation for ${p.id}!`)}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>{lang === 'ar' ? 'تنفيذ إجراء الحل الفوري (Run Mitigation)' : 'Run Mitigation Action'}</span>
                </button>
              </div>
            ))}
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

              <div>
                <ImageUploadInput
                  label={lang === 'ar' ? 'صورة الخدمة / المنتج (رابط مباشر أو رفع من الجهاز لـ Cloudinary)' : 'Product Image (URL or Cloudinary Upload)'}
                  value={prodForm.image}
                  onChange={url => setProdForm({ ...prodForm, image: url })}
                  placeholder="أدخل رابط الصورة أو اضغط زر رفع صورة من الجهاز..."
                />
              </div>

              {/* Category Select Input */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">{lang === 'ar' ? 'تصنيف الخدمة' : 'Category'}</label>
                <select
                  value={prodForm.categoryId}
                  onChange={e => setProdForm({ ...prodForm, categoryId: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-black"
                >
                  <option value="cat-games">{lang === 'ar' ? '🎮 الألعاب (Games)' : '🎮 Games'}</option>
                  <option value="cat-gaming-cards">{lang === 'ar' ? '💳 بطاقات الألعاب (Gaming Gift Cards)' : '💳 Gaming Gift Cards'}</option>
                  <option value="cat-subs">{lang === 'ar' ? '📺 الاشتراكات الرقمية (Subscriptions)' : '📺 Digital Subscriptions'}</option>
                  <option value="cat-ai">{lang === 'ar' ? '🤖 خدمات الذكاء الاصطناعي (AI Services)' : '🤖 AI Services'}</option>
                  <option value="cat-software">{lang === 'ar' ? '🖥️ البرامج والتراخيص (Software & Licenses)' : '🖥️ Software & Licenses'}</option>
                  <option value="cat-keys">{lang === 'ar' ? '🔑 مفاتيح التفعيل (Activation Keys)' : '🔑 Activation Keys'}</option>
                  <option value="cat-vpn">{lang === 'ar' ? '🛡️ الحماية وVPN (Security & VPN)' : '🛡️ Security & VPN'}</option>
                  <option value="cat-gift">{lang === 'ar' ? '🎁 بطاقات الهدايا (Gift Cards)' : '🎁 Gift Cards'}</option>
                  <option value="cat-wallets">{lang === 'ar' ? '💰 المحافظ والعملات الرقمية (Digital Wallets)' : '💰 Digital Wallets'}</option>
                  <option value="cat-apps">{lang === 'ar' ? '📱 التطبيقات والمتاجر (Apps & Stores)' : '📱 Apps & Stores'}</option>
                  <option value="cat-other">{lang === 'ar' ? '🌐 خدمات أخرى (Other Services)' : '🌐 Other Services'}</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">{lang === 'ar' ? 'نوع الخدمة / التسليم' : 'Product & Delivery Type'}</label>
                  <select
                    value={prodForm.productType}
                    onChange={e => setProdForm({ ...prodForm, productType: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-black"
                  >
                    <option value="TOP_UP">{lang === 'ar' ? 'شحن مباشر إلى الحساب (UID / Game ID)' : 'Direct Account Top-up (UID)'}</option>
                    <option value="GIFT_CARD">{lang === 'ar' ? 'بطاقة تحتوي على كود (Gift Card Code)' : 'Gift Card Code'}</option>
                    <option value="ACTIVATION_KEY">{lang === 'ar' ? 'مفتاح تفعيل برنامج (Activation Key)' : 'Software Activation Key'}</option>
                    <option value="SUBSCRIPTION">{lang === 'ar' ? 'اشتراك لمدة شهر أو سنة (Subscription)' : 'Digital Subscription'}</option>
                    <option value="ACCOUNT_UPGRADE">{lang === 'ar' ? 'ترقية حساب مباشرة (Account Upgrade)' : 'Account Upgrade'}</option>
                    <option value="DIGITAL_CODE">{lang === 'ar' ? 'كود رقمي عام (General Digital Code)' : 'General Digital Code'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">{lang === 'ar' ? 'المصنع / الشركة' : 'Publisher'}</label>
                  <input
                    type="text"
                    value={prodForm.publisher}
                    onChange={e => setProdForm({ ...prodForm, publisher: e.target.value })}
                    placeholder="Tencent / Garena / OpenAI / Microsoft"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">{lang === 'ar' ? 'وسام الخدمة (Badge)' : 'Badge'}</label>
                <input
                  type="text"
                  value={prodForm.badge}
                  onChange={e => setProdForm({ ...prodForm, badge: e.target.value })}
                  placeholder="INSTANT / HOT DEAL / 4K ULTRA HD / GLOBAL"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">{lang === 'ar' ? 'وصف الخدمة (بالعربية)' : 'Description (Arabic)'}</label>
                  <textarea
                    rows={2}
                    value={prodForm.descAr}
                    onChange={e => setProdForm({ ...prodForm, descAr: e.target.value })}
                    placeholder="تفاصيل الخدمة..."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-black"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">{lang === 'ar' ? 'وصف الخدمة (بالإنجليزية)' : 'Description (English)'}</label>
                  <textarea
                    rows={2}
                    value={prodForm.descEn}
                    onChange={e => setProdForm({ ...prodForm, descEn: e.target.value })}
                    placeholder="Service details..."
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

      {/* MODAL: ORDER FULFILLMENT CODE EMAIL DISPATCHER */}
      {showOrderEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-5 text-right rtl:text-right">

            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {lang === 'ar' ? 'إرسال كود المنتج عبر البريد الإلكتروني للمشتري' : 'Dispatch Product Code Email'}
                  </h3>
                  <span className="text-xs font-mono text-blue-600 dark:text-cyan-400 font-bold">
                    الطلب #{selectedOrderForDispatch?.id} | {selectedOrderForDispatch?.productTitle}
                  </span>
                </div>
              </div>
              <button onClick={() => setShowOrderEmailModal(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSendOrderEmailSubmit} className="space-y-4 text-xs font-extrabold">

              {/* Multi-Item / Multi-Account Tabs Bar */}
              {dispatchItemsList.length > 1 && (
                <div className="bg-slate-100 dark:bg-slate-800/80 p-2.5 rounded-2xl space-y-2 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between text-xs font-black text-slate-700 dark:text-slate-200">
                    <span>📦 هذا الطلب يحتوي على عدد ({dispatchItemsList.length}) حسابات/منتجات مستقلة:</span>
                    <span className="text-blue-600 dark:text-cyan-400">
                      محدد حالياً: ({activeDispatchItemIdx + 1} / {dispatchItemsList.length})
                    </span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                    {dispatchItemsList.map((item, idx) => {
                      const isActive = idx === activeDispatchItemIdx;
                      const isDelivered = item.status === 'DELIVERED';
                      return (
                        <button
                          key={item.id || idx}
                          type="button"
                          onClick={() => handleSwitchDispatchItem(idx)}
                          className={`px-3 py-2 rounded-xl text-xs font-black transition shrink-0 flex items-center gap-1.5 cursor-pointer border ${
                            isActive
                              ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-400/30'
                              : isDelivered
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                          }`}
                        >
                          <span>{isDelivered ? '🟢' : '⏳'}</span>
                          <span>{item.title}</span>
                          <span className="opacity-75 font-mono text-[10px]">({item.targetAccount || 'N/A'})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">عنوان البريد الإلكتروني للمستلم *</label>
                <input
                  type="email"
                  required
                  value={orderEmailForm.recipientEmail}
                  onChange={e => setOrderEmailForm({ ...orderEmailForm, recipientEmail: e.target.value })}
                  placeholder="customer@domain.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-xs font-black text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">عنوان الرسالة (Subject) *</label>
                <input
                  type="text"
                  required
                  value={orderEmailForm.emailSubject}
                  onChange={e => setOrderEmailForm({ ...orderEmailForm, emailSubject: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-xs"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">الكود الرقمي / رمز البطاقة *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={orderEmailForm.fulfillmentCode}
                      onChange={e => setOrderEmailForm({ ...orderEmailForm, fulfillmentCode: e.target.value })}
                      placeholder="e.g. ABCD-1234-EFGH-5678"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-xs font-black text-emerald-600 dark:text-emerald-400"
                    />
                    <button
                      type="button"
                      onClick={() => setOrderEmailForm({ ...orderEmailForm, fulfillmentCode: 'NEXUS-' + Math.floor(10000000 + Math.random() * 90000000) })}
                      className="px-2.5 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-900 dark:text-white text-[11px] font-black rounded-xl shrink-0"
                      title="توليد كود تلقائي"
                    >
                      🎲 جديد
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">الرقم التسلسلي (S/N Serial Number)</label>
                  <input
                    type="text"
                    value={orderEmailForm.serialNumber}
                    onChange={e => setOrderEmailForm({ ...orderEmailForm, serialNumber: e.target.value })}
                    placeholder="e.g. SN-90218491"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-xs font-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">نشرة وقالب الرسالة الجاهزة (قابل للتعديل المباشر قبل الإرسال) *</label>
                <textarea
                  rows={6}
                  required
                  value={orderEmailForm.emailBody}
                  onChange={e => setOrderEmailForm({ ...orderEmailForm, emailBody: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-xs font-bold text-slate-900 dark:text-white leading-relaxed"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Mail className="w-4 h-4" />
                  <span>إرسال البريد الإلكتروني واعتماد الطلب</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowOrderEmailModal(false)}
                  className="px-5 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CUSTOMER COMPLAINT REVIEW & REPLY */}
      {showComplaintModal && selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 text-right rtl:text-right">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    معاينة والرد على شكوى العميل #{selectedComplaint.id}
                  </h3>
                  <span className="text-xs font-mono text-slate-400 font-bold">
                    {selectedComplaint.name} ({selectedComplaint.email})
                  </span>
                </div>
              </div>
              <button onClick={() => setShowComplaintModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>

            <div className="space-y-4 text-xs font-bold">
              {/* Message Box */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                <div className="flex justify-between items-center text-[11px] text-slate-400 border-b border-slate-200 dark:border-slate-700/60 pb-2">
                  <span>موضوع الشكوى: <strong>{selectedComplaint.subject === 'TOPUP' ? 'مساعدة شحن محفظة' : selectedComplaint.subject === 'ORDER' ? 'مشكلة طلب / كود' : selectedComplaint.subject === 'BUSINESS' ? 'شراكة تجارية' : 'استفسار عام'}</strong></span>
                  <span className="font-mono">{selectedComplaint.createdAt ? new Date(selectedComplaint.createdAt).toLocaleString('ar-YE') : ''}</span>
                </div>
                <p className="text-slate-900 dark:text-white font-extrabold text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedComplaint.message}
                </p>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">تحديث حالة الشكوى *</label>
                <select
                  value={complaintResponseForm.status}
                  onChange={e => setComplaintResponseForm({ ...complaintResponseForm, status: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-black text-xs text-slate-900 dark:text-white"
                >
                  <option value="PENDING">معلقة ⏳</option>
                  <option value="IN_PROGRESS">قيد المعالجة والمتابعة 🔄</option>
                  <option value="RESOLVED">تمت المعالجة والحل بنجاح ✓</option>
                  <option value="REJECTED">مرفوضة ✕</option>
                </select>
              </div>

              {/* Admin Reply / Notes */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">ملاحظات الرد والحل (تُحفظ في النظام للعميل) *</label>
                <textarea
                  rows={4}
                  value={complaintResponseForm.notes}
                  onChange={e => setComplaintResponseForm({ ...complaintResponseForm, notes: e.target.value })}
                  placeholder="أدخل ردك أو الإجراء الذي تم اتخاذه مع العميل..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-900 dark:text-white leading-relaxed"
                />
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateComplaintStatus(selectedComplaint.id, complaintResponseForm.status, complaintResponseForm.notes);
                    addToast(lang === 'ar' ? `تم إرسال إشعار الرد بالبريد إلى: ${selectedComplaint.email}` : `Response email dispatched to ${selectedComplaint.email}`, 'success');
                  }}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>حفظ الرد وإرسال إشعار بالبريد الإلكتروني ({selectedComplaint.email})</span>
                </button>

                  {(() => {
                    const rawDigits = (selectedComplaint?.phone || selectedComplaint?.phone_number || '784746159').replace(/\D/g, '');
                    const fullWaNumber = rawDigits.startsWith('967') ? rawDigits : `967${rawDigits.replace(/^0+/, '')}`;
                    return (
                      <a
                        href={`https://wa.me/${fullWaNumber}?text=${encodeURIComponent(`أهلاً بك ${selectedComplaint?.name}، بخصوص استفسارك/شكواك رقم #${selectedComplaint?.id} في منصة NexusPay:\n${complaintResponseForm.notes || 'تمت المعالجة بنجاح'}`)}`}
                        target="_blank" rel="noreferrer"
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md transition text-center flex items-center justify-center gap-1.5"
                      >
                        💬 إرسال الرد عبر الواتساب المباشر ({fullWaNumber}+)
                      </a>
                    );
                  })()}
                  <button
                    type="button"
                    onClick={() => setShowComplaintModal(false)}
                    className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>

          </div>
        
      )}

      {/* MODAL: MULTI-ITEM ORDER ITEMS LIST */}
      {selectedOrderForItemsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 text-right rtl:text-right">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {lang === 'ar' ? `قائمة عناصر الطلب #${selectedOrderForItemsModal.id}` : `Items for Order #${selectedOrderForItemsModal.id}`}
                  </h3>
                  <span className="text-xs text-slate-400 font-bold">
                    {selectedOrderForItemsModal.items?.length || 1} {lang === 'ar' ? 'منتجات في هذا الطلب' : 'items in order'}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedOrderForItemsModal(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {(selectedOrderForItemsModal.items || []).map((item, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3">
                  <div>
                    <span className="font-black text-slate-900 dark:text-white text-xs block">{item.productTitle || item.title || item.productId}</span>
                    <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-bold block mt-0.5">📦 {item.packageTitle || item.name || 'باقة إلكترونية'}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">الكمية: {item.quantity || 1}</span>
                  </div>
                  <div className="text-left font-mono">
                    <span className="text-emerald-600 dark:text-emerald-400 font-black text-sm block">${((item.priceUSD || item.price || 9.99) * (item.quantity || 1)).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSelectedOrderForItemsModal(null)}
                className="w-full py-2.5 bg-slate-900 dark:bg-slate-800 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                {lang === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
