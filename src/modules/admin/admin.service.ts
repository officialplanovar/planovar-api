import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  KycStatus,
  Prisma,
  SubscriptionStatus,
  SubscriptionTier,
  UserRole,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';

/** Revenue counts only paid-and-active subs (PAST_DUE = pending payment). */
const REVENUE_STATUSES: SubscriptionStatus[] = [SubscriptionStatus.ACTIVE];

@Injectable()
export class AdminService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(AuditService) private readonly audit: AuditService,
  ) {}

  // ── Dashboard ────────────────────────────────────────────────────────────
  async dashboard() {
    const [
      pendingKyc,
      openDisputes,
      activeUsers,
      totalUsers,
      totalVendors,
      activeSubs,
      recentActivity,
    ] = await this.prisma.$transaction([
      this.prisma.vendorProfile.count({
        where: { kycStatus: KycStatus.SUBMITTED },
      }),
      this.prisma.dispute.count({
        where: { status: { in: ['OPEN', 'UNDER_REVIEW'] } },
      }),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.count(),
      this.prisma.vendorProfile.count(),
      this.prisma.vendorSubscription.count({
        where: { status: { in: REVENUE_STATUSES } },
      }),
      this.prisma.auditLog.findMany({
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
    ]);

    const revenue = await this.revenue();

    return {
      stats: {
        pendingKyc,
        openDisputes,
        activeUsers,
        totalUsers,
        totalVendors,
        activeSubscriptions: activeSubs,
        mrr: revenue.mrr,
        currency: revenue.currency,
      },
      recentActivity,
    };
  }

  // ── Vendors ──────────────────────────────────────────────────────────────
  async listVendors(params: {
    kycStatus?: KycStatus;
    tier?: SubscriptionTier;
    search?: string;
    take?: number;
    skip?: number;
  }) {
    const { kycStatus, tier, search } = params;
    const take = Math.min(params.take ?? 50, 200);
    const skip = params.skip ?? 0;

    const where: Prisma.VendorProfileWhereInput = {
      ...(kycStatus && { kycStatus }),
      ...(tier && { subscriptionTier: tier }),
      ...(search && {
        OR: [
          { businessName: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.vendorProfile.findMany({
        where,
        select: {
          id: true,
          businessName: true,
          slug: true,
          businessType: true,
          vendorType: true,
          location: true,
          tags: true,
          ratingAvg: true,
          reviewCount: true,
          subscriptionTier: true,
          kycStatus: true,
          isVerified: true,
          ninDocumentUrl: true,
          cacDocumentUrl: true,
          kycSubmittedAt: true,
          createdAt: true,
          user: {
            select: { id: true, name: true, email: true, phone: true, isActive: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      this.prisma.vendorProfile.count({ where }),
    ]);

    return { data: rows, meta: { total, take, skip } };
  }

  // ── Users ────────────────────────────────────────────────────────────────
  async listUsers(params: {
    role?: UserRole;
    isActive?: boolean;
    search?: string;
    take?: number;
    skip?: number;
  }) {
    const { role, isActive, search } = params;
    const take = Math.min(params.take ?? 50, 200);
    const skip = params.skip ?? 0;

    const where: Prisma.UserWhereInput = {
      ...(role && { role }),
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          emailVerified: true,
          createdAt: true,
          vendorProfile: {
            select: { id: true, businessName: true, subscriptionTier: true },
          },
          _count: { select: { bookingsAsClient: true, events: true } },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data: rows, meta: { total, take, skip } };
  }

  async getUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        vendorProfile: {
          select: {
            id: true,
            businessName: true,
            slug: true,
            subscriptionTier: true,
            kycStatus: true,
            isVerified: true,
            ratingAvg: true,
            reviewCount: true,
          },
        },
        _count: { select: { bookingsAsClient: true, events: true, reviews: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  /** Suspend / reactivate a user account. Audited. */
  async setUserActive(
    id: string,
    isActive: boolean,
    adminId: string,
    reason?: string,
    ipAddress?: string,
  ) {
    const target = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, isActive: true, role: true },
    });
    if (!target) throw new NotFoundException('User not found');

    const updated = await this.prisma.user.update({
      where: { id },
      data: { isActive },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    this.audit.record({
      userId: adminId,
      action: isActive ? 'user.reactivated' : 'user.suspended',
      resourceType: 'user',
      resourceId: id,
      metadata: { reason: reason ?? null, previous: target.isActive },
      ipAddress,
    });

    return updated;
  }

  // ── Subscriptions & revenue (replaces transactional "earnings") ───────────
  async listSubscriptions(params: {
    status?: SubscriptionStatus;
    tier?: SubscriptionTier;
    search?: string;
    take?: number;
    skip?: number;
  }) {
    const { status, tier, search } = params;
    const take = Math.min(params.take ?? 50, 200);
    const skip = params.skip ?? 0;

    const where: Prisma.VendorSubscriptionWhereInput = {
      ...(status && { status }),
      ...(tier && { plan: { tier } }),
      ...(search && {
        vendor: {
          OR: [
            { businessName: { contains: search, mode: 'insensitive' } },
            { user: { email: { contains: search, mode: 'insensitive' } } },
          ],
        },
      }),
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.vendorSubscription.findMany({
        where,
        select: {
          id: true,
          status: true,
          billingCycle: true,
          currentPeriodStart: true,
          currentPeriodEnd: true,
          trialEndsAt: true,
          cancelAtPeriodEnd: true,
          provider: true,
          createdAt: true,
          plan: { select: { tier: true, name: true, priceMonthly: true, priceYearly: true, currency: true } },
          vendor: {
            select: {
              id: true,
              businessName: true,
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      this.prisma.vendorSubscription.count({ where }),
    ]);

    return { data: rows, meta: { total, take, skip } };
  }

  /**
   * Revenue summary under the subscription-only model: MRR (monthly-normalised),
   * active counts, and a by-tier breakdown. Yearly plans are amortised /12.
   */
  async revenue() {
    const subs = await this.prisma.vendorSubscription.findMany({
      where: { status: { in: REVENUE_STATUSES } },
      select: {
        billingCycle: true,
        plan: { select: { tier: true, priceMonthly: true, priceYearly: true, currency: true } },
      },
    });

    const byTier: Record<string, { count: number; mrr: number }> = {
      BASIC: { count: 0, mrr: 0 },
      PREMIUM: { count: 0, mrr: 0 },
      GOLD: { count: 0, mrr: 0 },
    };
    let mrr = 0;
    let currency = 'USD';

    for (const s of subs) {
      const monthly =
        s.billingCycle === 'YEARLY'
          ? Number(s.plan.priceYearly) / 12
          : Number(s.plan.priceMonthly);
      currency = s.plan.currency;
      const tier = s.plan.tier;
      byTier[tier] = byTier[tier] ?? { count: 0, mrr: 0 };
      byTier[tier].count += 1;
      byTier[tier].mrr += monthly;
      mrr += monthly;
    }

    const round2 = (n: number) => Math.round(n * 100) / 100;
    return {
      currency,
      // Lets the admin UI toggle NGN ⇄ USD without another request.
      ngnToUsdRate: Number(process.env.NGN_TO_USD_RATE) || 1600,
      activeSubscriptions: subs.length,
      mrr: round2(mrr),
      arr: round2(mrr * 12),
      byTier: Object.fromEntries(
        Object.entries(byTier).map(([k, v]) => [k, { count: v.count, mrr: round2(v.mrr) }]),
      ),
    };
  }
}
