# Development guide

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | 20+ | [nodejs.org](https://nodejs.org) |
| npm | 10+ | Bundled with Node |
| Docker Desktop | latest | [docker.com](https://docker.com) |
| Flutter | 3.x | [flutter.dev](https://flutter.dev) |
| Prisma CLI | via npx | No global install needed |

---

## First-time setup

```bash
# From inside planovar-api/
npm install
cp .env.example .env
```

Edit `.env` — the minimum required values for local dev are already set. The only one you must generate is `BETTER_AUTH_SECRET`:

```bash
npx auth secret   # prints a secure random string — paste into .env
```

---

## Starting local infrastructure

All infrastructure runs in Docker. No local installations of Postgres, Redis, or Typesense are needed.

```bash
docker compose up -d
```

This starts three containers:

| Container | Image | Host port |
|---|---|---|
| `planovar_postgres` | `postgres:16-alpine` | `5434` |
| `planovar_redis` | `redis:7-alpine` | `6379` |
| `planovar_typesense` | `typesense/typesense:26.0` | `8108` |

> Port `5434` (not `5432`) is used because macOS often has a local Postgres installation already running on `5432`.

Check status:
```bash
docker compose ps
docker compose logs postgres   # check for errors
```

---

## Running migrations

```bash
npx prisma migrate dev
```

On first run this creates all 26 tables. After any `schema.prisma` change, run:

```bash
npx prisma migrate dev --name describe_your_change
```

This generates a SQL migration file in `prisma/migrations/` and applies it.

---

## Starting the API

```bash
npm run start:dev
```

NestJS watches for file changes and hot-reloads automatically. Output:

```
API running on http://localhost:3000
Swagger docs → http://localhost:3000/docs
```

---

## From the monorepo root (recommended)

All commands can be run from the `/Planovar` root via the `Makefile`:

```bash
make help          # list all commands

make db-up         # start Docker services
make db-down       # stop Docker services
make db-reset      # destroy volumes and restart (wipes all data)
make db-migrate    # run pending migrations
make db-studio     # open Prisma Studio in browser

make api-dev       # start API in watch mode
make api-build     # compile for production
make api-test      # run unit tests
```

---

## Prisma Studio

Visual browser for all database tables. Run while Docker is up:

```bash
npx prisma studio
# or
make db-studio
```

Opens at `http://localhost:5555`. You can read, filter, create, and edit rows directly.

---

## Testing auth endpoints

Open `requests/auth.http` in VS Code (requires the **REST Client** extension).

Click **Send Request** above any block to execute it. Remember to include the `Origin` header — REST clients don't send it automatically:

```
Origin: http://localhost:3000
```

The full registration flow:

1. **Register** — `POST /api/auth/sign-up/email`
2. **Get OTP** — check API terminal output for the printed OTP code
3. **Verify email** — `POST /api/auth/email-otp/verify-email` with the code
4. **Sign in** — `POST /api/auth/sign-in/email`
5. **Check session** — `GET /api/auth/get-session`

Alternatively, use the Swagger UI at `http://localhost:3000/docs` which handles cookies automatically across requests in the same browser session.

---

## Environment variables

Full reference — see `.env.example` for the complete file.

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Yes | Redis connection string |
| `PORT` | No | API port (default: `3000`) |
| `NODE_ENV` | No | `development` / `production` |
| `API_BASE_URL` | No | Full base URL (default: `http://localhost:3000`) |
| `BETTER_AUTH_SECRET` | Yes | Min 32-char random string for session signing |
| `GOOGLE_CLIENT_ID` | For OAuth | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | For OAuth | From Google Cloud Console |
| `PAYSTACK_SECRET_KEY` | For payments | Paystack dashboard → test key |
| `PAYSTACK_WEBHOOK_SECRET` | For webhooks | Paystack dashboard |
| `FIREBASE_PROJECT_ID` | For push | Firebase console |
| `FIREBASE_CLIENT_EMAIL` | For push | Firebase service account |
| `FIREBASE_PRIVATE_KEY` | For push | Firebase service account |
| `R2_ACCOUNT_ID` | For file uploads | Cloudflare dashboard |
| `R2_ACCESS_KEY_ID` | For file uploads | Cloudflare R2 API token |
| `R2_SECRET_ACCESS_KEY` | For file uploads | Cloudflare R2 API token |
| `R2_BUCKET_NAME` | For file uploads | e.g. `planovar-dev` |
| `R2_PUBLIC_URL` | For file uploads | R2 public bucket URL |
| `TYPESENSE_HOST` | For search | `localhost` in dev |
| `TYPESENSE_PORT` | For search | `8108` |
| `TYPESENSE_API_KEY` | For search | `xyz` in dev (Docker) |
| `LIVEKIT_URL` | For voice | LiveKit server URL |
| `LIVEKIT_API_KEY` | For voice | LiveKit project credentials |
| `LIVEKIT_API_SECRET` | For voice | LiveKit project credentials |
| `RESEND_API_KEY` | For email | Resend dashboard |
| `SENTRY_DSN` | For monitoring | Sentry project DSN |

---

## Adding a new module

1. Create the folder under `src/modules/<name>/`
2. Scaffold the files:
   ```
   src/modules/<name>/
   ├── <name>.controller.ts
   ├── <name>.service.ts
   ├── <name>.module.ts
   └── dto/
       ├── create-<name>.dto.ts
       └── update-<name>.dto.ts
   ```
3. Register the module in `src/app.module.ts`
4. Use `@UseGuards(SessionAuthGuard)` on protected routes
5. Use `@Roles(UserRole.VENDOR)` + `RolesGuard` where role restriction is needed
6. Use `@CurrentUser()` to access the authenticated user in handlers
7. Add Swagger decorators (`@ApiTags`, `@ApiOperation`, `@ApiResponse`) on the controller

---

## Troubleshooting

**`INVALID_ORIGIN` from Better Auth**
Add the request's origin to `trustedOrigins` in `src/auth/auth.config.ts` and restart the API. Also ensure the `Origin` header is being sent by your client.

**`PrismaClientInitializationError` on startup**
The `DATABASE_URL` in `.env` is missing or incorrect. Verify Docker is running (`docker compose ps`) and the URL matches the container's port.

**`Already in sync` from `prisma migrate dev` but tables are missing**
Run `npx prisma migrate reset` to wipe the database and reapply all migrations from scratch. Warning: this deletes all data.

**Port 5434 not binding (postgres shows `5432/tcp` without host mapping)**
Another process may be using port 5434. Change the host port in `docker-compose.yml` to something free (e.g. `5435:5432`) and update `DATABASE_URL` in `.env` to match.
