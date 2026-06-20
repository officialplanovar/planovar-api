"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
exports.normalizeNgPhone = normalizeNgPhone;
require("dotenv/config");
const better_auth_1 = require("better-auth");
const api_1 = require("better-auth/api");
const prisma_1 = require("better-auth/adapters/prisma");
const plugins_1 = require("better-auth/plugins");
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const resend_1 = require("resend");
const templates_1 = require("../common/email/templates");
const adapter = new adapter_pg_1.PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new client_1.PrismaClient({ adapter });
function normalizeNgPhone(raw) {
    if (!raw)
        return null;
    let digits = raw.replace(/\D/g, '');
    if (digits.startsWith('234'))
        digits = digits.slice(3);
    digits = digits.replace(/^0+/, '');
    if (digits.length === 0)
        return null;
    return `+234${digits}`;
}
const resend = process.env.RESEND_API_KEY
    ? new resend_1.Resend(process.env.RESEND_API_KEY)
    : null;
const EMAIL_FROM = process.env.EMAIL_FROM ?? 'noreply@planovar.ng';
async function deliverOtp(email, otp, type) {
    if (process.env.NODE_ENV !== 'production') {
        console.log(`[OTP] ${type} → ${email}: ${otp}`);
    }
    if (!resend)
        return;
    const purpose = type === 'sign-in' ? 'login' : type === 'forget-password' ? 'reset' : 'verify';
    const { subject, html } = templates_1.emailTemplates.otp(otp, purpose);
    await resend.emails.send({ from: EMAIL_FROM, to: email, subject, html });
}
const socialProviders = {};
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
        ...(process.env.APPLE_APP_BUNDLE_ID && {
            appBundleIdentifier: process.env.APPLE_APP_BUNDLE_ID,
        }),
    };
}
exports.auth = (0, better_auth_1.betterAuth)({
    database: (0, prisma_1.prismaAdapter)(prisma, { provider: 'postgresql' }),
    baseURL: process.env.API_BASE_URL ?? 'http://localhost:3000',
    trustedOrigins: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://localhost:3003',
        'http://localhost:3004',
        ...(process.env.TRUSTED_ORIGINS ?? '')
            .split(',')
            .map((o) => o.trim())
            .filter(Boolean),
    ],
    secret: process.env.BETTER_AUTH_SECRET ?? 'change-me-in-production',
    advanced: {
        generateId: () => crypto.randomUUID(),
    },
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: process.env.REQUIRE_EMAIL_VERIFICATION === 'true',
        minPasswordLength: 8,
    },
    socialProviders,
    plugins: [
        (0, plugins_1.bearer)(),
        (0, plugins_1.emailOTP)({
            otpLength: 6,
            expiresIn: 600,
            async sendVerificationOTP({ email, otp, type }) {
                await deliverOtp(email, otp, type);
            },
        }),
    ],
    user: {
        additionalFields: {
            role: {
                type: 'string',
                defaultValue: 'CLIENT',
                input: false,
            },
            phone: {
                type: 'string',
                required: false,
                input: true,
            },
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
                input: false,
            },
        },
    },
    databaseHooks: {
        user: {
            create: {
                before: async (user) => {
                    const phone = normalizeNgPhone(user.phone);
                    if (phone) {
                        const existing = await prisma.user.findUnique({
                            where: { phone },
                            select: { id: true },
                        });
                        if (existing) {
                            throw new api_1.APIError('UNPROCESSABLE_ENTITY', {
                                message: 'This phone number is already registered. Please sign in or use a different number.',
                            });
                        }
                    }
                    return { data: { ...user, phone } };
                },
            },
        },
    },
    session: {
        expiresIn: 60 * 60 * 24 * 30,
        updateAge: 60 * 60 * 24,
        cookieCache: {
            enabled: true,
            maxAge: 60 * 5,
        },
    },
});
//# sourceMappingURL=auth.config.js.map