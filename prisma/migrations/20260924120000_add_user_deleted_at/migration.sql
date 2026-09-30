-- Anonymized soft-delete marker for account deletion (NDPA erasure of PII while
-- retaining anonymized transactional records). See UsersService.deleteMe.
ALTER TABLE "user" ADD COLUMN "deleted_at" TIMESTAMP(3);
