import { EventType } from '@prisma/client';
export declare class SearchListingsDto {
    q?: string;
    page?: number;
    perPage?: number;
    categoryId?: string;
    pricingType?: string;
    vendorTier?: string;
    minPrice?: number;
    maxPrice?: number;
    city?: string;
    country?: string;
    isRentable?: boolean;
    eventType?: EventType;
}
export declare class SearchVendorsDto {
    q?: string;
    page?: number;
    perPage?: number;
    subscriptionTier?: string;
    city?: string;
    country?: string;
    isVerified?: boolean;
    eventType?: EventType;
}
export declare class SearchEventsDto {
    q?: string;
    page?: number;
    clientId?: string;
    city?: string;
}
