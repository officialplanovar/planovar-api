# planovar-api — Progress Log

Living log. Newest entries on top. Full plan: repo-root `PLANOVAR_BUILD_PLAN.md`.
Decisions of record: repo-root `PLANOVAR_RECONCILIATION.md` + agent memory.

## Status snapshot
- **Current phase:** ✅ Phases 1–4 complete (subs/tier, onboarding+KYC, auth, billing adapters,
  emails, listings, inquiries, quotes, reviews, real-time chat, notifications, Gold-gated LiveKit
  voice). Next: Phase 6 — wire the admin console (planovar-admin-console-web) to the API/DB.
- **Billing rails:** Paystack + Stripe both functional behind the abstraction (switch via `PAYMENT_PROVIDER`).
- **Build:** 🟢 green (`npm run build`, tsc, 0 errors).
- **Mode:** subscription-only (`TRANSACTIONS_ENABLED=false`); billing rail = `PAYMENT_PROVIDER` (default paystack).
- **Port:** 3000.

## Log

### 2026-06-19 — Subscriptions: payment-gated activation ✅ — verified E2E
- **Bug**: paid plans activated immediately (created TRIALING + switched the vendor tier) **before any
  payment**, and switching plans stacked active rows. Now paid plans are **payment-gated**:
  `subscribe`/`change` create a **PAST_DUE (pending)** subscription (invisible to `/me`) + return
  `{status:'pending', checkoutUrl, reference}`; the vendor stays on their **old plan** until paid.
- New `POST /subscriptions/verify {reference}` → `PaymentProvider.verifyTransaction` (Paystack
  `/transaction/verify/:ref`): on `success` activates the pending sub, **cancels the previous one**, and
  switches the tier; on `failed` marks it EXPIRED. `changePlan` now just delegates to `subscribe`.
- Admin revenue now counts **only ACTIVE** (PAST_DUE = pending, not revenue); `/admin/revenue` returns
  `ngnToUsdRate` for the admin's NGN⇄USD toggle.
- **Verified E2E**: change→Premium ⇒ pending + checkout, `/me` still BASIC; change→Gold ⇒ pending, `/me`
  still BASIC (one ACTIVE only); verify(unpaid) ⇒ 400. (Removed the upfront 45-day trial activation.)

### 2026-06-19 — Paid checkout fixed: DI bug + NGN pricing ✅ — verified E2E
- **Root cause of the persistent paid-subscribe 500/503**: billing adapters used
  `constructor(private readonly config: ConfigService)` with **no `@Inject`** — under tsx (no
  `emitDecoratorMetadata`) Nest injected `undefined`, so `this.config.getOrThrow` threw. Added explicit
  `@Inject(ConfigService)` to **all four** adapters (paystack/stripe/paypal/store-iap).
- **Currency**: plans are now priced in **NGN** (canonical — matches the Paystack merchant): Basic ₦0,
  Premium ₦32,000/mo (₦320k/yr), Gold ₦80,000/mo (₦800k/yr). Updated seed + DB.
- **Provider-aware display/charge**: `SubscriptionsService` recalculates to **USD** when
  `PAYMENT_PROVIDER=stripe` at `NGN_TO_USD_RATE` (default 1600 → ₦32,000 = $20). Applied to `listPlans`,
  `getMySubscription`, and `subscribe` (amount + currency). Vendor app shows `₦`/`$` accordingly.
- **Verified E2E**: `/subscriptions/plans` → NGN; Premium subscribe → **201 with a real
  `checkout.paystack.com` URL**.

### 2026-06-18 — Paystack adapter: clearer error on init failure ✅
- Subscribing to a **paid** plan (Premium/Gold) 500'd with an opaque "Failed to initialize Paystack
  subscription" because `PAYSTACK_SECRET_KEY` is a 12-char placeholder (real keys are `sk_test_…`).
