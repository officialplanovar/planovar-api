-- CreateTable
CREATE TABLE "trial_claims" (
    "id" UUID NOT NULL,
    "vendor_id" UUID NOT NULL,
    "device_id" TEXT,
    "phone" TEXT,
    "claimed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trial_claims_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "trial_claims_device_id_idx" ON "trial_claims"("device_id");

-- CreateIndex
CREATE INDEX "trial_claims_phone_idx" ON "trial_claims"("phone");

