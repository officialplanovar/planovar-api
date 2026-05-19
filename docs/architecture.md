# Architecture

## Overview

Planovar is a two-sided event marketplace. The backend is a single NestJS API that serves four separate client surfaces:

| Surface | Technology | Audience |
|---|---|---|
| Client app (mobile + web) | Flutter | Event planners booking vendors |
| Vendor app (mobile + web) | Flutter | Event service/product suppliers |
| Admin console | Next.js | Planovar internal operations team |
| Marketing site | Next.js | Public-facing landing pages |

All surfaces talk to this single API. There is no separate backend per surface.

---

## High-level data flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client surfaces                         │
│                                                                 │
│  Flutter Client App   Flutter Vendor App   Next.js Admin        │
│  (iOS / Android / Web)(iOS / Android / Web)(Web only)           │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTPS + WebSocket
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Planovar API                             │
│                   NestJS + TypeScript                           │
│                                                                 │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────┐  │
│  │  REST   │  │ Socket.io│  │  BullMQ  │  │  Better Auth   │  │
│  │Endpoints│  │(realtime)│  │ (queues) │  │  /api/auth/*   │  │
│  └────┬────┘  └────┬─────┘  └────┬─────┘  └───────┬────────┘  │
└───────┼────────────┼─────────────┼─────────────────┼───────────┘
        │            │             │                 │
        ▼            ▼             ▼                 ▼
┌──────────────┐ ┌────────┐ ┌──────────┐     ┌──────────────┐
│  PostgreSQL  │ │ Redis  │ │Typesense │     │   External   │
│  (primary    │ │(pub/sub│ │(search   │     │  services    │
│   data store)│ │+queues)│ │ index)   │     │  (Paystack,  │
└──────────────┘ └────────┘ └──────────┘     │  FCM, R2,   │
                                              │  LiveKit,   │
                                              │  Resend)    │
                                              └──────────────┘
```

---

## Service responsibilities

### NestJS API (`planovar-api`)

The single backend. Responsible for:

- **Auth** — delegated entirely to Better Auth. Handles email/password, OTP, Google OAuth, session management, and token rotation. Exposed at `/api/auth/*`.
- **Business logic** — all marketplace rules: booking lifecycle, commission calculation, payout scheduling, subscription tier enforcement.
- **Real-time** — Socket.io gateway for chat messages, quote notifications, booking status updates, and presence.
- **Job queues** — BullMQ workers for async tasks: vendor payouts (T+1), FCM push notifications, Typesense reindexing, subscription renewals, review reminders.
- **Webhook handling** — Paystack webhook receiver (HMAC-SHA512 verified).

### PostgreSQL

Primary data store. All persistent state lives here. 26 tables across 8 semantic groups. Managed by Prisma with a full migration history.

Runs on:
- **Dev** — Docker container on port 5434
- **Staging** — Railway managed Postgres
- **Production** — AWS RDS PostgreSQL 16 Multi-AZ

### Redis

Two roles:

1. **Pub/sub** — Socket.io Redis adapter for horizontal scaling of WebSocket connections across multiple API instances.
2. **Job queues** — BullMQ uses Redis as its queue backend. All background jobs are persisted here.

### Typesense

Full-text and geo-aware search. Vendor listings are indexed here and searched via a composite ranking algorithm factoring in: subscription tier, rating, proximity, freshness, review count, and exact tag match.

The NestJS API maintains the Typesense index — inserts, updates, and deletes are triggered via BullMQ jobs whenever a listing changes.

### Better Auth

Open-source auth library running inside the NestJS process. Handles the full auth lifecycle without any external service or account. Auth data (sessions, accounts, verifications) is stored in the same PostgreSQL database.

See [auth.md](./auth.md) for full detail.

---

## Module structure

The API is divided into feature modules. Each module is self-contained with its own controller, service, and DTOs.

```
src/modules/
├── auth/           # Auth routes (delegated to Better Auth)
├── users/          # User profile management
├── vendors/        # Vendor profile and onboarding
├── listings/       # Listing CRUD, media, packages
├── bookings/       # Booking lifecycle, status transitions
├── quotes/         # Quote requests and responses
├── payments/       # Paystack integration, webhook
├── messaging/      # Conversations, messages, Socket.io
├── reviews/        # Reviews and vendor responses
├── notifications/  # FCM push + in-app notifications
├── search/         # Typesense query layer
└── subscriptions/  # Subscription plan management
```

---

## Environments

| Environment | API host | Database | Notes |
|---|---|---|---|
| **Development** | `localhost:3000` | Docker Postgres `:5434` | Hot reload, Swagger enabled |
| **Staging** | Railway | Railway Postgres | Mirrors production config |
| **Production** | AWS ECS (Fargate) | RDS Multi-AZ | Swagger disabled, Sentry active |

---

## Security design

- **Auth sessions** — Better Auth issues session tokens stored as HTTP-only cookies. No JWTs in `localStorage`.
- **Role enforcement** — `SessionAuthGuard` validates the session on every protected route. `RolesGuard` + `@Roles()` enforces `CLIENT / VENDOR / ADMIN` access at the handler level.
- **Paystack webhooks** — HMAC-SHA512 signature verified on every incoming webhook before any state change.
- **Input validation** — Global `ValidationPipe` with `whitelist: true` strips all undeclared fields from request bodies.
- **CORS** — Explicitly configured to allow only the three known frontend origins plus the API itself.
- **Trusted origins** — Better Auth independently validates the `Origin` header against its own `trustedOrigins` list.
