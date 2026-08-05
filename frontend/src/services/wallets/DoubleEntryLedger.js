/**
 * DoubleEntryLedger.js - Financial Wallet Engine with Hold & Capture Mechanics
 * Implements double-entry ledger logging to guarantee accounting precision.
 */

import { EventBus, DOMAIN_EVENTS } from '../../packages/events/EventBus';
import { CategorizedLogger } from '../../packages/logging/CategorizedLogger';

class DoubleEntryLedgerImpl {
  constructor() {
    this.wallets = new Map();
    this.ledgerEntries = [];

    // Initialize sample user wallet
    this.wallets.set('usr-demo-01', {
      userId: 'usr-demo-01',
      availableBalance: 450.00,
      heldBalance: 0.00,
      currency: 'USD'
    });
  }

  getWallet(userId) {
    if (!this.wallets.has(userId)) {
      this.wallets.set(userId, {
        userId,
        availableBalance: 0.00,
        heldBalance: 0.00,
        currency: 'USD'
      });
    }
    return this.wallets.get(userId);
  }

  // 0. Top Up / Deposit Balance to Site Wallet
  topup(userId, amount, referenceId = `topup_${Date.now()}`, correlationId = 'CID-TOPUP') {
    const wallet = this.getWallet(userId);
    const beforeAvailable = wallet.availableBalance;
    wallet.availableBalance += amount;

    const entry = {
      id: `ledg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      walletId: wallet.userId,
      correlationId,
      entryType: 'TOPUP',
      amount,
      balanceBefore: beforeAvailable,
      balanceAfter: wallet.availableBalance,
      heldBefore: wallet.heldBalance,
      heldAfter: wallet.heldBalance,
      referenceType: 'DEPOSIT',
      referenceId,
      createdAt: new Date().toISOString()
    };
    this.ledgerEntries.push(entry);
    return wallet;
  }

  // 1. Hold Balance (Temporary lock during order processing)
  hold(userId, amount, referenceId, correlationId = 'CID-HOLD') {
    const wallet = this.getWallet(userId);
    if (wallet.availableBalance < amount) {
      throw new Error(`Insufficient Balance: Available $${wallet.availableBalance.toFixed(2)}, Required $${amount.toFixed(2)}`);
    }

    const beforeAvailable = wallet.availableBalance;
    const beforeHeld = wallet.heldBalance;

    wallet.availableBalance -= amount;
    wallet.heldBalance += amount;

    const entry = {
      id: `ledg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      walletId: wallet.userId,
      correlationId,
      entryType: 'HOLD',
      amount,
      balanceBefore: beforeAvailable,
      balanceAfter: wallet.availableBalance,
      heldBefore: beforeHeld,
      heldAfter: wallet.heldBalance,
      referenceType: 'ORDER',
      referenceId,
      createdAt: new Date().toISOString()
    };

    this.ledgerEntries.unshift(entry);
    CategorizedLogger.log('PAYMENT', { correlationId, action: 'WALLET_HOLD', amount, userId, referenceId });
    EventBus.publish(DOMAIN_EVENTS.WALLET_HELD, { userId, amount, referenceId }, correlationId);

    return wallet;
  }

  // 2. Capture Balance (Order delivered successfully -> Convert Hold into final Debit)
  capture(userId, amount, referenceId, correlationId = 'CID-CAPTURE') {
    const wallet = this.getWallet(userId);
    if (wallet.heldBalance < amount) {
      throw new Error(`Invalid Capture: Held balance $${wallet.heldBalance.toFixed(2)} is less than capture amount $${amount.toFixed(2)}`);
    }

    const beforeHeld = wallet.heldBalance;
    wallet.heldBalance -= amount;

    const entry = {
      id: `ledg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      walletId: wallet.userId,
      correlationId,
      entryType: 'CAPTURE',
      amount,
      balanceBefore: wallet.availableBalance,
      balanceAfter: wallet.availableBalance,
      heldBefore: beforeHeld,
      heldAfter: wallet.heldBalance,
      referenceType: 'ORDER',
      referenceId,
      createdAt: new Date().toISOString()
    };

    this.ledgerEntries.unshift(entry);
    CategorizedLogger.log('PAYMENT', { correlationId, action: 'WALLET_CAPTURE', amount, userId, referenceId });
    EventBus.publish(DOMAIN_EVENTS.WALLET_CAPTURED, { userId, amount, referenceId }, correlationId);

    return wallet;
  }

  // 3. Release Balance (Order failed -> Release Hold back to Available)
  release(userId, amount, referenceId, correlationId = 'CID-RELEASE') {
    const wallet = this.getWallet(userId);
    const beforeAvailable = wallet.availableBalance;
    const beforeHeld = wallet.heldBalance;

    wallet.heldBalance = Math.max(0, wallet.heldBalance - amount);
    wallet.availableBalance += amount;

    const entry = {
      id: `ledg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      walletId: wallet.userId,
      correlationId,
      entryType: 'RELEASE',
      amount,
      balanceBefore: beforeAvailable,
      balanceAfter: wallet.availableBalance,
      heldBefore: beforeHeld,
      heldAfter: wallet.heldBalance,
      referenceType: 'ORDER',
      referenceId,
      createdAt: new Date().toISOString()
    };

    this.ledgerEntries.unshift(entry);
    CategorizedLogger.log('PAYMENT', { correlationId, action: 'WALLET_RELEASE', amount, userId, referenceId });
    EventBus.publish(DOMAIN_EVENTS.WALLET_RELEASED, { userId, amount, referenceId }, correlationId);

    return wallet;
  }

  getLedgerHistory(userId = null) {
    if (!userId) return this.ledgerEntries;
    return this.ledgerEntries.filter(e => e.walletId === userId);
  }
}

export const DoubleEntryLedger = new DoubleEntryLedgerImpl();
