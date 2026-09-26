import { EventStatus } from '@prisma/client';
export declare class UpdateEventDto {
    title?: string;
    description?: string;
    eventDate?: string;
    location?: string;
    budget?: number;
    guestCount?: number;
    coverUrl?: string;
    status?: EventStatus;
}
