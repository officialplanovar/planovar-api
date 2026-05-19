import 'dotenv/config'; // must load before anything reads process.env
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { emailOTP } from 'better-auth/plugins';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Prisma 7 uses a driver adapter instead of embedding the URL in the schema.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),

  // ── Base URL ────────────────────────────────────────────────────────────
  baseURL: process.env.API_BASE_URL ?? 'http://localhost:3000',

  // ── Trusted origins — Better Auth validates the Origin header independently
  // of NestJS CORS. All client surfaces must be listed here.
  trustedOrigins: [
    'http://localhost:3000', // Swagger UI / API itself
    'http://localhost:3001', // Flutter client web
    'http://localhost:3002', // Flutter vendor web
    'http://localhost:3003', // Admin console
  ],

  // ── Secret (used to sign sessions) ─────────────────────────────────────
  secret: process.env.BETTER_AUTH_SECRET ?? 'change-me-in-production',

  // ── ID generation — always UUID so our FK columns stay @db.Uuid ────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  advanced: {
    generateId: () => crypto.randomUUID(),
  } as any,

  // ── Email + password ────────────────────────────────────────────────────
  emailAndPassword: {
    enabled: true,
    // Set to true once email/OTP sending is wired up via Resend.
    // Keep false in dev so you can sign in immediately after registration.
    requireEmailVerification: false,
    minPasswordLength: 8,
  },

  // ── Google OAuth ────────────────────────────────────────────────────────
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    },
  },

  // ── Plugins ─────────────────────────────────────────────────────────────
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 600, // 10 minutes
      async sendVerificationOTP({ email, otp, type }) {
        // Resend integration added in the notifications module.
        // For now we log to console so local dev works without email config.
        console.log(`[OTP] ${type} → ${email}: ${otp}`);
      },
    }),
  ],

  // ── Domain-specific fields on the user table ────────────────────────────
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'CLIENT',
        // input: true allows the client to pass it during sign-up.
        // The Flutter apps always send the correct role for their surface.
        input: true,
      },
      phone: {
        type: 'string',
        required: false,
        input: true,
      },
      // Prisma maps firstName→first_name and lastName→last_name at the ORM
      // level via @map(). Better Auth must use the Prisma field names (camelCase),
      // not the DB column names — so no fieldName override here.
      firstName: {
        type: 'string',
        required: false,
        input: true,
      },
      lastName: {
        type: 'string',
        required: false,
        input: true,
      },
      isActive: {
        type: 'boolean',
        defaultValue: true,
        input: false, // only set server-side
      },
    },
  },

  // ── Session config ───────────────────────────────────────────────────────
  session: {
    expiresIn: 60 * 60 * 24 * 30,        // 30 days
    updateAge: 60 * 60 * 24,             // refresh if used within 1 day of expiry
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,                    // 5-minute client-side cache
    },
  },
});

export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session;
export type AuthUser = typeof auth.$Infer.Session.user;
