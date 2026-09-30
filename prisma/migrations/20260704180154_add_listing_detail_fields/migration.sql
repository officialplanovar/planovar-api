-- AlterTable
ALTER TABLE "listings" ADD COLUMN     "cancellation_policy" TEXT,
ADD COLUMN     "duration_unit" TEXT,
ADD COLUMN     "duration_value" INTEGER,
ADD COLUMN     "sku" TEXT,
ADD COLUMN     "stock_quantity" INTEGER;
