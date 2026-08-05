/**
 * RecommendationEngine.js - Product Recommendation Engine
 * Provides "Trending Products", "Popular Today", and "Customers Also Bought" recommendations.
 */

class RecommendationEngineImpl {
  getTrendingProducts(products) {
    return products.filter(p => p.rating >= 4.7 || p.isPopular).slice(0, 4);
  }

  getCustomersAlsoBought(products, currentProductId) {
    return products.filter(p => p.id !== currentProductId).slice(0, 3);
  }

  getPopularToday(products) {
    return products.slice(0, 4);
  }
}

export const RecommendationEngine = new RecommendationEngineImpl();
