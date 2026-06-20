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
        updatedAt: Date;
        body: string;
        title: string | null;
        rating: number;
        vendorId: string;
        isVerified: boolean;
        bookingId: string;
        reviewerId: string;
    }>;
    findMyReviews(req: Request, take?: string, skip?: string): Promise<{
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
    findAllForVendor(vendorId: string, take?: string, skip?: string): Promise<{
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
    findOne(id: string): Promise<{
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
    respond(req: Request, id: string, dto: ReviewResponseDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        body: string;
        vendorId: string;
        reviewId: string;
    }>;
}
