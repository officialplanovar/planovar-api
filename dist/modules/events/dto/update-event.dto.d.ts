import { EventStatus, EventType } from '@prisma/client';
export declare class UpdateEventDto {
    title?: string;
    type?: EventType;
    description?: string;
    eventDate?: string;
    location?: string;
    budget?: number;
    guestCount?: number;
    coverUrl?: string;
    status?: EventStatus;
}
