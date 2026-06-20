import { MediaType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { TypesenseSyncService } from '../../common/typesense/typesense-sync.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
interface AddMediaData {
    url: string;
    publicId?: string;
    type: MediaType;
    sortOrder?: number;
}
export declare class ListingsService {
    private readonly prisma;
    private readonly redis;
    private readonly sync;
    constructor(prisma: PrismaService, redis: RedisService, sync: TypesenseSyncService);
    create(userId: string, dto: CreateListingDto): Promise<{
        category: {
            id: string;
            name: string;
            slug: string;
        };
        tags: string[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        description: string;
        title: string;
        pricingType: import("@prisma/client").$Enums.PricingType;
        categoryId: string;
        location: Prisma.JsonValue;
        vendorId: string;
        reviewCount: number;
        isRentable: boolean;
        ratingAvg: Prisma.Decimal;
        basePrice: Prisma.Decimal | null;
        isFeatured: boolean;
        viewCount: number;
        perDayRate: Prisma.Decimal | null;
        depositAmount: Prisma.Decimal | null;
        media: {
            type: import("@prisma/client").$Enums.MediaType;
            url: string;
            publicId: string | null;
            id: string;
            sortOrder: number;
        }[];
    }>;
    private assertWithinListingLimit;
    findAllForUser(userId: string): Promise<{
        category: {
            id: string;
            name: string;
            slug: string;
        };
        tags: string[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        description: string;
        title: string;
        pricingType: import("@prisma/client").$Enums.PricingType;
        categoryId: string;
        location: Prisma.JsonValue;
        vendorId: string;
        reviewCount: number;
        isRentable: boolean;
        ratingAvg: Prisma.Decimal;
        basePrice: Prisma.Decimal | null;
        isFeatured: boolean;
        viewCount: number;
        perDayRate: Prisma.Decimal | null;
        depositAmount: Prisma.Decimal | null;
        media: {
            type: import("@prisma/client").$Enums.MediaType;
            url: string;
            publicId: string | null;
            id: string;
            sortOrder: number;
        }[];
    }[]>;
    findAll(vendorId: string): Promise<{
        category: {
            id: string;
            name: string;
            slug: string;
        };
        tags: string[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        description: string;
        title: string;
        pricingType: import("@prisma/client").$Enums.PricingType;
        categoryId: string;
        location: Prisma.JsonValue;
        vendorId: string;
        reviewCount: number;
        isRentable: boolean;
        ratingAvg: Prisma.Decimal;
        basePrice: Prisma.Decimal | null;
        isFeatured: boolean;
        viewCount: number;
        perDayRate: Prisma.Decimal | null;
        depositAmount: Prisma.Decimal | null;
        media: {
            type: import("@prisma/client").$Enums.MediaType;
            url: string;
            publicId: string | null;
            id: string;
            sortOrder: number;
        }[];
    }[]>;
    findOne(id: string): Promise<{}>;
    update(id: string, userId: string, dto: UpdateListingDto): Promise<{
        category: {
            id: string;
            name: string;
            slug: string;
        };
        tags: string[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        description: string;
        title: string;
        pricingType: import("@prisma/client").$Enums.PricingType;
        categoryId: string;
        location: Prisma.JsonValue;
        vendorId: string;
        reviewCount: number;
        isRentable: boolean;
        ratingAvg: Prisma.Decimal;
        basePrice: Prisma.Decimal | null;
        isFeatured: boolean;
        viewCount: number;
        perDayRate: Prisma.Decimal | null;
        depositAmount: Prisma.Decimal | null;
        media: {
            type: import("@prisma/client").$Enums.MediaType;
            url: string;
            publicId: string | null;
            id: string;
            sortOrder: number;
        }[];
    }>;
    remove(id: string, userId: string): Promise<{
        id: string;
        isActive: boolean;
    }>;
    addMedia(listingId: string, userId: string, mediaData: AddMediaData): Promise<{
        type: import("@prisma/client").$Enums.MediaType;
        url: string;
        publicId: string | null;
        id: string;
        createdAt: Date;
        sortOrder: number;
        listingId: string;
    }>;
    removeMedia(mediaId: string, userId: string): Promise<{
        publicId: string | null;
    }>;
    private syncListingToSearch;
    private assertOwnership;
    private buildListingSelect;
}
export {};
