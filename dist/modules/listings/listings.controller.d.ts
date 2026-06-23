import { MediaType } from '@prisma/client';
import type { Request } from 'express';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { ListingsService } from './listings.service';
declare class AddMediaDto {
    url: string;
    publicId?: string;
    type: MediaType;
    sortOrder?: number;
}
export declare class ListingsController {
    private readonly listingsService;
    constructor(listingsService: ListingsService);
    create(req: Request, dto: CreateListingDto): Promise<{
        id: string;
        createdAt: Date;
        vendorId: string;
        updatedAt: Date;
        description: string;
        location: import("@prisma/client/runtime/client").JsonValue;
        tags: string[];
        ratingAvg: import("@prisma/client-runtime-utils").Decimal;
        reviewCount: number;
        isActive: boolean;
        categoryId: string;
        title: string;
        pricingType: import("@prisma/client").$Enums.PricingType;
        basePrice: import("@prisma/client-runtime-utils").Decimal | null;
        isFeatured: boolean;
        viewCount: number;
        isRentable: boolean;
        perDayRate: import("@prisma/client-runtime-utils").Decimal | null;
        depositAmount: import("@prisma/client-runtime-utils").Decimal | null;
        category: {
            id: string;
            name: string;
            slug: string;
        };
        media: {
            type: import("@prisma/client").$Enums.MediaType;
            id: string;
            sortOrder: number;
            url: string;
            publicId: string | null;
        }[];
    }>;
    findAll(req: Request): Promise<{
        id: string;
        createdAt: Date;
        vendorId: string;
        updatedAt: Date;
        description: string;
        location: import("@prisma/client/runtime/client").JsonValue;
        tags: string[];
        ratingAvg: import("@prisma/client-runtime-utils").Decimal;
        reviewCount: number;
        isActive: boolean;
        categoryId: string;
        title: string;
        pricingType: import("@prisma/client").$Enums.PricingType;
        basePrice: import("@prisma/client-runtime-utils").Decimal | null;
        isFeatured: boolean;
        viewCount: number;
        isRentable: boolean;
        perDayRate: import("@prisma/client-runtime-utils").Decimal | null;
        depositAmount: import("@prisma/client-runtime-utils").Decimal | null;
        category: {
            id: string;
            name: string;
            slug: string;
        };
        media: {
            type: import("@prisma/client").$Enums.MediaType;
            id: string;
            sortOrder: number;
            url: string;
            publicId: string | null;
        }[];
    }[]>;
    findOne(id: string): Promise<{}>;
    update(id: string, req: Request, dto: UpdateListingDto): Promise<{
        id: string;
        createdAt: Date;
        vendorId: string;
        updatedAt: Date;
        description: string;
        location: import("@prisma/client/runtime/client").JsonValue;
        tags: string[];
        ratingAvg: import("@prisma/client-runtime-utils").Decimal;
        reviewCount: number;
        isActive: boolean;
        categoryId: string;
        title: string;
        pricingType: import("@prisma/client").$Enums.PricingType;
        basePrice: import("@prisma/client-runtime-utils").Decimal | null;
        isFeatured: boolean;
        viewCount: number;
        isRentable: boolean;
        perDayRate: import("@prisma/client-runtime-utils").Decimal | null;
        depositAmount: import("@prisma/client-runtime-utils").Decimal | null;
        category: {
            id: string;
            name: string;
            slug: string;
        };
        media: {
            type: import("@prisma/client").$Enums.MediaType;
            id: string;
            sortOrder: number;
            url: string;
            publicId: string | null;
        }[];
    }>;
    remove(id: string, req: Request): Promise<{
        id: string;
        isActive: boolean;
    }>;
    addMedia(id: string, req: Request, body: AddMediaDto): Promise<{
        type: import("@prisma/client").$Enums.MediaType;
        id: string;
        createdAt: Date;
        sortOrder: number;
        listingId: string;
        url: string;
        publicId: string | null;
    }>;
    removeMedia(mediaId: string, req: Request): Promise<{
        publicId: string | null;
    }>;
}
export {};
