# Planovar API

The backend API for **Planovar** — a two-sided event marketplace connecting event planners (clients) with event service vendors across Nigeria.

Built with **NestJS · TypeScript · Prisma · PostgreSQL · Better Auth**.

---

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template and fill in values
cp .env.example .env

# 3. Start local infrastructure (Postgres, Redis, Typesense)
docker compose up -d

# 4. Run database migrations
npx prisma migrate dev

# 5. Start the API in watch mode
npm run start:dev
```

The API will be available at `http://localhost:3000`.
Interactive API docs (Swagger) at `http://localhost:3000/docs`.

> All of the above can also be run from the monorepo root using `make` commands.
> Run `make help` from `/Planovar` to see all available commands.

---

## Documentation

| Document | Description |
|---|---|
| [Architecture](./docs/architecture.md) | System design, service roles, data flow |
| [Database](./docs/database.md) | Schema overview, table groups, design decisions |
| [Authentication](./docs/auth.md) | Better Auth setup, flows, Google OAuth, guards |
| [Development](./docs/development.md) | Local setup, Docker, environment variables, tooling |

---

## Project structure

```
planovar-api/
├── prisma/
│   ├── schema.prisma          # Full 26-table database schema
│   └── migrations/            # Applied migration history
├── src/
│   ├── auth/
│   │   ├── auth.config.ts     # Better Auth configuration
│   │   ├── auth.controller.ts # Mounts Better Auth at /api/auth/*
│   │   ├── auth.module.ts
│   │   └── better-auth.swagger.ts
│   ├── common/
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   └── guards/
│   │       ├── session-auth.guard.ts
│   │       └── roles.guard.ts
│   ├── prisma/
│   │   ├── prisma.service.ts  # Global Prisma client
│   │   └── prisma.module.ts
│   ├── modules/               # Feature modules (users, vendors, listings…)
│   ├── app.module.ts
│   └── main.ts
├── requests/
│   └── auth.http              # HTTP test file (VS Code REST Client)
├── docs/                      # Developer documentation
├── docker-compose.yml
├── .env.example
└── package.json
```

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | NestJS 11 + TypeScript |
| Database | PostgreSQL 16 (Docker locally, RDS Multi-AZ in production) |
| ORM | Prisma 7 + `@prisma/adapter-pg` |
| Auth | Better Auth 1.x — email/password, OTP, Google OAuth |
| Cache / Queues | Redis 7 + BullMQ |
| Search | Typesense 26 |
| Real-time | Socket.io 4 with Redis adapter |
| Payments | Paystack |
| File storage | Cloudflare R2 |
| Push notifications | Firebase FCM |
| Voice calls | LiveKit (WebRTC) |
| Email | Resend |
| Monitoring | Sentry |

---

## Available scripts

```bash
npm run start:dev     # Watch mode (development)
npm run start:debug   # Debug mode with inspector
npm run build         # Compile TypeScript
npm run start:prod    # Run compiled output
npm run test          # Unit tests
npm run test:e2e      # End-to-end tests
npm run lint          # ESLint
```
