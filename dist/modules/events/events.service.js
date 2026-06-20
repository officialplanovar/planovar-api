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
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const redis_service_1 = require("../../common/redis/redis.service");
let EventsService = class EventsService {
    prisma;
    redis;
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    async getEventForOwner(id, userId) {
        const event = await this.prisma.event.findUnique({ where: { id } });
        if (!event)
            throw new common_1.NotFoundException('Event not found');
        if (event.clientId !== userId)
            throw new common_1.NotFoundException('Event not found');
        return event;
    }
    async create(userId, dto) {
        return this.prisma.event.create({
            data: {
                clientId: userId,
                name: dto.title,
                description: dto.description,
                eventDate: new Date(dto.eventDate),
                location: dto.location ? { address: dto.location } : client_1.Prisma.JsonNull,
                budgetMin: dto.budget != null ? new client_1.Prisma.Decimal(dto.budget) : undefined,
                guestCount: dto.guestCount,
                coverUrl: dto.coverUrl,
                status: client_1.EventStatus.DRAFT,
            },
        });
    }
    async findAll(userId) {
        return this.prisma.event.findMany({
            where: { clientId: userId },
            orderBy: { eventDate: 'desc' },
            select: {
                id: true,
                name: true,
                eventDate: true,
                location: true,
                status: true,
                guestCount: true,
                coverUrl: true,
                createdAt: true,
            },
        });
    }
    async findOne(id, userId) {
        const event = await this.prisma.event.findUnique({
            where: { id },
            include: {
                eventVendors: {
                    include: {
                        vendor: {
                            select: { id: true, businessName: true, slug: true },
                        },
                    },
                },
                bookings: {
                    select: {
                        id: true,
                        status: true,
                        eventDate: true,
                        quoteAmount: true,
                    },
                },
            },
        });
        if (!event)
            throw new common_1.NotFoundException('Event not found');
        if (event.clientId !== userId)
            throw new common_1.NotFoundException('Event not found');
        return event;
    }
    async update(id, userId, dto) {
        const event = await this.getEventForOwner(id, userId);
        if (event.status === client_1.EventStatus.COMPLETED || event.status === client_1.EventStatus.CANCELLED) {
            throw new common_1.ConflictException('Cannot update a completed or cancelled event');
        }
        return this.prisma.event.update({
            where: { id },
            data: {
                name: dto.title,
                description: dto.description,
                eventDate: dto.eventDate ? new Date(dto.eventDate) : undefined,
                location: dto.location ? { address: dto.location } : undefined,
                budgetMin: dto.budget != null ? new client_1.Prisma.Decimal(dto.budget) : undefined,
                guestCount: dto.guestCount,
                coverUrl: dto.coverUrl,
                status: dto.status,
            },
        });
    }
    async cancel(id, userId) {
        const event = await this.getEventForOwner(id, userId);
        if (event.status === client_1.EventStatus.COMPLETED) {
            throw new common_1.ConflictException('Cannot cancel a completed event');
        }
        if (event.status === client_1.EventStatus.CANCELLED) {
            throw new common_1.ConflictException('Event is already cancelled');
        }
        return this.prisma.event.update({
            where: { id },
            data: { status: client_1.EventStatus.CANCELLED },
        });
    }
    async addVendor(eventId, userId, vendorId) {
        await this.getEventForOwner(eventId, userId);
        const vendor = await this.prisma.vendorProfile.findUnique({ where: { id: vendorId } });
        if (!vendor)
            throw new common_1.NotFoundException('Vendor not found');
        const existing = await this.prisma.eventVendor.findFirst({
            where: { eventId, vendorId },
        });
        if (existing)
            throw new common_1.ConflictException('Vendor is already added to this event');
        return this.prisma.eventVendor.create({
            data: { eventId, vendorId },
        });
    }
    async removeVendor(eventId, userId, vendorId) {
        await this.getEventForOwner(eventId, userId);
        const eventVendor = await this.prisma.eventVendor.findFirst({
            where: { eventId, vendorId },
        });
        if (!eventVendor)
            throw new common_1.NotFoundException('Vendor not found on this event');
        return this.prisma.eventVendor.delete({ where: { id: eventVendor.id } });
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_service_1.PrismaService)),
    __param(1, (0, common_1.Inject)(redis_service_1.RedisService)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], EventsService);
//# sourceMappingURL=events.service.js.map