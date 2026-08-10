import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { MOCK_GAMES, MOCK_CATEGORIES } from '../data/mockData';
import { ProductCard } from '../components/ProductCard';
import { Search, SlidersHorizontal } from 'lucide-react';

export const BrowsePage = () => {
  const { lang, setActiveTab, setSelectedGameId, products, activeCategories, selectedCategoryId, setSelectedCategoryId } = useApp();
  const selectedCat = selectedCategoryId || 'all';
  const setSelectedCat = (id) => setSelectedCategoryId(id);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('popular');

  const catalogProducts = products || [];

  const validCategories = activeCategories && activeCategories.length > 0 ? activeCategories : MOCK_CATEGORIES;

  // All categories including "All"
  const allCategories = [
    { id: 'all', icon: '✨', title: { en: 'All Products', ar: 'جميع المنتجات' } },
    ...validCategories,
  ];

  // Filter + search
  const displayProducts = useMemo(() => {
    const activeCatIds = new Set(validCategories.map(c => c.id));
    let list = catalogProducts.filter(p => {
      if (p.categoryId && !activeCatIds.has(p.categoryId)) return false;
      if (selectedCat !== 'all' && p.categoryId !== selectedCat) return false;
      if (search.trim()) {
        const t = p.title ? (p.title[lang] || p.title.ar || p.title.en || '') : '';
        const pub = p.publisher || '';
        return (
          t.toLowerCase().includes(search.toLowerCase()) ||
          pub.toLowerCase().includes(search.toLowerCase())
        );
      }
      return true;
    });

    if (sortBy === 'price-low')  list = [...list].sort((a, b) => (a.minPriceUSD || 0) - (b.minPriceUSD || 0));
    if (sortBy === 'price-high') list = [...list].sort((a, b) => (b.minPriceUSD || 0) - (a.minPriceUSD || 0));
    if (sortBy === 'rating')     list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return list;
  }, [catalogProducts, selectedCat, search, sortBy, lang]);

  const selectedCatObj = allCategories.find(c => c.id === selectedCat);
  const selectedLabel  = selectedCatObj ? (selectedCatObj.title[lang] || selectedCatObj.title.en) : '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
            {lang === 'ar' ? 'المتجر الرقمي الشامل' : 'COMPLETE DIGITAL STORE'}
          </span>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
            {lang === 'ar' ? 'تصفح جميع الخدمات الرقمية' : 'Browse All Digital Services'}
          </h1>
          {selectedCat !== 'all' && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {selectedCatObj?.icon} {selectedLabel} — {displayProducts.length} {lang === 'ar' ? 'منتج' : 'products'}
            </p>
          )}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-2xl shadow-xs">
            <Search className="w-4 h-4 text-slate-400 ml-2 rtl:mr-2 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={lang === 'ar' ? 'ابحث عن خدمة...' : 'Search products...'}
              className="bg-transparent border-none text-xs text-slate-900 dark:text-white focus:outline-none w-44"
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

      {/* ── Category Pills — Scrollable Row ── */}
      <div className="relative">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x">
          {allCategories.map((cat) => {
            const label = cat.title[lang] || cat.title.en;
            const isActive = selectedCat === cat.id;
            return (
              <button
                key={cat.id}
                id={`cat-pill-${cat.id}`}
                onClick={() => setSelectedCat(cat.id)}
                className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-2 rounded-2xl text-xs font-bold transition-all snap-start shrink-0 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Products Grid ── */}
      {displayProducts.length === 0 ? (
        <div className="text-center py-20 text-slate-400 dark:text-slate-500">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-lg font-bold">
            {lang === 'ar' ? 'لا توجد منتجات مطابقة' : 'No products found'}
          </p>
          <p className="text-sm mt-2">
            {lang === 'ar' ? 'حاول تغيير مصطلح البحث أو الفئة' : 'Try changing your search or category filter'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} game={product} />
          ))}
        </div>
      )}
    </div>
  );
};
