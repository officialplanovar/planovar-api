# Infrastructure & Third-Party Services

This document covers every external service the Planovar API depends on, what you need to set up in each service's console, and which environment variables to populate.

Read this document **before** starting integration testing. All the variables listed here are required for the corresponding features to function. Features that depend on unconfigured services will either throw on startup or log warnings and degrade gracefully, depending on how the module is written.

---

## Table of contents

1. [Better Auth secret](#1-better-auth-secret)
2. [Google OAuth](#2-google-oauth)
3. [Apple OAuth (Sign in with Apple)](#3-apple-oauth-sign-in-with-apple)
4. [Cloudinary (file storage & media)](#4-cloudinary-file-storage--media)
5. [Paystack (primary payments)](#5-paystack-primary-payments)
6. [Flutterwave (payment fallback)](#6-flutterwave-payment-fallback)
7. [Firebase Cloud Messaging (push notifications)](#7-firebase-cloud-messaging-push-notifications)
8. [LiveKit (in-app voice & video calls)](#8-livekit-in-app-voice--video-calls)
9. [Resend (transactional email)](#9-resend-transactional-email)
10. [Typesense (search)](#10-typesense-search)
11. [Redis](#11-redis)
12. [Sentry (error monitoring)](#12-sentry-error-monitoring)
13. [Railway (hosting)](#13-railway-hosting)
14. [Full .env reference](#14-full-env-reference)

---

## 1. Better Auth secret

**Purpose:** Signs and verifies all session tokens. Must be a strong, random string — treat it like a database password.

**What to do:**

```bash
# Inside planovar-api/, run:
npx auth secret
# Or generate one manually (min 32 chars):
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output into `.env`:

```env
BETTER_AUTH_SECRET=paste_generated_secret_here
```

**Rules:**
- Never reuse the same secret across environments.
- If this secret changes in production, all active sessions are immediately invalidated (all users logged out).
- The placeholder `change-me-in-production` in `.env.example` must not be deployed.

---

## 2. Google OAuth

**Purpose:** Allows users to sign in with their Google account on both the client and vendor Flutter apps.

**What to do:**

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project named `Planovar` (or select an existing one)
3. Navigate to **APIs & Services → OAuth consent screen**
   - User type: **External**
   - App name: `Planovar`
   - Authorised domain: `planovar.ng` (or your domain)
   - Save
4. Navigate to **APIs & Services → Credentials → Create Credentials → OAuth Client ID**
   - Application type: **Web application**
   - Name: `Planovar API`
   - Authorised JavaScript origins:
     ```
     http://localhost:3000
     https://api.planovar.ng
     ```
   - Authorised redirect URIs:
     ```
     http://localhost:3000/api/auth/callback/google
     https://api.planovar.ng/api/auth/callback/google
     ```
5. Click **Create** — copy the **Client ID** and **Client Secret**

```env
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_client_secret
```

**Flutter note:** On mobile, the `google_sign_in` Flutter package handles the OAuth flow natively. It returns an ID token which is sent to the backend. You also need an **Android OAuth client** (for the Android app) and an **iOS OAuth client** (for the iOS app) — both created under the same Google Cloud project, same credentials page. The mobile client IDs go into the Flutter project's config, not the backend `.env`.

---

## 3. Apple OAuth (Sign in with Apple)

**Purpose:** Required for iOS App Store submission if you offer any third-party social login. Allows users to sign in with their Apple ID.

**Requirements:**
- An active Apple Developer Program membership ($99/year)

**What to do:**

### Step A — Register an App ID

1. Go to [developer.apple.com](https://developer.apple.com) → **Certificates, Identifiers & Profiles → Identifiers**
2. Click **+** → **App IDs** → **App** → Continue
3. Set Bundle ID: `ng.planovar.client` (reverse domain, match your Flutter project)
4. Under **Capabilities**, check **Sign In with Apple** → Continue → Register

### Step B — Create a Service ID (for web/backend OAuth)

1. **Identifiers → +** → **Services IDs** → Continue
2. Identifier: `ng.planovar.signin`
3. Description: `Planovar Sign In`
4. Check **Sign In with Apple** → **Configure**:
   - Primary App ID: select `ng.planovar.client` (from Step A)
   - Domains: `planovar.ng`
   - Return URLs:
     ```
     https://api.planovar.ng/api/auth/callback/apple
     http://localhost:3000/api/auth/callback/apple
     ```
5. Save → Continue → Register

```env
APPLE_SERVICE_ID=ng.planovar.signin
```

### Step C — Create a private key

1. **Keys → +**
2. Name: `Planovar Sign In Key`
3. Check **Sign In with Apple** → Configure → select your App ID → Save
4. Register → **Download the `.p8` file** (you can only download it once)
5. Note the **Key ID** shown on the page

```env
APPLE_KEY_ID=XXXXXXXXXX
```

### Step D — Get your Team ID

1. Go to [developer.apple.com/account](https://developer.apple.com/account)
2. Your Team ID is shown in the top right corner under your name

```env
APPLE_TEAM_ID=XXXXXXXXXX
```

### Step E — Add the private key content

Open the downloaded `.p8` file in a text editor. Copy the entire content including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines. Because `.env` files can't contain literal newlines in values, encode them as `\n`:

```bash
# macOS — copies the .p8 content with \n-encoded newlines to clipboard
awk 'NR==1{printf "%s",$0; next}{printf "\\n%s",$0}' AuthKey_XXXXXXXXXX.p8 | pbcopy
```

Then paste it into `.env`:

```env
APPLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIB...\n-----END PRIVATE KEY-----
```

---

## 4. Cloudinary (file storage & media)

**Purpose:** Stores and serves all user-generated media — vendor cover images, listing photos, user avatars, voice notes (audio files), message image attachments, and any future document uploads. Cloudinary is the primary provider. The upload layer is designed as a swappable provider interface, so migrating to R2 later requires only a configuration change.

**Supported file types:** Images (JPEG, PNG, WebP, HEIC), video, audio (MP3, M4A, OGG — used for voice messages), PDF and raw files. Not image-only.

**What to do:**

1. Go to [cloudinary.com](https://cloudinary.com) → Sign up or log in
2. Open your **Dashboard** (the home page after login)
3. Copy your credentials:
   - **Cloud name** — shown at the top (e.g. `dxyz12345`)
   - **API key**
   - **API secret**

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

4. (Optional but recommended) Create **Upload Presets** for each asset type:
   - Go to **Settings → Upload → Upload presets → Add upload preset**
   - One for `avatars` (folder: `planovar/avatars`, crop: fill 400×400)
   - One for `listings` (folder: `planovar/listings`, allowed formats: jpg,png,webp)
   - One for `voice_notes` (folder: `planovar/voice`, allowed formats: mp3,m4a,ogg,webm)
   - Preset mode: **Signed** (the backend signs every upload)

5. (Optional) Set up a **Cloudinary folder structure** convention:
   ```
   planovar/
   ├── avatars/         user profile photos
   ├── vendors/         vendor cover images
   ├── listings/        listing photos
   ├── voice_notes/     audio message attachments
   └── attachments/     other message file attachments
   ```

**Free tier limits (as of 2025):**
- 25 GB storage
- 25 GB bandwidth/month
- Unlimited transformations (within the monthly transformation credits)

When approaching the free tier limit, the upload module's provider can be switched to Cloudflare R2 by changing `UPLOAD_PROVIDER=r2` in `.env` — no code change required.

```env
UPLOAD_PROVIDER=cloudinary
```

---

## 5. Paystack (primary payments)

**Purpose:** All client payments for bookings. Handles card payments, bank transfers, USSD. Also used for vendor payouts via Transfers API and for vendor subscription billing.

**What to do:**

1. Go to [paystack.com](https://paystack.com) → Sign up or log in
2. Complete business verification (required for live keys)
3. Go to **Settings → API Keys & Webhooks**
4. Copy your **Test Secret Key** and **Test Public Key** for development
5. Copy your **Live Secret Key** and **Live Public Key** for production

```env
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxx
PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxx
```

### Webhook setup

1. On the same page, find **Webhook URL**
2. Enter your API webhook endpoint:
   - Dev (use [ngrok](https://ngrok.com) or similar): `https://your-tunnel.ngrok.io/payments/webhook/paystack`
   - Staging/Production: `https://api.planovar.ng/payments/webhook/paystack`
3. Paystack will show you a **Webhook Secret** — copy it

```env
PAYSTACK_WEBHOOK_SECRET=your_webhook_secret
```

The webhook handler verifies the HMAC-SHA512 signature on every incoming event before processing. Never skip this verification.

### Transfers (vendor payouts)

To send money to vendors, you need to:
1. Enable **Transfers** in your Paystack dashboard (Settings → Preferences)
2. Ensure your Paystack account has sufficient balance or a linked bank account for float
3. Each vendor must have a stored Paystack **Transfer Recipient code** (created via API when vendor adds bank details during onboarding — handled by the Vendors module)

### Subaccounts (split payments / commission)

For Planovar's commission model, you can use Paystack **Subaccounts** to split payments at collection time:
- Create a subaccount per vendor on their onboarding
- Specify the commission percentage when charging
- Paystack splits automatically

Or alternatively, collect the full amount and transfer the vendor's share minus commission at payout time. The implementation uses the latter (manual split) by default, but the subaccount approach can be layered in.

```env
PAYSTACK_SUBACCOUNT_ENABLED=false
```

---

## 6. Flutterwave (payment fallback)

**Purpose:** Fallback payment processor used when Paystack is unavailable or a user's card is not supported by Paystack. The payment module automatically falls back to Flutterwave after a configurable number of Paystack failures.

**What to do:**

1. Go to [flutterwave.com](https://flutterwave.com) → Sign up or log in
2. Complete business KYC
3. Go to **Settings → API** → copy your keys

```env
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-xxxxxxxxxxxxxxxxxxxx
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-xxxxxxxxxxxxxxxxxxxx
FLUTTERWAVE_ENCRYPTION_KEY=xxxxxxxxxxxxxxxxxxxx
```

### Webhook setup

1. Go to **Settings → Webhooks**
2. URL: `https://api.planovar.ng/payments/webhook/flutterwave`
3. Secret hash: create a strong random string and set it here AND in `.env`

```env
FLUTTERWAVE_WEBHOOK_SECRET=your_flutterwave_webhook_secret
```

---

## 7. Firebase Cloud Messaging (push notifications)

**Purpose:** Sends push notifications to Flutter apps on iOS and Android. Used for booking updates, new messages, quote received, payment confirmed, etc.

**What to do:**

### Step A — Create a Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → Name it `Planovar`
3. Disable Google Analytics (optional) → **Create project**

### Step B — Enable Cloud Messaging

1. In your project, go to **Project settings** (gear icon)
2. Click the **Cloud Messaging** tab
3. Firebase Cloud Messaging API (V1) should be enabled by default. If you see a prompt to enable it, do so.
4. Note your **Sender ID** (not needed in `.env`, but needed in the Flutter app's `google-services.json` / `GoogleService-Info.plist`)

### Step C — Generate a service account key

1. In Project settings → **Service accounts** tab
2. Click **Generate new private key** → **Generate key**
3. A JSON file downloads — open it

Copy the following three values into `.env`:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIEo...\n-----END RSA PRIVATE KEY-----\n"
```

**Important:** The private key contains literal newlines. In `.env`, they must be represented as `\n` within a quoted string (use double quotes around the value).

```bash
# macOS — encode the private_key field with \n newlines and copy to clipboard:
cat your-firebase-key.json | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['private_key'].replace('\n','\\\\n'))" | pbcopy
```

### Step D — Add Firebase to Flutter apps

Each Flutter app needs its own Firebase config file. In the Firebase console:

1. **Project settings → Your apps → Add app**
2. For the client app:
   - iOS → Bundle ID: `ng.planovar.client` → download `GoogleService-Info.plist` → place in `ios/Runner/`
   - Android → Package name: `ng.planovar.client` → download `google-services.json` → place in `android/app/`
3. For the vendor app:
   - iOS → Bundle ID: `ng.planovar.vendor` → separate `GoogleService-Info.plist`
   - Android → Package name: `ng.planovar.vendor` → separate `google-services.json`

---

## 8. LiveKit (in-app voice & video calls)

**Purpose:** Real-time voice and video calls within the chat screen. LiveKit is a self-hostable WebRTC media server. The API generates access tokens; the Flutter apps use the LiveKit Flutter SDK to connect.

**Option A — LiveKit Cloud (recommended for getting started)**

1. Go to [livekit.io](https://livekit.io) → Sign up
2. Create a new project → Name it `planovar`
3. Note the **WebSocket URL** (e.g. `wss://planovar-xxxx.livekit.cloud`)
4. Go to **Settings → Keys** → Create a new API key
5. Copy the **API Key** and **API Secret**

```env
LIVEKIT_URL=wss://planovar-xxxx.livekit.cloud
LIVEKIT_API_KEY=APIxxxxxxxxxxxxxxx
LIVEKIT_API_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Option B — Self-hosted LiveKit**

Run LiveKit via Docker:
```bash
docker run --rm \
  -p 7880:7880 \
  -p 7881:7881 \
  -p 7882:7882/udp \
  -e LIVEKIT_KEYS="devkey: devsecret" \
  livekit/livekit-server \
  --dev
```

```env
LIVEKIT_URL=ws://localhost:7880
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=devsecret
```

**How it works in Planovar:**
- When a user initiates a call from the chat screen, the Flutter app calls the API: `POST /calls/token`
- The API generates a LiveKit access token scoped to a room named after the conversation ID
- The Flutter app uses that token + `LIVEKIT_URL` to connect directly to the LiveKit server
- The API does not proxy media — it only generates tokens

---

## 9. Resend (transactional email)

**Purpose:** Sends all transactional emails: OTP verification, booking confirmations, quote notifications, password reset, payout notifications, dispute updates.

**What to do:**

### Step A — Create a Resend account

1. Go to [resend.com](https://resend.com) → Sign up
2. Go to **API Keys → Create API Key**
3. Name: `Planovar API` → Permission: **Full access**

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
```

### Step B — Verify your sending domain

Without domain verification, Resend only lets you send to the address you signed up with (sandbox mode). To send to any address:

1. In Resend → **Domains → Add Domain**
2. Enter: `planovar.ng`
3. Resend will give you DNS records to add:
   - SPF record (TXT)
   - DKIM record (TXT, 3 entries)
   - DMARC record (TXT)
4. Add these in your DNS provider (Cloudflare, Namecheap, etc.)
5. Click **Verify** in Resend — may take up to 48 hours for DNS propagation, usually minutes

```env
EMAIL_FROM=noreply@planovar.ng
```

The `EMAIL_FROM` address must be `@planovar.ng` (or a subdomain of it) once the domain is verified.

### Step C — Dev mode

Before the domain is verified, all emails are only delivered to the Resend sandbox. During development, OTPs are also printed to the API terminal as a fallback — so you do not need Resend configured to test auth flows locally.

---

## 10. Typesense (search)

**Purpose:** Powers the smart search and recommendation engine — vendor and listing search with fuzzy matching, geo-proximity ranking, budget filtering, and category awareness. Also drives event-context vendor recommendations.

### Development (Docker — no setup needed)

Typesense runs automatically via `docker compose up -d`. The dev API key is `xyz` (set in `docker-compose.yml`).

```env
TYPESENSE_HOST=localhost
TYPESENSE_PORT=8108
TYPESENSE_PROTOCOL=http
TYPESENSE_API_KEY=xyz
```

### Production (Typesense Cloud)

1. Go to [cloud.typesense.org](https://cloud.typesense.org) → Sign up
2. Create a **Cluster**:
   - Region: `eu-west` or `us-east` (whichever is closer to your Railway deployment)
   - Memory: 0.5 GB (smallest) is fine for early stage
3. Once provisioned, go to **Clusters → your cluster → Overview**
4. Copy:
   - **Hostname** (e.g. `xxx.a1.typesense.net`)
   - **Port**: `443`
   - **Protocol**: `https`
   - **API Key** (admin key — store securely, rotate periodically)

```env
TYPESENSE_HOST=xxx.a1.typesense.net
TYPESENSE_PORT=443
TYPESENSE_PROTOCOL=https
TYPESENSE_API_KEY=your_admin_api_key
```

**Search-only key (for the Flutter client):**

In Typesense Cloud → your cluster → **API Keys → Generate Search-Only API Key**. This key can be embedded in the Flutter app (it can search but not write). Add it to the Flutter project's config, not the backend `.env`.

---

## 11. Redis

### Development (Docker — no setup needed)

Redis runs automatically via `docker compose up -d`.

```env
REDIS_URL=redis://localhost:6379
```

### Production (Railway)

When deploying to Railway, add a **Redis** service to your project:
1. Railway dashboard → your project → **+ New Service → Database → Redis**
2. Railway automatically injects `REDIS_URL` into services in the same project

Or use **Upstash Redis** (serverless, generous free tier):
1. Go to [upstash.com](https://upstash.com) → Create database
2. Region: same as your Railway region
3. Copy the **Redis URL** (TLS-enabled: `rediss://...`)

```env
REDIS_URL=rediss://default:xxxx@your-db.upstash.io:6379
```

---

## 12. Sentry (error monitoring)

**Purpose:** Captures unhandled exceptions and performance traces in production. Optional but strongly recommended before going live.

**What to do:**

1. Go to [sentry.io](https://sentry.io) → Sign up
2. Create a new project → Platform: **Node.js**
3. Copy the **DSN** from the setup page

```env
SENTRY_DSN=https://xxxx@o000000.ingest.sentry.io/0000000
```

Sentry is only active when `NODE_ENV=production`. It is silently skipped in development even if `SENTRY_DSN` is set.

---

## 13. Railway (hosting)

**Purpose:** Production hosting for the NestJS API. Railway auto-detects Node.js apps and handles builds, deployments, and managed Postgres.

**What to do:**

### Step A — Deploy the API

1. Go to [railway.app](https://railway.app) → New Project → **Deploy from GitHub repo**
2. Select `planovar-api`
3. Railway will detect it as a Node.js project and build it with `npm run build` and start with `node dist/main`

### Step B — Add managed Postgres

1. In your Railway project → **+ New Service → Database → PostgreSQL**
2. Railway automatically injects `DATABASE_URL` into the API service (you do not need to copy it manually — Railway links services in the same project)

### Step C — Configure environment variables

In Railway → your API service → **Variables**, add all the variables from the `.env` reference below. Do not upload your `.env` file — set them one by one in the UI, or use the Railway CLI:

```bash
railway variables set BETTER_AUTH_SECRET=xxx
railway variables set PAYSTACK_SECRET_KEY=sk_live_xxx
# ... etc
```

### Step D — Custom domain

1. Railway → your API service → **Settings → Networking → Custom Domain**
2. Add `api.planovar.ng`
3. Follow Railway's CNAME/ALIAS instructions in your DNS provider

### Step E — Set webhook URLs in Paystack and Flutterwave

Once your Railway URL is live (or your custom domain is set), update:
- Paystack: Settings → Webhooks → `https://api.planovar.ng/payments/webhook/paystack`
- Flutterwave: Settings → Webhooks → `https://api.planovar.ng/payments/webhook/flutterwave`

Also update Better Auth trusted origins in `.env` (Railway):
```env
BETTER_AUTH_TRUSTED_ORIGINS=https://app.planovar.ng,https://vendor.planovar.ng,https://admin.planovar.ng
```

---

## 14. Full `.env` reference

This is the canonical list of all environment variables used by the API. Copy this to `.env` and fill in values as you set up each service.

```env
# ─── App ────────────────────────────────────────────────────────────────────
NODE_ENV=development
PORT=3003
API_BASE_URL=http://localhost:3003

# ─── Better Auth ────────────────────────────────────────────────────────────
# Generate with: npx auth secret
BETTER_AUTH_SECRET=

# Comma-separated list of trusted frontend origins (added to the dev defaults)
BETTER_AUTH_TRUSTED_ORIGINS=

# ─── Database ───────────────────────────────────────────────────────────────
DATABASE_URL="postgresql://postgres:postgres@localhost:5434/planovar_dev?schema=public"

# ─── Redis ──────────────────────────────────────────────────────────────────
REDIS_URL="redis://localhost:6379"

# ─── Google OAuth ───────────────────────────────────────────────────────────
# console.cloud.google.com → APIs & Services → Credentials → OAuth Client ID
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# ─── Apple OAuth (Sign in with Apple) ───────────────────────────────────────
# developer.apple.com → Certificates, Identifiers & Profiles
APPLE_SERVICE_ID=ng.planovar.signin
APPLE_TEAM_ID=
APPLE_KEY_ID=
# Encode newlines as \n — see infrastructure.md § 3 for how to extract this
APPLE_PRIVATE_KEY=

# ─── Cloudinary (file & media storage) ──────────────────────────────────────
# cloudinary.com → Dashboard
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
# Which storage provider to use: 'cloudinary' | 'r2'
UPLOAD_PROVIDER=cloudinary

# ─── Cloudflare R2 (future fallback storage) ────────────────────────────────
# Populated when migrating away from Cloudinary free tier
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=planovar-dev
R2_PUBLIC_URL=

# ─── Paystack (primary payments) ────────────────────────────────────────────
# dashboard.paystack.com → Settings → API Keys & Webhooks
PAYSTACK_SECRET_KEY=sk_test_
PAYSTACK_PUBLIC_KEY=pk_test_
PAYSTACK_WEBHOOK_SECRET=
# Enable Paystack subaccounts for split payments (optional — set true later)
PAYSTACK_SUBACCOUNT_ENABLED=false

# ─── Flutterwave (payment fallback) ─────────────────────────────────────────
# dashboard.flutterwave.com → Settings → API
FLUTTERWAVE_SECRET_KEY=
FLUTTERWAVE_PUBLIC_KEY=
FLUTTERWAVE_ENCRYPTION_KEY=
FLUTTERWAVE_WEBHOOK_SECRET=

# ─── Firebase (push notifications) ──────────────────────────────────────────
# console.firebase.google.com → Project settings → Service accounts → Generate new private key
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
# Encode newlines as \n inside double-quoted value
FIREBASE_PRIVATE_KEY=

# ─── LiveKit (in-app voice & video calls) ────────────────────────────────────
# cloud.livekit.io → your project → Settings → Keys
LIVEKIT_URL=
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=

# ─── Resend (transactional email) ───────────────────────────────────────────
# resend.com → API Keys
RESEND_API_KEY=
EMAIL_FROM=noreply@planovar.ng

# ─── Typesense (search & recommendations) ───────────────────────────────────
# Development: runs via Docker — defaults below work out of the box
# Production: cloud.typesense.org → your cluster → Overview
TYPESENSE_HOST=localhost
TYPESENSE_PORT=8108
TYPESENSE_PROTOCOL=http
TYPESENSE_API_KEY=xyz

# ─── Commission (platform fee per subscription tier) ─────────────────────────
# Default rates applied at payout time. Editable here OR via admin dashboard.
# Format: decimal (0.08 = 8%). Must match SubscriptionTier values in schema.
COMMISSION_RATE_BASIC=0.08
COMMISSION_RATE_FEATURED=0.055
COMMISSION_RATE_PREMIUM=0.03

# ─── JWT (legacy — not used for auth, kept for potential service-to-service use)
JWT_SECRET=change_me_in_production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=change_me_in_production
JWT_REFRESH_EXPIRES_IN=30d

# ─── Sentry (error monitoring — production only) ─────────────────────────────
SENTRY_DSN=
```

---

## Quick checklist — what to configure before first test

| Service | What you need | Section |
|---|---|---|
| ✅ Better Auth secret | Generate and paste into `.env` | [§ 1](#1-better-auth-secret) |
| 🔲 Google OAuth | Client ID + Secret from Google Cloud Console | [§ 2](#2-google-oauth) |
| 🔲 Apple OAuth | Service ID, Team ID, Key ID, `.p8` private key | [§ 3](#3-apple-oauth-sign-in-with-apple) |
| 🔲 Cloudinary | Cloud name, API key, API secret | [§ 4](#4-cloudinary-file-storage--media) |
| 🔲 Paystack | Test keys + webhook secret | [§ 5](#5-paystack-primary-payments) |
| 🔲 Flutterwave | Test keys + webhook secret | [§ 6](#6-flutterwave-payment-fallback) |
| 🔲 Firebase | Project created + service account JSON downloaded | [§ 7](#7-firebase-cloud-messaging-push-notifications) |
| 🔲 LiveKit | Project + API key + secret | [§ 8](#8-livekit-in-app-voice--video-calls) |
| 🔲 Resend | API key + domain DNS records | [§ 9](#9-resend-transactional-email) |
| ✅ Typesense | Auto-configured for dev via Docker | [§ 10](#10-typesense-search) |
| ✅ Redis | Auto-configured for dev via Docker | [§ 11](#11-redis) |
| 🔲 Sentry | Only needed before production launch | [§ 12](#12-sentry-error-monitoring) |
| 🔲 Railway | Only needed at deployment time | [§ 13](#13-railway-hosting) |

Items marked ✅ work out of the box in local development with no additional setup.
