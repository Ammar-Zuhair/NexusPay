/**
 * ProviderInterface.js - Universal Supplier Driver Interface
 * All external digital suppliers must implement this contract.
 */

export class ProviderInterface {
  constructor(name, code, config = {}) {
    this.name = name;
    this.code = code;
    this.config = config;
  }

  async checkBalance() {
    throw new Error('ProviderInterface.checkBalance() must be implemented');
  }

  async getProducts() {
    throw new Error('ProviderInterface.getProducts() must be implemented');
  }

  async createOrder(params) {
    throw new Error('ProviderInterface.createOrder() must be implemented');
  }

  async checkOrderStatus(providerOrderId) {
    throw new Error('ProviderInterface.checkOrderStatus() must be implemented');
  }

  async cancelOrder(providerOrderId) {
    throw new Error('ProviderInterface.cancelOrder() must be implemented');
  }

  async refundOrder(providerOrderId) {
    throw new Error('ProviderInterface.refundOrder() must be implemented');
  }

  async getHealthStatus() {
    throw new Error('ProviderInterface.getHealthStatus() must be implemented');
  }
}
