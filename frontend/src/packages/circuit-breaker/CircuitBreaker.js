/**
 * CircuitBreaker.js - 3-State Circuit Breaker Resilience Module
 * States: CLOSED (Normal), OPEN (Short-circuit), HALF_OPEN (Trial recovery)
 */

export class CircuitBreaker {
  constructor(name, options = {}) {
    this.name = name;
    this.failureThreshold = options.failureThreshold || 3;
    this.cooldownMs = options.cooldownMs || 15000;
    
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.consecutiveFailures = 0;
    this.consecutiveSuccesses = 0;
    this.lastFailureTime = null;
    this.nextAttempt = Date.now();
  }

  async execute(actionFn, fallbackFn = null) {
    if (this.state === 'OPEN') {
      if (Date.now() >= this.nextAttempt) {
        this.state = 'HALF_OPEN';
        this.consecutiveSuccesses = 0;
      } else {
        if (fallbackFn) return fallbackFn(new Error(`CircuitBreaker [${this.name}] is OPEN`));
        throw new Error(`CircuitBreaker [${this.name}] is OPEN. Fast failing request.`);
      }
    }

    try {
      const result = await actionFn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error);
      if (fallbackFn) return fallbackFn(error);
      throw error;
    }
  }

  onSuccess() {
    this.consecutiveFailures = 0;
    if (this.state === 'HALF_OPEN') {
      this.consecutiveSuccesses++;
      if (this.consecutiveSuccesses >= 2) {
        this.state = 'CLOSED';
      }
    }
  }

  onFailure(error) {
    this.consecutiveFailures++;
    this.lastFailureTime = Date.now();

    if (this.state === 'CLOSED' && this.consecutiveFailures >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.cooldownMs;
    } else if (this.state === 'HALF_OPEN') {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.cooldownMs;
    }
  }

  getStatus() {
    return {
      name: this.name,
      state: this.state,
      consecutiveFailures: this.consecutiveFailures,
      lastFailureTime: this.lastFailureTime ? new Date(this.lastFailureTime).toISOString() : null,
      cooldownRemainingSec: this.state === 'OPEN' ? Math.max(0, Math.ceil((this.nextAttempt - Date.now()) / 1000)) : 0
    };
  }
}
