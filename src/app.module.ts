import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

// Infrastructure (global — available to every feature module)
import { PrismaModule } from './prisma/prisma.module';
import { ChatRealtimeModule } from './common/realtime/chat-realtime.module';
import { RedisModule } from './common/redis/redis.module';
import { UploadModule } from './common/upload/upload.module';
import { EmailModule } from './common/email/email.module';
import { FirebaseModule } from './common/firebase/firebase.module';
import { TypesenseModule } from './common/typesense/typesense.module';
import { AuditModule } from './common/audit/audit.module';

// Auth
import { AuthModule } from './auth/auth.module';

// Billing (provider-agnostic subscription rails — Stripe/Paystack/PayPal/IAP)
import { BillingModule } from './modules/billing/billing.module';

// Feature modules
import { LocationsModule } from './modules/locations/locations.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { UsersModule } from './modules/users/users.module';
import { AdminModule } from './modules/admin/admin.module';
import { VendorsModule } from './modules/vendors/vendors.module';
import { ListingsModule } from './modules/listings/listings.module';
import { EventsModule } from './modules/events/events.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { QuotesModule } from './modules/quotes/quotes.module';
import { ChatOrdersModule } from './modules/chat-orders/chat-orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { PayoutsModule } from './modules/payouts/payouts.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { DisputesModule } from './modules/disputes/disputes.module';
import { MessagingModule } from './modules/messaging/messaging.module';
import { CallsModule } from './modules/calls/calls.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SearchModule } from './modules/search/search.module';

@Module({
  imports: [
    // ─── Config ───────────────────────────────────────────────────────────
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),

    // ─── Rate limiting ────────────────────────────────────────────────────
    // A general per-IP backstop across the whole API (payments, bank-resolve
    // proxy, etc.). Auth/OTP endpoints have their own tighter per-path limits
    // via Better Auth (see auth.config.ts). Webhooks are exempt (@SkipThrottle).
    // Kept generous by default to tolerate carrier NAT (many users share one IP
    // on Nigerian mobile networks); tune via THROTTLE_TTL_MS / THROTTLE_LIMIT.
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: Number(process.env.THROTTLE_TTL_MS ?? 60_000),
        limit: Number(process.env.THROTTLE_LIMIT ?? 300),
      },
    ]),

    // ─── Infrastructure ───────────────────────────────────────────────────
    PrismaModule,
    ChatRealtimeModule,
    RedisModule,
    EmailModule,
    FirebaseModule,
    UploadModule,
    TypesenseModule,
    AuditModule,

    // ─── Auth ─────────────────────────────────────────────────────────────
    AuthModule,

    // ─── Billing ──────────────────────────────────────────────────────────
    BillingModule,

    // ─── Feature modules ──────────────────────────────────────────────────
    LocationsModule,
    CategoriesModule,
    UsersModule,
    AdminModule,
    VendorsModule,
    ListingsModule,
    EventsModule,
    BookingsModule,
    QuotesModule,
    ChatOrdersModule,
    PaymentsModule,
    PayoutsModule,
    SubscriptionsModule,
    ReviewsModule,
    DisputesModule,
    MessagingModule,
    CallsModule,
    NotificationsModule,
    SearchModule,
  ],
  providers: [
    // Apply the rate limiter globally.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
