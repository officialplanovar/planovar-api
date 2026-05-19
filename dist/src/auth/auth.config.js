"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
require("dotenv/config");
const better_auth_1 = require("better-auth");
const prisma_1 = require("better-auth/adapters/prisma");
const plugins_1 = require("better-auth/plugins");
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const adapter = new adapter_pg_1.PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new client_1.PrismaClient({ adapter });
exports.auth = (0, better_auth_1.betterAuth)({
    database: (0, prisma_1.prismaAdapter)(prisma, { provider: 'postgresql' }),
    baseURL: process.env.API_BASE_URL ?? 'http://localhost:3000',
    trustedOrigins: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://localhost:3003',
    ],
    secret: process.env.BETTER_AUTH_SECRET ?? 'change-me-in-production',
    advanced: {
        generateId: () => crypto.randomUUID(),
    },
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
        minPasswordLength: 8,
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID ?? '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
        },
    },
    plugins: [
        (0, plugins_1.emailOTP)({
            otpLength: 6,
            expiresIn: 600,
            async sendVerificationOTP({ email, otp, type }) {
                console.log(`[OTP] ${type} → ${email}: ${otp}`);
            },
        }),
    ],
    user: {
        additionalFields: {
            role: {
                type: 'string',
                defaultValue: 'CLIENT',
                input: true,
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