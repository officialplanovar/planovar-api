import type { Request } from 'express';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SetPreferencesDto } from './dto/set-preferences.dto';
import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getMe(req: Request): Promise<{
        clientProfile: {
            id: string;
            onboardingComplete: boolean;
            preferredCountry: {
                id: string;
                name: string;
                code: string;
                dialCode: string;
                flagEmoji: string | null;
            } | null;
            preferredCity: {
                id: string;
                name: string;
                state: string | null;
                latitude: import("@prisma/client-runtime-utils").Decimal;
                longitude: import("@prisma/client-runtime-utils").Decimal;
            } | null;
            categoryPrefs: {
                category: {
                    id: string;
                    name: string;
                    slug: string;
                    iconUrl: string | null;
                    imageUrl: string | null;
                };
            }[];
        } | null;
        image: string | null;
        email: string;
        id: string;
        createdAt: Date;
        emailVerified: boolean;
        name: string;
        role: import("@prisma/client").$Enums.UserRole;
        phone: string | null;
        firstName: string | null;
        lastName: string | null;
    }>;
    updateMe(req: Request, dto: UpdateProfileDto): Promise<{
        clientProfile: {
            id: string;
            onboardingComplete: boolean;
            preferredCountry: {
                id: string;
                name: string;
                code: string;
                dialCode: string;
                flagEmoji: string | null;
            } | null;
            preferredCity: {
                id: string;
                name: string;
                state: string | null;
                latitude: import("@prisma/client-runtime-utils").Decimal;
                longitude: import("@prisma/client-runtime-utils").Decimal;
            } | null;
            categoryPrefs: {
                category: {
                    id: string;
                    name: string;
                    slug: string;
                    iconUrl: string | null;
                    imageUrl: string | null;
                };
            }[];
        } | null;
        image: string | null;
        email: string;
        id: string;
        createdAt: Date;
        emailVerified: boolean;
        name: string;
        role: import("@prisma/client").$Enums.UserRole;
        phone: string | null;
        firstName: string | null;
        lastName: string | null;
    }>;
    setPreferences(req: Request, dto: SetPreferencesDto): Promise<{
        clientProfile: {
            id: string;
            onboardingComplete: boolean;
            preferredCountry: {
                id: string;
                name: string;
                code: string;
                dialCode: string;
                flagEmoji: string | null;
            } | null;
            preferredCity: {
                id: string;
                name: string;
                state: string | null;
                latitude: import("@prisma/client-runtime-utils").Decimal;
                longitude: import("@prisma/client-runtime-utils").Decimal;
            } | null;
            categoryPrefs: {
                category: {
                    id: string;
                    name: string;
                    slug: string;
                    iconUrl: string | null;
                    imageUrl: string | null;
                };
            }[];
        } | null;
        image: string | null;
        email: string;
        id: string;
        createdAt: Date;
        emailVerified: boolean;
        name: string;
        role: import("@prisma/client").$Enums.UserRole;
        phone: string | null;
        firstName: string | null;
        lastName: string | null;
    }>;
    registerDeviceToken(req: Request, body: {
        token: string;
        platform: string;
    }): Promise<{
        registered: boolean;
    }>;
    removeDeviceToken(req: Request, token: string): Promise<{
        removed: boolean;
    }>;
    listFavourites(req: Request): Promise<{
        listing: {
            category: {
                id: string;
                name: string;
                slug: string;
            };
            tags: string[];
            vendor: {
                id: string;
                slug: string;
                subscriptionTier: import("@prisma/client").$Enums.SubscriptionTier;
                isVerified: boolean;
                businessName: string;
            };
            id: string;
            isActive: boolean;
            title: string;
            pricingType: import("@prisma/client").$Enums.PricingType;
            reviewCount: number;
            ratingAvg: import("@prisma/client-runtime-utils").Decimal;
            basePrice: import("@prisma/client-runtime-utils").Decimal | null;
            media: {
                type: import("@prisma/client").$Enums.MediaType;
                url: string;
                id: string;
            }[];
        } | null;
    }[]>;
    addFavourite(req: Request, listingId: string): Promise<{
        favourited: boolean;
    }>;
    removeFavourite(req: Request, listingId: string): Promise<{
        favourited: boolean;
    }>;
}
