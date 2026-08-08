import React, { useState, useEffect } from 'react';
import { MOCK_CATEGORIES, MOCK_GAMES } from '../data/mockData';
import { useApp } from '../context/AppContext';

import { API_BASE_URL } from '../utils/api.js';

export const HomePage = () => {
  const { lang, setActiveTab, setSelectedGameId, activeCategories, products, setSelectedCategoryId } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [dailyReviews, setDailyReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);

  const validCategories = activeCategories && activeCategories.length > 0 ? activeCategories : MOCK_CATEGORIES;
  const activeCatIds = new Set(validCategories.map(c => c.id));
  const catalogProducts = (products && products.length > 0) ? products : MOCK_GAMES;

  // Fetch daily 10 random 5-star customer reviews from backend API
  useEffect(() => {
    let isMounted = true;
    const fetchDailyReviews = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/reviews/daily-5star`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.reviews) {
            setDailyReviews(data.reviews);
          }
        }
      } catch (err) {
        console.warn('Could not fetch daily reviews:', err);
      } finally {
        if (isMounted) setIsLoadingReviews(false);
      }
    };

    fetchDailyReviews();
    return () => { isMounted = false; };
  }, []);

  return (
    <main className="mt-20">
      
      {/* 🚀 Hero Section - Comprehensive Electronic & Digital Services */}
      <section className="relative overflow-hidden pt-2xl pb-2xl md:pt-2xl md:pb-2xl">
        <div className="max-w-container-max mx-auto px-gutter relative z-10 flex flex-col md:flex-row items-center gap-xl">
          
          {/* Text Content */}
          <div className="w-full md:w-3/5 text-center md:text-left rtl:md:text-right space-y-lg">
            <div className="inline-flex items-center px-md py-xs bg-primary-fixed text-on-primary-fixed rounded-full font-label-caps text-label-caps mb-md">
              <span className="material-symbols-outlined text-md mr-sm rtl:ml-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              {lang === 'ar' ? 'منصة متكاملة لكافة الخدمات والمنتجات الرقمية' : 'ALL-IN-ONE DIGITAL & ELECTRONIC SERVICES'}
            </div>

            <h1 className="font-display-lg text-display-lg text-on-surface leading-tight">
              {lang === 'ar' ? (
                <>
                  جميع الخدمات والبطاقات الرقمية <span className="text-primary">في مكان واحد.</span>
                </>
              ) : (
                <>
                  All Your Digital & Electronic Services <span className="text-primary">In One Place.</span>
                </>
              )}
            </h1>

            <h2 className="font-headline-lg text-headline-lg text-on-surface-variant font-arabic-body">
              {lang === 'ar'
                ? 'اشتراكات البث والذكاء الاصطناعي، بطاقات الهدايا، البرامج والتراخيص، والمحافظ الرقمية.'
                : 'Streaming & AI subscriptions, gift cards, software licenses, and digital top-ups.'}
            </h2>

            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl mx-auto md:mx-0 font-arabic-body">
              {lang === 'ar' 
                ? 'منصتك الشاملة لشراء وتفعيل كافة المنتجات الإلكترونية والخدمات الرقمية والبطاقات فورياً وبأمان كامل.' 
                : 'Your comprehensive platform to buy and activate all electronic services, digital cards, and subscriptions instantly.'}
            </p>

            {/* Search Bar */}
            <div className="max-w-md w-full glass p-base rounded-2xl flex items-center shadow-md">
              <span className="material-symbols-outlined text-outline ml-md rtl:mr-md">search</span>
              <input
                className="w-full bg-transparent border-none focus:ring-0 font-body-lg text-on-surface py-md"
                placeholder={lang === 'ar' ? 'ابحث عن نيتفليكس، ستيم، بلايستيشن، شحن...' : 'Search for Netflix, Steam, PlayStation, AI...'}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                onClick={() => setActiveTab('browse')}
                className="bg-primary text-on-primary px-lg py-md rounded-xl font-title-md text-title-md hover:bg-primary-container transition-colors m-xs shrink-0"
              >
                {lang === 'ar' ? 'بحث' : 'Search'}
              </button>
            </div>
          </div>

          {/* Visual Element Floating Cards */}
          <div className="w-full md:w-2/5 relative">
            <div className="relative w-full aspect-square md:h-[500px]">
              
              {/* Glassmorphic Card 1 */}
              <div 
                onClick={() => setActiveTab('browse')}
                className="absolute top-0 right-0 w-64 h-80 glass rounded-[16px] shadow-2xl p-lg transform rotate-3 hover:rotate-0 transition-transform duration-500 z-20 cursor-pointer"
              >
                <div className="w-full h-40 rounded-lg mb-md bg-gradient-to-br from-primary to-secondary-fixed-dim flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[64px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    smart_toy
                  </span>
                </div>
                <h4 className="font-title-md text-title-md text-on-surface">{lang === 'ar' ? 'الذكاء الاصطناعي والاشتراكات' : 'AI & Subscriptions'}</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-sm">{lang === 'ar' ? 'ChatGPT, Netflix, Spotify وتطبيقات العمل.' : 'ChatGPT, Netflix, Spotify & pro apps.'}</p>
              </div>

              {/* Glassmorphic Card 2 */}
              <div 
                onClick={() => setActiveTab('browse')}
                className="absolute bottom-10 left-0 w-64 h-80 glass rounded-[16px] shadow-2xl p-lg transform -rotate-6 hover:rotate-0 transition-transform duration-500 z-30 cursor-pointer"
              >
                <div className="w-full h-40 rounded-lg mb-md bg-gradient-to-br from-tertiary-container to-tertiary-fixed-dim flex items-center justify-center overflow-hidden">
                  <img 
                    className="w-full h-full object-cover" 
                    alt="Digital Cards" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7eGVDq_xAwLG4EFRC_vSrFrZirB_1XGfFsMAaiaL8xJblXpic-yJzGZW6idJn38FQLI_Hf9OaEYHTn6zk99oftfK067bK8ybhRKZz-CgAh3yk1GHGocYNEgQukIwJr3ofuq1JjAulsN6U6-EIbLJYTBOuSYxqA-9ZMOemjDLvg3cJMCs--txrymVN7cLayWIMXpiZmz5QrCKDE2E1x-_EqkLOQZMgz_93YN8Ba8DKJ9-ER30l80cW"
                  />
                </div>
                <h4 className="font-title-md text-title-md text-on-surface">{lang === 'ar' ? 'البطاقات الإلكترونية والشحن' : 'Digital Cards & Top-ups'}</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-sm">{lang === 'ar' ? 'بطاقات هدايا، تراخيص برامج وشحن خدمات.' : 'Gift cards, licenses & service top-ups.'}</p>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ─── Categories Grid ─── */}
      <section className="py-2xl bg-surface-container-low">
        <div className="max-w-container-max mx-auto px-gutter">
          <div className="flex items-end justify-between mb-xl">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface">
                {lang === 'ar' ? 'تصفح حسب الفئة' : 'Browse by Category'}
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                {lang === 'ar' ? 'خدمات إلكترونية وشاملة لكل احتياجاتك اليومية' : 'Comprehensive digital services for all your needs.'}
              </p>
            </div>
            <button
              onClick={() => { setSelectedCategoryId('all'); setActiveTab('browse'); }}
              className="font-title-md text-title-md text-primary flex items-center gap-xs hover:underline underline-offset-4 decoration-2"
            >
              {lang === 'ar' ? 'عرض الكل' : 'View All'}
              <span className="material-symbols-outlined rtl:rotate-180">arrow_forward</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-md">
            {validCategories.map((cat) => {
              const label = cat.title[lang] || cat.title.en;
              const count = catalogProducts.filter(p => p.categoryId === cat.id).length;
              return (
                <div
                  key={cat.id}
                  onClick={() => { setSelectedCategoryId(cat.id); setActiveTab('browse'); }}
                  className="group bg-surface-container-lowest border border-outline-variant/30 rounded-[16px] p-md shadow-sm hover:shadow-lg hover:border-primary/40 transition-all duration-300 cursor-pointer text-center"
                >
                  <div className="text-4xl mb-md">{cat.icon}</div>
                  <h3 className="font-title-sm text-title-sm text-on-surface leading-snug">{label}</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
                    {count} {lang === 'ar' ? 'خدمة/منتج' : 'services'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Products Slider */}
      <section className="py-2xl">
        <div className="max-w-container-max mx-auto px-gutter">
          <div className="flex items-end justify-between mb-xl">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface">
                {lang === 'ar' ? 'المنتجات والخدمات الأكثر شعبية' : 'Most Popular Digital Products'}
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                {lang === 'ar' ? 'أبرز الخدمات والاشتراكات والبطاقات الإلكترونية.' : 'Top electronic services & digital products.'}
              </p>
            </div>
            <div className="flex gap-sm">
              <button className="p-sm rounded-full border border-outline-variant hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="p-sm rounded-full border border-outline-variant hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>

          <div className="flex overflow-x-auto gap-lg pb-lg custom-scrollbar snap-x">
            {catalogProducts.filter(p => p.isPopular && (!p.categoryId || activeCatIds.has(p.categoryId))).slice(0, 8).map(product => {
              const catObj = validCategories.find(c => c.id === product.categoryId);
              const titleText = typeof product.title === 'object' ? (product.title[lang] || product.title.en) : product.title;
              const minPkg = product.packages?.[0];
              return (
                <div
                  key={product.id}
                  className="min-w-[260px] snap-start glass border-none rounded-[16px] overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
                  onClick={() => { setSelectedGameId(product.id); setActiveTab('product'); }}
                >
                  <div className="h-32 bg-surface-container-high flex items-center justify-center overflow-hidden relative">
                    {product.image ? (
                      <img src={product.image} alt={titleText} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-5xl">{catObj?.icon || '📦'}</span>
                    )}
                    {product.badge && (
                      <span className="absolute top-sm right-sm bg-primary text-on-primary px-sm py-xs rounded-full font-label-caps text-label-caps text-[10px]">
                        {product.badge}
                      </span>
                    )}
                  </div>
                  <div className="p-md space-y-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-label-caps text-label-caps text-on-surface-variant text-[10px]">
                        {catObj?.icon} {catObj ? (catObj.title[lang] || catObj.title.en) : ''}
                      </span>
                      <span className="px-sm py-xs bg-tertiary-container/10 text-tertiary rounded-full text-[10px] font-bold">متوفر</span>
                    </div>
                    <h4 className="font-title-md text-title-md text-on-surface">{titleText}</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {lang === 'ar' ? 'من' : 'From'} ${minPkg?.priceUSD?.toFixed(2) || product.minPriceUSD?.toFixed(2) || '—'}
                    </p>
                    <button className="w-full py-sm bg-surface-container-high hover:bg-primary hover:text-on-primary transition-all rounded-xl font-title-sm text-title-sm">
                      {lang === 'ar' ? 'اشترِ الآن' : 'Buy Now'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* Genuine Trust Commitments Section (No Fake Stats) */}
      <section className="py-2xl bg-primary text-on-primary overflow-hidden relative">
        <div className="max-w-container-max mx-auto px-gutter relative z-10">
          <div className="text-center mb-2xl">
            <h2 className="font-headline-lg text-headline-lg mb-md">
              {lang === 'ar' ? 'التزامنا وجودة خدماتنا الإلكترونية' : 'Our Digital Excellence Commitment'}
            </h2>
            <p className="font-body-lg text-body-lg opacity-80 max-w-2xl mx-auto">
              {lang === 'ar' ? 'منصة حديثة، آمنة ومضمونة لشراء وتفعيل كافة خدماتك وبطاقاتك الرقمية.' : 'A modern, secure, and transparent marketplace for all your digital card and service needs.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-xl">
            <div className="flex flex-col items-center text-center space-y-md">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
              </div>
              <h3 className="font-title-md text-title-md">{lang === 'ar' ? 'تنفيذ وتسليم فوري' : 'Instant Delivery'}</h3>
              <p className="font-body-sm text-body-sm opacity-80 font-arabic-body">
                {lang === 'ar' 
                  ? 'يتم إرسال أكواد البطاقات الإلكترونية وتفاصيل التفعيل آلياً وفورياً فور تأكيد عملية الشراء.' 
                  : 'Digital codes and subscription details are delivered immediately after successful payment.'}
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-md">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
              </div>
              <h3 className="font-title-md text-title-md">{lang === 'ar' ? 'معاملات آمنة ومفرّة' : 'Secure Transactions'}</h3>
              <p className="font-body-sm text-body-sm opacity-80 font-arabic-body">
                {lang === 'ar'
                  ? 'نعتمد أعلى معايير التشفير وبوابات الدفع الرسمية لحماية بياناتك وأموالك.'
                  : 'We use robust SSL encryption and official payment gateways for your maximum security.'}
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-md">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>support_agent</span>
              </div>
              <h3 className="font-title-md text-title-md">{lang === 'ar' ? 'دعم فني متواصل' : 'Dedicated Customer Support'}</h3>
              <p className="font-body-sm text-body-sm opacity-80 font-arabic-body">
                {lang === 'ar'
                  ? 'فريق الدعم الفني جاهز لمساعدتك والإجابة على كافة استفساراتك حول الخدمة.'
                  : 'Our customer support team is available to assist you with any questions or help needed.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 🌟 Daily 10 Verified Customer Reviews (5-Stars Only, Refreshed Daily) */}
      <section className="py-2xl bg-surface">
        <div className="max-w-container-max mx-auto px-gutter">
          <div className="text-center mb-xl space-y-sm">
            <div className="inline-flex items-center gap-1.5 px-md py-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full font-bold text-xs">
              <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              {lang === 'ar' ? 'تقييمات حقيقية بعد الشراء' : 'Verified Post-Purchase Reviews'}
            </div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">
              {lang === 'ar' ? 'آراء وتقييمات العملاء اليومية' : 'Daily 5-Star Customer Reviews'}
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl mx-auto">
              {lang === 'ar' 
                ? 'يتم عرض 10 تقييمات بـ 5 نجوم عشوائياً يومياً من آراء وتعليقات المستخدمين الحقيقيين بعد الشراء' 
                : 'Displaying 10 daily random 5-star reviews from verified buyers.'}
            </p>
          </div>

          {isLoadingReviews ? (
            <div className="text-center py-12 text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin text-3xl">sync</span>
              <p className="mt-2 text-xs font-bold">{lang === 'ar' ? 'جاري تحميل التقييمات...' : 'Loading customer reviews...'}</p>
            </div>
          ) : dailyReviews && dailyReviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
              {dailyReviews.map((rev, index) => (
                <div key={rev.id || index} className="bg-surface-container-low p-xl rounded-[20px] space-y-md border border-outline-variant/30 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center">
                    <div className="flex text-amber-400">
                      {[...Array(rev.rating || 5)].map((_, i) => (
                        <span key={i} className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      ))}
                    </div>
                    <span className="text-[10px] text-on-surface-variant/70 font-mono">
                      {rev.created_at ? new Date(rev.created_at).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US') : ''}
                    </span>
                  </div>

                  <p className="font-body-lg text-body-lg text-on-surface leading-relaxed italic font-arabic-body">
                    "{rev.comment}"
                  </p>

                  <div className="flex items-center gap-md pt-xs border-t border-outline-variant/10">
                    <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm shrink-0">
                      {(rev.reviewer_name || 'ع')[0]}
                    </div>
                    <div>
                      <h4 className="font-title-sm text-title-sm text-on-surface font-bold">{rev.reviewer_name}</h4>
                      <p className="font-body-sm text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-xs">check_circle</span>
                        {lang === 'ar' ? 'مشتري معتمد' : 'Verified Buyer'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-surface-container-low rounded-2xl border border-outline-variant/30 max-w-md mx-auto space-y-3">
              <span className="material-symbols-outlined text-4xl text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>reviews</span>
              <h3 className="font-title-md text-title-md text-on-surface">
                {lang === 'ar' ? 'لا توجد تقييمات بعد' : 'No Reviews Yet'}
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {lang === 'ar' 
                  ? 'كن أول من يشارك تجربته وتقييمه للموقع بعد إتمام عمليتك في المنصة!' 
                  : 'Be the first to leave a review after completing your purchase!'}
              </p>
            </div>
          )}
        </div>
      </section>

    </main>
  );
};
