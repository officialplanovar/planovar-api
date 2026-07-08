-- The specific products/services a client added to an event.
CREATE TABLE "event_listings" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "listing_id" UUID NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "event_listings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "event_listings_event_id_listing_id_key" ON "event_listings"("event_id", "listing_id");
CREATE INDEX "event_listings_event_id_idx" ON "event_listings"("event_id");

ALTER TABLE "event_listings" ADD CONSTRAINT "event_listings_event_id_fkey"
    FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "event_listings" ADD CONSTRAINT "event_listings_listing_id_fkey"
    FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
