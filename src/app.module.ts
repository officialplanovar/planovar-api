import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Infrastructure (global — available to every feature module)
import { PrismaModule } from './prisma/prisma.module';
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

    // ─── Infrastructure ───────────────────────────────────────────────────
    PrismaModule,
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
})
export class AppModule {}
