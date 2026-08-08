import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LogoMark } from './LogoMark';
import { MessageCircle, Send, Mail } from 'lucide-react';

export const Footer = () => {
  const { lang, setActiveTab, addToast } = useApp();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      addToast(lang === 'ar' ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email address', 'error');
      return;
    }
    setIsSubscribed(true);
    addToast(
      lang === 'ar'
        ? `تم اشتراكك بنجاح في نشرة NexusPay البريدية! ستصلك أحدث العروض على: ${newsletterEmail}`
        : `Successfully subscribed to NexusPay newsletter: ${newsletterEmail}`,
      'success'
    );
  };

  return (
    <footer className="w-full mt-16 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand & Mission Statement */}
        <div className="space-y-4">
          <div onClick={() => setActiveTab('home')} className="cursor-pointer">
            <LogoMark size="lg" />
          </div>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">
            {lang === 'ar' 
              ? 'الوجهة المتميزة لجميع احتياجاتك الرقمية. شحن آمن، ومباشر، وفوري في كل مرة في اليمن وخارجها.'
              : 'The premium destination for all your digital needs. Safe, secure, and instant delivery every time.'}
          </p>

          {/* Social / Direct Channels Icons */}
          <div className="flex items-center gap-3 pt-1">
            <a 
              href="https://wa.me/967784746159" 
              target="_blank" 
              rel="noreferrer" 
              title={lang === 'ar' ? 'دعم الواتساب المباشر' : 'WhatsApp Direct Support'}
              className="w-10 h-10 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-500 hover:scale-110 transition-transform"
            >
              <MessageCircle className="w-5 h-5" />
            </a>
            <a 
              href="https://t.me/nexuspay_support" 
              target="_blank" 
              rel="noreferrer" 
              title={lang === 'ar' ? 'قناة التليجرام والدعم' : 'Telegram Support Channel'}
              className="w-10 h-10 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-500 hover:scale-110 transition-transform"
            >
              <Send className="w-5 h-5" />
            </a>
            <button 
              onClick={() => setActiveTab('contact')} 
              title={lang === 'ar' ? 'نموذج الشكاوى والتواصل' : 'Contact Support Form'}
              className="w-10 h-10 rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-500 hover:scale-110 transition-transform"
            >
              <Mail className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Digital Marketplace Category Links — TEXT ONLY */}
        <div>
          <h4 className="font-extrabold text-base text-blue-600 dark:text-cyan-400 mb-4 uppercase tracking-wider">
            {lang === 'ar' ? 'السوق الرقمي' : 'Marketplace'}
          </h4>
          <ul className="space-y-2.5 text-xs font-bold text-slate-700 dark:text-slate-200">
            <li>
              <button onClick={() => setActiveTab('browse')} className="hover:text-blue-600 dark:hover:text-cyan-400 transition text-start">
                {lang === 'ar' ? 'شحن الألعاب وشدات ببجي' : 'Games & PUBG UC'}
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('browse')} className="hover:text-blue-600 dark:hover:text-cyan-400 transition text-start">
                {lang === 'ar' ? 'بطاقات الهدايا والمتاجر' : 'Gift Cards'}
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('browse')} className="hover:text-blue-600 dark:hover:text-cyan-400 transition text-start">
                {lang === 'ar' ? 'الاشتراكات والبرامج' : 'Software & Subs'}
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('browse')} className="hover:text-blue-600 dark:hover:text-cyan-400 transition text-start">
                {lang === 'ar' ? 'العروض الحصرية المميزة' : 'Premium Deals'}
              </button>
            </li>
          </ul>
        </div>

        {/* Quick Legal & Support Links — TEXT ONLY */}
        <div>
          <h4 className="font-extrabold text-base text-blue-600 dark:text-cyan-400 mb-4 uppercase tracking-wider">
            {lang === 'ar' ? 'روابط سريعة' : 'Quick Links'}
          </h4>
          <ul className="space-y-2.5 text-xs font-bold text-slate-700 dark:text-slate-200">
            <li>
              <button onClick={() => setActiveTab('terms')} className="hover:text-blue-600 dark:hover:text-cyan-400 transition text-start">
                {lang === 'ar' ? 'شروط الخدمة والاستخدام' : 'Terms of Service'}
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('privacy')} className="hover:text-blue-600 dark:hover:text-cyan-400 transition text-start">
                {lang === 'ar' ? 'سياسة الخصوصية وحماية البيانات' : 'Privacy Policy'}
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('refund')} className="hover:text-blue-600 dark:hover:text-cyan-400 transition text-start">
                {lang === 'ar' ? 'سياسة الاسترجاع وضمان الكود' : 'Refund Policy'}
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('contact')} className="hover:text-blue-600 dark:hover:text-cyan-400 transition text-start">
                {lang === 'ar' ? 'تواصل معنا — الدعم الفني' : 'Contact Support'}
              </button>
            </li>
          </ul>
        </div>

        {/* Interactive Newsletter — TEXT ONLY */}
        <div>
          <h4 className="font-extrabold text-base text-blue-600 dark:text-cyan-400 mb-4 uppercase tracking-wider">
            {lang === 'ar' ? 'النشرة البريدية' : 'Join Our Newsletter'}
          </h4>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3">
            {lang === 'ar' ? 'احصل على حصريات العروض وأخبار الألعاب والبطاقات إلى بريدك مباشرة.' : 'Get exclusive deals and game news directly to your inbox.'}
          </p>
          
          {isSubscribed ? (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {lang === 'ar' ? 'تم اشتراكك بنجاح! شكراً لك.' : 'Subscribed successfully! Thank you.'}
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-2">
              <input 
                required
                value={newsletterEmail}
                onChange={e => setNewsletterEmail(e.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder={lang === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Email address'} 
                type="email"
              />
              <button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2 rounded-xl transition shadow-md text-center"
              >
                {lang === 'ar' ? 'اشتراك في النشرة' : 'Subscribe'}
              </button>
            </form>
          )}
        </div>

      </div>

      {/* Copyright Footer Bar — TEXT ONLY */}
      <div className="max-w-7xl mx-auto px-4 py-4 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center text-xs font-extrabold text-slate-600 dark:text-slate-400">
        <p>© 2026 NexusPay Digital Marketplace. All rights reserved.</p>
        <div className="flex gap-6 mt-2 md:mt-0 font-black">
          <span>SECURED BY SSL</span>
          <span>YEMEN & GLOBAL COVERAGE</span>
        </div>
      </div>
    </footer>
  );
};
