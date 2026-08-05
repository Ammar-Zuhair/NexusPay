import React from 'react';
import { useApp } from '../context/AppContext';
import { OptimizedImage } from './OptimizedImage';
import { Star, Zap, ChevronRight, ChevronLeft, ShieldCheck } from 'lucide-react';

export const ProductCard = ({ game }) => {
  const { lang, setActiveTab, setSelectedGameId, formatCurrency } = useApp();

  const handleSelect = () => {
    setSelectedGameId(game.id);
    setActiveTab('product');
  };

  const ArrowIcon = lang === 'ar' ? ChevronLeft : ChevronRight;
  const minPriceUSD = game.packages && game.packages.length > 0 
    ? Math.min(...game.packages.map(p => p.priceUSD || 0.00)) 
    : (game.minPriceUSD || 0.99);

  const getLocalizedText = (field) => {
    if (!field) return '';
    if (typeof field === 'string') return field;
    return field[lang] || field.ar || field.en || '';
  };

  const titleText = getLocalizedText(game.title);
  const descText = getLocalizedText(game.description);

  return (
    <div 
      onClick={handleSelect}
      className="group relative rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/60 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between"
    >
      <div>
        {/* Top Image Container with Lazy Loading & Memory Caching */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
          <OptimizedImage 
            src={game.image} 
            alt={titleText}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />
          
          {/* Badge */}
          {game.badge && (
            <span className="absolute top-3 left-3 bg-blue-600 text-white font-extrabold text-[10px] tracking-wider px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
              <Zap className="w-3 h-3 fill-current" />
              {game.badge}
            </span>
          )}

          {/* Rating Tag */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded-md text-amber-400 text-xs font-bold border border-white/10">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{game.rating}</span>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-4 space-y-2">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            <span>{game.publisher}</span>
          </div>

          <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-1">
            {titleText}
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {descText}
          </p>
        </div>
      </div>

      {/* Card Footer Price & CTA */}
      <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-700/50 mt-3 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-medium text-slate-400 block">
            {lang === 'ar' ? 'يبدأ من' : 'Starts from'}
          </span>
          <span className="font-extrabold text-blue-600 dark:text-cyan-400 text-base">
            {formatCurrency(minPriceUSD)}
          </span>
        </div>

        <button 
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-cyan-400 font-bold text-xs group-hover:bg-blue-600 group-hover:text-white transition-all shadow-xs"
        >
          <span>{lang === 'ar' ? 'اشحن الآن' : 'Top Up'}</span>
          <ArrowIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
