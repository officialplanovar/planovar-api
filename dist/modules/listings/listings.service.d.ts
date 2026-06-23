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
        id: string;
        createdAt: Date;
        vendorId: string;
        updatedAt: Date;
        description: string;
        location: Prisma.JsonValue;
        tags: string[];
        ratingAvg: Prisma.Decimal;
        reviewCount: number;
        isActive: boolean;
        categoryId: string;
        title: string;
        pricingType: import("@prisma/client").$Enums.PricingType;
        basePrice: Prisma.Decimal | null;
        isFeatured: boolean;
        viewCount: number;
        isRentable: boolean;
        perDayRate: Prisma.Decimal | null;
        depositAmount: Prisma.Decimal | null;
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
    private assertWithinListingLimit;
    findAllForUser(userId: string): Promise<{
        id: string;
        createdAt: Date;
        vendorId: string;
        updatedAt: Date;
        description: string;
        location: Prisma.JsonValue;
        tags: string[];
        ratingAvg: Prisma.Decimal;
        reviewCount: number;
        isActive: boolean;
        categoryId: string;
        title: string;
        pricingType: import("@prisma/client").$Enums.PricingType;
        basePrice: Prisma.Decimal | null;
        isFeatured: boolean;
        viewCount: number;
        isRentable: boolean;
        perDayRate: Prisma.Decimal | null;
        depositAmount: Prisma.Decimal | null;
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
    findAll(vendorId: string): Promise<{
        id: string;
        createdAt: Date;
        vendorId: string;
        updatedAt: Date;
        description: string;
        location: Prisma.JsonValue;
        tags: string[];
        ratingAvg: Prisma.Decimal;
        reviewCount: number;
        isActive: boolean;
        categoryId: string;
        title: string;
        pricingType: import("@prisma/client").$Enums.PricingType;
        basePrice: Prisma.Decimal | null;
        isFeatured: boolean;
        viewCount: number;
        isRentable: boolean;
        perDayRate: Prisma.Decimal | null;
        depositAmount: Prisma.Decimal | null;
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
    update(id: string, userId: string, dto: UpdateListingDto): Promise<{
        id: string;
        createdAt: Date;
        vendorId: string;
        updatedAt: Date;
        description: string;
        location: Prisma.JsonValue;
        tags: string[];
        ratingAvg: Prisma.Decimal;
        reviewCount: number;
        isActive: boolean;
        categoryId: string;
        title: string;
        pricingType: import("@prisma/client").$Enums.PricingType;
        basePrice: Prisma.Decimal | null;
        isFeatured: boolean;
        viewCount: number;
        isRentable: boolean;
        perDayRate: Prisma.Decimal | null;
        depositAmount: Prisma.Decimal | null;
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
    remove(id: string, userId: string): Promise<{
        id: string;
        isActive: boolean;
    }>;
    addMedia(listingId: string, userId: string, mediaData: AddMediaData): Promise<{
        type: import("@prisma/client").$Enums.MediaType;
        id: string;
        createdAt: Date;
        sortOrder: number;
        listingId: string;
        url: string;
        publicId: string | null;
    }>;
    removeMedia(mediaId: string, userId: string): Promise<{
        publicId: string | null;
    }>;
    private syncListingToSearch;
    private assertOwnership;
    private buildListingSelect;
}
export {};
