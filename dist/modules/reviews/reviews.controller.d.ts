import type { Request } from 'express';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { ReviewsService } from './reviews.service';
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    create(req: Request, dto: CreateReviewDto): Promise<{
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
    findMyReviews(req: Request, take?: string, skip?: string): Promise<{
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
    findAllForVendor(vendorId: string, take?: string, skip?: string): Promise<{
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
    findOne(id: string): Promise<{
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
    respond(req: Request, id: string, dto: ReviewResponseDto): Promise<{
        id: string;
        createdAt: Date;
        vendorId: string;
        updatedAt: Date;
        body: string;
        reviewId: string;
    }>;
}
