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
        updatedAt: Date;
        body: string;
        title: string | null;
        rating: number;
        vendorId: string;
        isVerified: boolean;
        bookingId: string;
        reviewerId: string;
    }>;
    findAllForVendor(vendorId: string, take?: number, skip?: number): Promise<{
        data: ({
            reviewer: {
                image: string | null;
                name: string;
            };
            response: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                body: string;
                vendorId: string;
                reviewId: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            body: string;
            title: string | null;
            rating: number;
            vendorId: string;
            isVerified: boolean;
            bookingId: string;
            reviewerId: string;
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
            booking: {
                eventDate: Date;
            };
            vendor: {
                slug: string;
                businessName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            body: string;
            title: string | null;
            rating: number;
            vendorId: string;
            isVerified: boolean;
            bookingId: string;
            reviewerId: string;
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
        updatedAt: Date;
        body: string;
        vendorId: string;
        reviewId: string;
    }>;
    findOne(reviewId: string): Promise<{
        vendor: {
            id: string;
            slug: string;
            businessName: string;
        };
        reviewer: {
            image: string | null;
            id: string;
            name: string;
        };
        response: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            body: string;
            vendorId: string;
            reviewId: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        body: string;
        title: string | null;
        rating: number;
        vendorId: string;
        isVerified: boolean;
        bookingId: string;
        reviewerId: string;
    }>;
}
