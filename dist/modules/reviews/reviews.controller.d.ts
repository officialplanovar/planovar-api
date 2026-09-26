import type { Request } from 'express';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { ReviewsService } from './reviews.service';
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    create(req: Request, dto: CreateReviewDto): Promise<{
        rating: number;
        id: string;
        title: string | null;
        vendorId: string;
        createdAt: Date;
        isVerified: boolean;
        updatedAt: Date;
        body: string;
        bookingId: string;
        reviewerId: string;
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
            rating: number;
            id: string;
            title: string | null;
            vendorId: string;
            createdAt: Date;
            isVerified: boolean;
            updatedAt: Date;
            body: string;
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
                vendorId: string;
                createdAt: Date;
                updatedAt: Date;
                body: string;
                reviewId: string;
            } | null;
        } & {
            rating: number;
            id: string;
            title: string | null;
            vendorId: string;
            createdAt: Date;
            isVerified: boolean;
            updatedAt: Date;
            body: string;
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
            id: string;
            image: string | null;
            name: string;
        };
        response: {
            id: string;
            vendorId: string;
            createdAt: Date;
            updatedAt: Date;
            body: string;
            reviewId: string;
        } | null;
    } & {
        rating: number;
        id: string;
        title: string | null;
        vendorId: string;
        createdAt: Date;
        isVerified: boolean;
        updatedAt: Date;
        body: string;
        bookingId: string;
        reviewerId: string;
    }>;
    respond(req: Request, id: string, dto: ReviewResponseDto): Promise<{
        id: string;
        vendorId: string;
        createdAt: Date;
        updatedAt: Date;
        body: string;
        reviewId: string;
    }>;
}
