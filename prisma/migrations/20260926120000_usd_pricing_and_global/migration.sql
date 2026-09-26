-- USD pricing + global platform.
--
-- Hand-authored, NON-destructive data/default correction. Planovar is now a
-- global, USD-native platform; the only on-platform payment is the vendor
-- subscription. This migration:
--   (a) column types: NONE — subscription_plans.price_monthly/price_yearly are
--       already numeric(12,2), so no ALTER TYPE is required.
--   (b) rewrites the seeded subscription plan prices/currency to USD.
--   (c) flips the platform_settings.currency default (and existing NGN rows)
--       from NGN to USD.
--
-- Do NOT auto-apply from this review; deploy via the normal migration pipeline.

-- ─────────────────────────────────────────────────────────────────────────────
-- (b) One-time correction of existing subscription plan pricing to USD.
--     Matches prisma/seed/seed.ts (MoM-00005 #24).
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE "public"."subscription_plans"
  SET "price_monthly" = 0, "price_yearly" = 0, "currency" = 'USD'
  WHERE "tier" = 'BASIC';

UPDATE "public"."subscription_plans"
  SET "price_monthly" = 19.99, "price_yearly" = 199.99, "currency" = 'USD'
  WHERE "tier" = 'PREMIUM';

UPDATE "public"."subscription_plans"
  SET "price_monthly" = 49.99, "price_yearly" = 499.99, "currency" = 'USD'
  WHERE "tier" = 'GOLD';

-- ─────────────────────────────────────────────────────────────────────────────
-- (c) platform_settings.currency: default NGN → USD, and correct existing rows.
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE "public"."platform_settings"
  ALTER COLUMN "currency" SET DEFAULT 'USD';

UPDATE "public"."platform_settings"
  SET "currency" = 'USD'
  WHERE "currency" = 'NGN';
