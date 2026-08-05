/**
 * BusinessRulesEngine.js - Configurable Rule Evaluator
 * Evaluates: IF VIP Tier AND Order > $100 THEN Apply 5% Discount
 */

class BusinessRulesEngineImpl {
  constructor() {
    this.rules = [
      {
        id: 'rule-vip-discount',
        name: 'VIP High-Volume 5% Discount',
        condition: (user, orderAmount) => user.isVip && orderAmount >= 100.0,
        action: (orderAmount) => orderAmount * 0.05
      },
      {
        id: 'rule-bulk-discount',
        name: 'Bulk Purchase 3% Discount',
        condition: (user, orderAmount) => orderAmount >= 300.0,
        action: (orderAmount) => orderAmount * 0.03
      }
    ];
  }

  evaluateDiscounts(user = { isVip: true }, orderAmount = 150.0) {
    let totalDiscountUSD = 0;
    const appliedRules = [];

    this.rules.forEach(rule => {
      if (rule.condition(user, orderAmount)) {
        const discount = rule.action(orderAmount);
        totalDiscountUSD += discount;
        appliedRules.push({ ruleId: rule.id, name: rule.name, discountUSD: discount });
      }
    });

    return {
      originalAmountUSD: orderAmount,
      totalDiscountUSD,
      finalAmountUSD: Math.max(0, orderAmount - totalDiscountUSD),
      appliedRules
    };
  }
}

export const BusinessRulesEngine = new BusinessRulesEngineImpl();
