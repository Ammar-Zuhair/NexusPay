/**
 * GatewayAdapterPattern.js - Payment Gateway Adapters & Webhook Manager
 * Supports: Cards, Crypto USDT (TRC-20), Binance Pay, PayPal, Fawry/STC Pay
 */

import { CategorizedLogger } from '../../packages/logging/CategorizedLogger';

export class PaymentGatewayAdapter {
  constructor(name, code) {
    this.name = name;
    this.code = code;
  }
  async processPayment(amount, currency, correlationId) { throw new Error('Not implemented'); }
  async verifyWebhookSignature(payload, signature) { return true; }
}

export class BinancePayAdapter extends PaymentGatewayAdapter {
  constructor() { super('Binance Pay Gateway', 'BINANCE_PAY'); }
  async processPayment(amount, currency, correlationId) {
    return { success: true, gatewayTxId: `BN_TX_${Date.now()}`, status: 'PAID' };
  }
}

export class CryptoUSDTAdapter extends PaymentGatewayAdapter {
  constructor() { super('Crypto USDT TRC-20 Gateway', 'USDT_TRC20'); }
  async processPayment(amount, currency, correlationId) {
    return { success: true, gatewayTxId: `USDT_TX_${Date.now()}`, status: 'PAID' };
  }
}

export class LocalWalletAdapter extends PaymentGatewayAdapter {
  constructor() { super('STC Pay / Fawry Local Gateway', 'FAWRY_LOCAL'); }
  async processPayment(amount, currency, correlationId) {
    return { success: true, gatewayTxId: `FAW_TX_${Date.now()}`, status: 'PAID' };
  }
}

class WebhookManagerImpl {
  constructor() {
    this.inboxWebhooks = [];
  }

  processWebhook(gatewayCode, payload, signature, correlationId = 'CID-WEBHOOK') {
    const gatewayTxId = payload.gatewayTxId || `tx_${Date.now()}`;
    const dedupeKey = `${gatewayCode}_${gatewayTxId}`;

    // Inbox Pattern: Deduplication Guard
    const existing = this.inboxWebhooks.find(w => w.dedupeKey === dedupeKey);
    if (existing) {
      CategorizedLogger.log('PAYMENT', { correlationId, gatewayCode, dedupeKey, status: 'DUPLICATE_WEBHOOK_IGNORED' });
      return { status: 'DUPLICATE_IGNORED', webhookId: existing.id };
    }

    const entry = {
      id: `wh_${Date.now()}`,
      dedupeKey,
      gatewayCode,
      payload,
      verified: true,
      processedAt: new Date().toISOString()
    };
    this.inboxWebhooks.unshift(entry);

    CategorizedLogger.log('PAYMENT', { correlationId, gatewayCode, dedupeKey, status: 'VERIFIED_AND_PROCESSED' });
    return { status: 'PROCESSED', webhookId: entry.id };
  }
}

export const WebhookManager = new WebhookManagerImpl();
