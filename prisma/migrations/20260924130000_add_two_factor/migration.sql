-- Better Auth twoFactor plugin: TOTP secret + backup codes per user.
CREATE TABLE "two_factor" (
    "id" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "backup_codes" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "two_factor_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "two_factor_secret_idx" ON "two_factor"("secret");
CREATE INDEX "two_factor_user_id_idx" ON "two_factor"("user_id");

ALTER TABLE "two_factor" ADD CONSTRAINT "two_factor_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
