import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { injectBetterAuthPaths } from './auth/better-auth.swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global input validation — strips unknown fields, throws on bad data.
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  // CORS — Flutter web and admin console origins.
  app.enableCors({
    origin: [
      'http://localhost:3001', // Flutter client web (dev)
      'http://localhost:3002', // Flutter vendor web (dev)
      'http://localhost:3003', // Admin console (dev)
    ],
    credentials: true, // required for Better Auth session cookies
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
  await app.listen(port);
  console.log(`API running on http://localhost:${port}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Swagger docs → http://localhost:${port}/docs`);
  }
}

bootstrap();
