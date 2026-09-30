import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

/**
 * Promote an EXISTING user to ADMIN. The user must already exist (sign up first
 * through the normal flow so Better Auth hashes their password) — this only
 * flips their role.
 *
 *   npm run promote-admin -- you@planovar.com
 *
 * Run it against the target DB by setting DATABASE_URL (e.g. Railway's public
 * connection string for the deployed database).
 */
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  const email = process.argv[2]?.trim();
  if (!email) {
    console.error('Usage: npm run promote-admin -- <email>');
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true, role: true },
  });
  if (!existing) {
    console.error(
      `No user with email "${email}". Sign that account up first, then re-run.`,
    );
    process.exit(1);
  }

  const user = await prisma.user.update({
    where: { email },
    data: { role: 'ADMIN' },
    select: { id: true, email: true, role: true },
  });
  console.log('✓ Promoted to ADMIN:', user);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
