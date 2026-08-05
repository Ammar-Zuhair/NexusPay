import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  ShoppingBag, 
  ShieldCheck, 
  Zap, 
  Info, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft 
} from 'lucide-react';

export const NotificationsPage = () => {
  const { 
    lang, 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    clearNotifications,
    setActiveTab 
  } = useApp();

  const [activeCategory, setActiveCategory] = useState('all');

  const filteredNotifications = notifications.filter(n => {
    if (activeCategory === 'all') return true;
    return n.category === activeCategory;
  });

  const getIcon = (type, category) => {
    if (category === 'orders') return <ShoppingBag className="w-5 h-5 text-blue-500" />;
    if (category === 'security') return <ShieldCheck className="w-5 h-5 text-emerald-500" />;
    if (category === 'promos') return <Zap className="w-5 h-5 text-amber-500" />;
    return <Info className="w-5 h-5 text-cyan-500" />;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Title & Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
            <Bell className="w-4 h-4" />
            <span>{lang === 'ar' ? 'مركز التنبيهات والإشعارات' : 'NEXUSPAY NOTIFICATIONS CENTER'}</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
            {lang === 'ar' ? 'الإشعارات والتحديثات المباشرة' : 'Activity & System Alerts'}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={markAllNotificationsAsRead}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
          >
            <CheckCheck className="w-4 h-4 text-emerald-500" />
            <span>{lang === 'ar' ? 'تحديد الكل كقروء' : 'Mark all as read'}</span>
          </button>
          <button
            onClick={clearNotifications}
            className="px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-xs hover:bg-rose-100 transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>{lang === 'ar' ? 'مسح الكل' : 'Clear all'}</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'all', label: { en: 'All Notifications', ar: 'جميع الإشعارات' } },
          { id: 'orders', label: { en: 'Orders & Fulfillment', ar: 'الطلبات والشحن' } },
          { id: 'security', label: { en: 'Security & Wallet', ar: 'الأمان والمحفظة' } },
          { id: 'promos', label: { en: 'Promotions & Offers', ar: 'العروض والخصومات' } }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-5 py-2.5 rounded-2xl font-bold text-xs whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 hover:bg-slate-50'
            }`}
          >
            {cat.label[lang]}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-800/60 rounded-3xl border border-slate-200 dark:border-slate-700/60 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto text-slate-400">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {lang === 'ar' ? 'لا يوجد إشعارات في الفئة المختارة' : 'No notifications in this category'}
            </h3>
            <p className="text-xs text-slate-500">
              {lang === 'ar' ? 'ستظهر أي تنبيهات بخصوص طلباتك أو رصيدك هنا فوراً.' : 'Any alerts regarding your orders or balance will appear here live.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map(item => (
            <div 
              key={item.id}
              onClick={() => markNotificationAsRead(item.id)}
              className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                item.read 
                  ? 'bg-white/80 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/50 opacity-80' 
                  : 'bg-white dark:bg-slate-800 border-blue-500/40 dark:border-blue-500/50 shadow-md shadow-blue-500/5'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl ${
                  item.category === 'orders' ? 'bg-blue-100 dark:bg-blue-900/40' :
                  item.category === 'security' ? 'bg-emerald-100 dark:bg-emerald-900/40' :
                  item.category === 'promos' ? 'bg-amber-100 dark:bg-amber-900/40' : 'bg-cyan-100 dark:bg-cyan-900/40'
                }`}>
                  {getIcon(item.type, item.category)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {item.title[lang] || item.title.en}
                    </h4>
                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {item.message[lang] || item.message.en}
                  </p>
                  <span className="text-[11px] font-semibold text-slate-400 block pt-1">
                    {item.timestamp}
                  </span>
                </div>
              </div>

              {item.actionLabel && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    markNotificationAsRead(item.id);
                    if (item.category === 'orders' || item.category === 'security') {
                      setActiveTab('dashboard');
                    } else if (item.category === 'promos') {
                      setActiveTab('browse');
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-cyan-400 text-xs font-bold transition-colors flex items-center gap-1.5 self-end md:self-auto"
                >
                  <span>{item.actionLabel[lang]}</span>
                  {lang === 'ar' ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
