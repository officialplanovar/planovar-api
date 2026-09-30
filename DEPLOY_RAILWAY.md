# Deploying planovar-api to Railway

The API ships as a Docker image (see `Dockerfile`). Railway builds it, runs
`prisma migrate deploy` on boot, then starts the compiled server (`node dist/main`).

## 1. Provision services (Railway plugins)

| Service | Why | Gives you |
|---|---|---|
| **PostgreSQL** | Primary DB (Prisma) | `DATABASE_URL` |
| **Redis** | BullMQ queues / sessions — **boot-fatal if missing** (`redis.service.ts` does `getOrThrow('REDIS_URL')`) | `REDIS_URL` |
| **Typesense** *(optional at first)* | Search + indexing. Not boot-fatal (client falls back to localhost defaults), but `/search/*` and indexing won't work until it exists. Deploy from the `typesense/typesense` Docker image as a separate Railway service. | `TYPESENSE_HOST/PORT/PROTOCOL/API_KEY` |

Reference Railway's plugin vars with `${{Postgres.DATABASE_URL}}` / `${{Redis.REDIS_URL}}` in the API service's variables.

## 2. Environment variables

**Required (app won't work without these):**
- `DATABASE_URL` — from the Postgres plugin
- `REDIS_URL` — from the Redis plugin
- `BETTER_AUTH_SECRET` — long random string
- `API_BASE_URL` — the public Railway URL of THIS API (e.g. `https://planovar-api.up.railway.app`)
- `TRUSTED_ORIGINS` — comma-separated; the Better Auth allow-list. Include the deployed Flutter web origins + admin console.
- `CORS_ORIGINS` — comma-separated; same web origins.
- `NODE_ENV=production`
- `PAYMENT_PROVIDER=paystack`
- `PAYSTACK_SECRET_KEY`
- `NGN_TO_USD_RATE` (e.g. `1600`)

**Strongly recommended (features silently degrade without them):**
- `UPLOAD_PROVIDER` + `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` — image uploads
- `RESEND_API_KEY` + `EMAIL_FROM` — email / OTP delivery

**Optional (only if the feature is used):**
- `FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` — push notifications
- `LIVEKIT_URL` / `LIVEKIT_API_KEY` / `LIVEKIT_API_SECRET` — voice/video
- `R2_*` — S3/R2 storage (if not using Cloudinary)
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` — only if `PAYMENT_PROVIDER=stripe`
- `FLUTTERWAVE_SECRET_KEY` / `FLUTTERWAVE_SECRET_HASH`
- `PAYMENT_REDIRECT_URL`, `REQUIRE_EMAIL_VERIFICATION`, `LOG_REQUESTS`, `TRANSACTIONS_ENABLED`

> `PORT` is injected by Railway automatically — do **not** set it.

## 3. Deploy

1. New Project → Deploy from GitHub → `officialplanovar/planovar-api` (branch `dev`).
2. Railway detects `railway.json` → builds with the Dockerfile.
3. Add the Postgres + Redis plugins; set the env vars above.
4. First deploy runs `prisma migrate deploy` (applies all 9 migrations to the fresh DB).
5. (Optional) Seed once: run `npm run seed` via a one-off Railway command, or a temporary release step. The seed needs the same `DATABASE_URL`.

## 4. Webhooks (for later, when recurring billing lands)
Point Paystack's webhook at `https://<api-domain>/payments/webhook/paystack`.
The endpoint verifies the HMAC-SHA512 signature with `PAYSTACK_SECRET_KEY`.

## Notes
- The container runs `prisma migrate deploy` on every boot — fine for a single
  instance. If you scale to multiple replicas, move the migrate step to a
  Railway pre-deploy/release command to avoid concurrent migration runs.
- The build uses `nest build` (tsc), **not** the `tsx` dev runner — required so
  decorator metadata is emitted (DI + validation depend on it).
