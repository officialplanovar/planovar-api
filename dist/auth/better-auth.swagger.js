"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.injectBetterAuthPaths = injectBetterAuthPaths;
function injectBetterAuthPaths(document) {
    if (!document.paths)
        document.paths = {};
    const authTag = ['auth'];
    const jsonContent = (schema) => ({
        content: { 'application/json': { schema } },
    });
    document.paths['/api/auth/sign-up/email'] = {
        post: {
            tags: authTag,
            summary: 'Register with email and password',
            description: 'Creates a new user account. Pass `role: "CLIENT"` from the client app and `role: "VENDOR"` from the vendor app. An OTP is sent to the email address for verification.',
            requestBody: {
                required: true,
                ...jsonContent({
                    type: 'object',
                    required: ['name', 'email', 'password'],
                    properties: {
                        name: { type: 'string', example: 'Tunde Ajiroba' },
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'tunde@example.com',
                        },
                        password: { type: 'string', minLength: 8, example: 'Str0ngPass!' },
                        role: {
                            type: 'string',
                            enum: ['CLIENT', 'VENDOR'],
                            default: 'CLIENT',
                        },
                        firstName: { type: 'string', example: 'Tunde' },
                        lastName: { type: 'string', example: 'Ajiroba' },
                        phone: { type: 'string', example: '+2348012345678' },
                    },
                }),
            },
            responses: {
                200: { description: 'Account created — OTP sent to email' },
                422: { description: 'Email already registered' },
            },
        },
    };
    document.paths['/api/auth/sign-in/email'] = {
        post: {
            tags: authTag,
            summary: 'Sign in with email and password',
            requestBody: {
                required: true,
                ...jsonContent({
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'tunde@example.com',
                        },
                        password: { type: 'string', example: 'Str0ngPass!' },
                    },
                }),
            },
            responses: {
                200: { description: 'Authenticated — session cookie set' },
                401: { description: 'Invalid credentials' },
                403: { description: 'Email not verified' },
            },
        },
    };
    document.paths['/api/auth/sign-out'] = {
        post: {
            tags: authTag,
            summary: 'Sign out (revoke session)',
            responses: {
                200: { description: 'Session revoked' },
            },
        },
    };
    document.paths['/api/auth/get-session'] = {
        get: {
            tags: authTag,
            summary: 'Get current session and user',
            description: 'Returns the authenticated user and session info from the session cookie.',
            responses: {
                200: { description: 'Active session returned' },
                401: { description: 'No active session' },
            },
        },
    };
    document.paths['/api/auth/email-otp/send-verification-otp'] = {
        post: {
            tags: authTag,
            summary: 'Send email OTP',
            description: 'Sends a 6-digit OTP. Use `type: "email-verification"` after sign-up, or `type: "forget-password"` for password reset.',
            requestBody: {
                required: true,
                ...jsonContent({
                    type: 'object',
                    required: ['email', 'type'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'tunde@example.com',
                        },
                        type: {
                            type: 'string',
                            enum: ['email-verification', 'forget-password', 'sign-in'],
                            example: 'email-verification',
                        },
                    },
                }),
            },
            responses: {
                200: { description: 'OTP sent' },
                400: { description: 'Invalid request' },
            },
        },
    };
    document.paths['/api/auth/email-otp/verify-email'] = {
        post: {
            tags: authTag,
            summary: 'Verify email with OTP',
            requestBody: {
                required: true,
                ...jsonContent({
                    type: 'object',
                    required: ['email', 'otp'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'tunde@example.com',
                        },
                        otp: { type: 'string', example: '482910' },
                    },
                }),
            },
            responses: {
                200: { description: 'Email verified' },
                400: { description: 'Invalid or expired OTP' },
            },
        },
    };
    document.paths['/api/auth/forget-password'] = {
        post: {
            tags: authTag,
            summary: 'Request password reset OTP',
            requestBody: {
                required: true,
                ...jsonContent({
                    type: 'object',
                    required: ['email'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'tunde@example.com',
                        },
                    },
                }),
            },
            responses: {
                200: { description: 'Reset OTP sent' },
            },
        },
    };
    document.paths['/api/auth/reset-password'] = {
        post: {
            tags: authTag,
            summary: 'Reset password using OTP token',
            requestBody: {
                required: true,
                ...jsonContent({
                    type: 'object',
                    required: ['newPassword', 'token'],
                    properties: {
                        newPassword: { type: 'string', minLength: 8, example: 'NewPass123!' },
                        token: {
                            type: 'string',
                            description: 'Token received in the password-reset email',
                        },
                    },
                }),
            },
            responses: {
                200: { description: 'Password updated' },
                400: { description: 'Invalid or expired token' },
            },
        },
    };
    document.paths['/api/auth/sign-in/social'] = {
        post: {
            tags: authTag,
            summary: 'Initiate Google OAuth',
            description: 'Returns a redirect URL to Google. In the Flutter apps this is handled natively via the google_sign_in package — this endpoint is primarily used by the admin web console.',
            requestBody: {
                required: true,
                ...jsonContent({
                    type: 'object',
                    required: ['provider', 'callbackURL'],
                    properties: {
                        provider: { type: 'string', enum: ['google'], example: 'google' },
                        callbackURL: {
                            type: 'string',
                            example: 'http://localhost:3003/auth/callback',
                        },
                    },
                }),
            },
            responses: {
                200: { description: 'Returns redirect URL to Google' },
            },
        },
    };
}
//# sourceMappingURL=better-auth.swagger.js.map