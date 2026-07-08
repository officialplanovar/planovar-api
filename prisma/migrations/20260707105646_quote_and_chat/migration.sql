/*
  Warnings:

  - A unique constraint covering the columns `[quote_number]` on the table `quotes` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'PARTIALLY_PAID', 'PAID', 'DECLINED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "FulfilmentType" AS ENUM ('PURCHASE', 'SERVICE', 'RENTAL');

-- CreateEnum
CREATE TYPE "DeliveryMethod" AS ENUM ('DELIVERY', 'PICKUP');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "MessageType" ADD VALUE 'INQUIRY';
ALTER TYPE "MessageType" ADD VALUE 'QUOTE_ACCEPTED';
ALTER TYPE "MessageType" ADD VALUE 'QUOTE_DECLINED';
ALTER TYPE "MessageType" ADD VALUE 'QUOTE_EXPIRED';
ALTER TYPE "MessageType" ADD VALUE 'ORDER_REQUEST';
ALTER TYPE "MessageType" ADD VALUE 'ORDER_ACCEPTED';
ALTER TYPE "MessageType" ADD VALUE 'ORDER_DECLINED';
ALTER TYPE "MessageType" ADD VALUE 'TIMELINE_UPDATE';
ALTER TYPE "MessageType" ADD VALUE 'MILESTONE_PAID';
ALTER TYPE "MessageType" ADD VALUE 'DEPOSIT_REFUNDED';
ALTER TYPE "MessageType" ADD VALUE 'TODO';

-- AlterEnum
ALTER TYPE "QuoteStatus" ADD VALUE 'SUPERSEDED';

-- DropForeignKey
ALTER TABLE "quotes" DROP CONSTRAINT "quotes_booking_id_fkey";

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "delivery_fee" DECIMAL(12,2),
ADD COLUMN     "delivery_method" "DeliveryMethod",
ADD COLUMN     "deposit_amount" DECIMAL(12,2),
ADD COLUMN     "fulfilment_type" "FulfilmentType",
ADD COLUMN     "late_fee_per_day" DECIMAL(12,2),
ADD COLUMN     "pickup_at" TIMESTAMP(3),
ADD COLUMN     "return_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "booking_id" UUID,
ADD COLUMN     "invoice_id" UUID,
ADD COLUMN     "todo_id" UUID;

-- AlterTable
ALTER TABLE "quotes" ADD COLUMN     "client_id" TEXT,
ADD COLUMN     "event_id" UUID,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "listing_id" UUID,
ADD COLUMN     "parent_quote_id" UUID,
ADD COLUMN     "payment_terms" JSONB,
ADD COLUMN     "quote_number" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "booking_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "vendor_profiles" ADD COLUMN     "paystack_subaccount_code" TEXT;

-- CreateTable
CREATE TABLE "invoices" (
    "id" UUID NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "quote_id" UUID,
    "conversation_id" UUID NOT NULL,
    "booking_id" UUID,
    "vendor_id" UUID NOT NULL,
    "client_id" TEXT NOT NULL,
    "event_id" UUID,
    "listing_id" UUID,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'SENT',
    "notes" TEXT,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_line_items" (
    "id" UUID NOT NULL,
    "invoice_id" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoice_line_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_milestones" (
    "id" UUID NOT NULL,
    "invoice_id" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "due_label" TEXT,
    "percentage" DECIMAL(5,2) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "fee_amount" DECIMAL(12,2),
    "status" "InstallmentStatus" NOT NULL DEFAULT 'PENDING',
    "due_at" TIMESTAMP(3),
    "paid_at" TIMESTAMP(3),
    "paystack_reference" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "todos" (
    "id" UUID NOT NULL,
    "conversation_id" UUID NOT NULL,
    "created_by" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "due_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "todos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "todo_assignments" (
    "id" UUID NOT NULL,
    "todo_id" UUID NOT NULL,
    "user_id" TEXT NOT NULL,
    "is_done" BOOLEAN NOT NULL DEFAULT false,
    "done_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "todo_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoice_number_key" ON "invoices"("invoice_number");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_quote_id_key" ON "invoices"("quote_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_booking_id_key" ON "invoices"("booking_id");

-- CreateIndex
CREATE INDEX "invoices_conversation_id_idx" ON "invoices"("conversation_id");

-- CreateIndex
CREATE INDEX "invoices_vendor_id_idx" ON "invoices"("vendor_id");

-- CreateIndex
CREATE INDEX "invoices_client_id_idx" ON "invoices"("client_id");

-- CreateIndex
CREATE INDEX "invoice_line_items_invoice_id_idx" ON "invoice_line_items"("invoice_id");

-- CreateIndex
CREATE INDEX "payment_milestones_invoice_id_idx" ON "payment_milestones"("invoice_id");

-- CreateIndex
CREATE INDEX "payment_milestones_status_idx" ON "payment_milestones"("status");

-- CreateIndex
CREATE INDEX "todos_conversation_id_idx" ON "todos"("conversation_id");

-- CreateIndex
CREATE INDEX "todo_assignments_todo_id_idx" ON "todo_assignments"("todo_id");

-- CreateIndex
CREATE UNIQUE INDEX "todo_assignments_todo_id_user_id_key" ON "todo_assignments"("todo_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "quotes_quote_number_key" ON "quotes"("quote_number");

-- CreateIndex
CREATE INDEX "quotes_conversation_id_idx" ON "quotes"("conversation_id");

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_parent_quote_id_fkey" FOREIGN KEY ("parent_quote_id") REFERENCES "quotes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_todo_id_fkey" FOREIGN KEY ("todo_id") REFERENCES "todos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "quotes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendor_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_milestones" ADD CONSTRAINT "payment_milestones_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "todos" ADD CONSTRAINT "todos_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "todo_assignments" ADD CONSTRAINT "todo_assignments_todo_id_fkey" FOREIGN KEY ("todo_id") REFERENCES "todos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
