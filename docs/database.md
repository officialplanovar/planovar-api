# Database

## Overview

PostgreSQL 16. Managed via **Prisma 7** with `@prisma/adapter-pg` as the runtime driver adapter (required by Prisma 7 since the connection URL is no longer embedded in the schema).

26 tables total across 8 semantic groups.

---

## Connection

The database URL is configured in two places intentionally:

| File | Used by | Purpose |
|---|---|---|
| `.env` → `DATABASE_URL` | Runtime (`PrismaClient`, `PrismaPg`) | Application queries |
| `prisma.config.ts` | Prisma CLI | `migrate`, `studio`, `generate` |

Both read from `DATABASE_URL` in `.env`.

---

## Table groups

### Group 1 — Identity & Auth (Better Auth owned)

> These 4 tables are owned and written by Better Auth. Do not manually insert or alter rows in them.

| Table | Purpose |
|---|---|
| `user` | Registered users (clients, vendors, admins). IDs are Better Auth-generated strings (not UUID). |
| `session` | Active sessions. Better Auth manages expiry and rotation. |
| `account` | OAuth provider accounts and password hashes. One user can have multiple accounts (e.g. Google + email). |
| `verification` | OTP codes and email verification tokens. |

**Important:** `user.id` is a plain `text` column, not `uuid`. All foreign keys referencing `user.id` in application tables are therefore also `text`, not `uuid`. This is intentional — Better Auth generates its own IDs.

---

### Group 2 — Vendor profiles

| Table | Purpose |
|---|---|
| `vendor_profiles` | Extended profile for users with `role = VENDOR`. One-to-one with `user`. Contains business name, location, bank details, subscription tier, rating. |

---

### Group 3 — Listings & discovery

| Table | Purpose |
|---|---|
| `categories` | Hierarchical category tree (self-referential). e.g. Photography > Wedding Photography. |
| `listings` | A vendor's service or product offering. Supports fixed price, quote-based, and starting-from pricing. |
| `listing_media` | Photos and videos attached to a listing. |
| `listing_packages` | Tiered packages within a listing (e.g. Basic, Standard, Premium). |

---

### Group 4 — Bookings

| Table | Purpose |
|---|---|
| `bookings` | Core booking record linking a client, vendor, and listing for a specific event date. Tracks financial amounts (quote, final, platform fee, vendor payout). |
| `booking_status_history` | Immutable audit trail of every status transition. |
| `quotes` | A vendor's formal price quote against a booking request. A booking may have multiple quote iterations. |

**Booking status machine:**

```
PENDING → CONFIRMED → ACTIVE → COMPLETED
       ↘             ↘
        CANCELLED     DISPUTED
```

---

### Group 5 — Payments & finance

| Table | Purpose |
|---|---|
| `transactions` | Every payment event: client payment, refund, payout, subscription charge. Linked to a Paystack reference. |
| `payouts` | Scheduled vendor payout (T+1 fraud buffer). One payout aggregates multiple bookings. |
| `payout_line_items` | Each booking's contribution to a payout, with commission rate at the time of booking. |
| `subscription_plans` | The three plan tiers: Basic (free, 8%), Featured (₦15k/mo, 5.5%), Premium (₦35k/mo, 3%). |
| `vendor_subscriptions` | A vendor's active subscription. Tracks billing period and Paystack subscription code. |

---

### Group 6 — Messaging & communication

| Table | Purpose |
|---|---|
| `conversations` | A messaging thread between a client and vendor. Optionally tied to a booking. |
| `messages` | Individual messages within a conversation. Supports text, images, files, and system messages. |
| `message_attachments` | Files attached to a message (stored in Cloudflare R2, URL stored here). |

---

### Group 7 — Reviews & trust

| Table | Purpose |
|---|---|
| `reviews` | A client's review of a vendor after a completed booking. One review per booking (enforced by `@unique`). |
| `review_responses` | A vendor's public reply to a review. One response per review. |

---

### Group 8 — Platform operations

| Table | Purpose |
|---|---|
| `notifications` | In-app notification inbox for every user. Typed by `NotificationType` enum. |
| `disputes` | Formal dispute raised by a client or vendor against a booking. Resolved by admin. |
| `audit_logs` | Immutable log of all significant actions across the platform for compliance and debugging. |

---

## Key design decisions

**UUIDs for application tables, Better Auth IDs for auth tables**

All tables whose IDs we control use `@default(uuid()) @db.Uuid`. Better Auth's 4 tables use plain `String @id` because Better Auth generates its own IDs internally. This means `user.id` is `text` and all FKs pointing to it are also `text`.

**JSONB columns**

`location` on `vendor_profiles` and `listings` is a `Json` field (maps to `jsonb` in Postgres). This allows flexible location data `{ state, city, lga, lat, lng }` without a separate address table, and supports PostGIS-style proximity queries via Typesense.

**Commission rate stored at payout time**

`payout_line_items.commission_rate` is stored at the moment the payout is created, not derived from the vendor's current subscription. This ensures commission history is immutable even if the vendor changes tiers.

**One review per booking, not per vendor**

`reviews.booking_id` is `@unique`. A client can only review a vendor once per booking, preventing review spam while allowing honest feedback from repeat customers.

---

## Common commands

```bash
# Open visual table browser
npx prisma studio

# Create and apply a new migration after schema changes
npx prisma migrate dev --name describe_your_change

# Regenerate Prisma client after schema changes
npx prisma generate

# Reset database (drops all data — dev only)
npx prisma migrate reset

# From the monorepo root
make db-studio
make db-migrate
make db-reset
```