- Adapter now logs the underlying Paystack response/error and throws a **503** with an actionable
  message ("Payment provider error: … Check PAYSTACK_SECRET_KEY" / "Could not reach the payment
  provider"). Free **BASIC** plan subscribe works E2E (onboard→subscribe→KYC all 201).
- Paystack initialize now sends `callback_url` (from `successUrl` ← subscribe `callbackUrl`) so the app's
  in-app WebView can detect when checkout finishes.
- ⏭️ Config gap (not code): set a valid `PAYSTACK_SECRET_KEY` to enable paid plans end-to-end.

### 2026-06-18 — Vendor onboard: idempotent + auto-unique slug ✅ — verified E2E
- `VendorsService.onboard` no longer 409s. **Slug collision** → `generateUniqueSlug()` derives the next
  free variant (`name`, `name-2`, …). **Already-onboarded user** → now *updates* the existing profile in
  place (resuming/redoing the setup wizard) instead of throwing "vendor profile already exists".
- Vendor app: `SetupCubit.submit` swallows the "active subscription already exists" error on re-run so
  the rest of the flow (KYC) still completes.
- **Verified E2E**: two vendors named "Slug Test Co" → `slug-test-co` / `slug-test-co-2`; onboarding the
  same user twice → 201 both times with the updated description and an unchanged slug.

### 2026-06-18 — Vendor logo upload endpoint ✅ — verified E2E
- `POST /upload/vendor/logo` (image, ≤5 MB, 512×512, vendors folder) for the onboarding business logo.
  Proof-of-ownership reuses `POST /upload/attachment` (image **or PDF**).
- Cloudinary creds are now fully set → verified E2E: logo → Cloudinary image URL, proof PDF → Cloudinary
  raw URL, both fetch 200. (Local-provider fallback still kicks in automatically if creds are removed.)

### 2026-06-18 — Signup phone: friendly dup error + E.164 normalization ✅ — verified E2E
- **Bug**: vendor/client signup with a phone already in the DB surfaced the raw Prisma `P2002`
  (`phone @unique`) as an opaque 422/500. Also the apps prepended `+234` without stripping the
  national-trunk `0`, so `08132665650` stored as `+23408132665650` — a *different* value from
  `+2348132665650`, letting the same person dodge the anti-dup constraint.
- **Fix** (`auth.config.ts`): `normalizeNgPhone()` collapses `8…`/`08…`/`234…`/`+2340…` to one
  canonical `+234XXXXXXXXXX`; a Better Auth `databaseHooks.user.create.before` normalizes the phone
  and, on an existing match, throws `APIError(UNPROCESSABLE_ENTITY, "This phone number is already
  registered…")`. Vendor register screen also strips a leading `0` before `+234`.
- **Verified E2E**: `8132665650` (dup) → 422 friendly; `08132665650` (same number, 0-prefixed) →
  also 422 (dedupes across formats); fresh `08099990123` → 200, stored as `+2348099990123`.

### 2026-06-17 — Local upload provider (uploads work with no cloud account) ✅ — verified E2E
- New `LocalProvider` (`providers/local.provider.ts`) implements `IStorageProvider`: writes to
  `public/uploads/<folder>/` and returns `<API_BASE_URL>/uploads/...` (served by the existing
  `useStaticAssets('public')`). Registered in UploadModule; `UploadResult.provider` union += `'local'`.
- **Auto-fallback**: UploadService picks `local` when `UPLOAD_PROVIDER=local`, **or** when a cloud
  provider is selected but has no credentials (dev convenience — logs a warning). `UPLOAD_PROVIDER=r2`
  / configured cloudinary still take precedence. `public/uploads/` git-ignored.
- **Verified E2E**: `POST /upload/category/image` → 201 `{provider:'local', url}`; GET that url → 200
  `image/png`. So the admin category image upload now works with zero external accounts.

### 2026-06-17 — Category image upload endpoint ✅
- Added `POST /upload/category/image` (FileInterceptor, SessionAuth) + `uploadCategoryImage` service
  method + `CATEGORIES: planovar/categories` folder (image-only, ≤8 MB, 1200×800). Returns `{url,…}`.
- Verified: route present in Swagger; no-auth → 401. (Real uploads now succeed via the local provider
  fallback above; for prod set `CLOUDINARY_*` or `UPLOAD_PROVIDER=r2` + R2 vars.)

### 2026-06-17 — Categories enrichment (presentation + taxonomy + metrics) ✅ — verified E2E
- **Schema** (`enrich_categories` migration): Category gains `color` (hex), `tags[]`, `keywords[]`
  (search synonyms), `featured`, `popularityScore`, `metadata Json`; `@@index([featured])`.
- **CategoriesService**: `findAllAdmin()` returns ALL categories (incl. inactive) with `_count`
  {listings, children} metrics; `findOne` adds counts; create/update persist the new fields; public
  `findAll` now exposes color/tags/featured (NOT keywords) and orders `featured desc, sortOrder asc`.
- **DTO**: hex-`@Matches` on color, `@ArrayMaxSize` on tags/keywords, featured/popularityScore/metadata.
- **Admin categories controller**: list → `findAllAdmin`; create/update/delete now **audited**
  (`category.created/updated/deactivated`).
- **Verified E2E**: create returns enriched fields; admin list shows `_count`; update persists
  featured+keywords; public `/categories` hides keywords; soft-delete flips isActive; 3 audit rows written.
- ⚠️ **Found (app-wide, pre-existing):** `start:dev` runs via **tsx/esbuild**, which does NOT emit
  `emitDecoratorMetadata` → `ValidationPipe` is **inert in dev** (bad input reaches services; `whitelist`
  off). DTO validation only runs under `nest build`/tsc (prod). Same reason the codebase uses explicit
  `@Inject()` tokens everywhere. Fix = run dev on `nest start --watch` or add an esbuild metadata plugin.
- ⏭️ Search payoff (feeding category `keywords` into the Typesense listing index) deferred — needs a
  collection rebuild + reindex (ensureCollections only creates, doesn't migrate schema).

### 2026-06-16 — Phase 6: admin API surface + audit logging ✅ — verified E2E
- New **AdminService** + controllers under `/admin`: `GET /admin/dashboard` (platform stats + recent activity),
  `GET /admin/revenue` (MRR/ARR + by-tier, yearly amortised /12), `GET /admin/vendors` (filter kyc/tier/search),
  `GET /admin/users` + `GET /admin/users/:id` + `PATCH /admin/users/:id/status` (suspend/reactivate),
  `GET /admin/subscriptions`. All guarded by `SessionAuthGuard + RolesGuard @Roles(ADMIN)`.
- New **AuditService** (`common/audit`, `@Global`): fire-and-forget `record()` + `GET /admin/audit-logs` (filterable).
  Wired into KYC review (`vendor.kyc.approved/rejected`) and user status changes (`user.suspended/reactivated`).
- **CORS** now env-extensible (`CORS_ORIGINS`) + exposes `set-auth-token` so the browser admin SPA can read the
  bearer token; added :3004 to CORS and **Better Auth `trustedOrigins`** (also `TRUSTED_ORIGINS` env).
- **Verified E2E** on the dev API: admin sign-in → bearer token; all six endpoints 200 with real data
  (18 users / 8 vendors); non-admin token → 403; suspend wrote a `user.suspended` audit row (actor + reason).

### 2026-06-16 — Phase 4: voice (LiveKit) backend ✅ — verified
- Installed `livekit-server-sdk`; new `calls` module: `POST /calls/token` {conversationId} →
  `{url, token, roomName: conv_<id>}`. Gated to **GOLD-tier vendors** (participant check + vendor
  subscriptionTier==GOLD; 403 otherwise; 503 if LIVEKIT_* unset).
- Messaging gateway: added `call:invite`/`call:end` relay → emits `call:incoming`/`call:ended` to the
  conversation room (signaling only; media via LiveKit).
- Verified offline (dummy creds): BASIC vendor → 403; GOLD → 201 with signed token.
- Needs real LIVEKIT_URL/API_KEY/API_SECRET for live calls.


### 2026-06-10 — Phase 2: reviews + vendor replies ✅ — verified E2E (backend Phase 2 complete)
- Reviews already had the right gates (COMPLETED booking, client-only, one per booking, vendor
  single reply). Hardened: review create + ratingAvg/reviewCount recompute now **one transaction**
  (count recomputed from aggregate, not increment); **vendor public-profile cache invalidated** on
  rating change (was stale up to 5 min); notifications added (REVIEW_RECEIVED → vendor with star
  count; SYSTEM "vendor replied" → client).
- **E2E-verified**: review on PENDING → 403 · after COMPLETED → created · duplicate → 409 ·
  public profile ratingAvg 4 / reviewCount 1 immediately (cache bust works) · reply 201, second
  reply 409 · vendor list includes response · 2 notification rows.
- **Backend Phase 2 items are now all done** — remaining Phase 2: wire vendor app screens.

### 2026-06-10 — Phase 2: quotes = price proposals; accept → booking confirmed ✅ — verified E2E
- Quotes reframed as **price proposals** on a booking inquiry (payment-structure/installments are
  off-platform terms info only — platform never charges).
- **Accept = "Accept & Book"**: one transaction locks the quote (ACCEPTED) + writes the agreed
  amount onto the booking + auto-CONFIRMS a PENDING booking with a status-history row
  ("Quote accepted"). Fan-out: quote-accepted email+notification → vendor; booking-confirmed
  email+notification → client. Reject notifies the vendor (conversation stays open).
- **Expiry enforced**: accepting past `validUntil` flips the quote to EXPIRED and 409s.
- **Bug fixed**: removed `POST /quotes/:id/send` — it set quotes straight to ACCEPTED (a vendor
  could "accept" their own quote on the client's behalf). Quotes are live (PENDING) from creation.
- Notifications added on create/accept/reject (QUOTE_RECEIVED/ACCEPTED/REJECTED).
- **E2E-verified**: quote → accept → quote ACCEPTED+locked · booking CONFIRMED `final=350000` ·
  history `PENDING→CONFIRMED (Quote accepted)` · 4 notification rows · double-accept 409 · dead
  send route 404.

### 2026-06-10 — Phase 2: inquiry inbox (payment-free bookings) ✅ — verified end-to-end
- Bookings reframed as **inquiries** (no payment anywhere): client create → vendor confirm/reject →
  complete; client cancel. Every transition now writes **BookingStatusHistory** (from/to/changedBy/
  reason) in the same transaction; `findOne` returns the history trail.
- New `GET /bookings?status=&take=&skip=` filter/pagination and **`GET /bookings/inbox/summary`**
  (per-status counts + `actionNeeded` for badges).
- **In-app + FCM notifications** fan out on create/confirm/decline/cancel/complete (NotificationsService
  wired into BookingsModule) alongside the branded emails; email/notify calls are fire-and-forget.
- Hardening: create now validates the listing belongs to the vendor (cross-vendor inquiry mismatch).
- **E2E-verified against the dev DB**: Basic-tier listing → 403 upgrade prompt · GOLD → created ·
  inquiry PENDING → summary `{PENDING:1, actionNeeded:1}` → CONFIRMED → COMPLETED · history trail
  `-→PENDING→CONFIRMED→COMPLETED` · 3 notification rows written.

### 2026-06-10 — Phase 2: logo assets in-project + adaptive emails; listings tier enforcement ✅
- **Branding assets served by the API**: `main.ts` now serves `planovar-api/public/` statically →
  drop logos at `public/branding/planovar-logo-light.png` + `planovar-logo-dark.png`
  (README in that folder documents names/sizes). URLs: `${API_BASE_URL}/branding/...`;
  `EMAIL_LOGO_URL` env still overrides (CDN). Verified 200 over HTTP.
- **Emails adapt to light/dark**: both logo variants embedded; `prefers-color-scheme` swaps
  header/logo (light → white header + light logo; dark → dark surfaces; default/no-support →
  navy header + dark logo, safe in both). Verified refs + media queries in rendered HTML.
- **Listings tier enforcement** (`assertWithinListingLimit`): Basic 0 / Premium 5 / Gold unlimited,
  read from `SubscriptionPlan.listingLimit` (fallbacks if plan row missing); counts active listings;
  ForbiddenException with upgrade prompt.
- **Security fix**: removed client-supplied `vendorId` from CreateListingDto/create flow — any
  authenticated user could previously create listings under any vendor. Vendor is now always
  resolved from the session user.

### 2026-06-10 — Phase 2 kickoff: branded email design system ✅
- Rebuilt `src/common/email/templates/index.ts` on the Planovar brand (from the logo): navy `#0F0D2E`
  header + footer, magenta→indigo→blue gradient bar/buttons (`#C44AE1→#5B50F0→#2D9CFD`), gold `#D9A441`
  sparkle/tagline "Plan better. Celebrate bigger.", CSS-only confetti band (renders with images blocked).
- Logo via `EMAIL_LOGO_URL` env (host the dark-bg PNG on R2/CDN); styled wordmark fallback until set.
- All 12 template signatures preserved (EmailService untouched); copy updated for subscription-only
  model (booking *inquiry*, quote-accept → inquiry, dispute → report). Better Auth OTP mail now uses
  the branded `emailTemplates.otp` (was a bare one-liner); OTP still logs to console outside production.
- Preview renderer → `/tmp/planovar-email-preview.html` (OTP, welcome, inquiry, quote-accepted).

### 2026-06-10 — Tooling: per-folder Makefiles + one-shot `make dev` ✅
- Each repo now has its own self-contained Makefile (deployable independently); root Makefile is a thin
  orchestrator delegating via `make -C`. docker-compose stays here (only the API needs infra).
- Added Postgres + Redis **healthchecks** to docker-compose; `db-up` uses `docker compose up -d --wait`.
- **`make dev`** (root or in planovar-api) = bring up all DBs (wait for health) → `prisma generate` →
  `prisma migrate deploy` → `npm run start:dev`. Verified: containers report healthy, migrations apply.

### 2026-06-10 — Phase 1.5a (backend bit): Better Auth bearer plugin ✅
- Enabled `bearer()` so mobile/web apps authenticate with `Authorization: Bearer <token>`
  (token returned in `set-auth-token` header) instead of cookies. Vendor Flutter auth now wired to this.
- Verified all Phase-1 routes appear in Swagger (`/docs-json`): subscriptions (plans/subscribe/cancel/me/
  billing.webhook), vendors (onboard/me/me.kyc), admin vendors (kyc) + 10 /api/auth/* routes.

### 2026-06-10 — Phase 1.4: Stripe adapter (USD card billing) ✅
- Installed `stripe`. Implemented `StripeAdapter`: Checkout Sessions in `subscription` mode with inline
  `price_data` (no pre-created Price IDs) + `trial_period_days`; `cancelSubscription` (cancel_at_period_end
  or immediate); `verifyAndParseWebhook` (signature-verified, mapped to normalized events).
- Type note: Stripe's CJS `export =` is a namespace under nodenext → used `InstanceType<typeof Stripe>`
  and inferred the event type rather than `Stripe.Event`.
- Added provider-agnostic webhook path: `SubscriptionsService.handleProviderWebhook` +
  `applyWebhookEvent` (activated/renewed/cancelled/payment_failed → updates sub + vendor tier) and a
  signature-verified `POST /subscriptions/billing/webhook` (raw body, no auth). Paystack continues via
  its existing `/payments/webhook/paystack` path.
- `subscribe` now passes successUrl/cancelUrl (from dto.callbackUrl) to the provider.
- Verified: boots clean with `PAYMENT_PROVIDER=stripe`; webhook 200, subscribe 401, plans 200.

### 2026-06-10 — Phase 1.3: Auth hardening + anti-duplicate-signup ✅
- Better Auth: added **Apple** OAuth (env-gated via APPLE_SERVICE_ID + APPLE_CLIENT_SECRET);
  Google now conditional (only when GOOGLE_CLIENT_ID set). Social providers built dynamically.
- Email **OTP now delivered via Resend** in auth.config (console fallback when RESEND_API_KEY unset).
- `requireEmailVerification` is env-driven (`REQUIRE_EMAIL_VERIFICATION`, default false in dev).
- .env.example: fixed stale `API_BASE_URL` (3003→3000), added `REQUIRE_EMAIL_VERIFICATION`,
  `APPLE_CLIENT_SECRET`, `APPLE_APP_BUNDLE_ID`.
- **Anti-duplicate-signup (MoM #18):** `User.phone` is already `@unique` (one phone = one account).
  Added `TrialClaim` ledger (`20260610063248_trial_claims`) + `isTrialAllowed(deviceId, phone)` guard
  in `subscribe`: the 45-day trial is granted only if neither the `x-device-id` nor the phone has
  claimed one before; otherwise the vendor subscribes with no trial (`trialApplied:false`). Records a
  claim when granted. Controller reads the `x-device-id` header.
- Runtime-verified on :3010 — `/api/auth/ok` 200, `/api/auth/get-session` 200, `/subscriptions/subscribe` 401.

### 2026-06-10 — Phase 1.2: Vendor onboarding + KYC ✅
- Schema (`20260610062159_vendor_onboarding_kyc`): added enums `VendorBusinessType` (LICENSED/FREELANCER),
  `VendorType` (PRODUCTS/SERVICES/BOTH), `KycStatus` (NOT_SUBMITTED/SUBMITTED/APPROVED/REJECTED).
  VendorProfile gained `logoUrl`, `businessType`, `vendorType` (default BOTH), `serviceRadiusKm`,
  and KYC fields (`ninDocumentUrl`, `cacDocumentUrl`, `kycStatus`, `kycSubmittedAt`, `kycReviewedAt`,
  `kycReviewedBy`, `kycRejectionReason`).
- Onboard DTO/flow extended with the above; update-vendor too.
- KYC flow: `POST /vendors/me/kyc` (vendor submits NIN, + CAC required for LICENSED) → SUBMITTED;
  admin `GET /admin/vendors/kyc/pending` + `PATCH /admin/vendors/:id/kyc` (approve→isVerified, reject→reason).
  New AdminVendorsController wired into AdminModule.
- Security: split `buildOwnerSelect` (KYC docs) from public `buildVendorSelect`; `getMyProfile` no longer
  writes the owner payload into the shared public vendor cache key (prevents KYC-doc leak via public profile).
- Runtime-verified on a throwaway :3010 instance — onboard/kyc/admin routes 401 (guarded), plans 200.

### 2026-06-10 — Phase 1.1: Subscription & tier model (USD Basic/Premium/Gold) ✅
- Migrated `SubscriptionTier` BASIC/FEATURED/PREMIUM → **BASIC/PREMIUM/GOLD**; added `BillingCycle`
  enum + `EXPIRED` status (migration `20260610060244_subscription_tiers_usd_billing`, authored via
  `prisma migrate diff` + `migrate deploy` since `migrate dev` can't run destructive enum changes non-interactively).
- `SubscriptionPlan`: added `priceYearly`, `currency` (USD), `listingLimit`; `commissionRate` kept @default(0)
  (shelved). `VendorSubscription`: dropped `paystackSubscriptionCode`; added `billingCycle`, `trialEndsAt`,
  `cancelAtPeriodEnd`, `provider`, `providerSubscriptionId` (+ index).
- Seed now USD: Basic $0 (0 listings) · Premium $19.99/$199.99 (5) · Gold $49.99/$499.99 (unlimited). No commission seed.
- Rewrote `SubscriptionsService` onto the **billing abstraction** (`@Inject(PAYMENT_PROVIDER)`): Basic activates
  free immediately; Premium/Gold start a **45-day trial** + provider checkout; cancel = `cancelAtPeriodEnd`.
  Removed admin commission endpoints/DTO. Kept `handleSubscriptionWebhook` (new field names) for the live path.
- **PaystackAdapter** now functional (createSubscription via transaction/initialize, cancel via subscription/disable);
  Stripe/PayPal/IAP still stubs.
- Quick check: `GET /subscriptions/plans` returns the 3 USD plans.

### 2026-06-10 — Phase 0 setup: local DB provisioned ✅
- Brought up Docker (Postgres :5434, Redis :6379, Typesense :8108); applied all 5 migrations; seeded
  (16 categories, 1 country, 44 cities, 3 subscription plans, 3 commission configs).
- Fixed `prisma migrate dev` P1003: `prisma.config.ts` sets an explicit `shadowDatabaseUrl`
  (`.../planovar_shadow`), which Prisma will NOT auto-create. Added
  `docker/initdb/01-create-shadow-db.sql` + a compose mount so the shadow DB is auto-created on fresh
  volumes (e.g. after `make db-reset`). One-off manual fix:
  `docker exec planovar_postgres psql -U postgres -c "CREATE DATABASE planovar_shadow;"`.
- NOTE: seeded plans/commission still use OLD tiers (BASIC/FEATURED/PREMIUM, NGN) — replaced in Phase 1.

### 2026-06-09 — Phase 0: Foundations & guardrails ✅
- Added subscription-only guardrail: `TRANSACTIONS_ENABLED` flag + `TransactionsEnabledGuard`
  (404s payouts and payment initiate/verify/escrow). Webhooks + read endpoints untouched. Nothing deleted.
- Added provider-agnostic billing (`src/modules/billing/`): `PaymentProvider` interface + `PAYMENT_PROVIDER`
  token + adapter stubs (Stripe/Paystack/PayPal/Apple-Google-IAP) + `@Global()` factory by env. Registered in app.module.
- Port 3003 → 3000. `.env` + `.env.example` updated (new flags + all billing rails' keys).
- Fixed pre-existing build breakage (dependency drift): 4 DTO `@ApiProperty({type:'object'})` → add
  `additionalProperties`; `RawBodyRequest` → `import type`; `users.service` favourites fixed to the real
  polymorphic schema (`type`+`referenceId`); device-token platform cast to `DevicePlatform`.
- Repaired local install (`npm install` + `prisma generate`) after a wiped `node_modules/.bin`.
- Deferred to Phase 1: subscription tier schema migration (BASIC/PREMIUM/GOLD, USD, trial, provider fields)
  — coupled to the subscriptions.service rewrite.

## Next (Phase 1)
- Auth (email/pwd, OTP, Google/Apple) hardening + roles; anti-duplicate-signup.
- Vendor onboarding (profile, category tags, vendor type, location) + KYC (NIN+CAC).
- Subscriptions rework: tiers BASIC/PREMIUM/GOLD in USD, monthly/yearly, 45-day trial, upgrade/downgrade/cancel,
  recurring renewal via the billing abstraction; implement Stripe + Paystack adapters.
