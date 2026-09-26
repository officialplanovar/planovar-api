import type { Request } from 'express';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { ReviewsService } from './reviews.service';
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    create(req: Request, dto: CreateReviewDto): Promise<{
        body: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        vendorId: string;
        isVerified: boolean;
        title: string | null;
        bookingId: string;
        rating: number;
        reviewerId: string;
    }>;
    findMyReviews(req: Request, take?: string, skip?: string): Promise<{
        data: ({
            vendor: {
                businessName: string;
                slug: string;
            };
            booking: {
                eventDate: Date;
            };
        } & {
            body: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            vendorId: string;
            isVerified: boolean;
            title: string | null;
            bookingId: string;
            rating: number;
            reviewerId: string;
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
                body: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                vendorId: string;
                reviewId: string;
            } | null;
        } & {
            body: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            vendorId: string;
            isVerified: boolean;
            title: string | null;
            bookingId: string;
            rating: number;
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
    findOne(id: string): Promise<{
        vendor: {
            id: string;
            businessName: string;
            slug: string;
        };
        reviewer: {
            id: string;
            name: string;
            image: string | null;
        };
        response: {
            body: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            vendorId: string;
            reviewId: string;
        } | null;
    } & {
        body: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        vendorId: string;
        isVerified: boolean;
        title: string | null;
        bookingId: string;
        rating: number;
        reviewerId: string;
    }>;
    respond(req: Request, id: string, dto: ReviewResponseDto): Promise<{
        body: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        vendorId: string;
        reviewId: string;
    }>;
}
