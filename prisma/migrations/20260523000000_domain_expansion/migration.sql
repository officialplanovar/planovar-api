-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: domain_expansion
-- Applied via: prisma db push (applied to live DB), then resolved in history
-- ─────────────────────────────────────────────────────────────────────────────

-- CreateEnum
CREATE TYPE "public"."ConversationType" AS ENUM ('DIRECT', 'GROUP');

-- CreateEnum
CREATE TYPE "public"."DevicePlatform" AS ENUM ('IOS', 'ANDROID', 'WEB');

-- CreateEnum
CREATE TYPE "public"."EscrowStatus" AS ENUM ('HELD', 'PARTIALLY_RELEASED', 'RELEASED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."EventStatus" AS ENUM ('DRAFT', 'PLANNING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."EventType" AS ENUM ('WEDDING', 'BIRTHDAY', 'ANNIVERSARY', 'CORPORATE', 'CONCERT', 'BURIAL', 'GRADUATION', 'CONFERENCE', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."FavouriteType" AS ENUM ('VENDOR', 'LISTING');

-- CreateEnum
CREATE TYPE "public"."InstallmentStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'WAIVED');

-- CreateEnum
CREATE TYPE "public"."InstallmentType" AS ENUM ('IMMEDIATE', 'ESCROW');

-- CreateEnum
CREATE TYPE "public"."QuotePaymentStructure" AS ENUM ('FULL_UPFRONT', 'INSTALLMENTS', 'CUSTOM_ESCROW');

-- AlterEnum
ALTER TYPE "public"."MediaType" ADD VALUE 'AUDIO';

-- AlterEnum: MessageType (expanded from 4 to 18 values)
ALTER TYPE "public"."MessageType" ADD VALUE 'VOICE';
ALTER TYPE "public"."MessageType" ADD VALUE 'QUOTE';
ALTER TYPE "public"."MessageType" ADD VALUE 'QUOTE_REVISED';
ALTER TYPE "public"."MessageType" ADD VALUE 'INVOICE';
ALTER TYPE "public"."MessageType" ADD VALUE 'INVOICE_ACCEPTED';
ALTER TYPE "public"."MessageType" ADD VALUE 'INVOICE_DECLINED';
ALTER TYPE "public"."MessageType" ADD VALUE 'BOOKING_CONFIRMED';
ALTER TYPE "public"."MessageType" ADD VALUE 'PAYMENT_CONFIRMED';
ALTER TYPE "public"."MessageType" ADD VALUE 'PAYMENT_PENDING';
ALTER TYPE "public"."MessageType" ADD VALUE 'BOOKING_CANCELLED';
ALTER TYPE "public"."MessageType" ADD VALUE 'DISPUTE_RAISED';
ALTER TYPE "public"."MessageType" ADD VALUE 'REVIEW_REQUESTED';
ALTER TYPE "public"."MessageType" ADD VALUE 'REVIEW_SUBMITTED';
ALTER TYPE "public"."MessageType" ADD VALUE 'REFUND_REQUESTED';

-- AlterEnum: NotificationType (9 new values)
ALTER TYPE "public"."NotificationType" ADD VALUE 'INVOICE_RECEIVED';
ALTER TYPE "public"."NotificationType" ADD VALUE 'INVOICE_ACCEPTED';
ALTER TYPE "public"."NotificationType" ADD VALUE 'INVOICE_DECLINED';
ALTER TYPE "public"."NotificationType" ADD VALUE 'PAYMENT_PENDING';
ALTER TYPE "public"."NotificationType" ADD VALUE 'INSTALLMENT_DUE';
ALTER TYPE "public"."NotificationType" ADD VALUE 'ESCROW_RELEASED';
ALTER TYPE "public"."NotificationType" ADD VALUE 'REVIEW_REQUESTED';
ALTER TYPE "public"."NotificationType" ADD VALUE 'REFUND_REQUESTED';
ALTER TYPE "public"."NotificationType" ADD VALUE 'REFUND_PROCESSED';

-- AlterEnum: TransactionType (2 new values)
ALTER TYPE "public"."TransactionType" ADD VALUE 'ESCROW_HOLD';
ALTER TYPE "public"."TransactionType" ADD VALUE 'ESCROW_RELEASE';

-- DropForeignKey (vendor_id becoming nullable on conversations)
ALTER TABLE "public"."conversations" DROP CONSTRAINT "conversations_vendor_id_fkey";

-- AlterTable: bookings
ALTER TABLE "public"."bookings"
  ADD COLUMN "event_id" UUID,
  ADD COLUMN "package_id" UUID;

-- AlterTable: conversations
ALTER TABLE "public"."conversations"
  ADD COLUMN "event_id" UUID,
  ADD COLUMN "group_name" TEXT,
  ADD COLUMN "type" "public"."ConversationType" NOT NULL DEFAULT 'DIRECT',
  ALTER COLUMN "vendor_id" DROP NOT NULL;

-- AlterTable: listing_media
ALTER TABLE "public"."listing_media" ADD COLUMN "public_id" TEXT;

-- AlterTable: listings
ALTER TABLE "public"."listings"
  ADD COLUMN "deposit_amount" DECIMAL(12,2),
  ADD COLUMN "is_rentable" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "per_day_rate" DECIMAL(12,2),
  ADD COLUMN "rating_avg" DECIMAL(3,2) NOT NULL DEFAULT 0,
  ADD COLUMN "review_count" INTEGER NOT NULL DEFAULT 0;

-- AlterTable: message_attachments
ALTER TABLE "public"."message_attachments"
  ADD COLUMN "file_name" TEXT,
  ADD COLUMN "public_id" TEXT;

-- AlterTable: messages
ALTER TABLE "public"."messages"
  ADD COLUMN "metadata" JSONB,
  ADD COLUMN "quote_id" UUID,
  ADD COLUMN "voice_duration" INTEGER,
  ADD COLUMN "voice_url" TEXT;

-- AlterTable: quotes
ALTER TABLE "public"."quotes"
  ADD COLUMN "conversation_id" UUID,
  ADD COLUMN "escrow_percentage" DECIMAL(5,2),
  ADD COLUMN "is_locked" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "locked_at" TIMESTAMP(3),
  ADD COLUMN "notes" TEXT,
  ADD COLUMN "payment_structure" "public"."QuotePaymentStructure" NOT NULL DEFAULT 'FULL_UPFRONT';

-- AlterTable: transactions
ALTER TABLE "public"."transactions"
  ADD COLUMN "flutterwave_reference" TEXT,
  ADD COLUMN "installment_id" UUID;

-- AlterTable: user
ALTER TABLE "public"."user"
  ADD COLUMN "notification_prefs" JSONB,
  ADD COLUMN "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable: vendor_profiles
ALTER TABLE "public"."vendor_profiles"
  ADD COLUMN "email" TEXT,
  ADD COLUMN "phone" TEXT,
  ADD COLUMN "portfolio_urls" TEXT[];

-- CreateTable: commission_config
CREATE TABLE "public"."commission_config" (
    "id" UUID NOT NULL,
    "tier" "public"."SubscriptionTier" NOT NULL,
    "rate" DECIMAL(5,4) NOT NULL,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "commission_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable: conversation_participants
CREATE TABLE "public"."conversation_participants" (
    "id" UUID NOT NULL,
    "conversation_id" UUID NOT NULL,
    "user_id" TEXT NOT NULL,
    "unread_count" INTEGER NOT NULL DEFAULT 0,
    "last_read_at" TIMESTAMP(3),
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "conversation_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable: device_push_tokens
CREATE TABLE "public"."device_push_tokens" (
    "id" UUID NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" "public"."DevicePlatform" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "device_push_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable: escrow_holds
CREATE TABLE "public"."escrow_holds" (
    "id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "installment_id" UUID,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" "public"."EscrowStatus" NOT NULL DEFAULT 'HELD',
    "held_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "released_at" TIMESTAMP(3),
    "released_by" TEXT,
    "release_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "escrow_holds_pkey" PRIMARY KEY ("id")
);

-- CreateTable: event_vendors
CREATE TABLE "public"."event_vendors" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "vendor_id" UUID NOT NULL,
    "booking_id" UUID,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "event_vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable: events
CREATE TABLE "public"."events" (
    "id" UUID NOT NULL,
    "client_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."EventType" NOT NULL DEFAULT 'OTHER',
    "status" "public"."EventStatus" NOT NULL DEFAULT 'DRAFT',
    "event_date" TIMESTAMP(3) NOT NULL,
    "location" JSONB,
    "guest_count" INTEGER,
    "duration_hours" INTEGER,
    "budget_min" DECIMAL(12,2),
    "budget_max" DECIMAL(12,2),
    "cover_url" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable: favourites
CREATE TABLE "public"."favourites" (
    "id" UUID NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "public"."FavouriteType" NOT NULL,
    "reference_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "favourites_pkey" PRIMARY KEY ("id")
);

-- CreateTable: payment_installments
CREATE TABLE "public"."payment_installments" (
    "id" UUID NOT NULL,
    "quote_id" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "percentage" DECIMAL(5,2) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "type" "public"."InstallmentType" NOT NULL DEFAULT 'IMMEDIATE',
    "status" "public"."InstallmentStatus" NOT NULL DEFAULT 'PENDING',
    "due_at" TIMESTAMP(3),
    "paid_at" TIMESTAMP(3),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "payment_installments_pkey" PRIMARY KEY ("id")
);

-- CreateTable: quote_line_items
CREATE TABLE "public"."quote_line_items" (
    "id" UUID NOT NULL,
    "quote_id" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "quote_line_items_pkey" PRIMARY KEY ("id")
);

-- Indexes: commission_config
CREATE UNIQUE INDEX "commission_config_tier_key" ON "public"."commission_config"("tier" ASC);

-- Indexes: conversation_participants
CREATE INDEX "conversation_participants_conversation_id_idx" ON "public"."conversation_participants"("conversation_id" ASC);
CREATE UNIQUE INDEX "conversation_participants_conversation_id_user_id_key" ON "public"."conversation_participants"("conversation_id" ASC, "user_id" ASC);
CREATE INDEX "conversation_participants_user_id_idx" ON "public"."conversation_participants"("user_id" ASC);

-- Indexes: device_push_tokens
CREATE UNIQUE INDEX "device_push_tokens_token_key" ON "public"."device_push_tokens"("token" ASC);
CREATE INDEX "device_push_tokens_user_id_idx" ON "public"."device_push_tokens"("user_id" ASC);

-- Indexes: escrow_holds
CREATE INDEX "escrow_holds_booking_id_idx" ON "public"."escrow_holds"("booking_id" ASC);
CREATE UNIQUE INDEX "escrow_holds_installment_id_key" ON "public"."escrow_holds"("installment_id" ASC);
CREATE INDEX "escrow_holds_status_idx" ON "public"."escrow_holds"("status" ASC);

-- Indexes: event_vendors
CREATE INDEX "event_vendors_event_id_idx" ON "public"."event_vendors"("event_id" ASC);
CREATE UNIQUE INDEX "event_vendors_event_id_vendor_id_key" ON "public"."event_vendors"("event_id" ASC, "vendor_id" ASC);

-- Indexes: events
CREATE INDEX "events_client_id_idx" ON "public"."events"("client_id" ASC);
CREATE INDEX "events_event_date_idx" ON "public"."events"("event_date" ASC);
CREATE INDEX "events_status_idx" ON "public"."events"("status" ASC);

-- Indexes: favourites
CREATE INDEX "favourites_user_id_type_idx" ON "public"."favourites"("user_id" ASC, "type" ASC);
CREATE UNIQUE INDEX "favourites_user_id_type_reference_id_key" ON "public"."favourites"("user_id" ASC, "type" ASC, "reference_id" ASC);

-- Indexes: payment_installments
CREATE INDEX "payment_installments_quote_id_idx" ON "public"."payment_installments"("quote_id" ASC);

-- Indexes: quote_line_items
CREATE INDEX "quote_line_items_quote_id_idx" ON "public"."quote_line_items"("quote_id" ASC);

-- Indexes: bookings (event_id)
CREATE INDEX "bookings_event_id_idx" ON "public"."bookings"("event_id" ASC);

-- Indexes: conversations (event_id)
CREATE INDEX "conversations_event_id_idx" ON "public"."conversations"("event_id" ASC);
CREATE UNIQUE INDEX "conversations_event_id_key" ON "public"."conversations"("event_id" ASC);

-- Indexes: transactions (flutterwave_reference)
CREATE UNIQUE INDEX "transactions_flutterwave_reference_key" ON "public"."transactions"("flutterwave_reference" ASC);

-- Foreign keys: bookings
ALTER TABLE "public"."bookings" ADD CONSTRAINT "bookings_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "public"."bookings" ADD CONSTRAINT "bookings_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "public"."listing_packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Foreign keys: conversation_participants
ALTER TABLE "public"."conversation_participants" ADD CONSTRAINT "conversation_participants_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."conversation_participants" ADD CONSTRAINT "conversation_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Foreign keys: conversations
ALTER TABLE "public"."conversations" ADD CONSTRAINT "conversations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "public"."conversations" ADD CONSTRAINT "conversations_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendor_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Foreign keys: device_push_tokens
ALTER TABLE "public"."device_push_tokens" ADD CONSTRAINT "device_push_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Foreign keys: escrow_holds
ALTER TABLE "public"."escrow_holds" ADD CONSTRAINT "escrow_holds_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."escrow_holds" ADD CONSTRAINT "escrow_holds_installment_id_fkey" FOREIGN KEY ("installment_id") REFERENCES "public"."payment_installments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Foreign keys: event_vendors
ALTER TABLE "public"."event_vendors" ADD CONSTRAINT "event_vendors_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."event_vendors" ADD CONSTRAINT "event_vendors_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Foreign keys: events
ALTER TABLE "public"."events" ADD CONSTRAINT "events_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Foreign keys: favourites
ALTER TABLE "public"."favourites" ADD CONSTRAINT "favourite_listing_fk" FOREIGN KEY ("reference_id") REFERENCES "public"."listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."favourites" ADD CONSTRAINT "favourites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Foreign keys: messages
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Foreign keys: payment_installments
ALTER TABLE "public"."payment_installments" ADD CONSTRAINT "payment_installments_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Foreign keys: quote_line_items
ALTER TABLE "public"."quote_line_items" ADD CONSTRAINT "quote_line_items_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Foreign keys: quotes
ALTER TABLE "public"."quotes" ADD CONSTRAINT "quotes_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Foreign keys: transactions
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_installment_id_fkey" FOREIGN KEY ("installment_id") REFERENCES "public"."payment_installments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
