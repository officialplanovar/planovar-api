import 'dotenv/config';
export declare function normalizeNgPhone(raw?: string | null): string | null;
export declare const auth: import("better-auth", { with: { "resolution-mode": "import" } }).Auth<{
    database: (options: import("better-auth", { with: { "resolution-mode": "import" } }).BetterAuthOptions) => import("better-auth", { with: { "resolution-mode": "import" } }).DBAdapter<import("better-auth", { with: { "resolution-mode": "import" } }).BetterAuthOptions>;
    baseURL: string;
    trustedOrigins: string[];
    secret: string;
    advanced: any;
    emailAndPassword: {
        enabled: true;
        requireEmailVerification: boolean;
        minPasswordLength: number;
    };
    socialProviders: Record<string, unknown>;
    plugins: [{
        id: "bearer";
        version: string;
        hooks: {
            before: {
                matcher(context: import("better-auth", { with: { "resolution-mode": "import" } }).HookEndpointContext): boolean;
                handler: (inputContext: import("better-auth", { with: { "resolution-mode": "import" } }).MiddlewareInputContext<import("better-auth", { with: { "resolution-mode": "import" } }).MiddlewareOptions>) => Promise<{
                    context: {
                        headers: Headers;
                    };
                } | undefined>;
            }[];
            after: {
                matcher(context: import("better-auth", { with: { "resolution-mode": "import" } }).HookEndpointContext): true;
                handler: (inputContext: import("better-auth", { with: { "resolution-mode": "import" } }).MiddlewareInputContext<import("better-auth", { with: { "resolution-mode": "import" } }).MiddlewareOptions>) => Promise<void>;
            }[];
        };
        options: import("better-auth/plugins", { with: { "resolution-mode": "import" } }).BearerOptions | undefined;
    }, {
        id: "email-otp";
        version: string;
        init(ctx: import("better-auth", { with: { "resolution-mode": "import" } }).AuthContext): {
            options: {
                emailVerification: {
                    sendVerificationEmail(data: {
                        user: import("better-auth", { with: { "resolution-mode": "import" } }).User;
                        url: string;
                        token: string;
                    }, request: Request | undefined): Promise<void>;
                };
            };
        } | undefined;
        endpoints: {
            sendVerificationOTP: import("better-auth", { with: { "resolution-mode": "import" } }).StrictEndpoint<"/email-otp/send-verification-otp", {
                method: "POST";
                body: import("better-auth", { with: { "resolution-mode": "import" } }).ZodObject<{
                    email: import("better-auth", { with: { "resolution-mode": "import" } }).ZodString;
                    type: import("better-auth", { with: { "resolution-mode": "import" } }).ZodEnum<{
                        "sign-in": "sign-in";
                        "change-email": "change-email";
                        "email-verification": "email-verification";
                        "forget-password": "forget-password";
                    }>;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    openapi: {
                        operationId: string;
                        description: string;
                        responses: {
                            200: {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                success: {
                                                    type: string;
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, {
                success: boolean;
            }>;
            createVerificationOTP: import("better-auth", { with: { "resolution-mode": "import" } }).StrictEndpoint<string, {
                method: "POST";
                body: import("better-auth", { with: { "resolution-mode": "import" } }).ZodObject<{
                    email: import("better-auth", { with: { "resolution-mode": "import" } }).ZodString;
                    type: import("better-auth", { with: { "resolution-mode": "import" } }).ZodEnum<{
                        "sign-in": "sign-in";
                        "change-email": "change-email";
                        "email-verification": "email-verification";
                        "forget-password": "forget-password";
                    }>;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    openapi: {
                        operationId: string;
                        description: string;
                        responses: {
                            200: {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "string";
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, string>;
            getVerificationOTP: import("better-auth", { with: { "resolution-mode": "import" } }).StrictEndpoint<string, {
                method: "GET";
                query: import("better-auth", { with: { "resolution-mode": "import" } }).ZodObject<{
                    email: import("better-auth", { with: { "resolution-mode": "import" } }).ZodString;
                    type: import("better-auth", { with: { "resolution-mode": "import" } }).ZodEnum<{
                        "sign-in": "sign-in";
                        "change-email": "change-email";
                        "email-verification": "email-verification";
                        "forget-password": "forget-password";
                    }>;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    openapi: {
                        operationId: string;
                        description: string;
                        responses: {
                            "200": {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                otp: {
                                                    type: string;
                                                    nullable: boolean;
                                                    description: string;
                                                };
                                            };
                                            required: string[];
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, {
                otp: null;
            } | {
                otp: string;
            }>;
            checkVerificationOTP: import("better-auth", { with: { "resolution-mode": "import" } }).StrictEndpoint<"/email-otp/check-verification-otp", {
                method: "POST";
                body: import("better-auth", { with: { "resolution-mode": "import" } }).ZodObject<{
                    email: import("better-auth", { with: { "resolution-mode": "import" } }).ZodString;
                    type: import("better-auth", { with: { "resolution-mode": "import" } }).ZodEnum<{
                        "sign-in": "sign-in";
                        "change-email": "change-email";
                        "email-verification": "email-verification";
                        "forget-password": "forget-password";
                    }>;
                    otp: import("better-auth", { with: { "resolution-mode": "import" } }).ZodString;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    openapi: {
                        operationId: string;
                        description: string;
                        responses: {
                            200: {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                success: {
                                                    type: string;
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, {
                success: boolean;
            }>;
            verifyEmailOTP: import("better-auth", { with: { "resolution-mode": "import" } }).StrictEndpoint<"/email-otp/verify-email", {
                method: "POST";
                body: import("better-auth", { with: { "resolution-mode": "import" } }).ZodObject<{
                    email: import("better-auth", { with: { "resolution-mode": "import" } }).ZodString;
                    otp: import("better-auth", { with: { "resolution-mode": "import" } }).ZodString;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    openapi: {
                        description: string;
                        responses: {
                            200: {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                status: {
                                                    type: string;
                                                    description: string;
                                                    enum: boolean[];
                                                };
                                                token: {
                                                    type: string;
                                                    nullable: boolean;
                                                    description: string;
                                                };
                                                user: {
                                                    $ref: string;
                                                };
                                            };
                                            required: string[];
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, {
                status: boolean;
                token: string;
                user: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    email: string;
                    emailVerified: boolean;
                    name: string;
                    image?: string | null | undefined;
                } & Record<string, any>;
            } | {
                status: boolean;
                token: null;
                user: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    email: string;
                    emailVerified: boolean;
                    name: string;
                    image?: string | null | undefined;
                } & Record<string, any>;
            }>;
            signInEmailOTP: import("better-auth", { with: { "resolution-mode": "import" } }).StrictEndpoint<"/sign-in/email-otp", {
                method: "POST";
                body: import("better-auth", { with: { "resolution-mode": "import" } }).ZodIntersection<import("better-auth", { with: { "resolution-mode": "import" } }).ZodObject<{
                    email: import("better-auth", { with: { "resolution-mode": "import" } }).ZodString;
                    otp: import("better-auth", { with: { "resolution-mode": "import" } }).ZodString;
                    name: import("better-auth", { with: { "resolution-mode": "import" } }).ZodOptional<import("better-auth", { with: { "resolution-mode": "import" } }).ZodString>;
                    image: import("better-auth", { with: { "resolution-mode": "import" } }).ZodOptional<import("better-auth", { with: { "resolution-mode": "import" } }).ZodString>;
                }, import("zod/v4/core").$strip>, import("better-auth", { with: { "resolution-mode": "import" } }).ZodRecord<import("better-auth", { with: { "resolution-mode": "import" } }).ZodString, import("better-auth", { with: { "resolution-mode": "import" } }).ZodAny>>;
                metadata: {
                    openapi: {
                        operationId: string;
                        description: string;
                        responses: {
                            200: {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                token: {
                                                    type: string;
                                                    description: string;
                                                };
                                                user: {
                                                    $ref: string;
                                                };
                                            };
                                            required: string[];
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, {
                token: string;
                user: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    email: string;
                    emailVerified: boolean;
                    name: string;
                    image?: string | null | undefined;
                };
            }>;
            requestPasswordResetEmailOTP: import("better-auth", { with: { "resolution-mode": "import" } }).StrictEndpoint<"/email-otp/request-password-reset", {
                method: "POST";
                body: import("better-auth", { with: { "resolution-mode": "import" } }).ZodObject<{
                    email: import("better-auth", { with: { "resolution-mode": "import" } }).ZodString;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    openapi: {
                        operationId: string;
                        description: string;
                        responses: {
                            200: {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                success: {
                                                    type: string;
                                                    description: string;
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, {
                success: boolean;
            }>;
            forgetPasswordEmailOTP: import("better-auth", { with: { "resolution-mode": "import" } }).StrictEndpoint<"/forget-password/email-otp", {
                method: "POST";
                body: import("better-auth", { with: { "resolution-mode": "import" } }).ZodObject<{
                    email: import("better-auth", { with: { "resolution-mode": "import" } }).ZodString;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    openapi: {
                        operationId: string;
                        description: string;
                        responses: {
                            200: {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                success: {
                                                    type: string;
                                                    description: string;
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, {
                success: boolean;
            }>;
            resetPasswordEmailOTP: import("better-auth", { with: { "resolution-mode": "import" } }).StrictEndpoint<"/email-otp/reset-password", {
                method: "POST";
                body: import("better-auth", { with: { "resolution-mode": "import" } }).ZodObject<{
                    email: import("better-auth", { with: { "resolution-mode": "import" } }).ZodString;
                    otp: import("better-auth", { with: { "resolution-mode": "import" } }).ZodString;
                    password: import("better-auth", { with: { "resolution-mode": "import" } }).ZodString;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    openapi: {
                        operationId: string;
                        description: string;
                        responses: {
                            200: {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                success: {
                                                    type: string;
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, {
                success: boolean;
            }>;
            requestEmailChangeEmailOTP: import("better-auth", { with: { "resolution-mode": "import" } }).StrictEndpoint<"/email-otp/request-email-change", {
                method: "POST";
                body: import("better-auth", { with: { "resolution-mode": "import" } }).ZodObject<{
                    newEmail: import("better-auth", { with: { "resolution-mode": "import" } }).ZodString;
                    otp: import("better-auth", { with: { "resolution-mode": "import" } }).ZodOptional<import("better-auth", { with: { "resolution-mode": "import" } }).ZodString>;
                }, import("zod/v4/core").$strip>;
                use: ((inputContext: import("better-auth", { with: { "resolution-mode": "import" } }).MiddlewareInputContext<import("better-auth", { with: { "resolution-mode": "import" } }).MiddlewareOptions>) => Promise<{
                    session: {
                        session: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            userId: string;
                            expiresAt: Date;
                            token: string;
                            ipAddress?: string | null | undefined;
                            userAgent?: string | null | undefined;
                        };
                        user: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            email: string;
                            emailVerified: boolean;
                            name: string;
                            image?: string | null | undefined;
                        };
                    };
                }>)[];
                metadata: {
                    openapi: {
                        operationId: string;
                        description: string;
                        responses: {
                            200: {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                success: {
                                                    type: string;
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, {
                success: boolean;
            }>;
            changeEmailEmailOTP: import("better-auth", { with: { "resolution-mode": "import" } }).StrictEndpoint<"/email-otp/change-email", {
                method: "POST";
                body: import("better-auth", { with: { "resolution-mode": "import" } }).ZodObject<{
                    newEmail: import("better-auth", { with: { "resolution-mode": "import" } }).ZodString;
                    otp: import("better-auth", { with: { "resolution-mode": "import" } }).ZodString;
                }, import("zod/v4/core").$strip>;
                use: ((inputContext: import("better-auth", { with: { "resolution-mode": "import" } }).MiddlewareInputContext<import("better-auth", { with: { "resolution-mode": "import" } }).MiddlewareOptions>) => Promise<{
                    session: {
                        session: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            userId: string;
                            expiresAt: Date;
                            token: string;
                            ipAddress?: string | null | undefined;
                            userAgent?: string | null | undefined;
                        };
                        user: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            email: string;
                            emailVerified: boolean;
                            name: string;
                            image?: string | null | undefined;
                        };
                    };
                }>)[];
                metadata: {
                    openapi: {
                        operationId: string;
                        description: string;
                        responses: {
                            200: {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                success: {
                                                    type: string;
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, {
                success: boolean;
            }>;
        };
        hooks: {
            after: {
                matcher(context: import("better-auth", { with: { "resolution-mode": "import" } }).HookEndpointContext): boolean;
                handler: (inputContext: import("better-auth", { with: { "resolution-mode": "import" } }).MiddlewareInputContext<import("better-auth", { with: { "resolution-mode": "import" } }).MiddlewareOptions>) => Promise<void>;
            }[];
        };
        rateLimit: ({
            pathMatcher(path: string): path is "/email-otp/send-verification-otp";
            window: number;
            max: number;
        } | {
            pathMatcher(path: string): path is "/email-otp/check-verification-otp";
            window: number;
            max: number;
        } | {
            pathMatcher(path: string): path is "/email-otp/verify-email";
            window: number;
            max: number;
        } | {
            pathMatcher(path: string): path is "/sign-in/email-otp";
            window: number;
            max: number;
        } | {
            pathMatcher(path: string): path is "/email-otp/request-password-reset";
            window: number;
            max: number;
        } | {
            pathMatcher(path: string): path is "/email-otp/reset-password";
            window: number;
            max: number;
        } | {
            pathMatcher(path: string): path is "/forget-password/email-otp";
            window: number;
            max: number;
        } | {
            pathMatcher(path: string): path is "/email-otp/request-email-change";
            window: number;
            max: number;
        } | {
            pathMatcher(path: string): path is "/email-otp/change-email";
            window: number;
            max: number;
        })[];
        options: import("better-auth/plugins", { with: { "resolution-mode": "import" } }).EmailOTPOptions;
        $ERROR_CODES: {
            OTP_EXPIRED: import("better-auth", { with: { "resolution-mode": "import" } }).RawError<"OTP_EXPIRED">;
            INVALID_OTP: import("better-auth", { with: { "resolution-mode": "import" } }).RawError<"INVALID_OTP">;
            TOO_MANY_ATTEMPTS: import("better-auth", { with: { "resolution-mode": "import" } }).RawError<"TOO_MANY_ATTEMPTS">;
        };
    }];
    user: {
        additionalFields: {
            role: {
                type: "string";
                defaultValue: string;
                input: false;
            };
            phone: {
                type: "string";
                required: false;
                input: true;
            };
            firstName: {
                type: "string";
                required: false;
                input: true;
            };
            lastName: {
                type: "string";
                required: false;
                input: true;
            };
            isActive: {
                type: "boolean";
                defaultValue: true;
                input: false;
            };
        };
    };
    databaseHooks: {
        user: {
            create: {
                before: (user: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    email: string;
                    emailVerified: boolean;
                    name: string;
                    image?: string | null | undefined;
                } & Record<string, unknown>) => Promise<{
                    data: {
                        phone: string | null;
                        id: string;
                        createdAt: Date;
                        updatedAt: Date;
                        email: string;
                        emailVerified: boolean;
                        name: string;
                        image?: string | null | undefined;
                    };
                }>;
            };
        };
    };
    session: {
        expiresIn: number;
        updateAge: number;
        cookieCache: {
            enabled: true;
            maxAge: number;
        };
    };
}>;
export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session;
export type AuthUser = typeof auth.$Infer.Session.user;
