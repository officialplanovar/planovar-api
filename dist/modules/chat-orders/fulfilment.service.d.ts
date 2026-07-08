import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ReviewsService } from '../reviews/reviews.service';
import { ChatCardService } from './chat-card.service';
export declare class FulfilmentService {
    private readonly prisma;
    private readonly cards;
    private readonly reviews;
    private readonly notifications;
    constructor(prisma: PrismaService, cards: ChatCardService, reviews: ReviewsService, notifications: NotificationsService);
    private vendorFor;
    private loadBooking;
    postUpdate(vendorUserId: string, bookingId: string, message: string): Promise<{
        posted: boolean;
    }>;
    markDelivered(vendorUserId: string, bookingId: string): Promise<{
        completed: boolean;
    }>;
    confirmReturn(vendorUserId: string, bookingId: string): Promise<{
        completed: boolean;
        depositRefunded: boolean;
    }>;
    submitReview(clientUserId: string, bookingId: string, dto: {
        rating: number;
        body: string;
        title?: string;
    }): Promise<{
        submitted: boolean;
    }>;
}
