import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DevicePlatform, FavouriteType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SetPreferencesDto } from './dto/set-preferences.dto';

@Injectable()
export class UsersService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getMe(userId: string) {
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
        // Presence lets the apps enforce role separation (client vs vendor)
        // and resume onboarding at the right step.
        vendorProfile: {
          select: { id: true, subscriptionTier: true, kycStatus: true },
        },
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

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateMe(userId: string, dto: UpdateProfileDto) {
    const { preferredCountryId, preferredCityId, firstName, lastName, phone, dateOfBirth, ...rest } = dto;

    await this.prisma.$transaction(async (tx) => {
      // Update core user fields
      await tx.user.update({
        where: { id: userId },
        data: { firstName, lastName, phone, dateOfBirth },
      });

      // Upsert client profile with location preference
      const profile = await tx.clientProfile.upsert({
        where: { userId },
        create: { userId, preferredCountryId, preferredCityId },
        update: { preferredCountryId, preferredCityId },
      });

      // Essential onboarding = a location is set. Mark it complete so the
      // client app stops routing the user back into onboarding (the category-
      // preferences step, which also sets this, is skipped in the social-login
      // onboarding flow).
      if (profile.preferredCityId && !profile.onboardingComplete) {
        await tx.clientProfile.update({
          where: { id: profile.id },
          data: { onboardingComplete: true },
        });
      }
    });

    return this.getMe(userId);
  }

  async setPreferences(userId: string, dto: SetPreferencesDto) {
    // Verify all categoryIds exist
    const found = await this.prisma.category.findMany({
      where: { id: { in: dto.categoryIds }, isActive: true },
      select: { id: true },
    });

    if (found.length !== dto.categoryIds.length) {
      throw new BadRequestException('One or more category IDs are invalid');
    }

    // Upsert client profile first (in case it doesn't exist yet)
    const profile = await this.prisma.clientProfile.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    // Replace all preferences atomically
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

    // Mark onboarding complete if location is also set
    if (profile.preferredCityId) {
      await this.prisma.clientProfile.update({
        where: { id: profile.id },
        data: { onboardingComplete: true },
      });
    }

    return this.getMe(userId);
  }

  async completeOnboarding(userId: string) {
    await this.prisma.clientProfile.upsert({
      where: { userId },
      create: { userId, onboardingComplete: true },
      update: { onboardingComplete: true },
    });
    return this.getMe(userId);
  }

  // ─── Device push tokens ───────────────────────────────────────────────────

  async registerDeviceToken(userId: string, token: string, platform: string) {
    const devicePlatform = platform as DevicePlatform;
    await this.prisma.devicePushToken.upsert({
      where: { token },
      create: { userId, token, platform: devicePlatform },
      update: { userId, platform: devicePlatform },
    });
    return { registered: true };
  }

  async removeDeviceToken(userId: string, token: string) {
    await this.prisma.devicePushToken.deleteMany({
      where: { token, userId },
    });
    return { removed: true };
  }

  // ─── Favourites ───────────────────────────────────────────────────────────

  async addFavourite(userId: string, listingId: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true },
    });
    if (!listing) throw new NotFoundException('Listing not found');

    await this.prisma.favourite.upsert({
      where: {
        userId_type_referenceId: {
          userId,
          type: FavouriteType.LISTING,
          referenceId: listingId,
        },
      },
      create: { userId, type: FavouriteType.LISTING, referenceId: listingId },
      update: {},
    });

    return { favourited: true };
  }

  async removeFavourite(userId: string, listingId: string) {
    await this.prisma.favourite.deleteMany({
      where: { userId, type: FavouriteType.LISTING, referenceId: listingId },
    });
    return { favourited: false };
  }

  // ─── Vendor favourites ──────────────────────────────────────────────────────

  async addVendorFavourite(userId: string, vendorId: string) {
    const vendor = await this.prisma.vendorProfile.findUnique({
      where: { id: vendorId },
      select: { id: true },
    });
    if (!vendor) throw new NotFoundException('Vendor not found');

    await this.prisma.favourite.upsert({
      where: {
        userId_type_referenceId: {
          userId,
          type: FavouriteType.VENDOR,
          referenceId: vendorId,
        },
      },
      create: { userId, type: FavouriteType.VENDOR, referenceId: vendorId },
      update: {},
    });

    return { favourited: true };
  }

  async removeVendorFavourite(userId: string, vendorId: string) {
    await this.prisma.favourite.deleteMany({
      where: { userId, type: FavouriteType.VENDOR, referenceId: vendorId },
    });
    return { favourited: false };
  }

  async listVendorFavourites(userId: string) {
    const favs = await this.prisma.favourite.findMany({
      where: { userId, type: FavouriteType.VENDOR },
      orderBy: { createdAt: 'desc' },
      select: { referenceId: true },
    });
    const ids = favs.map((f) => f.referenceId);
    if (ids.length === 0) return [];

    const vendors = await this.prisma.vendorProfile.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        businessName: true,
        slug: true,
        description: true,
        logoUrl: true,
        coverUrl: true,
        location: true,
        tags: true,
        ratingAvg: true,
        reviewCount: true,
        subscriptionTier: true,
        isVerified: true,
      },
    });
    // Preserve most-recently-favourited order.
    const byId = new Map(vendors.map((v) => [v.id, v]));
    return ids.map((id) => byId.get(id)).filter(Boolean);
  }

  async listFavourites(userId: string) {
    // Listing favourites only. referenceId is polymorphic (no FK), so fetch the
    // listings manually and return them in the { listing } shape the client maps.
    const favs = await this.prisma.favourite.findMany({
      where: { userId, type: FavouriteType.LISTING },
      orderBy: { createdAt: 'desc' },
      select: { referenceId: true },
    });
    const ids = favs.map((f) => f.referenceId);
    if (ids.length === 0) return [];

    const listings = await this.prisma.listing.findMany({
      where: { id: { in: ids } },
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
          orderBy: { sortOrder: 'asc' as const },
          select: { id: true, url: true, type: true },
        },
      },
    });
    // Preserve most-recently-favourited order; wrap as { listing } for the client.
    const byId = new Map(listings.map((l) => [l.id, l]));
    return ids
      .map((id) => byId.get(id))
      .filter((l): l is NonNullable<typeof l> => Boolean(l))
      .map((listing) => ({ listing }));
  }
}
