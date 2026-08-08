/**
 * CurrencyFXEngine.js - Dynamic Multi-Currency FX Engine
 * Supported Currencies: USD, EUR, SAR, AED, YER, EGP
 */

import { MOCK_FX_RATES } from '../../data/mockData';

class CurrencyFXEngineImpl {
  constructor() {
    this.rates = { ...MOCK_FX_RATES };
  }

  convert(amountUSD, targetCurrency) {
    const rate = this.rates[targetCurrency] || 1.0;
    const rawConverted = amountUSD * rate;
    
    // Country-Specific Rounding Rules
    if (targetCurrency === 'SAR' || targetCurrency === 'AED') {
      return parseFloat(rawConverted.toFixed(2));
    } else if (targetCurrency === 'EGP') {
      return Math.round(rawConverted);
    }
    return parseFloat(rawConverted.toFixed(2));
  }

  getRates() {
    return { ...this.rates };
  }
}

export const CurrencyFXEngine = new CurrencyFXEngineImpl();
