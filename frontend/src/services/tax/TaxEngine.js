/**
 * TaxEngine.js - Global VAT & GST Calculation Engine
 */

class TaxEngineImpl {
  constructor() {
    this.vatRates = {
      SA: 0.15, // 15% VAT Saudi Arabia
      AE: 0.05, // 5% VAT UAE
      EG: 0.14, // 14% VAT Egypt
      EU: 0.20, // 20% Avg VAT European Union
      US: 0.00  // Digital Goods Tax Exempt or State Tax
    };
  }

  calculateTax(amountUSD, countryCode = 'SA') {
    const rate = this.vatRates[countryCode] || 0.0;
    const taxAmountUSD = parseFloat((amountUSD * rate).toFixed(2));
    const totalWithTaxUSD = parseFloat((amountUSD + taxAmountUSD).toFixed(2));

    return {
      countryCode,
      taxRatePercent: rate * 100,
      taxAmountUSD,
      totalWithTaxUSD
    };
  }
}

export const TaxEngine = new TaxEngineImpl();
