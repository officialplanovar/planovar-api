-- Remove all on-platform client↔vendor payment machinery.
-- Vendor→Planovar subscription billing is unaffected. Invoices are KEPT as
-- display-only agreement records (no payments / milestones / fees).
--
-- This migration is hand-written and destructive (drops tables/columns/types).
-- Do NOT apply it against a database with live payment data you need.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Drop payment tables (FK-safe order: children before parents)
-- ─────────────────────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS "public"."payout_line_items";
DROP TABLE IF EXISTS "public"."transactions";
DROP TABLE IF EXISTS "public"."payouts";
DROP TABLE IF EXISTS "public"."escrow_holds";
DROP TABLE IF EXISTS "public"."payment_installments";
DROP TABLE IF EXISTS "public"."payment_milestones";
DROP TABLE IF EXISTS "public"."commission_config";

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Drop payment columns from surviving tables
-- ─────────────────────────────────────────────────────────────────────────────
-- Bookings: platform fee / vendor payout / rental fee & deposit fields
ALTER TABLE "public"."bookings"
  DROP COLUMN IF EXISTS "platform_fee",
  DROP COLUMN IF EXISTS "vendor_payout",
  DROP COLUMN IF EXISTS "delivery_fee",
  DROP COLUMN IF EXISTS "deposit_amount",
  DROP COLUMN IF EXISTS "late_fee_per_day";

-- Vendor profiles: bank account + Paystack payout/subaccount fields
ALTER TABLE "public"."vendor_profiles"
  DROP COLUMN IF EXISTS "bank_code",
  DROP COLUMN IF EXISTS "bank_account",
  DROP COLUMN IF EXISTS "bank_name",
  DROP COLUMN IF EXISTS "account_name",
  DROP COLUMN IF EXISTS "paystack_recipient_code",
  DROP COLUMN IF EXISTS "paystack_subaccount_code";

-- Subscription plans: unused commission rate
ALTER TABLE "public"."subscription_plans"
  DROP COLUMN IF EXISTS "commission_rate";

-- Quotes: drop structured payment structure/escrow; keep payment_terms as free text
ALTER TABLE "public"."quotes"
  DROP COLUMN IF EXISTS "payment_structure",
  DROP COLUMN IF EXISTS "escrow_percentage";

-- payment_terms was JSONB (structured milestone terms) → now free-text String
ALTER TABLE "public"."quotes"
  ALTER COLUMN "payment_terms" TYPE TEXT USING "payment_terms"::text;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Prune MessageType enum (Postgres requires recreating the type to remove values)
-- ─────────────────────────────────────────────────────────────────────────────
-- Re-home any existing messages that carry a removed value onto SYSTEM.
UPDATE "public"."messages"
  SET "type" = 'SYSTEM'
  WHERE "type" IN (
    'MILESTONE_PAID', 'DEPOSIT_REFUNDED', 'PAYMENT_CONFIRMED',
    'PAYMENT_PENDING', 'REFUND_REQUESTED'
  );

ALTER TABLE "public"."messages" ALTER COLUMN "type" DROP DEFAULT;
ALTER TYPE "public"."MessageType" RENAME TO "MessageType_old";
CREATE TYPE "public"."MessageType" AS ENUM (
  'TEXT', 'IMAGE', 'FILE', 'VOICE',
  'INQUIRY', 'QUOTE', 'QUOTE_REVISED', 'QUOTE_ACCEPTED', 'QUOTE_DECLINED',
  'QUOTE_EXPIRED', 'INVOICE', 'INVOICE_ACCEPTED', 'INVOICE_DECLINED',
  'ORDER_REQUEST', 'ORDER_ACCEPTED', 'ORDER_DECLINED', 'TIMELINE_UPDATE',
  'BOOKING_CONFIRMED', 'BOOKING_CANCELLED',
  'DISPUTE_RAISED', 'REVIEW_REQUESTED', 'REVIEW_SUBMITTED',
  'TODO', 'SYSTEM'
);
ALTER TABLE "public"."messages"
  ALTER COLUMN "type" TYPE "public"."MessageType"
  USING ("type"::text::"public"."MessageType");
ALTER TABLE "public"."messages" ALTER COLUMN "type" SET DEFAULT 'TEXT';
DROP TYPE "public"."MessageType_old";

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Drop now-unused enum types (their columns/tables are gone)
-- ─────────────────────────────────────────────────────────────────────────────
DROP TYPE IF EXISTS "public"."QuotePaymentStructure";
DROP TYPE IF EXISTS "public"."InstallmentType";
DROP TYPE IF EXISTS "public"."InstallmentStatus";
DROP TYPE IF EXISTS "public"."EscrowStatus";
DROP TYPE IF EXISTS "public"."TransactionType";
DROP TYPE IF EXISTS "public"."PayoutStatus";
