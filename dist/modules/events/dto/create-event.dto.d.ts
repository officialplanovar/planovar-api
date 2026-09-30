import { EventType } from '@prisma/client';
export declare class CreateEventDto {
    title: string;
    type?: EventType;
    description?: string;
    eventDate: string;
    location?: string;
    budget?: number;
    guestCount?: number;
    coverUrl?: string;
}
