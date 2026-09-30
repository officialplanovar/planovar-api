-- Auto-created on fresh Postgres volume init (docker-entrypoint-initdb.d).
-- Prisma migrate dev needs a shadow database; prisma.config.ts points it at
-- "planovar_shadow". Without this, `make db-migrate` fails with P1003.
CREATE DATABASE planovar_shadow;
