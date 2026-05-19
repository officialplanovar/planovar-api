# Authentication

## Overview

Auth is handled entirely by **Better Auth** — an open-source, self-hosted TypeScript auth library. No external auth service or account is required. All auth data lives in the project's own PostgreSQL database.

Better Auth is mounted as Express middleware inside the NestJS app and handles all routes under `/api/auth/*`. These routes do not go through NestJS controllers or Swagger's auto-scanner (see [Swagger note](#swagger) below).

---

## Supported flows

| Flow | Endpoint | Notes |
|---|---|---|
| Email + password registration | `POST /api/auth/sign-up/email` | Sends OTP for email verification |
| Email + password sign-in | `POST /api/auth/sign-in/email` | Returns session cookie |
| Email OTP — send | `POST /api/auth/email-otp/send-verification-otp` | Used for verification and password reset |
| Email OTP — verify | `POST /api/auth/email-otp/verify-email` | Marks email as verified |
| Google OAuth | `POST /api/auth/sign-in/social` | Redirects to Google; Flutter apps use native `google_sign_in` |
| Get session | `GET /api/auth/get-session` | Returns current user + session |
| Sign out | `POST /api/auth/sign-out` | Revokes session |
| Forgot password | `POST /api/auth/forget-password` | Sends reset OTP |
| Reset password | `POST /api/auth/reset-password` | Accepts OTP token + new password |

---

## Role assignment

Planovar has three roles: `CLIENT`, `VENDOR`, `ADMIN`.

Because the client app and vendor app are separate Flutter projects, the role is **implicit from which app makes the request** — not a user choice:

- Client app always sends `role: "CLIENT"` in the sign-up body
- Vendor app always sends `role: "VENDOR"` in the sign-up body
- Admin users are assigned the `ADMIN` role manually (no self-registration)

For Google OAuth, the role must be passed alongside the social sign-in request. The Flutter app includes it in the request body.

---

## Session management

Better Auth issues a **session cookie** (`better-auth.session_token`) on successful sign-in. There are no JWTs in `localStorage`.

| Setting | Value |
|---|---|
| Session duration | 30 days |
| Session refresh | Rolling — refreshed if used within the last day |
| Client-side cache | 5 minutes (reduces DB lookups on frequent requests) |
| Cookie flags | `HttpOnly`, `SameSite=Lax` (set by Better Auth) |

Sessions are stored in the `session` table and can be revoked server-side at any time.

---

## Using auth in NestJS controllers

### Protecting a route

```typescript
import { UseGuards } from '@nestjs/common';
import { SessionAuthGuard } from '../common/guards/session-auth.guard';

@UseGuards(SessionAuthGuard)
@Get('me')
getProfile() {
  // only reachable with a valid session
}
```

### Restricting by role

```typescript
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '@prisma/client';

@UseGuards(SessionAuthGuard, RolesGuard)
@Roles(UserRole.VENDOR)
@Post('listings')
createListing() {
  // only reachable by verified vendors
}
```

### Reading the current user

```typescript
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../auth/auth.config';

@UseGuards(SessionAuthGuard)
@Get('me')
getProfile(@CurrentUser() user: AuthUser) {
  return user; // { id, email, name, role, ... }
}
```

---

## Guard internals

### `SessionAuthGuard`

Calls `auth.api.getSession()` on every request, passing the incoming headers. Better Auth validates the session token against the `session` table and returns the user. If no valid session exists, throws `401 Unauthorized`.

Attaches `request.user` and `request.session` for downstream use.

### `RolesGuard`

Reads the `@Roles()` metadata from the route handler. Compares `request.user.role` against the allowed roles. Throws `403 Forbidden` on mismatch.

Must be used **after** `SessionAuthGuard` (which populates `request.user`).

---

## CORS and trusted origins

Better Auth performs its own origin check **independently** of NestJS's CORS middleware. Both must allow the same origins.

**NestJS CORS** — configured in `main.ts`:
```typescript
app.enableCors({
  origin: ['http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],
  credentials: true,
});
```

**Better Auth trusted origins** — configured in `auth.config.ts`:
```typescript
trustedOrigins: [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
],
```

When adding new deployment URLs (staging, production), both lists must be updated. An `INVALID_ORIGIN` error means the request's `Origin` header is missing from the Better Auth list.

REST clients (Postman, Insomnia, `.http` files) do not send an `Origin` header by default — add it manually:
```
Origin: http://localhost:3000
```

---

## Google OAuth setup

Google OAuth requires credentials from Google Cloud Console. No code changes needed — just environment variables.

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project → **APIs & Services → Credentials → OAuth Client ID**
3. Type: **Web application**
4. Authorised redirect URI: `http://localhost:3000/api/auth/callback/google`
5. Copy the Client ID and Secret into `.env`:

```
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_secret
```

For Flutter mobile apps, the native `google_sign_in` package handles the OAuth flow client-side and passes the resulting ID token to the backend via `POST /api/auth/sign-in/id-token`.

---

## Email / OTP in development

OTP sending via Resend is not wired up yet. In development, all OTPs are **printed to the API terminal**:

```
[OTP] email-verification → user@example.com: 482910
```

Copy the code from your terminal and use it in the verify request. Email sending will be connected in the Notifications module.

---

## Swagger

Better Auth routes are mounted as Express middleware and bypass NestJS's controller scanner. They are manually injected into the Swagger document via `src/auth/better-auth.swagger.ts` so they appear in `/docs` under the **auth** tag.

Swagger is only enabled when `NODE_ENV !== 'production'`.

---

## Configuration reference

All auth config lives in `src/auth/auth.config.ts`. Key settings:

| Config | Env var | Default (dev) |
|---|---|---|
| Base URL | `API_BASE_URL` | `http://localhost:3000` |
| Session secret | `BETTER_AUTH_SECRET` | (insecure placeholder) |
| Google Client ID | `GOOGLE_CLIENT_ID` | — |
| Google Client Secret | `GOOGLE_CLIENT_SECRET` | — |
| Email verification required | — | `false` (dev), `true` (prod) |
| Session duration | — | 30 days |
| OTP length | — | 6 digits |
| OTP expiry | — | 10 minutes |
