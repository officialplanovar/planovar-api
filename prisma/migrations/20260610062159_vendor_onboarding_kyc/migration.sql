-- CreateEnum
CREATE TYPE "VendorBusinessType" AS ENUM ('LICENSED', 'FREELANCER');

-- CreateEnum
CREATE TYPE "VendorType" AS ENUM ('PRODUCTS', 'SERVICES', 'BOTH');

-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('NOT_SUBMITTED', 'SUBMITTED', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "vendor_profiles" ADD COLUMN     "business_type" "VendorBusinessType",
ADD COLUMN     "cac_document_url" TEXT,
ADD COLUMN     "kyc_rejection_reason" TEXT,
ADD COLUMN     "kyc_reviewed_at" TIMESTAMP(3),
ADD COLUMN     "kyc_reviewed_by" TEXT,
ADD COLUMN     "kyc_status" "KycStatus" NOT NULL DEFAULT 'NOT_SUBMITTED',
ADD COLUMN     "kyc_submitted_at" TIMESTAMP(3),
ADD COLUMN     "logo_url" TEXT,
ADD COLUMN     "nin_document_url" TEXT,
ADD COLUMN     "service_radius_km" INTEGER,
ADD COLUMN     "vendor_type" "VendorType" NOT NULL DEFAULT 'BOTH';

