# syntax=docker/dockerfile:1

# ── Stage 1: build ───────────────────────────────────────────────────────────
# Debian slim (not alpine) — Prisma 7 + node-gyp deps behave best on glibc.
FROM node:22-slim AS builder
WORKDIR /app

# Prisma needs OpenSSL present for `prisma generate`.
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy the bits `postinstall` (prisma generate) needs BEFORE `npm ci`, so the
# generate step during install can find the schema + config.
COPY package*.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma

# Full install (incl. dev deps for `nest build`). postinstall runs prisma generate.
RUN npm ci

# Build the Nest app with tsc (emits decorator metadata — required; the dev
# `tsx` runner does NOT, which breaks DI/validation).
COPY . .
RUN npm run build

# ── Stage 2: runtime ─────────────────────────────────────────────────────────
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Prod-only deps. `prisma` + `@prisma/client` are runtime deps, so the CLI is
# available for `migrate deploy` and postinstall regenerates the client here.
COPY package*.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci --omit=dev

# Compiled output from the builder.
COPY --from=builder /app/dist ./dist

# Railway injects PORT; the app reads process.env.PORT.
EXPOSE 3000

# Apply pending migrations, then boot the compiled server.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
