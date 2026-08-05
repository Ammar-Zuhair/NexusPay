/**
 * CacheService.js - Redis Cache & Session Emulation Service
 * Caches: Products, FX Rates, Provider Health, System Config, Sessions
 */

class CacheServiceImpl {
  constructor() {
    this.store = new Map();
  }

  set(key, value, ttlSeconds = 300) {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { value, expiresAt });
  }

  get(key) {
    const item = this.store.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  delete(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }

  getMetrics() {
    return {
      keysCount: this.store.size,
      activeKeys: Array.from(this.store.keys())
    };
  }
}

export const CacheService = new CacheServiceImpl();
