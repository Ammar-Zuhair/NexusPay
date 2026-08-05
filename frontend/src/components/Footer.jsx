import React from 'react';
import { useApp } from '../context/AppContext';
import { LogoMark } from './LogoMark';

export const Footer = () => {
  const { lang, setActiveTab } = useApp();

  return (
    <footer className="w-full mt-16 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        <div className="space-y-4">
          <div onClick={() => setActiveTab('home')}>
            <LogoMark size="lg" />
          </div>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">
            {lang === 'ar' 
              ? 'الوجهة المتميزة لجميع احتياجاتك الرقمية. شحن آمن، ومباشر، وفوري في كل مرة.'
              : 'The premium destination for all your digital needs. Safe, secure, and instant delivery every time.'}
          </p>
          <div className="flex gap-3">
            <a className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-blue-600 dark:text-cyan-400 hover:scale-110 transition-transform font-bold" href="#">
              <span className="material-symbols-outlined text-lg">qr_code_2</span>
            </a>
            <a className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-blue-600 dark:text-cyan-400 hover:scale-110 transition-transform font-bold" href="#">
              <span className="material-symbols-outlined text-lg">language</span>
            </a>
            <a className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-blue-600 dark:text-cyan-400 hover:scale-110 transition-transform font-bold" href="#">
              <span className="material-symbols-outlined text-lg">forum</span>
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-extrabold text-base text-blue-600 dark:text-cyan-400 mb-4 uppercase tracking-wider">
            {lang === 'ar' ? 'السوق الرقمي' : 'Marketplace'}
          </h4>
          <ul className="space-y-2.5 text-xs font-bold text-slate-700 dark:text-slate-200">
            <li><button onClick={() => setActiveTab('browse')} className="hover:text-blue-600 dark:hover:text-cyan-400 transition">{lang === 'ar' ? 'شحن الألعاب' : 'Games Top-up'}</button></li>
            <li><button onClick={() => setActiveTab('browse')} className="hover:text-blue-600 dark:hover:text-cyan-400 transition">{lang === 'ar' ? 'بطاقات الهدايا' : 'Gift Cards'}</button></li>
            <li><button onClick={() => setActiveTab('browse')} className="hover:text-blue-600 dark:hover:text-cyan-400 transition">{lang === 'ar' ? 'الاشتراكات والبرامج' : 'Software & Subs'}</button></li>
            <li><button onClick={() => setActiveTab('browse')} className="hover:text-blue-600 dark:hover:text-cyan-400 transition">{lang === 'ar' ? 'العروض المميزة' : 'Premium Deals'}</button></li>
          </ul>
        </div>

        <div>
          <h4 className="font-extrabold text-base text-blue-600 dark:text-cyan-400 mb-4 uppercase tracking-wider">
            {lang === 'ar' ? 'روابط سريعة' : 'Quick Links'}
          </h4>
          <ul className="space-y-2.5 text-xs font-bold text-slate-700 dark:text-slate-200">
            <li><a className="hover:text-blue-600 dark:hover:text-cyan-400 transition" href="#">{lang === 'ar' ? 'شروط الخدمة' : 'Terms of Service'}</a></li>
            <li><a className="hover:text-blue-600 dark:hover:text-cyan-400 transition" href="#">{lang === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}</a></li>
            <li><a className="hover:text-blue-600 dark:hover:text-cyan-400 transition" href="#">{lang === 'ar' ? 'سياسة الاسترجاع' : 'Refund Policy'}</a></li>
            <li><a className="hover:text-blue-600 dark:hover:text-cyan-400 transition" href="#">{lang === 'ar' ? 'اتصل بنا' : 'Contact Us'}</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-extrabold text-base text-blue-600 dark:text-cyan-400 mb-4 uppercase tracking-wider">
            {lang === 'ar' ? 'النشرة البريدية' : 'Join Our Newsletter'}
          </h4>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3">
            {lang === 'ar' ? 'احصل على حصريات العروض وأخبار الألعاب إلى بريدك.' : 'Get exclusive deals and game news directly to your inbox.'}
          </p>
          <div className="flex flex-col gap-2">
            <input 
              className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder={lang === 'ar' ? 'البريد الإلكتروني' : 'Email address'} 
              type="email"
            />
            <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2 rounded-xl transition shadow-md">
              {lang === 'ar' ? 'اشتراك' : 'Subscribe'}
            </button>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center text-xs font-extrabold text-slate-600 dark:text-slate-400">
        <p>© 2026 NexusPay Digital Marketplace. All rights reserved.</p>
        <div className="flex gap-6 mt-2 md:mt-0 font-black">
          <span>SECURED BY SSL</span>
          <span>PCI COMPLIANT</span>
        </div>
      </div>
    </footer>
  );
};
