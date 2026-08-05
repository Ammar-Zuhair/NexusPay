/**
 * SearchService.js - Product Catalog Search Engine
 * Features: Autocomplete, Ranking, Popular Searches & Synonym Mapping
 */

class SearchServiceImpl {
  constructor() {
    this.popularSearches = ['PUBG Mobile', 'Free Fire Diamonds', 'Netflix Subscription', 'Steam Wallet', 'Windows 11 Pro'];
    this.synonyms = {
      'pubg': ['pubg mobile', 'uc', 'unknown cash'],
      'ff': ['free fire', 'diamonds'],
      'netflix': ['streaming', 'movies', 'subscription'],
      'steam': ['wallet', 'gift card', 'pc gaming']
    };
  }

  search(products, query, lang = 'en') {
    if (!query || query.trim() === '') return products;
    const q = query.toLowerCase().trim();

    return products.filter(p => {
      const titleEn = (p.title?.en || p.title || '').toLowerCase();
      const titleAr = (p.title?.ar || '').toLowerCase();
      const category = (p.category || '').toLowerCase();

      // Check direct title match
      if (titleEn.includes(q) || titleAr.includes(q) || category.includes(q)) return true;

      // Check synonyms
      const synonymKeys = Object.keys(this.synonyms);
      for (const key of synonymKeys) {
        if (q.includes(key)) {
          const matchedTerms = this.synonyms[key];
          if (matchedTerms.some(term => titleEn.includes(term) || titleAr.includes(term))) return true;
        }
      }
      return false;
    });
  }

  getAutocompleteSuggestions(products, query, lang = 'en') {
    if (!query || query.length < 2) return this.popularSearches;
    const filtered = this.search(products, query, lang);
    return filtered.map(p => (lang === 'ar' ? p.title?.ar : p.title?.en) || p.title).slice(0, 5);
  }

  getPopularSearches() {
    return this.popularSearches;
  }
}

export const SearchService = new SearchServiceImpl();
