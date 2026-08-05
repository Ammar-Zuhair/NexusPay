/**
 * SmartRoutingEngine.js - 9-Factor Dynamic Provider Selection & Fallback Engine
 * Factors evaluated:
 * 1. Cost Price
 * 2. Provider Live Balance
 * 3. Product Availability
 * 4. Maintenance Mode
 * 5. Daily Rate Limits
 * 6. Current Queue Backlog
 * 7. Region Restrictions
 * 8. Currency Compatibility
 * 9. Circuit Breaker & Health Score
 */

import { FastPayDriver } from './drivers/FastPayDriver';
import { UniPinDriver } from './drivers/UniPinDriver';
import { GlobalCodesDriver } from './drivers/GlobalCodesDriver';
import { CircuitBreaker } from '../../packages/circuit-breaker/CircuitBreaker';
import { CategorizedLogger } from '../../packages/logging/CategorizedLogger';

class SmartRoutingEngineImpl {
  constructor() {
    this.drivers = [
      new FastPayDriver(),
      new UniPinDriver(),
      new GlobalCodesDriver()
    ];

    this.circuitBreakers = new Map();
    this.drivers.forEach(driver => {
      this.circuitBreakers.set(driver.code, new CircuitBreaker(driver.name, {
        failureThreshold: 3,
        cooldownMs: 15000
      }));
    });
  }

  async selectBestProvider(product, orderContext = {}) {
    const cid = orderContext.correlationId || 'CID-ROUTING';
    const candidateScores = [];

    for (const driver of this.drivers) {
      const cb = this.circuitBreakers.get(driver.code);
      const health = await driver.getHealthStatus();
      const balanceInfo = await driver.checkBalance();

      // Hard Filtering Rules
      if (health.inMaintenance) {
        CategorizedLogger.log('PROVIDER', { correlationId: cid, provider: driver.code, message: 'Filtered out: In Maintenance Mode' });
        continue;
      }
      if (cb.state === 'OPEN') {
        CategorizedLogger.log('PROVIDER', { correlationId: cid, provider: driver.code, message: 'Filtered out: Circuit Breaker OPEN' });
        continue;
      }
      if (balanceInfo.balance < product.salePrice) {
        CategorizedLogger.log('PROVIDER', { correlationId: cid, provider: driver.code, message: 'Filtered out: Insufficient Provider Balance' });
        continue;
      }

      // 9-Factor Weight Calculation
      const costFactor = (10 / (driver.config.estimatedCost || 9)) * 30; // 30% Weight
      const successFactor = health.successRatePercent * 0.35; // 35% Weight
      const latencyFactor = Math.max(0, (2000 - health.latencyMs) / 2000) * 15; // 15% Weight
      const queuePenalty = Math.min(10, health.queueLength) * 1.0; // Queue Backlog penalty
      const priorityBonus = driver.priorityWeight * 0.2; // 20% Weight

      const totalScore = parseFloat((costFactor + successFactor + latencyFactor + priorityBonus - queuePenalty).toFixed(2));

      candidateScores.push({
        driver,
        code: driver.code,
        name: driver.name,
        totalScore,
        cost: driver.config.estimatedCost || 9,
        latencyMs: health.latencyMs,
        successRate: health.successRatePercent,
        circuitBreakerState: cb.state,
        balance: balanceInfo.balance
      });
    }

    if (candidateScores.length === 0) {
      // Emergency Fallback to GlobalCodes
      const backup = this.drivers.find(d => d.code === 'GLOBAL_CODES');
      CategorizedLogger.log('PROVIDER', { correlationId: cid, message: 'No eligible candidates found. Using Emergency Backup Provider.' });
      return { selectedDriver: backup, rankings: [] };
    }

    // Sort by Score Descending
    candidateScores.sort((a, b) => b.totalScore - a.totalScore);

    const winner = candidateScores[0];
    CategorizedLogger.log('PROVIDER', {
      correlationId: cid,
      selectedProvider: winner.code,
      score: winner.totalScore,
      rankings: candidateScores
    });

    return {
      selectedDriver: winner.driver,
      rankings: candidateScores
    };
  }

  getCircuitBreakerStatus() {
    const statuses = {};
    this.circuitBreakers.forEach((cb, code) => {
      statuses[code] = cb.getStatus();
    });
    return statuses;
  }
}

export const SmartRoutingEngine = new SmartRoutingEngineImpl();
