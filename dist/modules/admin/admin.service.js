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
var AdminService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_service_1 = require("../../common/audit/audit.service");
const REVENUE_STATUSES = [client_1.SubscriptionStatus.ACTIVE];
let AdminService = class AdminService {
    static { AdminService_1 = this; }
    prisma;
    audit;
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async dashboard() {
        const [pendingKyc, openDisputes, activeUsers, totalUsers, totalVendors, activeSubs, recentActivity,] = await this.prisma.$transaction([
            this.prisma.vendorProfile.count({
                where: { kycStatus: client_1.KycStatus.SUBMITTED },
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
    async listVendors(params) {
        const { kycStatus, tier, search } = params;
        const take = Math.min(params.take ?? 50, 200);
        const skip = params.skip ?? 0;
        const where = {
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
                    idDocumentUrl: true,
                    idType: true,
                    idCountry: true,
                    businessRegDocumentUrl: true,
                    businessRegCountry: true,
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
    async listUsers(params) {
        const { role, isActive, search } = params;
        const take = Math.min(params.take ?? 50, 200);
        const skip = params.skip ?? 0;
        const where = {
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
    async getUser(id) {
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
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async setUserActive(id, isActive, adminId, reason, ipAddress) {
        const target = await this.prisma.user.findUnique({
            where: { id },
            select: { id: true, isActive: true, role: true },
        });
        if (!target)
            throw new common_1.NotFoundException('User not found');
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
    async listSubscriptions(params) {
        const { status, tier, search } = params;
        const take = Math.min(params.take ?? 50, 200);
        const skip = params.skip ?? 0;
        const where = {
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
    async revenue() {
        const subs = await this.prisma.vendorSubscription.findMany({
            where: { status: { in: REVENUE_STATUSES } },
            select: {
                billingCycle: true,
                plan: { select: { tier: true, priceMonthly: true, priceYearly: true, currency: true } },
            },
        });
        const byTier = {
            BASIC: { count: 0, mrr: 0 },
            PREMIUM: { count: 0, mrr: 0 },
            GOLD: { count: 0, mrr: 0 },
        };
        let mrr = 0;
        let currency = 'USD';
        for (const s of subs) {
            const monthly = s.billingCycle === 'YEARLY'
                ? Number(s.plan.priceYearly) / 12
                : Number(s.plan.priceMonthly);
            currency = s.plan.currency;
            const tier = s.plan.tier;
            byTier[tier] = byTier[tier] ?? { count: 0, mrr: 0 };
            byTier[tier].count += 1;
            byTier[tier].mrr += monthly;
            mrr += monthly;
        }
        const round2 = (n) => Math.round(n * 100) / 100;
        return {
            currency,
            ngnToUsdRate: Number(process.env.NGN_TO_USD_RATE) || 1600,
            activeSubscriptions: subs.length,
            mrr: round2(mrr),
            arr: round2(mrr * 12),
            byTier: Object.fromEntries(Object.entries(byTier).map(([k, v]) => [k, { count: v.count, mrr: round2(v.mrr) }])),
        };
    }
    async getSettings() {
        return this.prisma.platformSettings.upsert({
            where: { id: 'singleton' },
            create: {},
            update: {},
        });
    }
    async updateSettings(dto) {
        return this.prisma.platformSettings.upsert({
            where: { id: 'singleton' },
            create: { ...dto },
            update: { ...dto },
        });
    }
    static PLAN_SELECT = {
        tier: true,
        name: true,
        priceMonthly: true,
        priceYearly: true,
        currency: true,
        listingLimit: true,
        features: true,
    };
    async getPlans() {
        return this.prisma.subscriptionPlan.findMany({
            orderBy: { priceMonthly: 'asc' },
            select: AdminService_1.PLAN_SELECT,
        });
    }
    async updatePlan(tier, dto) {
        const validTiers = Object.values(client_1.SubscriptionTier);
        if (!validTiers.includes(tier)) {
            throw new common_1.BadRequestException(`Invalid tier. Expected one of: ${validTiers.join(', ')}`);
        }
        const existing = await this.prisma.subscriptionPlan.findUnique({
            where: { tier: tier },
            select: { id: true },
        });
        if (!existing)
            throw new common_1.NotFoundException('Subscription plan not found');
        const data = {};
        if (dto.name !== undefined)
            data.name = dto.name;
        if (dto.priceMonthly !== undefined)
            data.priceMonthly = dto.priceMonthly;
        if (dto.priceYearly !== undefined)
            data.priceYearly = dto.priceYearly;
        if (dto.currency !== undefined)
            data.currency = dto.currency;
        if (dto.listingLimit !== undefined)
            data.listingLimit = dto.listingLimit;
        if (dto.features !== undefined)
            data.features = dto.features;
        return this.prisma.subscriptionPlan.update({
            where: { tier: tier },
            data,
            select: AdminService_1.PLAN_SELECT,
        });
    }
    async listAdmins() {
        return this.prisma.user.findMany({
            where: { role: client_1.UserRole.ADMIN, deletedAt: null },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'asc' },
        });
    }
    async promoteToAdmin(email) {
        const user = await this.prisma.user.findFirst({
            where: { email: { equals: email.trim(), mode: 'insensitive' }, deletedAt: null },
        });
        if (!user)
            throw new common_1.NotFoundException('No user found with that email');
        await this.prisma.user.update({
            where: { id: user.id },
            data: { role: client_1.UserRole.ADMIN },
        });
        return this.listAdmins();
    }
    async setUserRole(userId, role) {
        const valid = Object.values(client_1.UserRole);
        if (!valid.includes(role))
            throw new common_1.BadRequestException('Invalid role');
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        await this.prisma.user.update({
            where: { id: userId },
            data: { role: role },
        });
        return { id: userId, role };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = AdminService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_service_1.PrismaService)),
    __param(1, (0, common_1.Inject)(audit_service_1.AuditService)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], AdminService);
//# sourceMappingURL=admin.service.js.map