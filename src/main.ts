import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { injectBetterAuthPaths } from './auth/better-auth.swagger';

// Runs the instant node executes this file — if this never appears in the logs,
// `node dist/main` isn't running at all (start-command/build problem).
console.log('[boot] dist/main loaded — node is executing');

// Surface anything that would otherwise kill the process silently.
process.on('uncaughtException', (err) => {
  console.error('[boot] FATAL uncaughtException:', err);
  process.exit(1);
});
process.on('unhandledRejection', (err) => {
  console.error('[boot] FATAL unhandledRejection:', err);
  process.exit(1);
});

async function bootstrap() {
  console.log('[boot] creating Nest app (loading all modules)…');
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });
  console.log('[boot] Nest app created — configuring middleware…');

  // Static branding assets (logos for emails etc.) — served at /branding/*.
  // Files live in planovar-api/public/branding/ (see the README there).
  app.useStaticAssets(join(process.cwd(), 'public'), {
    maxAge: '7d',
  });

  // ── Request logging (concise; disabled in production) ────────────────────
  // Logs every request — including Better Auth (/api/auth/*) and webhooks — with
  // method, path, status and duration. Set LOG_REQUESTS=false to silence.
  if (
    process.env.NODE_ENV !== 'production' &&
    process.env.LOG_REQUESTS !== 'false'
  ) {
    const httpLogger = new Logger('HTTP');
    app.use((req: any, res: any, next: () => void) => {
      const start = Date.now();
      res.on('finish', () => {
        const ms = Date.now() - start;
        httpLogger.log(
          `${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`,
        );
      });
      next();
    });
  }

  // Global input validation — strips unknown fields, throws on bad data.
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  // CORS — Flutter web and admin console origins.
  // Extra origins can be supplied via CORS_ORIGINS (comma-separated).
  const defaultOrigins = [
    'http://localhost:3001', // Flutter client web (dev)
    'http://localhost:3002', // Flutter vendor web (dev)
    'http://localhost:3003', // Admin console (dev, default Next port)
    'http://localhost:3004', // Admin console (dev, documented port)
  ];
  const envOrigins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  app.enableCors({
    origin: [...new Set([...defaultOrigins, ...envOrigins])],
    credentials: true, // required for Better Auth session cookies
    // Expose the Better Auth bearer token so browser SPAs (admin console) can
    // read it from the response and store it for Authorization headers.
    exposedHeaders: ['set-auth-token'],
  });

  // Swagger — available in dev/staging only.
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Planovar API')
      .setDescription(
        'REST API for the Planovar event marketplace. ' +
          'Auth routes (/api/auth/*) are managed by Better Auth and are not listed here. ' +
          'All other endpoints require a valid Better Auth session cookie.',
      )
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

    const document = SwaggerModule.createDocument(app, config);
    injectBetterAuthPaths(document);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  const port = process.env.PORT ?? 3000;
  // Bind to 0.0.0.0 (per Railway docs) — the default bind can leave the edge
  // proxy unable to reach the app, causing "connection dial timeout" 502s.
  await app.listen(port, '0.0.0.0');
  console.log(`API running on 0.0.0.0:${port}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Swagger docs → http://localhost:${port}/docs`);
  }
}

bootstrap().catch((err) => {
  // Make boot failures loud — otherwise the container exits silently and Railway
  // just reports a 502 with no clue why.
  console.error('FATAL: API failed to start');
  console.error(err);
  process.exit(1);
});
