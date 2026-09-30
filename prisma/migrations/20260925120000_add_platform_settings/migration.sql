-- Global platform configuration (single "singleton" row).
CREATE TABLE "platform_settings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "platform_name" TEXT NOT NULL DEFAULT 'Planovar',
    "support_email" TEXT NOT NULL DEFAULT 'support@planovar.com',
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "region" TEXT NOT NULL DEFAULT 'Nigeria',
    "maintenance_mode" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "platform_settings_pkey" PRIMARY KEY ("id")
);
