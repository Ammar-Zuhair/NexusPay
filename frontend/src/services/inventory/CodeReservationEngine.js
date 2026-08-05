/**
 * CodeReservationEngine.js - Digital Code Reservation & Lock System
 * Workflow: Reserve (10m Lock) -> Payment -> Deliver -> Release on Failure/Expiry
 */

import { EventBus, DOMAIN_EVENTS } from '../../packages/events/EventBus';
import { CategorizedLogger } from '../../packages/logging/CategorizedLogger';

class CodeReservationEngineImpl {
  constructor() {
    this.codes = [
      { id: 'cd-101', productId: 'game-4', pinCode: 'STEAM-9921-8812-3301', status: 'AVAILABLE', reservedUntil: null },
      { id: 'cd-102', productId: 'game-4', pinCode: 'STEAM-7712-4410-9921', status: 'AVAILABLE', reservedUntil: null },
      { id: 'cd-103', productId: 'sub-1', pinCode: 'NFLX-SUB-2026-VIP-01', status: 'AVAILABLE', reservedUntil: null },
      { id: 'cd-104', productId: 'lic-1', pinCode: 'WIN11-PRO-KEY-88120-X', status: 'AVAILABLE', reservedUntil: null }
    ];
  }

  reserveCode(productId, orderId, correlationId = 'CID-RESERVE') {
    const available = this.codes.find(c => c.productId === productId && c.status === 'AVAILABLE');
    if (!available) {
      CategorizedLogger.log('ORDER', { correlationId, productId, message: 'Out of Stock: No code available for reservation' });
      return null;
    }

    const lockMinutes = 10;
    available.status = 'RESERVED';
    available.reservedByOrderId = orderId;
    available.reservedUntil = new Date(Date.now() + lockMinutes * 60 * 1000).toISOString();

    CategorizedLogger.log('ORDER', {
      correlationId,
      codeId: available.id,
      orderId,
      status: 'RESERVED',
      expiresAt: available.reservedUntil
    });

    EventBus.publish(DOMAIN_EVENTS.INVENTORY_RESERVED, { codeId: available.id, orderId }, correlationId);
    return available;
  }

  confirmSale(orderId, correlationId = 'CID-DELIVER') {
    const reserved = this.codes.find(c => c.reservedByOrderId === orderId && c.status === 'RESERVED');
    if (!reserved) return null;

    reserved.status = 'SOLD';
    reserved.soldAt = new Date().toISOString();

    CategorizedLogger.log('ORDER', { correlationId, codeId: reserved.id, orderId, status: 'SOLD' });
    return reserved;
  }

  releaseCode(orderId, correlationId = 'CID-RELEASE') {
    const reserved = this.codes.find(c => c.reservedByOrderId === orderId && c.status === 'RESERVED');
    if (!reserved) return false;

    reserved.status = 'AVAILABLE';
    reserved.reservedByOrderId = null;
    reserved.reservedUntil = null;

    CategorizedLogger.log('ORDER', { correlationId, codeId: reserved.id, orderId, status: 'RELEASED' });
    EventBus.publish(DOMAIN_EVENTS.INVENTORY_RELEASED, { codeId: reserved.id, orderId }, correlationId);
    return true;
  }

  getInventoryStatus() {
    return {
      total: this.codes.length,
      available: this.codes.filter(c => c.status === 'AVAILABLE').length,
      reserved: this.codes.filter(c => c.status === 'RESERVED').length,
      sold: this.codes.filter(c => c.status === 'SOLD').length,
      codes: this.codes
    };
  }
}

export const CodeReservationEngine = new CodeReservationEngineImpl();
