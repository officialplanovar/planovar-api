import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MediaType, PricingType, Prisma, SubscriptionTier } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { TypesenseSyncService } from '../../common/typesense/typesense-sync.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';

const CACHE_TTL = 300;

interface AddMediaData {
  url: string;
  publicId?: string;
  type: MediaType;
  sortOrder?: number;
}

@Injectable()
export class ListingsService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(RedisService) private readonly redis: RedisService,
    @Inject(TypesenseSyncService) private readonly sync: TypesenseSyncService,
  ) {}

  async create(userId: string, dto: CreateListingDto) {
    // Always resolve the vendor from the session user — never trust a
    // client-supplied vendorId (it would allow listing under another vendor).
    const vendor = await this.prisma.vendorProfile.findUnique({
      where: { userId },
      select: { id: true, subscriptionTier: true },
    });
    if (!vendor) throw new NotFoundException('Vendor profile not found for this user');
    const vendorId = vendor.id;

    // ── Tier enforcement: Basic 0 · Premium 5 · Gold unlimited ────────────
    await this.assertWithinListingLimit(vendorId, vendor.subscriptionTier);

    const listing = await this.prisma.listing.create({
      data: {
        vendorId,
        categoryId: dto.categoryId,
        title: dto.title,
        description: dto.description,
        pricingType: dto.pricingType,
        basePrice: dto.basePrice != null ? new Prisma.Decimal(dto.basePrice) : null,
        location: (dto.location ?? {}) as Prisma.InputJsonValue,
        isRentable: dto.isRentable ?? false,
        perDayRate: dto.perDayRate != null ? new Prisma.Decimal(dto.perDayRate) : null,
        depositAmount: dto.depositAmount != null ? new Prisma.Decimal(dto.depositAmount) : null,
        sku: dto.sku ?? null,
        stockQuantity: dto.stockQuantity ?? null,
        durationValue: dto.durationValue ?? null,
        durationUnit: dto.durationUnit ?? null,
        cancellationPolicy: dto.cancellationPolicy ?? null,
        tags: dto.tags ?? [],
        ...(dto.mediaUrls?.length
          ? {
              media: {
                create: dto.mediaUrls.map((url, i) => ({
                  url,
                  type: MediaType.IMAGE,
                  sortOrder: i,
                })),
              },
            }
          : {}),
      },
      select: this.buildListingSelect(),
    });

    await this.redis.del(RedisService.keys.vendor(vendorId));

    // Fire-and-forget Typesense index — don't block on search failures
    this.syncListingToSearch(listing.id).catch(() => void 0);

    return listing;
  }

  /**
   * Enforce per-tier active-listing limits (subscription model):
   * limit comes from SubscriptionPlan.listingLimit — 0 = none (Basic),
   * N = capped (Premium 5), null = unlimited (Gold).
   */
  private async assertWithinListingLimit(
    vendorId: string,
    tier: SubscriptionTier,
  ): Promise<void> {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { tier },
      select: { listingLimit: true, name: true },
    });
    // Fallbacks if a plan row is missing: BASIC 0, PREMIUM 5, GOLD unlimited.
    const limit = plan
      ? plan.listingLimit
      : tier === SubscriptionTier.GOLD
        ? null
        : tier === SubscriptionTier.PREMIUM
          ? 5
          : 0;

    if (limit === null) return; // unlimited

    if (limit === 0) {
      throw new ForbiddenException(
        'Your current plan does not include listings. Upgrade to Premium or Gold to start listing.',
      );
    }

    const activeCount = await this.prisma.listing.count({
      where: { vendorId, isActive: true },
    });
    if (activeCount >= limit) {
      throw new ForbiddenException(
        `Your ${plan?.name ?? tier} plan allows up to ${limit} active listings. ` +
          'Deactivate a listing or upgrade your plan to add more.',
      );
    }
  }

  async findAllForUser(userId: string) {
    const vendor = await this.prisma.vendorProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!vendor) return [];
    return this.findAll(vendor.id);
  }

  async findAll(vendorId: string) {
    return this.prisma.listing.findMany({
      where: { vendorId },
      orderBy: { createdAt: 'desc' },
      select: this.buildListingSelect(),
    });
  }

  async findOne(id: string) {
    const cacheKey = RedisService.keys.listing(id);
    const cached = await this.redis.getJson(cacheKey);
    if (cached) return cached;

    const listing = await this.prisma.listing.findUnique({
      where: { id },
      select: {
        ...this.buildListingSelect(),
        vendor: {
          select: {
            id: true,
            businessName: true,
            slug: true,
            logoUrl: true,
            coverUrl: true,
            location: true,
            isVerified: true,
            ratingAvg: true,
            reviewCount: true,
          },
        },
      },
    });

    if (!listing) throw new NotFoundException('Listing not found');

    await this.redis.setJson(cacheKey, listing, CACHE_TTL);
    return listing;
  }

  /**
   * Public browse of active listings from verified vendors, straight from the
   * DB. This is the reliable path for product/service listing pages — it does
   * NOT depend on Typesense (which is only for full-text search). Filter by
   * pricingType (e.g. FIXED for products), category, or rentability.
   */
  async browse(opts: {
    pricingType?: string;
    categoryId?: string;
    isRentable?: boolean;
    take?: number;
    skip?: number;
  }) {
    const pricingType =
      opts.pricingType && opts.pricingType in PricingType
        ? (opts.pricingType as PricingType)
        : undefined;

    const where: Prisma.ListingWhereInput = {
      isActive: true,
      // Business rule: clients only see listings from verified vendors.
      vendor: { isVerified: true },
      ...(pricingType ? { pricingType } : {}),
      ...(opts.categoryId ? { categoryId: opts.categoryId } : {}),
      ...(opts.isRentable != null ? { isRentable: opts.isRentable } : {}),
    };

    return this.prisma.listing.findMany({
      where,
      orderBy: [{ ratingAvg: 'desc' }, { createdAt: 'desc' }],
      take: Math.min(Math.max(opts.take ?? 30, 1), 100),
      skip: Math.max(opts.skip ?? 0, 0),
      select: this.buildListingSelect(),
    });
  }

  /**
   * Record a client view: increments viewCount, then refreshes the cached
   * listing and search doc so the new count is visible (the vendor reads it
   * from their own listings list, which hits the DB directly).
   * MVP counts every view; per-user/session dedup can be layered on later.
   */
  async recordView(id: string) {
    const updated = await this.prisma.listing
      .update({
        where: { id },
        data: { viewCount: { increment: 1 } },
        select: { id: true, viewCount: true },
      })
      .catch(() => null);

    if (!updated) throw new NotFoundException('Listing not found');

    await this.redis.del(RedisService.keys.listing(id));
    this.syncListingToSearch(id).catch(() => void 0);
    return updated;
  }

  async update(id: string, userId: string, dto: UpdateListingDto) {
    await this.assertOwnership(id, userId);

    const updated = await this.prisma.listing.update({
      where: { id },
      data: {
        ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.pricingType !== undefined && { pricingType: dto.pricingType }),
        ...(dto.basePrice !== undefined && {
          basePrice: dto.basePrice != null ? new Prisma.Decimal(dto.basePrice) : null,
        }),
        ...(dto.location !== undefined && { location: dto.location as Prisma.InputJsonValue }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.isRentable !== undefined && { isRentable: dto.isRentable }),
        ...(dto.perDayRate !== undefined && {
          perDayRate: dto.perDayRate != null ? new Prisma.Decimal(dto.perDayRate) : null,
        }),
        ...(dto.depositAmount !== undefined && {
          depositAmount: dto.depositAmount != null ? new Prisma.Decimal(dto.depositAmount) : null,
        }),
        ...(dto.sku !== undefined && { sku: dto.sku ?? null }),
        ...(dto.stockQuantity !== undefined && { stockQuantity: dto.stockQuantity ?? null }),
        ...(dto.durationValue !== undefined && { durationValue: dto.durationValue ?? null }),
        ...(dto.durationUnit !== undefined && { durationUnit: dto.durationUnit ?? null }),
        ...(dto.cancellationPolicy !== undefined && {
          cancellationPolicy: dto.cancellationPolicy ?? null,
        }),
        ...(dto.tags !== undefined && { tags: dto.tags }),
      },
      select: this.buildListingSelect(),
    });

    await this.redis.del(RedisService.keys.listing(id));
    this.syncListingToSearch(id).catch(() => void 0);
    return updated;
  }

  async remove(id: string, userId: string) {
    const listing = await this.assertOwnership(id, userId);

    try {
      // Hard delete — the row is removed entirely. Cascades take care of
      // media, packages and favourites (see schema onDelete: Cascade).
      await this.prisma.listing.delete({ where: { id } });
    } catch (e) {
      // A listing referenced by bookings can't be hard-deleted (FK restrict);
      // don't erase transactional history — tell the vendor to deactivate.
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2003') {
        throw new ConflictException(
          'This listing has existing bookings and cannot be deleted. Deactivate it instead.',
        );
      }
      throw e;
    }

    await this.redis.del(
      RedisService.keys.listing(id),
      RedisService.keys.vendor(listing.vendorId),
    );

    // Remove from the search index
    this.sync.deleteListing(id).catch(() => void 0);

    return { id, deleted: true };
  }

  async addMedia(listingId: string, userId: string, mediaData: AddMediaData) {
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

    await this.redis.del(RedisService.keys.listing(listingId));
    return media;
  }

  async removeMedia(mediaId: string, userId: string) {
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

    if (!media) throw new NotFoundException('Media not found');

    if (media.listing.vendor.userId !== userId) {
      throw new ForbiddenException('You do not own this listing');
    }

    await this.prisma.listingMedia.delete({ where: { id: mediaId } });
    await this.redis.del(RedisService.keys.listing(media.listingId));

    return { publicId: media.publicId };
  }

  /** Fetch a listing with vendor + media and push to Typesense. */
  private async syncListingToSearch(listingId: string): Promise<void> {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        vendor: true,
        media: { where: { type: 'IMAGE' }, orderBy: { sortOrder: 'asc' }, take: 1 },
      },
    });
    if (listing) await this.sync.indexListing(listing);
  }

  private async assertOwnership(listingId: string, userId: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      select: {
        id: true,
        vendorId: true,
        vendor: { select: { userId: true } },
      },
    });

    if (!listing) throw new NotFoundException('Listing not found');
    if (listing.vendor.userId !== userId) throw new ForbiddenException('You do not own this listing');

    return listing;
  }

  private buildListingSelect() {
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
      sku: true,
      stockQuantity: true,
      durationValue: true,
      durationUnit: true,
      cancellationPolicy: true,
      ratingAvg: true,
      reviewCount: true,
      viewCount: true,
      tags: true,
      createdAt: true,
      updatedAt: true,
      category: { select: { id: true, name: true, slug: true } },
      media: {
        orderBy: { sortOrder: 'asc' as const },
        select: {
          id: true,
          url: true,
          publicId: true,
          type: true,
          sortOrder: true,
        },
      },
    } as const;
  }
}
