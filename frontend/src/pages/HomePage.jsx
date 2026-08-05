import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const HomePage = () => {
  const { lang, setActiveTab, setSelectedGameId } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <main className="mt-20">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-2xl pb-2xl md:pt-2xl md:pb-2xl">
        <div className="max-w-container-max mx-auto px-gutter relative z-10 flex flex-col md:flex-row items-center gap-xl">
          
          {/* Text Content */}
          <div className="w-full md:w-3/5 text-center md:text-left rtl:md:text-right space-y-lg">
            <div className="inline-flex items-center px-md py-xs bg-primary-fixed text-on-primary-fixed rounded-full font-label-caps text-label-caps mb-md">
              <span className="material-symbols-outlined text-md mr-sm rtl:ml-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              {lang === 'ar' ? 'شريك رسمي لألعاب الألعاب العالمية' : 'OFFICIAL PARTNER FOR GLOBAL GAMING'}
            </div>

            <h1 className="font-display-lg text-display-lg text-on-surface leading-tight">
              {lang === 'ar' ? (
                <>
                  شحن ألعابك المفضلة <span className="text-primary">فوراً وبأمان.</span>
                </>
              ) : (
                <>
                  Instant Level Up for Your <span className="text-primary">Digital Life.</span>
                </>
              )}
            </h1>

            <h2 className="font-headline-lg text-headline-lg text-on-surface-variant font-arabic-body">
              {lang === 'ar'
                ? 'اشحن ألعابك المفضلة واحصل على بطاقات الهدايا فوراً.'
                : 'Top up your favorite games and get digital gift cards instantly.'}
            </h2>

            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl mx-auto md:mx-0 font-arabic-body">
              {lang === 'ar' 
                ? 'NexusPay هو المتجر الرقمي الأكثر سرعة وأماناً لشحن الألعاب، وبطاقات الهدايا، والاشتراكات الرقمية بتغطية عالمية.' 
                : 'NexusPay is the fastest, most reliable marketplace for game top-ups, gift cards, and digital subscriptions with worldwide coverage.'}
            </p>

            {/* Search Bar */}
            <div className="max-w-md w-full glass p-base rounded-2xl flex items-center shadow-md">
              <span className="material-symbols-outlined text-outline ml-md rtl:mr-md">search</span>
              <input
                className="w-full bg-transparent border-none focus:ring-0 font-body-lg text-on-surface py-md"
                placeholder={lang === 'ar' ? 'ابحث عن ببجي، ستيم، نيتفليكس...' : 'Search for PUBG, Steam, Netflix...'}
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
                onClick={() => { setSelectedGameId('pubg-mobile'); setActiveTab('product'); }}
                className="absolute top-0 right-0 w-64 h-80 glass rounded-[16px] shadow-2xl p-lg transform rotate-3 hover:rotate-0 transition-transform duration-500 z-20 cursor-pointer"
              >
                <div className="w-full h-40 rounded-lg mb-md bg-gradient-to-br from-primary to-secondary-fixed-dim flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[64px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    videogame_asset
                  </span>
                </div>
                <h4 className="font-title-md text-title-md text-on-surface">Game Top-up</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-sm">Instant delivery to your game account ID.</p>
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
                <h4 className="font-title-md text-title-md text-on-surface">Digital Cards</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-sm">Netflix, Steam, PlayStation & more.</p>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Featured Games Grid */}
      <section className="py-2xl bg-surface-container-low">
        <div className="max-w-container-max mx-auto px-gutter">
          <div className="flex items-end justify-between mb-xl">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface">
                {lang === 'ar' ? 'الألعاب المميزة' : 'Featured Games'}
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                {lang === 'ar' ? 'شحن رسمي لأشهر الألعاب في العالم' : "Official top-ups for the world's biggest titles."}
              </p>
            </div>
            <button 
              onClick={() => setActiveTab('browse')}
              className="font-title-md text-title-md text-primary flex items-center gap-xs hover:underline underline-offset-4 decoration-2"
            >
              {lang === 'ar' ? 'عرض الكل' : 'View All'}
              <span className="material-symbols-outlined rtl:rotate-180">arrow_forward</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-md">
            
            {/* Game 1: PUBG Mobile */}
            <div 
              onClick={() => { setSelectedGameId('pubg-mobile'); setActiveTab('product'); }}
              className="group bg-surface-container-lowest border border-outline-variant/30 rounded-[16px] p-md shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              <div className="aspect-square rounded-xl overflow-hidden mb-md bg-surface-container-high relative">
                <img 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  alt="PUBG Mobile" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKH67dvduWDSZyGuuEV1OZoAxR3-N8Hii_KMKO62k43SStE0dyKWxdaDcqR6tsDQHlQAQYmJrQrHgVVNqnPdn6OOvW2YzKAPFI9qmaXVxwc_0h_iPAK3uqA2nBYltLTDujS7M_PRXEqYW7pS4aECW_DwUUxH0dwGXnDUWSi45WgFx9n2biKG_Ymc1zRWuJWqM9k7VSfE5yP3tFufUDx-VriXNd-D9NKWKuQStXBhwGiVn2n7UG7NRc" 
                />
                <div className="absolute top-sm right-sm bg-error/90 text-on-error px-sm py-xs rounded-lg font-label-caps text-label-caps">-15%</div>
              </div>
              <h3 className="font-title-md text-title-md text-on-surface truncate">PUBG Mobile</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Global UC</p>
              <div className="mt-md flex items-center justify-between">
                <span className="font-title-md text-primary">$0.99 - $99.99</span>
                <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">add_circle</span>
              </div>
            </div>

            {/* Game 2: Free Fire */}
            <div 
              onClick={() => { setSelectedGameId('free-fire'); setActiveTab('product'); }}
              className="group bg-surface-container-lowest border border-outline-variant/30 rounded-[16px] p-md shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              <div className="aspect-square rounded-xl overflow-hidden mb-md bg-surface-container-high">
                <img 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  alt="Free Fire" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuACzMb2NxDqNiYQBkwV-KyG6QrrfSKW8Cq5avppu3g_xZjrDpbC_P8KbG3lURSs47wncNdXMtASKOoHqHOpW8fGsmxDqfjTNpAZKevd5rmE7uZqB6MyFpc18NRylWXbVhbBcdvMOijFKSpSMeAdoGYm4dnW4SgwoMjSXSkS0lv547izFxgSaDMFvz8vQZqzYObIViosiwSpsq-nh52pRYKXlGGOZtIRlwWg906G3J3HgxFIZaVagmsg" 
                />
              </div>
              <h3 className="font-title-md text-title-md text-on-surface truncate">Free Fire</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Diamonds</p>
              <div className="mt-md flex items-center justify-between">
                <span className="font-title-md text-primary">$1.10</span>
                <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">add_circle</span>
              </div>
            </div>

            {/* Game 3: Roblox */}
            <div 
              onClick={() => { setSelectedGameId('free-fire'); setActiveTab('browse'); }}
              className="group bg-surface-container-lowest border border-outline-variant/30 rounded-[16px] p-md shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              <div className="aspect-square rounded-xl overflow-hidden mb-md bg-surface-container-high">
                <img 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  alt="Roblox" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLfLud-eqQL9b_SJKCnZU3iNmDiBxQc-7vdRJ1WN5AyyYOkbpw3sCFqud9vxyYtWWZN75TGz3DgPt5gzLqQP_-Dl9zJuH764JEHhQ9CC_DuInsBNBiBmJPntu0IgKO-uoU7EKLODUsgIXjnE6CtoobV2BEbneDHewoH7peVvTJ-fz_XE8qAF5OjbUOO3QEg_6qxrTA6CN91H6W574n-AiK9cUoAqYjitW7eKudkuki5QDYAlWXmsYe" 
                />
              </div>
              <h3 className="font-title-md text-title-md text-on-surface truncate">Roblox</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Robux</p>
              <div className="mt-md flex items-center justify-between">
                <span className="font-title-md text-primary">$5.00+</span>
                <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">add_circle</span>
              </div>
            </div>

            {/* Game 4: PlayStation */}
            <div 
              onClick={() => { setSelectedGameId('steam-giftcard'); setActiveTab('product'); }}
              className="group bg-surface-container-lowest border border-outline-variant/30 rounded-[16px] p-md shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              <div className="aspect-square rounded-xl overflow-hidden mb-md bg-surface-container-high">
                <img 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  alt="PlayStation" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfD-fErV-crEYxP8Kma5E9S-jsazRP0nMhqj_5HYBN82kk5_SEQiOcssV6UAi_76ttf7Paw30vKf_NJLJeNz_71t2MGsGVwwbOTZn0HmG8XR9BISywR-FKxuJ1D-JdIc_USitLJrrRL949zOz_gsEfLk_ovKrgwIvEZ3lmcSA_qqZeiaPRvIN1-jVuhAsneJAoUTaC-8LK4RMMD2IysDilKfFUP_bEkXQqbgYcVl_4bFBw6erCcfS6" 
                />
              </div>
              <h3 className="font-title-md text-title-md text-on-surface truncate">PlayStation</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Store Credit</p>
              <div className="mt-md flex items-center justify-between">
                <span className="font-title-md text-primary">$10.00+</span>
                <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">add_circle</span>
              </div>
            </div>

            {/* Game 5: Steam */}
            <div 
              onClick={() => { setSelectedGameId('steam-giftcard'); setActiveTab('product'); }}
              className="group bg-surface-container-lowest border border-outline-variant/30 rounded-[16px] p-md shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              <div className="aspect-square rounded-xl overflow-hidden mb-md bg-surface-container-high">
                <img 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  alt="Steam" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjtv8Q3oWnruiNtpHyutjoe_wjnYoZnjMi9CJLzWq31mPBIhjJdGLXmtTvEodM0dWskATkeW_zH5QVUP_w6uEi62s4_AsSp1gWyJFpB3O0dWODla05VpbdnJETCjzhMErUTRgWbeyJwqcl6ZOBC9wLYclJwrFvohqPrPkC7IyBqPyLfbHAgyKvCMc5pe5ro3GUViUJjWOHi_vmPeIkSnxMhz5xMU-51oN-YPM21P_O1qDAMtYnQVT3" 
                />
              </div>
              <h3 className="font-title-md text-title-md text-on-surface truncate">Steam</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Wallet Code</p>
              <div className="mt-md flex items-center justify-between">
                <span className="font-title-md text-primary">$5.00+</span>
                <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">add_circle</span>
              </div>
            </div>

            {/* Game 6: Netflix */}
            <div 
              onClick={() => { setSelectedGameId('netflix-sub'); setActiveTab('product'); }}
              className="group bg-surface-container-lowest border border-outline-variant/30 rounded-[16px] p-md shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              <div className="aspect-square rounded-xl overflow-hidden mb-md bg-surface-container-high">
                <img 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  alt="Netflix" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-JpcsmwtCuzTZnBcRLZoIIfjJjegU9cGtNFvcQO5WbdhQjRdsT9mSr860oHdLKzkp1GDELmCz4GEGbrIgwYQpKnY4amwNQIDGmKcqfJzuhKQExTvdCTI7ZdH2s8PWF-bhmP-jbO-YI-MHpJPi8wV4jDnc2a9r1dCFAb83fpqNWIj_2LMvVzWFi7AT2ctmD3nCGRHYwY_V6yMbhs_F3o4fAB54wNrs4tqVo1WgUTIxI0S00yTgP5-_" 
                />
              </div>
              <h3 className="font-title-md text-title-md text-on-surface truncate">Netflix</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Subscriptions</p>
              <div className="mt-md flex items-center justify-between">
                <span className="font-title-md text-primary">$15.00+</span>
                <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">add_circle</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Popular Gift Cards Slider */}
      <section className="py-2xl">
        <div className="max-w-container-max mx-auto px-gutter">
          <div className="flex items-end justify-between mb-xl">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface">
                {lang === 'ar' ? 'بطاقات الهدايا الشائعة' : 'Popular Gift Cards'}
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                {lang === 'ar' ? 'متوفرة لجميع المناطق والمتاجر العالمية.' : 'Global regions available for every store.'}
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
            
            {/* iTunes / Apple */}
            <div className="min-w-[280px] snap-start glass border-none rounded-[16px] overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="h-32 bg-primary flex items-center justify-center">
                <span className="font-display-lg text-on-primary">iTunes</span>
              </div>
              <div className="p-md space-y-sm">
                <div className="flex justify-between items-center">
                  <span className="font-label-caps text-label-caps text-on-surface-variant">REGION: USA</span>
                  <span className="px-sm py-xs bg-tertiary-container/10 text-tertiary-container rounded-full text-[10px] font-bold">IN STOCK</span>
                </div>
                <h4 className="font-title-md text-title-md">Apple Gift Card</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Digital code delivered instantly to your email.</p>
                <button onClick={() => { setSelectedGameId('apple-giftcard'); setActiveTab('product'); }} className="w-full py-sm bg-surface-container-high hover:bg-primary hover:text-on-primary transition-all rounded-xl font-title-md">Buy Now</button>
              </div>
            </div>

            {/* XBOX */}
            <div className="min-w-[280px] snap-start glass border-none rounded-[16px] overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="h-32 bg-[#2d3133] flex items-center justify-center">
                <span className="font-display-lg text-[#acedff]">XBOX</span>
              </div>
              <div className="p-md space-y-sm">
                <div className="flex justify-between items-center">
                  <span className="font-label-caps text-label-caps text-on-surface-variant">REGION: GLOBAL</span>
                  <span className="px-sm py-xs bg-tertiary-container/10 text-tertiary-container rounded-full text-[10px] font-bold">IN STOCK</span>
                </div>
                <h4 className="font-title-md text-title-md">Game Pass Ultimate</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Get 100+ high-quality games on PC and console.</p>
                <button onClick={() => { setSelectedGameId('xbox-gamepass'); setActiveTab('product'); }} className="w-full py-sm bg-surface-container-high hover:bg-primary hover:text-on-primary transition-all rounded-xl font-title-md">Buy Now</button>
              </div>
            </div>

            {/* Spotify */}
            <div className="min-w-[280px] snap-start glass border-none rounded-[16px] overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="h-32 bg-[#4edea3] flex items-center justify-center">
                <span className="font-display-lg text-on-tertiary">Spotify</span>
              </div>
              <div className="p-md space-y-sm">
                <div className="flex justify-between items-center">
                  <span className="font-label-caps text-label-caps text-on-surface-variant">REGION: MENA</span>
                  <span className="px-sm py-xs bg-tertiary-container/10 text-tertiary-container rounded-full text-[10px] font-bold">IN STOCK</span>
                </div>
                <h4 className="font-title-md text-title-md">Spotify Premium</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Ad-free music listening with offline mode.</p>
                <button onClick={() => { setSelectedGameId('spotify-sub'); setActiveTab('product'); }} className="w-full py-sm bg-surface-container-high hover:bg-primary hover:text-on-primary transition-all rounded-xl font-title-md">Buy Now</button>
              </div>
            </div>

            {/* Google Play */}
            <div className="min-w-[280px] snap-start glass border-none rounded-[16px] overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="h-32 bg-[#ba1a1a] flex items-center justify-center">
                <span className="font-display-lg text-white">Google</span>
              </div>
              <div className="p-md space-y-sm">
                <div className="flex justify-between items-center">
                  <span className="font-label-caps text-label-caps text-on-surface-variant">REGION: GLOBAL</span>
                  <span className="px-sm py-xs bg-tertiary-container/10 text-tertiary-container rounded-full text-[10px] font-bold">IN STOCK</span>
                </div>
                <h4 className="font-title-md text-title-md">Play Store Credit</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">The easiest way to pay for apps and games.</p>
                <button onClick={() => { setSelectedGameId('google-play'); setActiveTab('product'); }} className="w-full py-sm bg-surface-container-high hover:bg-primary hover:text-on-primary transition-all rounded-xl font-title-md">Buy Now</button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Trust Signals Section */}
      <section className="py-2xl bg-primary text-on-primary overflow-hidden relative">
        <div className="max-w-container-max mx-auto px-gutter relative z-10">
          <div className="text-center mb-2xl">
            <h2 className="font-headline-lg text-headline-lg mb-md">
              {lang === 'ar' ? 'موثوق من ملايين اللاعبين حول العالم' : 'Trusted by Millions Worldwide'}
            </h2>
            <p className="font-body-lg text-body-lg opacity-80 max-w-2xl mx-auto">
              {lang === 'ar' ? 'نوفر معاملات رقمية آمنة وسريعة منذ عام 2018.' : 'Providing safe and secure digital transactions since 2018.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-xl">
            <div className="flex flex-col items-center text-center space-y-md">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
              </div>
              <h3 className="font-title-md text-title-md">{lang === 'ar' ? 'تسليم فوري' : 'Instant Delivery'}</h3>
              <p className="font-body-sm text-body-sm opacity-80 font-arabic-body">
                {lang === 'ar' 
                  ? 'يتم إرسال الأكواد وشدات الألعاب فوراً إلى بريدك الإلكتروني أو حسابك بعد السداد المباشر.' 
                  : 'Codes are sent immediately to your email or game account upon successful payment.'}
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-md">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
              </div>
              <h3 className="font-title-md text-title-md">{lang === 'ar' ? 'دفع آمن 100%' : 'Secure Payments'}</h3>
              <p className="font-body-sm text-body-sm opacity-80 font-arabic-body">
                {lang === 'ar'
                  ? 'نستخدم أعلى معايير التشفير SSL وبوابات الدفع الرسمية المعتمدة لحماية جميع معاملاتك.'
                  : 'We use high-level SSL encryption and industry-standard payment gateways for your safety.'}
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-md">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>support_agent</span>
              </div>
              <h3 className="font-title-md text-title-md">{lang === 'ar' ? 'دعم 24/7' : '24/7 Support'}</h3>
              <p className="font-body-sm text-body-sm opacity-80 font-arabic-body">
                {lang === 'ar'
                  ? 'فريق الدعم الفني متواجد على مدار الساعة لمساعدتك في أي استفسارات أو عمليات شراء.'
                  : 'Our dedicated team is always here to help you with any purchase questions or issues.'}
              </p>
            </div>
          </div>

          <div className="mt-2xl pt-2xl border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-lg text-center">
            <div>
              <div className="text-[40px] font-bold">5M+</div>
              <div className="font-label-caps text-label-caps opacity-70 font-arabic-body">{lang === 'ar' ? 'لاعب سعيد' : 'Happy Users'}</div>
            </div>
            <div>
              <div className="text-[40px] font-bold">12M+</div>
              <div className="font-label-caps text-label-caps opacity-70 font-arabic-body">{lang === 'ar' ? 'عملية شحن ناجحة' : 'Transactions'}</div>
            </div>
            <div>
              <div className="text-[40px] font-bold">50+</div>
              <div className="font-label-caps text-label-caps opacity-70 font-arabic-body">{lang === 'ar' ? 'طريقة دفع آمنة' : 'Payment Methods'}</div>
            </div>
            <div>
              <div className="text-[40px] font-bold">190+</div>
              <div className="font-label-caps text-label-caps opacity-70 font-arabic-body">{lang === 'ar' ? 'دولة حول العالم' : 'Countries Covered'}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="py-2xl bg-surface">
        <div className="max-w-container-max mx-auto px-gutter">
          <h2 className="font-headline-lg text-headline-lg text-on-surface text-center mb-xl">
            {lang === 'ar' ? 'آراء واقتباسات اللاعبين' : 'What Gamers Say'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
            
            <div className="bg-surface-container-low p-xl rounded-[16px] space-y-md border border-outline-variant/20 shadow-sm">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                ))}
              </div>
              <p className="font-body-lg text-body-lg text-on-surface-variant italic font-arabic-body">
                {lang === 'ar' 
                  ? '"NexusPay أسرع منصة جربتها في حياتي، وصلني رصيد شدات ببجي في حسابي خلال 10 ثوانٍ فقط من الدفع."' 
                  : '"NexusPay is literally the fastest service I\'ve ever used. My PUBG UC was in my account within 10 seconds of paying."'}
              </p>
              <div className="flex items-center gap-md">
                <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center font-bold text-on-primary-container">أ م</div>
                <div>
                  <h4 className="font-title-md text-title-md">{lang === 'ar' ? 'أحمد م.' : 'Ahmed M.'}</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{lang === 'ar' ? 'لاعب محترف' : 'Competitive Player'}</p>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-low p-xl rounded-[16px] space-y-md border border-outline-variant/20 shadow-sm">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                ))}
              </div>
              <p className="font-body-lg text-body-lg text-on-surface-variant italic font-arabic-body">
                {lang === 'ar'
                  ? '"أعجبتني كثرة طرق الدفع المتوفرة وتنوع العملات المحلية مما جعل التسوق سهلاً جداً ومريحاً."'
                  : '"Love the variety of payment methods. Being able to pay with local options in my country makes it so convenient."'}
              </p>
              <div className="flex items-center gap-md">
                <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center font-bold text-on-secondary-container">ج ل</div>
                <div>
                  <h4 className="font-title-md text-title-md">{lang === 'ar' ? 'جيسيكا ل.' : 'Jessica L.'}</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{lang === 'ar' ? 'لاعبة هاوية' : 'Casual Gamer'}</p>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-low p-xl rounded-[16px] space-y-md border border-outline-variant/20 shadow-sm">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                ))}
              </div>
              <p className="font-body-lg text-body-lg text-on-surface-variant italic font-arabic-body">
                {lang === 'ar'
                  ? '"دعم فني ممتاز وسريع جداً، كان لدي استفسار حول المنطقة وحلوه لي عبر المحادثة المباشرة خلال دقائق."'
                  : '"Great customer support. I had a small issue with my region and they fixed it through live chat in minutes."'}
              </p>
              <div className="flex items-center gap-md">
                <div className="w-12 h-12 rounded-full bg-tertiary-container flex items-center justify-center font-bold text-on-tertiary-container">س ك</div>
                <div>
                  <h4 className="font-title-md text-title-md">{lang === 'ar' ? 'سامي ك.' : 'Sami K.'}</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{lang === 'ar' ? 'صانع محتوى وبثوث' : 'Pro Streamer'}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

    </main>
  );
};
