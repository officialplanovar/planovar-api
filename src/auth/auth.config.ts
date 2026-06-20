import 'dotenv/config'; // must load before anything reads process.env
import { betterAuth } from 'better-auth';
import { APIError } from 'better-auth/api';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { bearer, emailOTP } from 'better-auth/plugins';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Resend } from 'resend';
import { emailTemplates } from '../common/email/templates';

// Prisma 7 uses a driver adapter instead of embedding the URL in the schema.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

/**
 * Normalize a Nigerian MSISDN to canonical E.164 (`+234XXXXXXXXXX`).
 * Collapses the equivalent inputs `08132665650`, `8132665650`, `2348132665650`
 * and the mistyped `+23408132665650` to one value, so the `phone @unique`
 * anti-dup constraint can't be sidestepped by formatting. Empty → null.
 */
export function normalizeNgPhone(raw?: string | null): string | null {
  if (!raw) return null;
  let digits = raw.replace(/\D/g, ''); // keep digits only
  if (digits.startsWith('234')) digits = digits.slice(3); // strip country code
  digits = digits.replace(/^0+/, ''); // strip national trunk '0'
  if (digits.length === 0) return null;
  return `+234${digits}`;
}

// ── Email OTP delivery (Resend, branded templates) ─────────────────────────
// auth.config runs outside Nest DI, so we use Resend directly here. Falls back
// to console logging in dev when RESEND_API_KEY is unset.
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;
const EMAIL_FROM = process.env.EMAIL_FROM ?? 'noreply@planovar.ng';

async function deliverOtp(email: string, otp: string, type: string) {
  // Always log in dev so the flow is testable without checking an inbox.
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[OTP] ${type} → ${email}: ${otp}`);
  }
  if (!resend) return;
  const purpose =
    type === 'sign-in' ? 'login' : type === 'forget-password' ? 'reset' : 'verify';
  const { subject, html } = emailTemplates.otp(otp, purpose);
  await resend.emails.send({ from: EMAIL_FROM, to: email, subject, html });
}

// ── Social providers — only enabled when their credentials are configured ──
const socialProviders: Record<string, unknown> = {};
if (process.env.GOOGLE_CLIENT_ID) {
  socialProviders.google = {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
  };
}
if (process.env.APPLE_SERVICE_ID && process.env.APPLE_CLIENT_SECRET) {
  socialProviders.apple = {
    clientId: process.env.APPLE_SERVICE_ID,
    clientSecret: process.env.APPLE_CLIENT_SECRET,
    // For native iOS sign-in, Better Auth validates against the app bundle id.
    ...(process.env.APPLE_APP_BUNDLE_ID && {
      appBundleIdentifier: process.env.APPLE_APP_BUNDLE_ID,
    }),
  };
}

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
    'http://localhost:3003', // Admin console (default Next port)
    'http://localhost:3004', // Admin console (documented port)
    ...(process.env.TRUSTED_ORIGINS ?? '')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
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
    // Env-driven: enable verification in staging/prod once email is configured.
    requireEmailVerification:
      process.env.REQUIRE_EMAIL_VERIFICATION === 'true',
    minPasswordLength: 8,
  },

  // ── Social OAuth (Google + Apple) — see top of file; only configured providers ──
  socialProviders,

  // ── Plugins ─────────────────────────────────────────────────────────────
  plugins: [
    // Lets the mobile/web apps authenticate with `Authorization: Bearer <token>`
    // (token stored in flutter_secure_storage) instead of cookies. The token is
    // returned in the `set-auth-token` response header on sign-in/sign-up.
    bearer(),
    emailOTP({
      otpLength: 6,
      expiresIn: 600, // 10 minutes
      async sendVerificationOTP({ email, otp, type }) {
        await deliverOtp(email, otp, type);
      },
    }),
  ],

  // ── Domain-specific fields on the user table ────────────────────────────
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'CLIENT',
        // SECURITY: never client-settable — otherwise anyone could self-register
        // as ADMIN/VENDOR. New users are CLIENT; the role is elevated server-side
        // (e.g. VendorsService.onboard sets VENDOR; admins are provisioned manually).
        input: false,
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

  // ── Database hooks ─────────────────────────────────────────────────────────
  // Normalize the phone to E.164 and reject duplicates with a friendly message
  // (otherwise the `phone @unique` violation surfaces as an opaque 500/422).
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const phone = normalizeNgPhone(
            (user as { phone?: string | null }).phone,
          );
          if (phone) {
            const existing = await prisma.user.findUnique({
              where: { phone },
              select: { id: true },
            });
            if (existing) {
              throw new APIError('UNPROCESSABLE_ENTITY', {
                message:
                  'This phone number is already registered. Please sign in or use a different number.',
              });
            }
          }
          return { data: { ...user, phone } };
        },
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
