import { PricingType } from '@prisma/client';
export declare class CreateListingDto {
    categoryId: string;
    title: string;
    description: string;
    pricingType: PricingType;
    basePrice?: number;
    location?: Record<string, unknown>;
    tags?: string[];
    isRentable?: boolean;
    perDayRate?: number;
    depositAmount?: number;
    mediaUrls?: string[];
}
