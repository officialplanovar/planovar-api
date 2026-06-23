import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
export declare class ReviewsService {
    private readonly prisma;
    private readonly redis;
    private readonly notifications;
    constructor(prisma: PrismaService, redis: RedisService, notifications: NotificationsService);
    create(reviewerId: string, dto: CreateReviewDto): Promise<{
        id: string;
        createdAt: Date;
        vendorId: string;
        updatedAt: Date;
        isVerified: boolean;
        bookingId: string;
        title: string | null;
        reviewerId: string;
        rating: number;
        body: string;
    }>;
    findAllForVendor(vendorId: string, take?: number, skip?: number): Promise<{
        data: ({
            reviewer: {
                name: string;
                image: string | null;
            };
            response: {
                id: string;
                createdAt: Date;
                vendorId: string;
                updatedAt: Date;
                body: string;
                reviewId: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            vendorId: string;
            updatedAt: Date;
            isVerified: boolean;
            bookingId: string;
            title: string | null;
            reviewerId: string;
            rating: number;
            body: string;
        })[];
        meta: {
            total: number;
            take: number;
            skip: number;
            hasMore: boolean;
            averageRating: number;
        };
    }>;
    findMyReviews(userId: string, take?: number, skip?: number): Promise<{
        data: ({
            vendor: {
                slug: string;
                businessName: string;
            };
            booking: {
                eventDate: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            vendorId: string;
            updatedAt: Date;
            isVerified: boolean;
            bookingId: string;
            title: string | null;
            reviewerId: string;
            rating: number;
            body: string;
        })[];
        meta: {
            total: number;
            take: number;
            skip: number;
            hasMore: boolean;
        };
    }>;
    respond(reviewId: string, vendorUserId: string, dto: ReviewResponseDto): Promise<{
        id: string;
        createdAt: Date;
        vendorId: string;
        updatedAt: Date;
        body: string;
        reviewId: string;
    }>;
    findOne(reviewId: string): Promise<{
        vendor: {
            id: string;
            slug: string;
            businessName: string;
        };
        reviewer: {
            id: string;
            name: string;
            image: string | null;
        };
        response: {
            id: string;
            createdAt: Date;
            vendorId: string;
            updatedAt: Date;
            body: string;
            reviewId: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        vendorId: string;
        updatedAt: Date;
        isVerified: boolean;
        bookingId: string;
        title: string | null;
        reviewerId: string;
        rating: number;
        body: string;
    }>;
}
