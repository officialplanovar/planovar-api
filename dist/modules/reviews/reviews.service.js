"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const redis_service_1 = require("../../common/redis/redis.service");
const notifications_service_1 = require("../notifications/notifications.service");
let ReviewsService = class ReviewsService {
    prisma;
    redis;
    notifications;
    constructor(prisma, redis, notifications) {
        this.prisma = prisma;
        this.redis = redis;
        this.notifications = notifications;
    }
    async create(reviewerId, dto) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: dto.bookingId },
            select: {
                id: true,
                clientId: true,
                vendorId: true,
                status: true,
                listing: { select: { title: true } },
                vendor: { select: { slug: true, userId: true } },
                client: { select: { firstName: true, name: true } },
            },
        });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        if (booking.status !== client_1.BookingStatus.COMPLETED) {
            throw new common_1.ForbiddenException('Can only review a completed booking');
        }
        if (booking.clientId !== reviewerId) {
            throw new common_1.ForbiddenException('You are not the client for this booking');
        }
        const existing = await this.prisma.review.findUnique({
            where: { bookingId: dto.bookingId },
            select: { id: true },
        });
        if (existing)
            throw new common_1.ConflictException('A review already exists for this booking');
        const review = await this.prisma.$transaction(async (tx) => {
            const created = await tx.review.create({
                data: {
                    bookingId: dto.bookingId,
                    reviewerId,
                    vendorId: booking.vendorId,
                    rating: dto.rating,
                    title: dto.title ?? null,
                    body: dto.body,
                },
            });
            const aggregate = await tx.review.aggregate({
                where: { vendorId: booking.vendorId },
                _avg: { rating: true },
                _count: { _all: true },
            });
            await tx.vendorProfile.update({
                where: { id: booking.vendorId },
                data: {
                    ratingAvg: new client_1.Prisma.Decimal((aggregate._avg.rating ?? 0).toFixed(2)),
                    reviewCount: aggregate._count._all,
                },
            });
            return created;
        });
        await this.redis.del(redis_service_1.RedisService.keys.vendor(booking.vendorId), redis_service_1.RedisService.keys.vendorBySlug(booking.vendor.slug));
        const clientName = booking.client.firstName ?? booking.client.name ?? 'A client';
        void this.notifications
            .create(booking.vendor.userId, client_1.NotificationType.REVIEW_RECEIVED, `New ${dto.rating}★ review`, `${clientName} reviewed "${booking.listing.title}"${dto.title ? `: "${dto.title}"` : ''}`, { reviewId: review.id, bookingId: dto.bookingId })
            .catch(() => void 0);
        return review;
    }
    async findAllForVendor(vendorId, take = 20, skip = 0) {
        const [data, total] = await Promise.all([
            this.prisma.review.findMany({
                where: { vendorId },
                include: {
                    reviewer: { select: { name: true, image: true } },
                    response: true,
                },
                orderBy: { createdAt: 'desc' },
                take,
                skip,
            }),
            this.prisma.review.count({ where: { vendorId } }),
        ]);
        const aggregate = await this.prisma.review.aggregate({
            where: { vendorId },
            _avg: { rating: true },
        });
        return {
            data,
            meta: {
                total,
                take,
                skip,
                hasMore: skip + take < total,
                averageRating: aggregate._avg.rating ?? 0,
            },
        };
    }
    async findMyReviews(userId, take = 20, skip = 0) {
        const [data, total] = await Promise.all([
            this.prisma.review.findMany({
                where: { reviewerId: userId },
                include: {
                    vendor: { select: { businessName: true, slug: true } },
                    booking: { select: { eventDate: true } },
                },
                orderBy: { createdAt: 'desc' },
                take,
                skip,
            }),
            this.prisma.review.count({ where: { reviewerId: userId } }),
        ]);
        return {
            data,
            meta: {
                total,
                take,
                skip,
                hasMore: skip + take < total,
            },
        };
    }
    async respond(reviewId, vendorUserId, dto) {
        const review = await this.prisma.review.findUnique({
            where: { id: reviewId },
            include: {
                vendor: { select: { id: true, userId: true, businessName: true } },
                response: { select: { id: true } },
            },
        });
        if (!review)
            throw new common_1.NotFoundException('Review not found');
        if (review.vendor.userId !== vendorUserId) {
            throw new common_1.ForbiddenException('You are not the vendor for this review');
        }
        if (review.response) {
            throw new common_1.ConflictException('A response already exists for this review');
        }
        const response = await this.prisma.reviewResponse.create({
            data: {
                reviewId,
                vendorId: review.vendorId,
                body: dto.body,
            },
        });
        void this.notifications
            .create(review.reviewerId, client_1.NotificationType.SYSTEM, 'Vendor replied to your review', `${review.vendor.businessName} responded to your review`, { reviewId })
            .catch(() => void 0);
        return response;
    }
    async findOne(reviewId) {
        const review = await this.prisma.review.findUnique({
            where: { id: reviewId },
            include: {
                reviewer: { select: { id: true, name: true, image: true } },
                vendor: { select: { id: true, businessName: true, slug: true } },
                response: true,
            },
        });
        if (!review)
            throw new common_1.NotFoundException('Review not found');
        return review;
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_service_1.PrismaService)),
    __param(1, (0, common_1.Inject)(redis_service_1.RedisService)),
    __param(2, (0, common_1.Inject)(notifications_service_1.NotificationsService)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        notifications_service_1.NotificationsService])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map