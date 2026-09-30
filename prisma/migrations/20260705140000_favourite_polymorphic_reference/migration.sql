-- Make favourites.reference_id polymorphic: it references a listing OR a
-- vendor depending on `type`. The old hard FK to listings blocked VENDOR
-- favourites (FK violation), so drop it. Owning rows are joined manually.
ALTER TABLE "favourites" DROP CONSTRAINT IF EXISTS "favourite_listing_fk";
