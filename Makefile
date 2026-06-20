# Planovar API — self-contained Makefile (deployable independently of the monorepo).
# Run `make help` for the command list. docker-compose.yml lives in this folder.

.PHONY: help install \
	db-up db-down db-reset db-migrate db-migrate-deploy db-generate db-seed db-studio db-shadow \
	dev start-dev build start test test-e2e setup

CYAN  := \033[0;36m
RESET := \033[0m

help: ## Show this help
	@echo ""
	@echo "  Planovar API – commands"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  $(CYAN)%-18s$(RESET) %s\n", $$1, $$2}'
	@echo ""

install: ## Install dependencies
	npm install

# ── Databases / Infrastructure (Docker) ───────────────────────────────────
db-up: ## Start Postgres, Redis, Typesense and wait until healthy
	docker compose up -d --wait

db-down: ## Stop all Docker services
	docker compose down

db-reset: ## Drop volumes and restart fresh (DESTRUCTIVE)
	docker compose down -v
	docker compose up -d --wait

db-shadow: ## Ensure the Prisma shadow database exists (idempotent)
	docker exec planovar_postgres psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname='planovar_shadow'" \
		| grep -q 1 || docker exec planovar_postgres psql -U postgres -c "CREATE DATABASE planovar_shadow"

db-migrate: ## Create/apply migrations in dev (interactive)
	npx prisma migrate dev

db-migrate-deploy: ## Apply committed migrations (non-interactive, for the dev/CI bring-up)
	npx prisma migrate deploy

db-generate: ## Regenerate the Prisma client
	npx prisma generate

db-seed: ## Seed categories, locations, subscription plans
	npm run seed

db-studio: ## Open Prisma Studio
	npx prisma studio

# ── API ────────────────────────────────────────────────────────────────────
dev: ## ⭐ Bring up all databases (Docker, wait for health), apply migrations, then run the API in watch mode
	docker compose up -d --wait
	npx prisma generate
	npx prisma migrate deploy
	npm run start:dev

start-dev: ## Run the API in watch mode only (assumes databases already up)
	npm run start:dev

build: ## Compile for production
	npm run build

start: ## Run the compiled production build
	npm run start:prod

test: ## Unit tests
	npm run test

test-e2e: ## End-to-end tests
	npm run test:e2e

setup: ## First run: install deps, start DBs, migrate, seed
	npm install
	docker compose up -d --wait
	npx prisma migrate deploy
	npm run seed
	@echo "  API ready. Run 'make dev' to start."
