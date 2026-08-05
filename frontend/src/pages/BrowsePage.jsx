import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MOCK_GAMES, MOCK_GIFT_CARDS } from '../data/mockData';
import { ProductCard } from '../components/ProductCard';
import { Search, Filter, Gamepad2, Gift, SlidersHorizontal } from 'lucide-react';

export const BrowsePage = () => {
  const { lang, setActiveTab, setSelectedGameId, products } = useApp();
  const [selectedCat, setSelectedCat] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('popular');

  const catalogProducts = products || MOCK_GAMES;

  const categories = [
    { id: 'all', label: lang === 'ar' ? 'جميع الألعاب والبطاقات' : 'All Top-ups & Cards' },
    { id: 'battle-royale', label: lang === 'ar' ? 'ألعاب الباتل رويال' : 'Battle Royale' },
    { id: 'fps', label: lang === 'ar' ? 'ألعاب تصويب FPS' : 'FPS Shooter' },
    { id: 'sports', label: lang === 'ar' ? 'ألعاب رياضية' : 'Sports' },
    { id: 'gift-cards', label: lang === 'ar' ? 'بطاقات الهدايا' : 'Gift Cards' },
  ];

  let displayGames = catalogProducts.filter(g => {
    if (selectedCat !== 'all' && selectedCat !== 'gift-cards' && g.category !== selectedCat) return false;
    if (search.trim()) {
      const titleText = typeof g.title === 'string' ? g.title : (g.title[lang] || g.title.ar || g.title.en);
      return titleText.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  if (sortBy === 'price-low') {
    displayGames.sort((a, b) => a.minPriceSAR - b.minPriceSAR);
  } else if (sortBy === 'price-high') {
    displayGames.sort((a, b) => b.minPriceSAR - a.minPriceSAR);
  } else if (sortBy === 'rating') {
    displayGames.sort((a, b) => b.rating - a.rating);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
            {lang === 'ar' ? 'دليل الشحن والبطاقات الرقمية' : 'DIGITAL CATALOG & STORE'}
          </span>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
            {lang === 'ar' ? 'تصفح جميع الألعاب وبطاقات الهدايا' : 'Browse All Games & Gift Cards'}
          </h1>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-2xl shadow-xs">
            <Search className="w-4 h-4 text-slate-400 ml-2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={lang === 'ar' ? 'ابحث باسم اللعبة...' : 'Search by name...'}
              className="bg-transparent border-none text-xs text-slate-900 dark:text-white focus:outline-none w-40"
            />
          </div>

          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200">
            <SlidersHorizontal className="w-4 h-4 text-blue-600" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-none focus:outline-none cursor-pointer"
            >
              <option value="popular">{lang === 'ar' ? 'الأكثر شعبية' : 'Most Popular'}</option>
              <option value="price-low">{lang === 'ar' ? 'الأقل سعراً' : 'Price: Low to High'}</option>
              <option value="price-high">{lang === 'ar' ? 'الأعلى سعراً' : 'Price: High to Low'}</option>
              <option value="rating">{lang === 'ar' ? 'الأعلى تقييماً' : 'Highest Rated'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex flex-wrap gap-2 pb-4 border-b border-slate-200 dark:border-slate-800">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCat(cat.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              selectedCat === cat.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Product Cards Display */}
      {selectedCat === 'gift-cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {MOCK_GIFT_CARDS.map(card => (
            <div
              key={card.id}
              onClick={() => {
                setSelectedGameId('pubg-mobile');
                setActiveTab('product');
              }}
              className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xs hover:shadow-xl transition-all cursor-pointer space-y-4"
            >
              <div className="aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 relative">
                <img src={card.image} alt={card.title[lang] || card.title.en} className="w-full h-full object-cover" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">
                {card.title[lang] || card.title.en}
              </h4>
              <p className="text-xs text-blue-600 font-bold">
                {lang === 'ar' ? 'شحن فوري للكود' : 'Instant Voucher Code'}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayGames.map((game) => (
            <ProductCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  );
};
