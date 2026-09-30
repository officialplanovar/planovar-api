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
exports.DisputesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
let DisputesService = class DisputesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(raisedBy, dto) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: dto.bookingId },
            include: {
                vendor: { select: { id: true, userId: true } },
            },
        });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        const isClient = booking.clientId === raisedBy;
        const isVendor = booking.vendor.userId === raisedBy;
        if (!isClient && !isVendor) {
            throw new common_1.ForbiddenException('You are not a participant in this booking');
        }
        const existing = await this.prisma.dispute.findUnique({
            where: { bookingId: dto.bookingId },
            select: { id: true },
        });
        if (existing)
            throw new common_1.ConflictException('A dispute already exists for this booking');
        return this.prisma.dispute.create({
            data: {
                bookingId: dto.bookingId,
                raisedBy,
                reason: dto.reason,
                description: dto.description,
                status: client_1.DisputeStatus.OPEN,
            },
        });
    }
    async findAll(userId, role) {
        if (role === client_1.UserRole.ADMIN) {
            return this.prisma.dispute.findMany({
                include: {
                    booking: { select: { id: true, eventDate: true, status: true } },
                    raiser: { select: { id: true, name: true, email: true } },
                },
                orderBy: { createdAt: 'desc' },
            });
        }
        return this.prisma.dispute.findMany({
            where: {
                OR: [
                    { booking: { clientId: userId } },
                    { booking: { vendor: { userId } } },
                ],
            },
            include: {
                booking: { select: { id: true, eventDate: true, status: true } },
                raiser: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id, userId, role) {
        const dispute = await this.prisma.dispute.findUnique({
            where: { id },
            include: {
                booking: {
                    include: {
                        client: { select: { id: true, name: true, email: true } },
                        vendor: { select: { id: true, businessName: true, userId: true } },
                    },
                },
                raiser: { select: { id: true, name: true, email: true } },
            },
        });
        if (!dispute)
            throw new common_1.NotFoundException('Dispute not found');
        const isAdmin = role === client_1.UserRole.ADMIN;
        const isRaiser = dispute.raisedBy === userId;
        const isClient = dispute.booking.clientId === userId;
        const isVendor = dispute.booking.vendor.userId === userId;
        if (!isAdmin && !isRaiser && !isClient && !isVendor) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return dispute;
    }
    async updateStatus(id, status, adminId) {
        const dispute = await this.prisma.dispute.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!dispute)
            throw new common_1.NotFoundException('Dispute not found');
        return this.prisma.dispute.update({
            where: { id },
            data: { status },
        });
    }
    async resolve(id, dto, adminId) {
        const dispute = await this.prisma.dispute.findUnique({
            where: { id },
            select: { id: true, status: true },
        });
        if (!dispute)
            throw new common_1.NotFoundException('Dispute not found');
        if (dispute.status !== client_1.DisputeStatus.OPEN &&
            dispute.status !== client_1.DisputeStatus.UNDER_REVIEW) {
            throw new common_1.ConflictException(`Cannot resolve a dispute with status ${dispute.status}`);
        }
        return this.prisma.dispute.update({
            where: { id },
            data: {
                status: client_1.DisputeStatus.RESOLVED,
                resolution: dto.resolution,
                resolvedBy: adminId,
                resolvedAt: new Date(),
            },
        });
    }
};
exports.DisputesService = DisputesService;
exports.DisputesService = DisputesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_service_1.PrismaService)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DisputesService);
//# sourceMappingURL=disputes.service.js.map