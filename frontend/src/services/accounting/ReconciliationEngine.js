/**
 * ReconciliationEngine.js - 4-Way Reconciliation Inspector
 * Reconciles state alignment across Provider API, Payment Gateway, Wallet Balance & Order FSM.
 */

import { CategorizedLogger } from '../../packages/logging/CategorizedLogger';

class ReconciliationEngineImpl {
  reconcileOrder(order, gatewayTxStatus, providerApiStatus, walletHoldStatus) {
    const cid = order.correlationId || 'CID-RECON';
    const mismatches = [];

    // Rule 1: Gateway Paid vs Order FSM State
    if (gatewayTxStatus === 'PAID' && order.status === 'CREATED') {
      mismatches.push('GATEWAY_PAID_BUT_ORDER_UNCONFIRMED');
    }

    // Rule 2: Provider Delivered vs Wallet Hold State
    if (providerApiStatus === 'DELIVERED' && walletHoldStatus === 'HELD') {
      mismatches.push('PROVIDER_DELIVERED_BUT_WALLET_NOT_CAPTURED');
    }

    // Rule 3: Provider Failed vs Wallet Released State
    if (providerApiStatus === 'FAILED' && walletHoldStatus === 'HELD') {
      mismatches.push('PROVIDER_FAILED_BUT_WALLET_STILL_HELD');
    }

    const isBalanced = mismatches.length === 0;

    CategorizedLogger.log('AUDIT', {
      correlationId: cid,
      orderId: order.id,
      isBalanced,
      mismatches
    });

    return {
      orderId: order.id,
      isBalanced,
      mismatches,
      reconciledAt: new Date().toISOString()
    };
  }
}

export const ReconciliationEngine = new ReconciliationEngineImpl();
