import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(RedisService) private readonly redis: RedisService,
  ) {}

  private async getEventForOwner(id: string, userId: string) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    if (event.clientId !== userId) throw new NotFoundException('Event not found');
    return event;
  }

  async create(userId: string, dto: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        clientId: userId,
        name: dto.title,
        description: dto.description,
        eventDate: new Date(dto.eventDate),
        location: dto.location ? { address: dto.location } : Prisma.JsonNull,
        budgetMin: dto.budget != null ? new Prisma.Decimal(dto.budget) : undefined,
        guestCount: dto.guestCount,
        coverUrl: dto.coverUrl,
        status: EventStatus.DRAFT,
      },
    });
  }

  async findAll(userId: string) {
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

  async findOne(id: string, userId: string) {
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
    if (!event) throw new NotFoundException('Event not found');
    if (event.clientId !== userId) throw new NotFoundException('Event not found');
    return event;
  }

  async update(id: string, userId: string, dto: UpdateEventDto) {
    const event = await this.getEventForOwner(id, userId);
    if (event.status === EventStatus.COMPLETED || event.status === EventStatus.CANCELLED) {
      throw new ConflictException('Cannot update a completed or cancelled event');
    }
    return this.prisma.event.update({
      where: { id },
      data: {
        name: dto.title,
        description: dto.description,
        eventDate: dto.eventDate ? new Date(dto.eventDate) : undefined,
        location: dto.location ? { address: dto.location } : undefined,
        budgetMin: dto.budget != null ? new Prisma.Decimal(dto.budget) : undefined,
        guestCount: dto.guestCount,
        coverUrl: dto.coverUrl,
        status: dto.status,
      },
    });
  }

  async cancel(id: string, userId: string) {
    const event = await this.getEventForOwner(id, userId);
    if (event.status === EventStatus.COMPLETED) {
      throw new ConflictException('Cannot cancel a completed event');
    }
    if (event.status === EventStatus.CANCELLED) {
      throw new ConflictException('Event is already cancelled');
    }
    return this.prisma.event.update({
      where: { id },
      data: { status: EventStatus.CANCELLED },
    });
  }

  async addVendor(eventId: string, userId: string, vendorId: string) {
    await this.getEventForOwner(eventId, userId);

    const vendor = await this.prisma.vendorProfile.findUnique({ where: { id: vendorId } });
    if (!vendor) throw new NotFoundException('Vendor not found');

    const existing = await this.prisma.eventVendor.findFirst({
      where: { eventId, vendorId },
    });
    if (existing) throw new ConflictException('Vendor is already added to this event');

    return this.prisma.eventVendor.create({
      data: { eventId, vendorId },
    });
  }

  async removeVendor(eventId: string, userId: string, vendorId: string) {
    await this.getEventForOwner(eventId, userId);

    const eventVendor = await this.prisma.eventVendor.findFirst({
      where: { eventId, vendorId },
    });
    if (!eventVendor) throw new NotFoundException('Vendor not found on this event');

    return this.prisma.eventVendor.delete({ where: { id: eventVendor.id } });
  }
}
