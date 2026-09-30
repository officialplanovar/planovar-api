"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const path_1 = require("path");
const app_module_1 = require("./app.module");
const better_auth_swagger_1 = require("./auth/better-auth.swagger");
const cors_1 = require("./common/cors");
process.on('uncaughtException', (err) => {
    console.error('uncaughtException (logged, not fatal):', err);
});
process.on('unhandledRejection', (err) => {
    console.error('unhandledRejection (logged, not fatal):', err);
});
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        rawBody: true,
    });
    app.useStaticAssets((0, path_1.join)(process.cwd(), 'public'), {
        maxAge: '7d',
    });
    if (process.env.NODE_ENV !== 'production' &&
        process.env.LOG_REQUESTS !== 'false') {
        const httpLogger = new common_1.Logger('HTTP');
        app.use((req, res, next) => {
            const start = Date.now();
            res.on('finish', () => {
                const ms = Date.now() - start;
                httpLogger.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`);
            });
            next();
        });
    }
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    app.enableCors({
        origin: (0, cors_1.getCorsOrigins)(),
        credentials: true,
        exposedHeaders: ['set-auth-token'],
    });
    if (process.env.NODE_ENV !== 'production') {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('Planovar API')
            .setDescription('REST API for the Planovar event marketplace. ' +
            'Auth routes (/api/auth/*) are managed by Better Auth and are not listed here. ' +
            'All other endpoints require a valid Better Auth session cookie.')
            .setVersion('1.0')
            .addCookieAuth('better-auth.session_token')
            .addTag('users', 'User profile management')
            .addTag('vendors', 'Vendor profile and onboarding')
            .addTag('listings', 'Listing CRUD and discovery')
            .addTag('bookings', 'Booking lifecycle')
            .addTag('quotes', 'Quote requests and responses')
            .addTag('payments', 'Paystack payments and payouts')
            .addTag('messaging', 'Conversations and messages')
            .addTag('reviews', 'Reviews and vendor responses')
            .addTag('notifications', 'Push and in-app notifications')
            .addTag('search', 'Typesense-backed search')
            .addTag('subscriptions', 'Vendor subscription plans')
            .addTag('admin', 'Admin-only operations')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        (0, better_auth_swagger_1.injectBetterAuthPaths)(document);
        swagger_1.SwaggerModule.setup('docs', app, document, {
            swaggerOptions: {
                persistAuthorization: true,
            },
        });
    }
    app.enableShutdownHooks();
    const port = process.env.PORT ?? 3000;
    await app.listen(port, '0.0.0.0');
    console.log(`API running on 0.0.0.0:${port}`);
    if (process.env.NODE_ENV !== 'production') {
        console.log(`Swagger docs → http://localhost:${port}/docs`);
    }
}
bootstrap().catch((err) => {
    console.error('FATAL: API failed to start');
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map