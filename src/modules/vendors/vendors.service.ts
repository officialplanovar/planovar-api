import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { KycStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { TypesenseSyncService } from '../../common/typesense/typesense-sync.service';
import { OnboardVendorDto } from './dto/onboard-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { SubmitKycDto } from './dto/submit-kyc.dto';
import { KycDecision, ReviewKycDto } from './dto/review-kyc.dto';

const CACHE_TTL = 300;

@Injectable()
export class VendorsService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(RedisService) private readonly redis: RedisService,
    @Inject(TypesenseSyncService) private readonly sync: TypesenseSyncService,
  ) {}

  async onboard(userId: string, dto: OnboardVendorDto) {
    const existing = await this.prisma.vendorProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    // Idempotent: if the user already onboarded (e.g. resuming or redoing the
    // setup wizard), update the profile in place rather than dead-ending.
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
            location: dto.location as Prisma.InputJsonValue,
          }),
          ...(dto.serviceRadiusKm !== undefined && { serviceRadiusKm: dto.serviceRadiusKm }),
          ...(dto.tags !== undefined && { tags: dto.tags }),
        },
        select: this.buildOwnerSelect(),
      });
      this.sync.indexVendor(vendor).catch(() => void 0);
      return vendor;
    }

    // Slugs must be unique. Rather than failing when a business name collides,
    // derive the next free variant (`name`, `name-2`, `name-3`, …).
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
          location: (dto.location ?? {}) as Prisma.InputJsonValue,
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

    // Fire-and-forget — Typesense downtime must not block onboarding
    this.sync.indexVendor(vendor).catch(() => void 0);

    return vendor;
  }

  /** Returns `base` if free, else the first free `base-2`, `base-3`, … variant. */
  private async generateUniqueSlug(base: string): Promise<string> {
    const clean =
      (base || 'vendor')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-+)|(-+$)/g, '') || 'vendor';

    const taken = await this.prisma.vendorProfile.findMany({
      where: { OR: [{ slug: clean }, { slug: { startsWith: `${clean}-` } }] },
      select: { slug: true },
    });
    const used = new Set(taken.map((v) => v.slug));

    if (!used.has(clean)) return clean;
    let n = 2;
    while (used.has(`${clean}-${n}`)) n++;
    return `${clean}-${n}`;
  }

  async getMyProfile(userId: string) {
    const vendor = await this.prisma.vendorProfile.findUnique({
      where: { userId },
      select: this.buildOwnerSelect(),
    });

    if (!vendor) throw new NotFoundException('Vendor profile not found');
    return vendor;
  }

  async updateMyProfile(userId: string, dto: UpdateVendorDto) {
    const existing = await this.prisma.vendorProfile.findUnique({
      where: { userId },
      select: { id: true, slug: true },
    });

    if (!existing) throw new NotFoundException('Vendor profile not found');

    if (dto.slug && dto.slug !== existing.slug) {
      const slugTaken = await this.prisma.vendorProfile.findUnique({
        where: { slug: dto.slug },
        select: { id: true },
      });
      if (slugTaken) throw new ConflictException('This slug is already taken');
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
        ...(dto.location !== undefined && { location: dto.location as Prisma.InputJsonValue }),
      },
      select: this.buildOwnerSelect(),
    });

    // Invalidate both key variants
    await this.redis.del(
      RedisService.keys.vendor(existing.id),
      RedisService.keys.vendorBySlug(existing.slug),
    );

    this.sync.indexVendor(updated).catch(() => void 0);

    return updated;
  }

  async getPublicProfile(vendorId: string) {
    const cacheKey = RedisService.keys.vendor(vendorId);
    const cached = await this.redis.getJson(cacheKey);
    if (cached) return cached;

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

    if (!vendor) throw new NotFoundException('Vendor not found');

    await this.redis.setJson(cacheKey, vendor, CACHE_TTL);
    return vendor;
  }

  async getBySlug(slug: string) {
    const cacheKey = RedisService.keys.vendorBySlug(slug);
    const cached = await this.redis.getJson(cacheKey);
    if (cached) return cached;

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

    if (!vendor) throw new NotFoundException('Vendor not found');

    await this.redis.setJson(cacheKey, vendor, CACHE_TTL);
    return vendor;
  }

  async listMyListings(userId: string) {
    const vendor = await this.prisma.vendorProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!vendor) throw new NotFoundException('Vendor profile not found');

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

  // ─── KYC ─────────────────────────────────────────────────────────────────

  /** Vendor submits NIN (+ CAC for licensed businesses) for verification. */
  async submitKyc(userId: string, dto: SubmitKycDto) {
    const vendor = await this.prisma.vendorProfile.findUnique({
      where: { userId },
      select: { id: true, businessType: true },
    });
    if (!vendor) throw new NotFoundException('Vendor profile not found — onboard first');

    if (vendor.businessType === 'LICENSED' && !dto.cacDocumentUrl) {
      throw new BadRequestException('CAC document is required for licensed businesses');
    }

    const updated = await this.prisma.vendorProfile.update({
      where: { id: vendor.id },
      data: {
        ninDocumentUrl: dto.ninDocumentUrl,
        cacDocumentUrl: dto.cacDocumentUrl ?? null,
        kycStatus: KycStatus.SUBMITTED,
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

  /** Admin: list vendors awaiting KYC review. */
  async listPendingKyc() {
    return this.prisma.vendorProfile.findMany({
      where: { kycStatus: KycStatus.SUBMITTED },
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

  /** Admin: approve or reject a vendor's KYC. */
  async reviewKyc(vendorId: string, dto: ReviewKycDto, adminUserId: string) {
    const vendor = await this.prisma.vendorProfile.findUnique({
      where: { id: vendorId },
      select: { id: true, slug: true, kycStatus: true },
    });
    if (!vendor) throw new NotFoundException('Vendor not found');
    if (vendor.kycStatus !== KycStatus.SUBMITTED) {
      throw new BadRequestException('This vendor has no KYC submission awaiting review');
    }

    const approve = dto.decision === KycDecision.APPROVE;
    const updated = await this.prisma.vendorProfile.update({
      where: { id: vendorId },
      data: {
        kycStatus: approve ? KycStatus.APPROVED : KycStatus.REJECTED,
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

    // Verified state changed → bust public caches.
    await this.redis.del(
      RedisService.keys.vendor(vendor.id),
      RedisService.keys.vendorBySlug(vendor.slug),
    );
    return updated;
  }

  // ─── selects ─────────────────────────────────────────────────────────────

  /** Public-facing fields (no KYC documents). */
  private buildVendorSelect() {
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
    } as const;
  }

  /** Owner-only fields — adds KYC detail. Never used for public/cached reads. */
  private buildOwnerSelect() {
    return {
      ...this.buildVendorSelect(),
      ninDocumentUrl: true,
      cacDocumentUrl: true,
      kycSubmittedAt: true,
      kycReviewedAt: true,
      kycRejectionReason: true,
    } as const;
  }
}
