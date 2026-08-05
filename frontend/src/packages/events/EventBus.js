/**
 * EventBus.js - Distributed Event Bus & Domain Event Catalog
 * Implements Outbox Pattern & Correlation ID context propagation.
 */

export const DOMAIN_EVENTS = {
  ORDER_CREATED: 'OrderCreated',
  ORDER_VALIDATED: 'OrderValidated',
  INVENTORY_RESERVED: 'InventoryReserved',
  INVENTORY_RELEASED: 'InventoryReleased',
  PAYMENT_INITIATED: 'PaymentInitiated',
  PAYMENT_CONFIRMED: 'PaymentConfirmed',
  PAYMENT_FAILED: 'PaymentFailed',
  PAYMENT_REFUNDED: 'PaymentRefunded',
  WALLET_HELD: 'WalletHeld',
  WALLET_CAPTURED: 'WalletCaptured',
  WALLET_RELEASED: 'WalletReleased',
  WALLET_DEBITED: 'WalletDebited',
  WALLET_CREDITED: 'WalletCredited',
  PROVIDER_SELECTED: 'ProviderSelected',
  PROVIDER_TIMEOUT: 'ProviderTimeout',
  PROVIDER_FAILED: 'ProviderFailed',
  CIRCUIT_BREAKER_TRIPPED: 'CircuitBreakerTripped',
  DELIVERY_SUCCEEDED: 'DeliverySucceeded',
  DELIVERY_FAILED: 'DeliveryFailed',
  DELIVERY_RETRYING: 'DeliveryRetrying',
  SENT_TO_DLQ: 'SentToDLQ',
  FRAUD_DETECTED: 'FraudDetected',
  MANUAL_REVIEW_TRIGGERED: 'ManualReviewTriggered',
  NOTIFICATION_SENT: 'NotificationSent'
};

class EventBusService {
  constructor() {
    this.listeners = new Map();
    this.outboxQueue = [];
    this.eventHistory = [];
  }

  subscribe(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType).push(callback);
    return () => {
      const callbacks = this.listeners.get(eventType) || [];
      this.listeners.set(eventType, callbacks.filter(cb => cb !== callback));
    };
  }

  publish(eventType, payload, correlationId = null) {
    const cid = correlationId || payload?.correlationId || `CID-${Math.floor(100000 + Math.random() * 900000)}`;
    const event = {
      eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      eventType,
      correlationId: cid,
      timestamp: new Date().toISOString(),
      payload
    };

    // 1. Write to Outbox Queue (Atomic Outbox Pattern)
    this.outboxQueue.push({ ...event, status: 'PENDING' });
    this.eventHistory.unshift(event);
    if (this.eventHistory.length > 200) this.eventHistory.pop();

    // 2. Dispatch to subscribers
    const subscribers = this.listeners.get(eventType) || [];
    subscribers.forEach(callback => {
      try {
        callback(event);
      } catch (err) {
        console.error(`Error processing event ${eventType}:`, err);
      }
    });

    // Mark outbox entry as PROCESSED
    const outboxItem = this.outboxQueue.find(i => i.eventId === event.eventId);
    if (outboxItem) outboxItem.status = 'PROCESSED';

    return event;
  }

  getOutboxStatus() {
    return {
      total: this.outboxQueue.length,
      pending: this.outboxQueue.filter(i => i.status === 'PENDING').length,
      processed: this.outboxQueue.filter(i => i.status === 'PROCESSED').length
    };
  }

  getHistory(filterCid = null) {
    if (!filterCid) return this.eventHistory;
    return this.eventHistory.filter(e => e.correlationId === filterCid);
  }
}

export const EventBus = new EventBusService();
