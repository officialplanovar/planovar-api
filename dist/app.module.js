"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("./prisma/prisma.module");
const redis_module_1 = require("./common/redis/redis.module");
const upload_module_1 = require("./common/upload/upload.module");
const email_module_1 = require("./common/email/email.module");
const firebase_module_1 = require("./common/firebase/firebase.module");
const typesense_module_1 = require("./common/typesense/typesense.module");
const audit_module_1 = require("./common/audit/audit.module");
const auth_module_1 = require("./auth/auth.module");
const billing_module_1 = require("./modules/billing/billing.module");
const locations_module_1 = require("./modules/locations/locations.module");
const categories_module_1 = require("./modules/categories/categories.module");
const users_module_1 = require("./modules/users/users.module");
const admin_module_1 = require("./modules/admin/admin.module");
const vendors_module_1 = require("./modules/vendors/vendors.module");
const listings_module_1 = require("./modules/listings/listings.module");
const events_module_1 = require("./modules/events/events.module");
const bookings_module_1 = require("./modules/bookings/bookings.module");
const quotes_module_1 = require("./modules/quotes/quotes.module");
const payments_module_1 = require("./modules/payments/payments.module");
const payouts_module_1 = require("./modules/payouts/payouts.module");
const subscriptions_module_1 = require("./modules/subscriptions/subscriptions.module");
const reviews_module_1 = require("./modules/reviews/reviews.module");
const disputes_module_1 = require("./modules/disputes/disputes.module");
const messaging_module_1 = require("./modules/messaging/messaging.module");
const calls_module_1 = require("./modules/calls/calls.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const search_module_1 = require("./modules/search/search.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            redis_module_1.RedisModule,
            email_module_1.EmailModule,
            firebase_module_1.FirebaseModule,
            upload_module_1.UploadModule,
            typesense_module_1.TypesenseModule,
            audit_module_1.AuditModule,
            auth_module_1.AuthModule,
            billing_module_1.BillingModule,
            locations_module_1.LocationsModule,
            categories_module_1.CategoriesModule,
            users_module_1.UsersModule,
            admin_module_1.AdminModule,
            vendors_module_1.VendorsModule,
            listings_module_1.ListingsModule,
            events_module_1.EventsModule,
            bookings_module_1.BookingsModule,
            quotes_module_1.QuotesModule,
            payments_module_1.PaymentsModule,
            payouts_module_1.PayoutsModule,
            subscriptions_module_1.SubscriptionsModule,
            reviews_module_1.ReviewsModule,
            disputes_module_1.DisputesModule,
            messaging_module_1.MessagingModule,
            calls_module_1.CallsModule,
            notifications_module_1.NotificationsModule,
            search_module_1.SearchModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map