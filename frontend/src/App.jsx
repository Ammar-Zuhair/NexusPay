import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { ToastContainer } from './components/ToastContainer';
import { HomePage } from './pages/HomePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { BrowsePage } from './pages/BrowsePage';
import { CheckoutPage } from './pages/CheckoutPage';
import { UserDashboardPage } from './pages/UserDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { LegalAndContactPages } from './pages/LegalAndContactPages';

// Parse reset token from URL hash: /#reset-password?token=xxx
function getResetTokenFromHash() {
  const hash = window.location.hash || '';
  if (!hash.startsWith('#reset-password')) return null;
  const queryStr = hash.replace('#reset-password', '').replace(/^\?/, '');
  const params = new URLSearchParams(queryStr);
  return params.get('token') || null;
}

const MainContent = () => {
  const { activeTab, user, lang, setActiveTab } = useApp();
  const [resetToken, setResetToken] = useState(() => getResetTokenFromHash());

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [activeTab]);

  useEffect(() => {
    const handleHashChange = () => {
      setResetToken(getResetTokenFromHash());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Reset password page takes priority over everything else
  if (resetToken) {
    return (
      <main className="flex-1">
        <ResetPasswordPage token={resetToken} />
      </main>
    );
  }

  const isAdmin = user && user.role === 'ADMIN';

  return (
    <main className="mt-20 flex-1 min-h-[calc(100vh-5rem-16rem)]">
      {activeTab === 'home' && <HomePage />}
      {activeTab === 'product' && <ProductDetailPage />}
      {activeTab === 'browse' && <BrowsePage />}
      {activeTab === 'checkout' && <CheckoutPage />}
      {activeTab === 'dashboard' && (
        user ? (
          <UserDashboardPage />
        ) : (
          <div className="max-w-md mx-auto my-20 p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-center space-y-4 shadow-xl">
            <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
              🔒
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {lang === 'ar' ? 'يلزم تسجيل الدخول' : 'Authentication Required'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {lang === 'ar' 
                ? 'صفحة "محفظتي وحسابي" متاحة فقط للمستخدمين المسجلين. يرجى تسجيل الدخول للوصول لبيانات محفظتك.' 
                : 'Wallet & Account page is only available for logged-in users.'}
            </p>
            <button
              onClick={() => setActiveTab('home')}
              className="px-6 py-2.5 bg-blue-600 text-white font-extrabold text-xs rounded-xl shadow-md hover:bg-blue-500 transition"
            >
              {lang === 'ar' ? 'العودة للمتجر' : 'Back to Store'}
            </button>
          </div>
        )
      )}
      {activeTab === 'notifications' && <NotificationsPage />}
      {activeTab === 'admin' && (
        isAdmin ? (
          <AdminDashboardPage />
        ) : (
          <div className="max-w-md mx-auto my-20 p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-center space-y-4 shadow-xl">
            <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
              🚫
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {lang === 'ar' ? 'عفواً! غير مصرح لك بالدخول' : 'Access Denied (403 Forbidden)'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {lang === 'ar' 
                ? 'مركز التحكم والأداء متاح حصرياً لمدراء منصة NexusPay. يرجى تسجيل الدخول بحساب مدير للوصول.' 
                : 'The Admin HQ Console is restricted exclusively to System Administrators.'}
            </p>
            <button
              onClick={() => setActiveTab('home')}
              className="px-6 py-2.5 bg-blue-600 text-white font-extrabold text-xs rounded-xl shadow-md hover:bg-blue-500 transition"
            >
              {lang === 'ar' ? 'العودة للصفحة الرئيسية' : 'Return to Home'}
            </button>
          </div>
        )
      )}
      {['terms', 'privacy', 'refund', 'contact'].includes(activeTab) && (
        <LegalAndContactPages tab={activeTab} />
      )}
    </main>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
          <Header />
          <MainContent />
          <Footer />
          <CartDrawer />
          <ToastContainer />
        </div>
      </AppProvider>
    </ErrorBoundary>
  );
}

