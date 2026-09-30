"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IAP_PRODUCTS = void 0;
exports.resolveIapProduct = resolveIapProduct;
const client_1 = require("@prisma/client");
exports.IAP_PRODUCTS = {
    premium_monthly: { tier: client_1.SubscriptionTier.PREMIUM, cycle: client_1.BillingCycle.MONTHLY },
    premium_yearly: { tier: client_1.SubscriptionTier.PREMIUM, cycle: client_1.BillingCycle.YEARLY },
    gold_monthly: { tier: client_1.SubscriptionTier.GOLD, cycle: client_1.BillingCycle.MONTHLY },
    gold_yearly: { tier: client_1.SubscriptionTier.GOLD, cycle: client_1.BillingCycle.YEARLY },
};
function resolveIapProduct(productId) {
    return exports.IAP_PRODUCTS[productId] ?? null;
}
//# sourceMappingURL=iap-products.js.map