-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'YEARLY');

-- AlterEnum
ALTER TYPE "SubscriptionStatus" ADD VALUE 'EXPIRED';

-- AlterEnum
BEGIN;
CREATE TYPE "SubscriptionTier_new" AS ENUM ('BASIC', 'PREMIUM', 'GOLD');
ALTER TABLE "public"."vendor_profiles" ALTER COLUMN "subscription_tier" DROP DEFAULT;
ALTER TABLE "vendor_profiles" ALTER COLUMN "subscription_tier" TYPE "SubscriptionTier_new" USING ("subscription_tier"::text::"SubscriptionTier_new");
ALTER TABLE "subscription_plans" ALTER COLUMN "tier" TYPE "SubscriptionTier_new" USING ("tier"::text::"SubscriptionTier_new");
ALTER TABLE "commission_config" ALTER COLUMN "tier" TYPE "SubscriptionTier_new" USING ("tier"::text::"SubscriptionTier_new");
ALTER TYPE "SubscriptionTier" RENAME TO "SubscriptionTier_old";
ALTER TYPE "SubscriptionTier_new" RENAME TO "SubscriptionTier";
DROP TYPE "public"."SubscriptionTier_old";
ALTER TABLE "vendor_profiles" ALTER COLUMN "subscription_tier" SET DEFAULT 'BASIC';
COMMIT;

-- AlterTable
ALTER TABLE "subscription_plans" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "listing_limit" INTEGER,
ADD COLUMN     "price_yearly" DECIMAL(12,2) NOT NULL DEFAULT 0,
ALTER COLUMN "commission_rate" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "vendor_subscriptions" DROP COLUMN "paystack_subscription_code",
ADD COLUMN     "billing_cycle" "BillingCycle" NOT NULL DEFAULT 'MONTHLY',
ADD COLUMN     "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "provider" TEXT,
ADD COLUMN     "provider_subscription_id" TEXT,
ADD COLUMN     "trial_ends_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "vendor_subscriptions_provider_subscription_id_idx" ON "vendor_subscriptions"("provider_subscription_id");

