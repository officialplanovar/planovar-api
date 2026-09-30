import { DeliveryMethod, FulfilmentType } from '@prisma/client';
export declare class CreateOrderRequestDto {
    listingId: string;
    fulfilmentType: FulfilmentType;
    deliveryMethod: DeliveryMethod;
    amount: number;
    pickupAt?: string;
    returnAt?: string;
    eventId?: string;
    address?: string;
    notes?: string;
}
