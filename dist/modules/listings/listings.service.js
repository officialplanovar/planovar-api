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
exports.ListingsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const redis_service_1 = require("../../common/redis/redis.service");
const typesense_sync_service_1 = require("../../common/typesense/typesense-sync.service");
const CACHE_TTL = 300;
let ListingsService = class ListingsService {
    prisma;
    redis;
    sync;
    constructor(prisma, redis, sync) {
        this.prisma = prisma;
        this.redis = redis;
        this.sync = sync;
    }
    async create(userId, dto) {
        const vendor = await this.prisma.vendorProfile.findUnique({
            where: { userId },
            select: { id: true, subscriptionTier: true },
        });
        if (!vendor)
            throw new common_1.NotFoundException('Vendor profile not found for this user');
        const vendorId = vendor.id;
        await this.assertWithinListingLimit(vendorId, vendor.subscriptionTier);
        const listing = await this.prisma.listing.create({
            data: {
                vendorId,
                categoryId: dto.categoryId,
                title: dto.title,
                description: dto.description,
                pricingType: dto.pricingType,
                basePrice: dto.basePrice != null ? new client_1.Prisma.Decimal(dto.basePrice) : null,
                location: (dto.location ?? {}),
                isRentable: dto.isRentable ?? false,
                perDayRate: dto.perDayRate != null ? new client_1.Prisma.Decimal(dto.perDayRate) : null,
                depositAmount: dto.depositAmount != null ? new client_1.Prisma.Decimal(dto.depositAmount) : null,
                tags: dto.tags ?? [],
                ...(dto.mediaUrls?.length
                    ? {
                        media: {
                            create: dto.mediaUrls.map((url, i) => ({
                                url,
                                type: client_1.MediaType.IMAGE,
                                sortOrder: i,
                            })),
                        },
                    }
                    : {}),
            },
            select: this.buildListingSelect(),
        });
        await this.redis.del(redis_service_1.RedisService.keys.vendor(vendorId));
        this.syncListingToSearch(listing.id).catch(() => void 0);
        return listing;
    }
    async assertWithinListingLimit(vendorId, tier) {
        const plan = await this.prisma.subscriptionPlan.findUnique({
            where: { tier },
            select: { listingLimit: true, name: true },
        });
        const limit = plan
            ? plan.listingLimit
            : tier === client_1.SubscriptionTier.GOLD
                ? null
                : tier === client_1.SubscriptionTier.PREMIUM
                    ? 5
                    : 0;
        if (limit === null)
            return;
        if (limit === 0) {
            throw new common_1.ForbiddenException('Your current plan does not include listings. Upgrade to Premium or Gold to start listing.');
        }
        const activeCount = await this.prisma.listing.count({
            where: { vendorId, isActive: true },
        });
        if (activeCount >= limit) {
            throw new common_1.ForbiddenException(`Your ${plan?.name ?? tier} plan allows up to ${limit} active listings. ` +
                'Deactivate a listing or upgrade your plan to add more.');
        }
    }
    async findAllForUser(userId) {
        const vendor = await this.prisma.vendorProfile.findUnique({
            where: { userId },
            select: { id: true },
        });
        if (!vendor)
            return [];
        return this.findAll(vendor.id);
    }
    async findAll(vendorId) {
        return this.prisma.listing.findMany({
            where: { vendorId },
            orderBy: { createdAt: 'desc' },
            select: this.buildListingSelect(),
        });
    }
    async findOne(id) {
        const cacheKey = redis_service_1.RedisService.keys.listing(id);
        const cached = await this.redis.getJson(cacheKey);
        if (cached)
            return cached;
        const listing = await this.prisma.listing.findUnique({
            where: { id },
            select: {
                ...this.buildListingSelect(),
                vendor: {
                    select: {
                        id: true,
                        businessName: true,
                        slug: true,
                        coverUrl: true,
                        isVerified: true,
                        ratingAvg: true,
                        reviewCount: true,
                    },
                },
            },
        });
        if (!listing)
            throw new common_1.NotFoundException('Listing not found');
        await this.redis.setJson(cacheKey, listing, CACHE_TTL);
        return listing;
    }
    async update(id, userId, dto) {
        await this.assertOwnership(id, userId);
        const updated = await this.prisma.listing.update({
            where: { id },
            data: {
                ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
                ...(dto.title !== undefined && { title: dto.title }),
                ...(dto.description !== undefined && { description: dto.description }),
                ...(dto.pricingType !== undefined && { pricingType: dto.pricingType }),
                ...(dto.basePrice !== undefined && {
                    basePrice: dto.basePrice != null ? new client_1.Prisma.Decimal(dto.basePrice) : null,
                }),
                ...(dto.location !== undefined && { location: dto.location }),
                ...(dto.isActive !== undefined && { isActive: dto.isActive }),
                ...(dto.isRentable !== undefined && { isRentable: dto.isRentable }),
                ...(dto.perDayRate !== undefined && {
                    perDayRate: dto.perDayRate != null ? new client_1.Prisma.Decimal(dto.perDayRate) : null,
                }),
                ...(dto.depositAmount !== undefined && {
                    depositAmount: dto.depositAmount != null ? new client_1.Prisma.Decimal(dto.depositAmount) : null,
                }),
                ...(dto.tags !== undefined && { tags: dto.tags }),
            },
            select: this.buildListingSelect(),
        });
        await this.redis.del(redis_service_1.RedisService.keys.listing(id));
        this.syncListingToSearch(id).catch(() => void 0);
        return updated;
    }
    async remove(id, userId) {
        const listing = await this.assertOwnership(id, userId);
        const updated = await this.prisma.listing.update({
            where: { id },
            data: { isActive: false },
            select: { id: true, isActive: true },
        });
        await this.redis.del(redis_service_1.RedisService.keys.listing(id), redis_service_1.RedisService.keys.vendor(listing.vendorId));
        this.sync.deleteListing(id).catch(() => void 0);
        return updated;
    }
    async addMedia(listingId, userId, mediaData) {
        await this.assertOwnership(listingId, userId);
        const media = await this.prisma.listingMedia.create({
            data: {
                listingId,
                url: mediaData.url,
                publicId: mediaData.publicId ?? null,
                type: mediaData.type,
                sortOrder: mediaData.sortOrder ?? 0,
            },
        });
        await this.redis.del(redis_service_1.RedisService.keys.listing(listingId));
        return media;
    }
    async removeMedia(mediaId, userId) {
        const media = await this.prisma.listingMedia.findUnique({
            where: { id: mediaId },
            select: {
                id: true,
                publicId: true,
                listingId: true,
                listing: {
                    select: {
                        vendorId: true,
                        vendor: { select: { userId: true } },
                    },
                },
            },
        });
        if (!media)
            throw new common_1.NotFoundException('Media not found');
        if (media.listing.vendor.userId !== userId) {
            throw new common_1.ForbiddenException('You do not own this listing');
        }
        await this.prisma.listingMedia.delete({ where: { id: mediaId } });
        await this.redis.del(redis_service_1.RedisService.keys.listing(media.listingId));
        return { publicId: media.publicId };
    }
    async syncListingToSearch(listingId) {
        const listing = await this.prisma.listing.findUnique({
            where: { id: listingId },
            include: {
                vendor: true,
                media: { where: { type: 'IMAGE' }, orderBy: { sortOrder: 'asc' }, take: 1 },
            },
        });
        if (listing)
            await this.sync.indexListing(listing);
    }
    async assertOwnership(listingId, userId) {
        const listing = await this.prisma.listing.findUnique({
            where: { id: listingId },
            select: {
                id: true,
                vendorId: true,
                vendor: { select: { userId: true } },
            },
        });
        if (!listing)
            throw new common_1.NotFoundException('Listing not found');
        if (listing.vendor.userId !== userId)
            throw new common_1.ForbiddenException('You do not own this listing');
        return listing;
    }
    buildListingSelect() {
        return {
            id: true,
            vendorId: true,
            categoryId: true,
            title: true,
            description: true,
            pricingType: true,
            basePrice: true,
            location: true,
            isActive: true,
            isFeatured: true,
            isRentable: true,
            perDayRate: true,
            depositAmount: true,
            ratingAvg: true,
            reviewCount: true,
            viewCount: true,
            tags: true,
            createdAt: true,
            updatedAt: true,
            category: { select: { id: true, name: true, slug: true } },
            media: {
                orderBy: { sortOrder: 'asc' },
                select: {
                    id: true,
                    url: true,
                    publicId: true,
                    type: true,
                    sortOrder: true,
                },
            },
        };
    }
};
exports.ListingsService = ListingsService;
exports.ListingsService = ListingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_service_1.PrismaService)),
    __param(1, (0, common_1.Inject)(redis_service_1.RedisService)),
    __param(2, (0, common_1.Inject)(typesense_sync_service_1.TypesenseSyncService)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        typesense_sync_service_1.TypesenseSyncService])
], ListingsService);
//# sourceMappingURL=listings.service.js.map