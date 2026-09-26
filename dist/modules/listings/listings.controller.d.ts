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
        title: string;
        description: string;
        pricingType: import("@prisma/client").$Enums.PricingType;
        categoryId: string;
        tags: string[];
        location: import("@prisma/client/runtime/client").JsonValue;
        vendorId: string;
        reviewCount: number;
        isActive: boolean;
        isRentable: boolean;
        createdAt: Date;
        ratingAvg: import("@prisma/client-runtime-utils").Decimal;
        basePrice: import("@prisma/client-runtime-utils").Decimal | null;
        isFeatured: boolean;
        viewCount: number;
        perDayRate: import("@prisma/client-runtime-utils").Decimal | null;
        depositAmount: import("@prisma/client-runtime-utils").Decimal | null;
        sku: string | null;
        stockQuantity: number | null;
        durationValue: number | null;
        durationUnit: string | null;
        cancellationPolicy: string | null;
        updatedAt: Date;
        category: {
            id: string;
            name: string;
            slug: string;
        };
        media: {
            id: string;
            type: import("@prisma/client").$Enums.MediaType;
            sortOrder: number;
            url: string;
            publicId: string | null;
        }[];
    }>;
    findAll(req: Request): Promise<{
        id: string;
        title: string;
        description: string;
        pricingType: import("@prisma/client").$Enums.PricingType;
        categoryId: string;
        tags: string[];
        location: import("@prisma/client/runtime/client").JsonValue;
        vendorId: string;
        reviewCount: number;
        isActive: boolean;
        isRentable: boolean;
        createdAt: Date;
        ratingAvg: import("@prisma/client-runtime-utils").Decimal;
        basePrice: import("@prisma/client-runtime-utils").Decimal | null;
        isFeatured: boolean;
        viewCount: number;
        perDayRate: import("@prisma/client-runtime-utils").Decimal | null;
        depositAmount: import("@prisma/client-runtime-utils").Decimal | null;
        sku: string | null;
        stockQuantity: number | null;
        durationValue: number | null;
        durationUnit: string | null;
        cancellationPolicy: string | null;
        updatedAt: Date;
        category: {
            id: string;
            name: string;
            slug: string;
        };
        media: {
            id: string;
            type: import("@prisma/client").$Enums.MediaType;
            sortOrder: number;
            url: string;
            publicId: string | null;
        }[];
    }[]>;
    browse(pricingType?: string, categoryId?: string, isRentable?: string, take?: string, skip?: string): Promise<{
        id: string;
        title: string;
        description: string;
        pricingType: import("@prisma/client").$Enums.PricingType;
        categoryId: string;
        tags: string[];
        location: import("@prisma/client/runtime/client").JsonValue;
        vendorId: string;
        reviewCount: number;
        isActive: boolean;
        isRentable: boolean;
        createdAt: Date;
        ratingAvg: import("@prisma/client-runtime-utils").Decimal;
        basePrice: import("@prisma/client-runtime-utils").Decimal | null;
        isFeatured: boolean;
        viewCount: number;
        perDayRate: import("@prisma/client-runtime-utils").Decimal | null;
        depositAmount: import("@prisma/client-runtime-utils").Decimal | null;
        sku: string | null;
        stockQuantity: number | null;
        durationValue: number | null;
        durationUnit: string | null;
        cancellationPolicy: string | null;
        updatedAt: Date;
        category: {
            id: string;
            name: string;
            slug: string;
        };
        media: {
            id: string;
            type: import("@prisma/client").$Enums.MediaType;
            sortOrder: number;
            url: string;
            publicId: string | null;
        }[];
    }[]>;
    findOne(id: string): Promise<{}>;
    recordView(id: string): Promise<{
        id: string;
        viewCount: number;
    }>;
    update(id: string, req: Request, dto: UpdateListingDto): Promise<{
        id: string;
        title: string;
        description: string;
        pricingType: import("@prisma/client").$Enums.PricingType;
        categoryId: string;
        tags: string[];
        location: import("@prisma/client/runtime/client").JsonValue;
        vendorId: string;
        reviewCount: number;
        isActive: boolean;
        isRentable: boolean;
        createdAt: Date;
        ratingAvg: import("@prisma/client-runtime-utils").Decimal;
        basePrice: import("@prisma/client-runtime-utils").Decimal | null;
        isFeatured: boolean;
        viewCount: number;
        perDayRate: import("@prisma/client-runtime-utils").Decimal | null;
        depositAmount: import("@prisma/client-runtime-utils").Decimal | null;
        sku: string | null;
        stockQuantity: number | null;
        durationValue: number | null;
        durationUnit: string | null;
        cancellationPolicy: string | null;
        updatedAt: Date;
        category: {
            id: string;
            name: string;
            slug: string;
        };
        media: {
            id: string;
            type: import("@prisma/client").$Enums.MediaType;
            sortOrder: number;
            url: string;
            publicId: string | null;
        }[];
    }>;
    remove(id: string, req: Request): Promise<{
        id: string;
        deleted: boolean;
    }>;
    addMedia(id: string, req: Request, body: AddMediaDto): Promise<{
        id: string;
        createdAt: Date;
        type: import("@prisma/client").$Enums.MediaType;
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
