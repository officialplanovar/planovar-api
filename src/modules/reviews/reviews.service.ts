import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus, NotificationType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';

/**
 * Reviews — "verified interaction" model: only the client of a COMPLETED
 * booking can review (one review per booking). Vendors may reply once.
 * Denormalized vendor ratingAvg/reviewCount are recomputed transactionally
 * and the vendor's cached public profile is invalidated.
 */
@Injectable()
export class ReviewsService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(RedisService) private readonly redis: RedisService,
    @Inject(NotificationsService) private readonly notifications: NotificationsService,
  ) {}

  async create(reviewerId: string, dto: CreateReviewDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
      select: {
        id: true,
        clientId: true,
        vendorId: true,
        status: true,
        listing: { select: { title: true } },
        vendor: { select: { slug: true, userId: true } },
        client: { select: { firstName: true, name: true } },
      },
    });

    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.status !== BookingStatus.COMPLETED) {
      throw new ForbiddenException('Can only review a completed booking');
    }
    if (booking.clientId !== reviewerId) {
      throw new ForbiddenException('You are not the client for this booking');
    }

    const existing = await this.prisma.review.findUnique({
      where: { bookingId: dto.bookingId },
      select: { id: true },
    });
    if (existing) throw new ConflictException('A review already exists for this booking');

    // Create + recompute the denormalized rating atomically.
    const review = await this.prisma.$transaction(async (tx) => {
      const created = await tx.review.create({
        data: {
          bookingId: dto.bookingId,
          reviewerId,
          vendorId: booking.vendorId,
          rating: dto.rating,
          title: dto.title ?? null,
          body: dto.body,
        },
      });

      const aggregate = await tx.review.aggregate({
        where: { vendorId: booking.vendorId },
        _avg: { rating: true },
        _count: { _all: true },
      });

      await tx.vendorProfile.update({
        where: { id: booking.vendorId },
        data: {
          ratingAvg: new Prisma.Decimal((aggregate._avg.rating ?? 0).toFixed(2)),
          reviewCount: aggregate._count._all,
        },
      });

      return created;
    });

    // Rating changed → bust the vendor's cached public profile.
    await this.redis.del(
      RedisService.keys.vendor(booking.vendorId),
      RedisService.keys.vendorBySlug(booking.vendor.slug),
    );

    const clientName = booking.client.firstName ?? booking.client.name ?? 'A client';
    void this.notifications
      .create(
        booking.vendor.userId,
        NotificationType.REVIEW_RECEIVED,
        `New ${dto.rating}★ review`,
        `${clientName} reviewed "${booking.listing.title}"${dto.title ? `: "${dto.title}"` : ''}`,
        { reviewId: review.id, bookingId: dto.bookingId },
      )
      .catch(() => void 0);

    return review;
  }

  async findAllForVendor(vendorId: string, take = 20, skip = 0) {
    const [data, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { vendorId },
        include: {
          reviewer: { select: { name: true, image: true } },
          response: true,
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      this.prisma.review.count({ where: { vendorId } }),
    ]);

    const aggregate = await this.prisma.review.aggregate({
      where: { vendorId },
      _avg: { rating: true },
    });

    return {
      data,
      meta: {
        total,
        take,
        skip,
        hasMore: skip + take < total,
        averageRating: aggregate._avg.rating ?? 0,
      },
    };
  }

  async findMyReviews(userId: string, take = 20, skip = 0) {
    const [data, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { reviewerId: userId },
        include: {
          vendor: { select: { businessName: true, slug: true } },
          booking: { select: { eventDate: true } },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      this.prisma.review.count({ where: { reviewerId: userId } }),
    ]);

    return {
      data,
      meta: {
        total,
        take,
        skip,
        hasMore: skip + take < total,
      },
    };
  }

  async respond(reviewId: string, vendorUserId: string, dto: ReviewResponseDto) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        vendor: { select: { id: true, userId: true, businessName: true } },
        response: { select: { id: true } },
      },
    });

    if (!review) throw new NotFoundException('Review not found');
    if (review.vendor.userId !== vendorUserId) {
      throw new ForbiddenException('You are not the vendor for this review');
    }
    if (review.response) {
      throw new ConflictException('A response already exists for this review');
    }

    const response = await this.prisma.reviewResponse.create({
      data: {
        reviewId,
        vendorId: review.vendorId,
        body: dto.body,
      },
    });

    void this.notifications
      .create(
        review.reviewerId,
        NotificationType.SYSTEM,
        'Vendor replied to your review',
        `${review.vendor.businessName} responded to your review`,
        { reviewId },
      )
      .catch(() => void 0);

    return response;
  }

  async findOne(reviewId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        reviewer: { select: { id: true, name: true, image: true } },
        vendor: { select: { id: true, businessName: true, slug: true } },
        response: true,
      },
    });

    if (!review) throw new NotFoundException('Review not found');
    return review;
  }
}
