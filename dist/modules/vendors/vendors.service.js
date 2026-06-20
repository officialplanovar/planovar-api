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
exports.VendorsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const redis_service_1 = require("../../common/redis/redis.service");
const typesense_sync_service_1 = require("../../common/typesense/typesense-sync.service");
const review_kyc_dto_1 = require("./dto/review-kyc.dto");
const CACHE_TTL = 300;
let VendorsService = class VendorsService {
    prisma;
    redis;
    sync;
    constructor(prisma, redis, sync) {
        this.prisma = prisma;
        this.redis = redis;
        this.sync = sync;
    }
    async onboard(userId, dto) {
        const existing = await this.prisma.vendorProfile.findUnique({
            where: { userId },
            select: { id: true },
        });
        if (existing) {
            const vendor = await this.prisma.vendorProfile.update({
                where: { userId },
                data: {
                    businessName: dto.businessName,
                    ...(dto.description !== undefined && { description: dto.description ?? null }),
                    ...(dto.logoUrl !== undefined && { logoUrl: dto.logoUrl ?? null }),
                    ...(dto.coverUrl !== undefined && { coverUrl: dto.coverUrl ?? null }),
                    ...(dto.businessType !== undefined && { businessType: dto.businessType }),
                    ...(dto.vendorType !== undefined && { vendorType: dto.vendorType }),
                    ...(dto.phone !== undefined && { phone: dto.phone ?? null }),
                    ...(dto.email !== undefined && { email: dto.email ?? null }),
                    ...(dto.location !== undefined && {
                        location: dto.location,
                    }),
                    ...(dto.serviceRadiusKm !== undefined && { serviceRadiusKm: dto.serviceRadiusKm }),
                    ...(dto.tags !== undefined && { tags: dto.tags }),
                },
                select: this.buildOwnerSelect(),
            });
            this.sync.indexVendor(vendor).catch(() => void 0);
            return vendor;
        }
        const slug = await this.generateUniqueSlug(dto.slug);
        const [vendor] = await this.prisma.$transaction([
            this.prisma.vendorProfile.create({
                data: {
                    userId,
                    businessName: dto.businessName,
                    slug,
                    description: dto.description ?? null,
                    logoUrl: dto.logoUrl ?? null,
                    coverUrl: dto.coverUrl ?? null,
                    businessType: dto.businessType ?? null,
                    ...(dto.vendorType !== undefined && { vendorType: dto.vendorType }),
                    phone: dto.phone ?? null,
                    email: dto.email ?? null,
                    location: (dto.location ?? {}),
                    serviceRadiusKm: dto.serviceRadiusKm ?? null,
                    tags: dto.tags ?? [],
                },
                select: this.buildOwnerSelect(),
            }),
            this.prisma.user.update({
                where: { id: userId },
                data: { role: 'VENDOR' },
            }),
        ]);
        this.sync.indexVendor(vendor).catch(() => void 0);
        return vendor;
    }
    async generateUniqueSlug(base) {
        const clean = (base || 'vendor')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-+)|(-+$)/g, '') || 'vendor';
        const taken = await this.prisma.vendorProfile.findMany({
            where: { OR: [{ slug: clean }, { slug: { startsWith: `${clean}-` } }] },
            select: { slug: true },
        });
        const used = new Set(taken.map((v) => v.slug));
        if (!used.has(clean))
            return clean;
        let n = 2;
        while (used.has(`${clean}-${n}`))
            n++;
        return `${clean}-${n}`;
    }
    async getMyProfile(userId) {
        const vendor = await this.prisma.vendorProfile.findUnique({
            where: { userId },
            select: this.buildOwnerSelect(),
        });
        if (!vendor)
            throw new common_1.NotFoundException('Vendor profile not found');
        return vendor;
    }
    async updateMyProfile(userId, dto) {
        const existing = await this.prisma.vendorProfile.findUnique({
            where: { userId },
            select: { id: true, slug: true },
        });
        if (!existing)
            throw new common_1.NotFoundException('Vendor profile not found');
        if (dto.slug && dto.slug !== existing.slug) {
            const slugTaken = await this.prisma.vendorProfile.findUnique({
                where: { slug: dto.slug },
                select: { id: true },
            });
            if (slugTaken)
                throw new common_1.ConflictException('This slug is already taken');
        }
        const updated = await this.prisma.vendorProfile.update({
            where: { userId },
            data: {
                ...(dto.businessName !== undefined && { businessName: dto.businessName }),
                ...(dto.slug !== undefined && { slug: dto.slug }),
                ...(dto.description !== undefined && { description: dto.description }),
                ...(dto.businessType !== undefined && { businessType: dto.businessType }),
                ...(dto.vendorType !== undefined && { vendorType: dto.vendorType }),
                ...(dto.phone !== undefined && { phone: dto.phone }),
                ...(dto.email !== undefined && { email: dto.email }),
                ...(dto.logoUrl !== undefined && { logoUrl: dto.logoUrl }),
                ...(dto.coverUrl !== undefined && { coverUrl: dto.coverUrl }),
                ...(dto.portfolioUrls !== undefined && { portfolioUrls: dto.portfolioUrls }),
                ...(dto.tags !== undefined && { tags: dto.tags }),
                ...(dto.serviceRadiusKm !== undefined && { serviceRadiusKm: dto.serviceRadiusKm }),
                ...(dto.location !== undefined && { location: dto.location }),
            },
            select: this.buildOwnerSelect(),
        });
        await this.redis.del(redis_service_1.RedisService.keys.vendor(existing.id), redis_service_1.RedisService.keys.vendorBySlug(existing.slug));
        this.sync.indexVendor(updated).catch(() => void 0);
        return updated;
    }
    async getPublicProfile(vendorId) {
        const cacheKey = redis_service_1.RedisService.keys.vendor(vendorId);
        const cached = await this.redis.getJson(cacheKey);
        if (cached)
            return cached;
        const vendor = await this.prisma.vendorProfile.findUnique({
            where: { id: vendorId },
            select: {
                ...this.buildVendorSelect(),
                listings: {
                    where: { isActive: true },
                    take: 10,
                    orderBy: { ratingAvg: 'desc' },
                    select: {
                        id: true,
                        title: true,
                        pricingType: true,
                        basePrice: true,
                        ratingAvg: true,
                        reviewCount: true,
                        tags: true,
                        category: { select: { id: true, name: true, slug: true } },
                        media: {
                            take: 1,
                            orderBy: { sortOrder: 'asc' },
                            select: { id: true, url: true, type: true },
                        },
                    },
                },
            },
        });
        if (!vendor)
            throw new common_1.NotFoundException('Vendor not found');
        await this.redis.setJson(cacheKey, vendor, CACHE_TTL);
        return vendor;
    }
    async getBySlug(slug) {
        const cacheKey = redis_service_1.RedisService.keys.vendorBySlug(slug);
        const cached = await this.redis.getJson(cacheKey);
        if (cached)
            return cached;
        const vendor = await this.prisma.vendorProfile.findUnique({
            where: { slug },
            select: {
                ...this.buildVendorSelect(),
                listings: {
                    where: { isActive: true },
                    take: 10,
                    orderBy: { ratingAvg: 'desc' },
                    select: {
                        id: true,
                        title: true,
                        pricingType: true,
                        basePrice: true,
                        ratingAvg: true,
                        reviewCount: true,
                        tags: true,
                        category: { select: { id: true, name: true, slug: true } },
                        media: {
                            take: 1,
                            orderBy: { sortOrder: 'asc' },
                            select: { id: true, url: true, type: true },
                        },
                    },
                },
            },
        });
        if (!vendor)
            throw new common_1.NotFoundException('Vendor not found');
        await this.redis.setJson(cacheKey, vendor, CACHE_TTL);
        return vendor;
    }
    async listMyListings(userId) {
        const vendor = await this.prisma.vendorProfile.findUnique({
            where: { userId },
            select: { id: true },
        });
        if (!vendor)
            throw new common_1.NotFoundException('Vendor profile not found');
        return this.prisma.listing.findMany({
            where: { vendorId: vendor.id },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                title: true,
                description: true,
                pricingType: true,
                basePrice: true,
                isActive: true,
                isFeatured: true,
                isRentable: true,
                perDayRate: true,
                depositAmount: true,
                ratingAvg: true,
                reviewCount: true,
                tags: true,
                createdAt: true,
                updatedAt: true,
                category: { select: { id: true, name: true, slug: true } },
                media: {
                    take: 1,
                    orderBy: { sortOrder: 'asc' },
                    select: { id: true, url: true, type: true },
                },
            },
        });
    }
    async submitKyc(userId, dto) {
        const vendor = await this.prisma.vendorProfile.findUnique({
            where: { userId },
            select: { id: true, businessType: true },
        });
        if (!vendor)
            throw new common_1.NotFoundException('Vendor profile not found — onboard first');
        if (vendor.businessType === 'LICENSED' && !dto.cacDocumentUrl) {
            throw new common_1.BadRequestException('CAC document is required for licensed businesses');
        }
        const updated = await this.prisma.vendorProfile.update({
            where: { id: vendor.id },
            data: {
                ninDocumentUrl: dto.ninDocumentUrl,
                cacDocumentUrl: dto.cacDocumentUrl ?? null,
                kycStatus: client_1.KycStatus.SUBMITTED,
                kycSubmittedAt: new Date(),
                kycRejectionReason: null,
            },
            select: {
                id: true,
                kycStatus: true,
                kycSubmittedAt: true,
                isVerified: true,
            },
        });
        return updated;
    }
    async listPendingKyc() {
        return this.prisma.vendorProfile.findMany({
            where: { kycStatus: client_1.KycStatus.SUBMITTED },
            orderBy: { kycSubmittedAt: 'asc' },
            select: {
                id: true,
                businessName: true,
                slug: true,
                businessType: true,
                location: true,
                ninDocumentUrl: true,
                cacDocumentUrl: true,
                kycSubmittedAt: true,
            },
        });
    }
    async reviewKyc(vendorId, dto, adminUserId) {
        const vendor = await this.prisma.vendorProfile.findUnique({
            where: { id: vendorId },
            select: { id: true, slug: true, kycStatus: true },
        });
        if (!vendor)
            throw new common_1.NotFoundException('Vendor not found');
        if (vendor.kycStatus !== client_1.KycStatus.SUBMITTED) {
            throw new common_1.BadRequestException('This vendor has no KYC submission awaiting review');
        }
        const approve = dto.decision === review_kyc_dto_1.KycDecision.APPROVE;
        const updated = await this.prisma.vendorProfile.update({
            where: { id: vendorId },
            data: {
                kycStatus: approve ? client_1.KycStatus.APPROVED : client_1.KycStatus.REJECTED,
                isVerified: approve,
                kycReviewedAt: new Date(),
                kycReviewedBy: adminUserId,
                kycRejectionReason: approve ? null : (dto.rejectionReason ?? null),
            },
            select: {
                id: true,
                kycStatus: true,
                isVerified: true,
                kycReviewedAt: true,
                kycRejectionReason: true,
            },
        });
        await this.redis.del(redis_service_1.RedisService.keys.vendor(vendor.id), redis_service_1.RedisService.keys.vendorBySlug(vendor.slug));
        return updated;
    }
    buildVendorSelect() {
        return {
            id: true,
            userId: true,
            businessName: true,
            slug: true,
            description: true,
            logoUrl: true,
            coverUrl: true,
            portfolioUrls: true,
            phone: true,
            email: true,
            businessType: true,
            vendorType: true,
            location: true,
            serviceRadiusKm: true,
            tags: true,
            isVerified: true,
            kycStatus: true,
            ratingAvg: true,
            reviewCount: true,
            subscriptionTier: true,
            createdAt: true,
            updatedAt: true,
        };
    }
    buildOwnerSelect() {
        return {
            ...this.buildVendorSelect(),
            ninDocumentUrl: true,
            cacDocumentUrl: true,
            kycSubmittedAt: true,
            kycReviewedAt: true,
            kycRejectionReason: true,
        };
    }
};
exports.VendorsService = VendorsService;
exports.VendorsService = VendorsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_service_1.PrismaService)),
    __param(1, (0, common_1.Inject)(redis_service_1.RedisService)),
    __param(2, (0, common_1.Inject)(typesense_sync_service_1.TypesenseSyncService)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        typesense_sync_service_1.TypesenseSyncService])
], VendorsService);
//# sourceMappingURL=vendors.service.js.map