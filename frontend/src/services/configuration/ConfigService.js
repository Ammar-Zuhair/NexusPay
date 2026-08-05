/**
 * ConfigService.js - Centralized Configuration & Feature Toggle Engine
 * Allows runtime toggling of features without application redeployment.
 */

class ConfigServiceImpl {
  constructor() {
    this.featureFlags = {
      enable_binance_pay: true,
      enable_crypto_usdt: true,
      enable_fawry_local: true,
      enable_code_reservations: true,
      enable_fraud_velocity_checks: true,
      enable_smart_routing: true,
      enable_circuit_breaker: true,
      enable_multi_currency: true,
      enable_dlq_retries: true,
      maintenance_mode: false
    };

    this.businessRules = {
      code_reservation_timeout_minutes: 10,
      max_orders_per_minute_per_ip: 5,
      high_value_order_threshold_usd: 200.00,
      default_profit_margin_percent: 12.5,
      circuit_breaker_failure_threshold: 3,
      circuit_breaker_cooldown_sec: 15
    };
  }

  isFeatureEnabled(flagKey) {
    return !!this.featureFlags[flagKey];
  }

  toggleFeature(flagKey, value = null) {
    if (value === null) {
      this.featureFlags[flagKey] = !this.featureFlags[flagKey];
    } else {
      this.featureFlags[flagKey] = !!value;
    }
    return this.featureFlags[flagKey];
  }

  getRule(ruleKey) {
    return this.businessRules[ruleKey];
  }

  updateRule(ruleKey, value) {
    this.businessRules[ruleKey] = value;
  }

  getAllFlags() {
    return { ...this.featureFlags };
  }

  getAllRules() {
    return { ...this.businessRules };
  }
}

export const ConfigService = new ConfigServiceImpl();
