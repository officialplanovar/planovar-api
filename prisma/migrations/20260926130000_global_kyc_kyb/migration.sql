-- Generalize vendor KYC/KYB from Nigeria-specific (NIN/CAC) to global,
-- document-only fields. Rename the existing document columns and add the new
-- ID-type/country and business-registration-country columns (all nullable).

ALTER TABLE "public"."vendor_profiles" RENAME COLUMN "nin_document_url" TO "id_document_url";
ALTER TABLE "public"."vendor_profiles" RENAME COLUMN "cac_document_url" TO "business_reg_document_url";

ALTER TABLE "public"."vendor_profiles"
  ADD COLUMN IF NOT EXISTS "id_type" TEXT,
  ADD COLUMN IF NOT EXISTS "id_country" TEXT,
  ADD COLUMN IF NOT EXISTS "business_reg_country" TEXT;
