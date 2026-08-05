/**
 * MarketplaceCommissionEngine.js - Vendor Marketplace Commission Engine
 * Calculates: Vendor Payout = Total Sale Amount * (1 - Vendor Commission %)
 */

class MarketplaceCommissionEngineImpl {
  calculateVendorPayout(saleAmountUSD, commissionPercent = 5.0) {
    const platformCommissionUSD = parseFloat((saleAmountUSD * (commissionPercent / 100)).toFixed(2));
    const vendorPayoutUSD = parseFloat((saleAmountUSD - platformCommissionUSD).toFixed(2));

    return {
      saleAmountUSD,
      commissionPercent,
      platformCommissionUSD,
      vendorPayoutUSD
    };
  }
}

export const MarketplaceCommissionEngine = new MarketplaceCommissionEngineImpl();
