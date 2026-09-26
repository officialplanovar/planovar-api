-- Reshape EventType to five broad areas + a catch-all, and let vendors declare
-- which event types they serve.
--
-- New enum values: WEDDING, FUNERAL, BIRTHDAY, CORPORATE, SOCIAL_PARTY, OTHER.
-- Removed values (BURIAL, CONFERENCE, ANNIVERSARY, CONCERT, GRADUATION) are
-- remapped onto the new set. Postgres cannot drop/rename enum values in place,
-- so the enum is recreated via the standard rename-old / create-new / cast dance.
--
-- Order matters: remap existing events.type data during the column re-type,
-- recreate the enum, THEN add the new vendor column using the new enum type.

-- 1. Drop the default so the column can be re-typed independently of the enum.
ALTER TABLE "public"."events" ALTER COLUMN "type" DROP DEFAULT;

-- 2. Rename the existing enum out of the way and create the new one.
ALTER TYPE "public"."EventType" RENAME TO "EventType_old";
CREATE TYPE "public"."EventType" AS ENUM ('WEDDING', 'FUNERAL', 'BIRTHDAY', 'CORPORATE', 'SOCIAL_PARTY', 'OTHER');

-- 3. Re-type events.type, remapping removed values onto the new set:
--    BURIAL -> FUNERAL, CONFERENCE -> CORPORATE,
--    ANNIVERSARY/CONCERT/GRADUATION -> SOCIAL_PARTY.
ALTER TABLE "public"."events"
  ALTER COLUMN "type" TYPE "public"."EventType"
  USING (
    CASE "type"::text
      WHEN 'BURIAL' THEN 'FUNERAL'
      WHEN 'CONFERENCE' THEN 'CORPORATE'
      WHEN 'ANNIVERSARY' THEN 'SOCIAL_PARTY'
      WHEN 'CONCERT' THEN 'SOCIAL_PARTY'
      WHEN 'GRADUATION' THEN 'SOCIAL_PARTY'
      ELSE "type"::text
    END
  )::"public"."EventType";

-- 4. Restore the default and drop the old enum.
ALTER TABLE "public"."events" ALTER COLUMN "type" SET DEFAULT 'OTHER';
DROP TYPE "public"."EventType_old";

-- 5. Add the vendor event-type tags column, typed with the new enum.
ALTER TABLE "public"."vendor_profiles"
  ADD COLUMN IF NOT EXISTS "event_types" "public"."EventType"[] DEFAULT ARRAY[]::"public"."EventType"[];
