import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DisputeStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';

@Injectable()
export class DisputesService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async create(raisedBy: string, dto: CreateDisputeDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
      include: {
        vendor: { select: { id: true, userId: true } },
      },
    });

    if (!booking) throw new NotFoundException('Booking not found');

    const isClient = booking.clientId === raisedBy;
    const isVendor = booking.vendor.userId === raisedBy;
    if (!isClient && !isVendor) {
      throw new ForbiddenException('You are not a participant in this booking');
    }

    const existing = await this.prisma.dispute.findUnique({
      where: { bookingId: dto.bookingId },
      select: { id: true },
    });
    if (existing) throw new ConflictException('A dispute already exists for this booking');

    return this.prisma.dispute.create({
      data: {
        bookingId: dto.bookingId,
        raisedBy,
        reason: dto.reason,
        description: dto.description,
        status: DisputeStatus.OPEN,
      },
    });
  }

  async findAll(userId: string, role: UserRole) {
    if (role === UserRole.ADMIN) {
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

  async findOne(id: string, userId: string, role: UserRole) {
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

    if (!dispute) throw new NotFoundException('Dispute not found');

    const isAdmin = role === UserRole.ADMIN;
    const isRaiser = dispute.raisedBy === userId;
    const isClient = dispute.booking.clientId === userId;
    const isVendor = dispute.booking.vendor.userId === userId;

    if (!isAdmin && !isRaiser && !isClient && !isVendor) {
      throw new ForbiddenException('Access denied');
    }

    return dispute;
  }

  async updateStatus(id: string, status: DisputeStatus, adminId: string) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!dispute) throw new NotFoundException('Dispute not found');

    return this.prisma.dispute.update({
      where: { id },
      data: { status },
    });
  }

  async resolve(id: string, dto: ResolveDisputeDto, adminId: string) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!dispute) throw new NotFoundException('Dispute not found');

    if (
      dispute.status !== DisputeStatus.OPEN &&
      dispute.status !== DisputeStatus.UNDER_REVIEW
    ) {
      throw new ConflictException(
        `Cannot resolve a dispute with status ${dispute.status}`,
      );
    }

    return this.prisma.dispute.update({
      where: { id },
      data: {
        status: DisputeStatus.RESOLVED,
        resolution: dto.resolution,
        resolvedBy: adminId,
        resolvedAt: new Date(),
      },
    });
  }
}
