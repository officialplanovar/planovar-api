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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMe(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                emailVerified: true,
                image: true,
                role: true,
                phone: true,
                firstName: true,
                lastName: true,
                createdAt: true,
                clientProfile: {
                    select: {
                        id: true,
                        onboardingComplete: true,
                        preferredCountry: {
                            select: { id: true, name: true, code: true, dialCode: true, flagEmoji: true },
                        },
                        preferredCity: {
                            select: { id: true, name: true, state: true, latitude: true, longitude: true },
                        },
                        categoryPrefs: {
                            select: {
                                category: {
                                    select: { id: true, name: true, slug: true, iconUrl: true, imageUrl: true },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async updateMe(userId, dto) {
        const { preferredCountryId, preferredCityId, firstName, lastName, phone, ...rest } = dto;
        await this.prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: userId },
                data: { firstName, lastName, phone },
            });
            await tx.clientProfile.upsert({
                where: { userId },
                create: { userId, preferredCountryId, preferredCityId },
                update: { preferredCountryId, preferredCityId },
            });
        });
        return this.getMe(userId);
    }
    async setPreferences(userId, dto) {
        const found = await this.prisma.category.findMany({
            where: { id: { in: dto.categoryIds }, isActive: true },
            select: { id: true },
        });
        if (found.length !== dto.categoryIds.length) {
            throw new common_1.BadRequestException('One or more category IDs are invalid');
        }
        const profile = await this.prisma.clientProfile.upsert({
            where: { userId },
            create: { userId },
            update: {},
        });
        await this.prisma.$transaction([
            this.prisma.userCategoryPreference.deleteMany({
                where: { clientProfileId: profile.id },
            }),
            this.prisma.userCategoryPreference.createMany({
                data: dto.categoryIds.map((categoryId) => ({
                    clientProfileId: profile.id,
                    categoryId,
                })),
            }),
        ]);
        if (profile.preferredCityId) {
            await this.prisma.clientProfile.update({
                where: { id: profile.id },
                data: { onboardingComplete: true },
            });
        }
        return this.getMe(userId);
    }
    async completeOnboarding(userId) {
        await this.prisma.clientProfile.upsert({
            where: { userId },
            create: { userId, onboardingComplete: true },
            update: { onboardingComplete: true },
        });
        return this.getMe(userId);
    }
    async registerDeviceToken(userId, token, platform) {
        const devicePlatform = platform;
        await this.prisma.devicePushToken.upsert({
            where: { token },
            create: { userId, token, platform: devicePlatform },
            update: { userId, platform: devicePlatform },
        });
        return { registered: true };
    }
    async removeDeviceToken(userId, token) {
        await this.prisma.devicePushToken.deleteMany({
            where: { token, userId },
        });
        return { removed: true };
    }
    async addFavourite(userId, listingId) {
        const listing = await this.prisma.listing.findUnique({
            where: { id: listingId },
            select: { id: true },
        });
        if (!listing)
            throw new common_1.NotFoundException('Listing not found');
        await this.prisma.favourite.upsert({
            where: {
                userId_type_referenceId: {
                    userId,
                    type: client_1.FavouriteType.LISTING,
                    referenceId: listingId,
                },
            },
            create: { userId, type: client_1.FavouriteType.LISTING, referenceId: listingId },
            update: {},
        });
        return { favourited: true };
    }
    async removeFavourite(userId, listingId) {
        await this.prisma.favourite.deleteMany({
            where: { userId, type: client_1.FavouriteType.LISTING, referenceId: listingId },
        });
        return { favourited: false };
    }
    async listFavourites(userId) {
        return this.prisma.favourite.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            select: {
                listing: {
                    select: {
                        id: true,
                        title: true,
                        pricingType: true,
                        basePrice: true,
                        ratingAvg: true,
                        reviewCount: true,
                        tags: true,
                        isActive: true,
                        category: { select: { id: true, name: true, slug: true } },
                        vendor: {
                            select: {
                                id: true,
                                businessName: true,
                                slug: true,
                                isVerified: true,
                                subscriptionTier: true,
                            },
                        },
                        media: {
                            take: 1,
                            orderBy: { sortOrder: 'asc' },
                            select: { id: true, url: true, type: true },
                        },
                    },
                },
            },
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_service_1.PrismaService)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map