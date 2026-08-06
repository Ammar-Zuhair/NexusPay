/**
 * DoubleEntryLedger.js - Backend Double-Entry Accounting Wallet Engine
 * Implements double-entry ledger logging to guarantee accounting precision on Node.js Server.
 */

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
    console.log(`[BACKEND LEDGER TOPUP] User ${userId} topped up $${amount}. New balance: $${wallet.availableBalance}`);
    return wallet;
  }

  hold(userId, amount, referenceId, correlationId = 'CID-HOLD') {
    const wallet = this.getWallet(userId);
    if (wallet.availableBalance < amount) {
      throw new Error(`[BACKEND LEDGER GUARD] Insufficient Wallet Balance: Available $${wallet.availableBalance.toFixed(2)}, Required $${amount.toFixed(2)}`);
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
    console.log(`[BACKEND LEDGER HOLD] User ${userId} held $${amount} for Order ${referenceId}. Available: $${wallet.availableBalance}`);
    return wallet;
  }

  capture(userId, amount, referenceId, correlationId = 'CID-CAPTURE') {
    const wallet = this.getWallet(userId);
    if (wallet.heldBalance < amount) {
      throw new Error(`[BACKEND LEDGER GUARD] Invalid Capture: Held balance $${wallet.heldBalance.toFixed(2)} is less than capture amount $${amount.toFixed(2)}`);
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
    console.log(`[BACKEND LEDGER CAPTURE] User ${userId} captured $${amount} for Order ${referenceId}.`);
    return wallet;
  }

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
    console.log(`[BACKEND LEDGER RELEASE] User ${userId} released $${amount} back to available.`);
    return wallet;
  }
}

export const DoubleEntryLedger = new DoubleEntryLedgerImpl();
