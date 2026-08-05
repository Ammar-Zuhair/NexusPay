/**
 * PluginLoaderService.js - Dynamic Plugin Architecture & Extensible Driver Registry
 * Dynamically registers new Suppliers, Payment Adapters, or Notification Channels at runtime.
 */

class PluginLoaderServiceImpl {
  constructor() {
    this.registeredPlugins = new Map();
  }

  registerPlugin(type, pluginCode, pluginInstance) {
    const key = `${type}:${pluginCode}`;
    this.registeredPlugins.set(key, pluginInstance);
    return true;
  }

  getPlugin(type, pluginCode) {
    return this.registeredPlugins.get(`${type}:${pluginCode}`) || null;
  }

  listPlugins() {
    return Array.from(this.registeredPlugins.keys());
  }
}

export const PluginLoaderService = new PluginLoaderServiceImpl();
