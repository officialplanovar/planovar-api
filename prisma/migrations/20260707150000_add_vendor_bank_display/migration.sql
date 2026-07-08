-- Bank display fields for the vendor's receiving account (direct-pay setup)
ALTER TABLE "vendor_profiles" ADD COLUMN "bank_name" TEXT;
ALTER TABLE "vendor_profiles" ADD COLUMN "account_name" TEXT;
