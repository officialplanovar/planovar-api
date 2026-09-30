-- Apple/Google in-app-purchase linkage on vendor subscriptions.
-- iap_original_txn_id is the stable key store renewal/expiry notifications carry
-- (Apple originalTransactionId / Google purchase token) used to match a webhook
-- back to a subscription. Nullable: web (Stripe/Paystack) subs leave these NULL.
ALTER TABLE "vendor_subscriptions" ADD COLUMN IF NOT EXISTS "iap_platform" TEXT;
ALTER TABLE "vendor_subscriptions" ADD COLUMN IF NOT EXISTS "iap_product_id" TEXT;
ALTER TABLE "vendor_subscriptions" ADD COLUMN IF NOT EXISTS "iap_original_txn_id" TEXT;

CREATE INDEX IF NOT EXISTS "vendor_subscriptions_iap_original_txn_id_idx"
  ON "vendor_subscriptions"("iap_original_txn_id");
