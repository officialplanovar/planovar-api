import 'dotenv/config';
export declare function normalizePhone(raw?: string | null): string | null;
export declare const auth: import("better-auth", { with: { "resolution-mode": "import" } }).Auth<{
    database: (options: import("better-auth", { with: { "resolution-mode": "import" } }).BetterAuthOptions) => import("better-auth", { with: { "resolution-mode": "import" } }).DBAdapter<import("better-auth", { with: { "resolution-mode": "import" } }).BetterAuthOptions>;
    baseURL: string;
    trustedOrigins: string[];
    secret: string;
    rateLimit: {
        enabled: true;
        window: number;
        max: number;
        customRules: {
            '/sign-in/email': {
                window: number;
                max: number;
            };
            '/sign-up/email': {
                window: number;
                max: number;
            };
            '/email-otp/send-verification-otp': {
                window: number;
                max: number;
            };
            '/email-otp/verify-email': {
                window: number;
                max: number;
            };
            '/forget-password': {
                window: number;
                max: number;
            };
            '/reset-password': {
                window: number;
                max: number;
            };
        };
    };
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
        id: "two-factor";
        version: string;
        endpoints: {
            enableTwoFactor: import("better-auth", { with: { "resolution-mode": "import" } }).StrictEndpoint<"/two-factor/enable", {
                method: "POST";
                body: import("better-auth", { with: { "resolution-mode": "import" } }).ZodObject<{
                    password: import("better-auth", { with: { "resolution-mode": "import" } }).ZodOptional<import("better-auth", { with: { "resolution-mode": "import" } }).ZodString>;
                    issuer: import("better-auth", { with: { "resolution-mode": "import" } }).ZodOptional<import("better-auth", { with: { "resolution-mode": "import" } }).ZodString>;
                }, import("zod/v4/core").$strip> | import("better-auth", { with: { "resolution-mode": "import" } }).ZodObject<{
                    password: import("better-auth", { with: { "resolution-mode": "import" } }).ZodString;
                    issuer: import("better-auth", { with: { "resolution-mode": "import" } }).ZodOptional<import("better-auth", { with: { "resolution-mode": "import" } }).ZodString>;
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
                        summary: string;
                        description: string;
                        responses: {
                            200: {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                totpURI: {
                                                    type: string;
                                                    description: string;
                                                };
                                                backupCodes: {
                                                    type: string;
                                                    items: {
                                                        type: string;
                                                    };
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
                totpURI: string;
                backupCodes: string[];
            }>;
            disableTwoFactor: import("better-auth", { with: { "resolution-mode": "import" } }).StrictEndpoint<"/two-factor/disable", {
                method: "POST";
                body: import("better-auth", { with: { "resolution-mode": "import" } }).ZodObject<{
                    password: import("better-auth", { with: { "resolution-mode": "import" } }).ZodOptional<import("better-auth", { with: { "resolution-mode": "import" } }).ZodString>;
                }, import("zod/v4/core").$strip> | import("better-auth", { with: { "resolution-mode": "import" } }).ZodObject<{
                    password: import("better-auth", { with: { "resolution-mode": "import" } }).ZodString;
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
                        summary: string;
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
                status: boolean;
            }>;
            verifyBackupCode: import("better-auth", { with: { "resolution-mode": "import" } }).StrictEndpoint<"/two-factor/verify-backup-code", {
                method: "POST";
                body: import("better-auth", { with: { "resolution-mode": "import" } }).ZodObject<{
                    code: import("better-auth", { with: { "resolution-mode": "import" } }).ZodString;
                    disableSession: import("better-auth", { with: { "resolution-mode": "import" } }).ZodOptional<import("better-auth", { with: { "resolution-mode": "import" } }).ZodBoolean>;
                    trustDevice: import("better-auth", { with: { "resolution-mode": "import" } }).ZodOptional<import("better-auth", { with: { "resolution-mode": "import" } }).ZodBoolean>;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    openapi: {
                        description: string;
                        responses: {
                            "200": {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                user: {
                                                    type: string;
                                                    properties: {
                                                        id: {
                                                            type: string;
                                                            description: string;
                                                        };
                                                        email: {
                                                            type: string;
                                                            format: string;
                                                            nullable: boolean;
                                                            description: string;
                                                        };
                                                        emailVerified: {
                                                            type: string;
                                                            nullable: boolean;
                                                            description: string;
                                                        };
                                                        name: {
                                                            type: string;
                                                            nullable: boolean;
                                                            description: string;
                                                        };
                                                        image: {
                                                            type: string;
                                                            format: string;
                                                            nullable: boolean;
                                                            description: string;
                                                        };
                                                        twoFactorEnabled: {
                                                            type: string;
                                                            description: string;
                                                        };
                                                        createdAt: {
                                                            type: string;
                                                            format: string;
                                                            description: string;
                                                        };
                                                        updatedAt: {
                                                            type: string;
                                                            format: string;
                                                            description: string;
                                                        };
                                                    };
                                                    required: string[];
                                                    description: string;
                                                };
                                                session: {
                                                    type: string;
                                                    properties: {
                                                        token: {
                                                            type: string;
                                                            description: string;
                                                        };
                                                        userId: {
                                                            type: string;
                                                            description: string;
                                                        };
                                                        createdAt: {
                                                            type: string;
                                                            format: string;
                                                            description: string;
                                                        };
                                                        expiresAt: {
                                                            type: string;
                                                            format: string;
                                                            description: string;
                                                        };
                                                    };
                                                    required: string[];
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
                token: string | undefined;
                user: (Record<string, any> & {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    email: string;
                    emailVerified: boolean;
                    name: string;
                    image?: string | null | undefined;
                }) | import("better-auth/plugins", { with: { "resolution-mode": "import" } }).UserWithTwoFactor;
            }>;
            generateBackupCodes: import("better-auth", { with: { "resolution-mode": "import" } }).StrictEndpoint<"/two-factor/generate-backup-codes", {
                method: "POST";
                body: import("better-auth", { with: { "resolution-mode": "import" } }).ZodObject<{
                    password: import("better-auth", { with: { "resolution-mode": "import" } }).ZodOptional<import("better-auth", { with: { "resolution-mode": "import" } }).ZodString>;
                }, import("zod/v4/core").$strip> | import("better-auth", { with: { "resolution-mode": "import" } }).ZodObject<{
                    password: import("better-auth", { with: { "resolution-mode": "import" } }).ZodString;
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
                        description: string;
                        responses: {
                            "200": {
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
                                                backupCodes: {
                                                    type: string;
                                                    items: {
                                                        type: string;
                                                    };
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
                status: boolean;
                backupCodes: string[];
            }>;
            viewBackupCodes: import("better-auth", { with: { "resolution-mode": "import" } }).StrictEndpoint<string, {
                method: "POST";
                body: import("better-auth", { with: { "resolution-mode": "import" } }).ZodObject<{
                    userId: import("better-auth", { with: { "resolution-mode": "import" } }).ZodCoercedString<unknown>;
                }, import("zod/v4/core").$strip>;
            }, {
                status: boolean;
                backupCodes: string[];
            }>;
            sendTwoFactorOTP: import("better-auth", { with: { "resolution-mode": "import" } }).StrictEndpoint<"/two-factor/send-otp", {
                method: "POST";
                body: import("better-auth", { with: { "resolution-mode": "import" } }).ZodOptional<import("better-auth", { with: { "resolution-mode": "import" } }).ZodObject<{
                    trustDevice: import("better-auth", { with: { "resolution-mode": "import" } }).ZodOptional<import("better-auth", { with: { "resolution-mode": "import" } }).ZodBoolean>;
                }, import("zod/v4/core").$strip>>;
                metadata: {
                    openapi: {
                        summary: string;
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
                status: boolean;
            }>;
            verifyTwoFactorOTP: import("better-auth", { with: { "resolution-mode": "import" } }).StrictEndpoint<"/two-factor/verify-otp", {
                method: "POST";
                body: import("better-auth", { with: { "resolution-mode": "import" } }).ZodObject<{
                    code: import("better-auth", { with: { "resolution-mode": "import" } }).ZodString;
                    trustDevice: import("better-auth", { with: { "resolution-mode": "import" } }).ZodOptional<import("better-auth", { with: { "resolution-mode": "import" } }).ZodBoolean>;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    openapi: {
                        summary: string;
                        description: string;
                        responses: {
                            "200": {
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
                                                    type: string;
                                                    properties: {
                                                        id: {
                                                            type: string;
                                                            description: string;
                                                        };
                                                        email: {
                                                            type: string;
                                                            format: string;
                                                            nullable: boolean;
                                                            description: string;
                                                        };
                                                        emailVerified: {
                                                            type: string;
                                                            nullable: boolean;
                                                            description: string;
                                                        };
                                                        name: {
                                                            type: string;
                                                            nullable: boolean;
                                                            description: string;
                                                        };
                                                        image: {
                                                            type: string;
                                                            format: string;
                                                            nullable: boolean;
                                                            description: string;
                                                        };
                                                        createdAt: {
                                                            type: string;
                                                            format: string;
                                                            description: string;
                                                        };
                                                        updatedAt: {
                                                            type: string;
                                                            format: string;
                                                            description: string;
                                                        };
                                                    };
                                                    required: string[];
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
                token: string;
                user: import("better-auth/plugins", { with: { "resolution-mode": "import" } }).UserWithTwoFactor;
            } | {
                token: string;
                user: Record<string, any> & {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    email: string;
                    emailVerified: boolean;
                    name: string;
                    image?: string | null | undefined;
                };
            }>;
            generateTOTP: import("better-auth", { with: { "resolution-mode": "import" } }).StrictEndpoint<string, {
                method: "POST";
                body: import("better-auth", { with: { "resolution-mode": "import" } }).ZodObject<{
                    secret: import("better-auth", { with: { "resolution-mode": "import" } }).ZodString;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    openapi: {
                        summary: string;
                        description: string;
                        responses: {
                            200: {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                code: {
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
                code: string;
            }>;
            getTOTPURI: import("better-auth", { with: { "resolution-mode": "import" } }).StrictEndpoint<"/two-factor/get-totp-uri", {
                method: "POST";
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
                body: import("better-auth", { with: { "resolution-mode": "import" } }).ZodObject<{
                    password: import("better-auth", { with: { "resolution-mode": "import" } }).ZodOptional<import("better-auth", { with: { "resolution-mode": "import" } }).ZodString>;
                }, import("zod/v4/core").$strip> | import("better-auth", { with: { "resolution-mode": "import" } }).ZodObject<{
                    password: import("better-auth", { with: { "resolution-mode": "import" } }).ZodString;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    openapi: {
                        summary: string;
                        description: string;
                        responses: {
                            200: {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                totpURI: {
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
                totpURI: string;
            }>;
            verifyTOTP: import("better-auth", { with: { "resolution-mode": "import" } }).StrictEndpoint<"/two-factor/verify-totp", {
                method: "POST";
                body: import("better-auth", { with: { "resolution-mode": "import" } }).ZodObject<{
                    code: import("better-auth", { with: { "resolution-mode": "import" } }).ZodString;
                    trustDevice: import("better-auth", { with: { "resolution-mode": "import" } }).ZodOptional<import("better-auth", { with: { "resolution-mode": "import" } }).ZodBoolean>;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    openapi: {
                        summary: string;
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
                token: string;
                user: import("better-auth/plugins", { with: { "resolution-mode": "import" } }).UserWithTwoFactor;
            } | {
                token: string;
                user: Record<string, any> & {
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
        options: NoInfer<{
            issuer: string;
        }>;
        hooks: {
            after: {
                matcher(context: import("better-auth", { with: { "resolution-mode": "import" } }).HookEndpointContext): boolean;
                handler: (inputContext: import("better-auth", { with: { "resolution-mode": "import" } }).MiddlewareInputContext<import("better-auth", { with: { "resolution-mode": "import" } }).MiddlewareOptions>) => Promise<{
                    twoFactorRedirect: boolean;
                    twoFactorMethods: string[];
                } | undefined>;
            }[];
        };
        schema: {
            user: {
                fields: {
                    twoFactorEnabled: {
                        type: "boolean";
                        required: false;
                        defaultValue: false;
                        input: false;
                    };
                };
            };
            twoFactor: {
                fields: {
                    secret: {
                        type: "string";
                        required: true;
                        returned: false;
                        index: true;
                    };
                    backupCodes: {
                        type: "string";
                        required: true;
                        returned: false;
                    };
                    userId: {
                        type: "string";
                        required: true;
                        returned: false;
                        references: {
                            model: string;
                            field: string;
                        };
                        index: true;
                    };
                    verified: {
                        type: "boolean";
                        required: false;
                        defaultValue: true;
                        input: false;
                    };
                };
            };
        };
        rateLimit: {
            pathMatcher(path: string): boolean;
            window: number;
            max: number;
        }[];
        $ERROR_CODES: {
            OTP_NOT_ENABLED: import("better-auth", { with: { "resolution-mode": "import" } }).RawError<"OTP_NOT_ENABLED">;
            OTP_HAS_EXPIRED: import("better-auth", { with: { "resolution-mode": "import" } }).RawError<"OTP_HAS_EXPIRED">;
            TOTP_NOT_ENABLED: import("better-auth", { with: { "resolution-mode": "import" } }).RawError<"TOTP_NOT_ENABLED">;
            TWO_FACTOR_NOT_ENABLED: import("better-auth", { with: { "resolution-mode": "import" } }).RawError<"TWO_FACTOR_NOT_ENABLED">;
            BACKUP_CODES_NOT_ENABLED: import("better-auth", { with: { "resolution-mode": "import" } }).RawError<"BACKUP_CODES_NOT_ENABLED">;
            INVALID_BACKUP_CODE: import("better-auth", { with: { "resolution-mode": "import" } }).RawError<"INVALID_BACKUP_CODE">;
            INVALID_CODE: import("better-auth", { with: { "resolution-mode": "import" } }).RawError<"INVALID_CODE">;
            TOO_MANY_ATTEMPTS_REQUEST_NEW_CODE: import("better-auth", { with: { "resolution-mode": "import" } }).RawError<"TOO_MANY_ATTEMPTS_REQUEST_NEW_CODE">;
            INVALID_TWO_FACTOR_COOKIE: import("better-auth", { with: { "resolution-mode": "import" } }).RawError<"INVALID_TWO_FACTOR_COOKIE">;
        };
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
            dateOfBirth: {
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
