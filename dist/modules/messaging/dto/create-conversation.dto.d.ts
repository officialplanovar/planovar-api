import { ConversationType } from '@prisma/client';
export declare class CreateConversationDto {
    type: ConversationType;
    bookingId?: string;
    vendorId?: string;
    eventId?: string;
    groupName?: string;
}
