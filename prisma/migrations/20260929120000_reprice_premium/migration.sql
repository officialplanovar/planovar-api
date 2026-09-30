-- Reprice Premium to $24.99 / $249.99 (client decision, 2026-09-29).
-- Applied on top of the earlier USD-pricing migration so already-migrated
-- environments are corrected on the next deploy. Gold and Basic unchanged.
UPDATE "public"."subscription_plans"
  SET "price_monthly" = 24.99, "price_yearly" = 249.99
  WHERE "tier" = 'PREMIUM';
