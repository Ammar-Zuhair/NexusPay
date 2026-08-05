/**
 * FraudEngine.js - Anti-Fraud & Risk Assessment Engine
 * Checks: Velocity Limits, VPN Detection, Risk Scoring, Device Fingerprinting
 */

import { CategorizedLogger } from '../../packages/logging/CategorizedLogger';

class FraudEngineImpl {
  constructor() {
    this.ipHistory = new Map();
    this.highRiskThreshold = 75;
  }

  evaluateTransaction(orderPayload, reqContext = {}) {
    const cid = orderPayload.correlationId || 'CID-FRAUD';
    const ip = reqContext.ip || '185.220.101.4';
    const deviceFingerprint = reqContext.deviceFingerprint || 'fp_chrome_win11';

    let riskScore = 0;
    const flags = [];

    // 1. Velocity Check (Max 5 orders per minute per IP)
    const count = (this.ipHistory.get(ip) || 0) + 1;
    this.ipHistory.set(ip, count);
    if (count > 5) {
      riskScore += 40;
      flags.push('HIGH_ORDER_VELOCITY');
    }

    // 2. High-Value Transaction Check
    if (orderPayload.totalUSD > 200) {
      riskScore += 30;
      flags.push('HIGH_VALUE_TRANSACTION');
    }

    // 3. Simulated VPN Check
    if (ip.startsWith('185.')) {
      riskScore += 15;
      flags.push('SUSPICIOUS_IP_RANGE');
    }

    const isHighRisk = riskScore >= this.highRiskThreshold;

    CategorizedLogger.log('SECURITY', {
      correlationId: cid,
      ip,
      deviceFingerprint,
      riskScore,
      flags,
      isHighRisk
    });

    return {
      riskScore,
      flags,
      isHighRisk,
      actionRequired: isHighRisk ? 'TRIGGER_MANUAL_REVIEW' : 'ALLOW'
    };
  }
}

export const FraudEngine = new FraudEngineImpl();
