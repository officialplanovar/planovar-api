import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SetPreferencesDto } from './dto/set-preferences.dto';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getMe(userId: string): Promise<{
        id: string;
        image: string | null;
        isActive: boolean;
        createdAt: Date;
        name: string;
        vendorProfile: {
            id: string;
            subscriptionTier: import("@prisma/client").$Enums.SubscriptionTier;
            kycStatus: import("@prisma/client").$Enums.KycStatus;
        } | null;
        phone: string | null;
        email: string;
        emailVerified: boolean;
        role: import("@prisma/client").$Enums.UserRole;
        firstName: string | null;
        lastName: string | null;
        notificationPrefs: Prisma.JsonValue;
        deletedAt: Date | null;
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
                latitude: Prisma.Decimal;
                longitude: Prisma.Decimal;
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
    }>;
    updateNotificationPrefs(userId: string, prefs: Record<string, unknown>): Promise<string | number | boolean | Prisma.JsonObject | Prisma.JsonArray>;
    deactivateMe(userId: string): Promise<{
        deactivated: boolean;
    }>;
    updateMe(userId: string, dto: UpdateProfileDto): Promise<{
        id: string;
        image: string | null;
        isActive: boolean;
        createdAt: Date;
        name: string;
        vendorProfile: {
            id: string;
            subscriptionTier: import("@prisma/client").$Enums.SubscriptionTier;
            kycStatus: import("@prisma/client").$Enums.KycStatus;
        } | null;
        phone: string | null;
        email: string;
        emailVerified: boolean;
        role: import("@prisma/client").$Enums.UserRole;
        firstName: string | null;
        lastName: string | null;
        notificationPrefs: Prisma.JsonValue;
        deletedAt: Date | null;
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
                latitude: Prisma.Decimal;
                longitude: Prisma.Decimal;
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
    }>;
    deleteMe(userId: string): Promise<{
        deleted: boolean;
    }>;
    setPreferences(userId: string, dto: SetPreferencesDto): Promise<{
        id: string;
        image: string | null;
        isActive: boolean;
        createdAt: Date;
        name: string;
        vendorProfile: {
            id: string;
            subscriptionTier: import("@prisma/client").$Enums.SubscriptionTier;
            kycStatus: import("@prisma/client").$Enums.KycStatus;
        } | null;
        phone: string | null;
        email: string;
        emailVerified: boolean;
        role: import("@prisma/client").$Enums.UserRole;
        firstName: string | null;
        lastName: string | null;
        notificationPrefs: Prisma.JsonValue;
        deletedAt: Date | null;
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
                latitude: Prisma.Decimal;
                longitude: Prisma.Decimal;
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
    }>;
    completeOnboarding(userId: string): Promise<{
        id: string;
        image: string | null;
        isActive: boolean;
        createdAt: Date;
        name: string;
        vendorProfile: {
            id: string;
            subscriptionTier: import("@prisma/client").$Enums.SubscriptionTier;
            kycStatus: import("@prisma/client").$Enums.KycStatus;
        } | null;
        phone: string | null;
        email: string;
        emailVerified: boolean;
        role: import("@prisma/client").$Enums.UserRole;
        firstName: string | null;
        lastName: string | null;
        notificationPrefs: Prisma.JsonValue;
        deletedAt: Date | null;
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
                latitude: Prisma.Decimal;
                longitude: Prisma.Decimal;
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
    }>;
    registerDeviceToken(userId: string, token: string, platform: string): Promise<{
        registered: boolean;
    }>;
    removeDeviceToken(userId: string, token: string): Promise<{
        removed: boolean;
    }>;
    addFavourite(userId: string, listingId: string): Promise<{
        favourited: boolean;
    }>;
    removeFavourite(userId: string, listingId: string): Promise<{
        favourited: boolean;
    }>;
    addVendorFavourite(userId: string, vendorId: string): Promise<{
        favourited: boolean;
    }>;
    removeVendorFavourite(userId: string, vendorId: string): Promise<{
        favourited: boolean;
    }>;
    listVendorFavourites(userId: string): Promise<({
        id: string;
        description: string | null;
        tags: string[];
        location: Prisma.JsonValue;
        reviewCount: number;
        ratingAvg: Prisma.Decimal;
        slug: string;
        subscriptionTier: import("@prisma/client").$Enums.SubscriptionTier;
        isVerified: boolean;
        coverUrl: string | null;
        businessName: string;
        logoUrl: string | null;
    } | undefined)[]>;
    listFavourites(userId: string): Promise<{
        listing: {
            vendor: {
                id: string;
                slug: string;
                subscriptionTier: import("@prisma/client").$Enums.SubscriptionTier;
                isVerified: boolean;
                businessName: string;
            };
            id: string;
            title: string;
            pricingType: import("@prisma/client").$Enums.PricingType;
            tags: string[];
            reviewCount: number;
            isActive: boolean;
            ratingAvg: Prisma.Decimal;
            basePrice: Prisma.Decimal | null;
            category: {
                id: string;
                name: string;
                slug: string;
            };
            media: {
                id: string;
                type: import("@prisma/client").$Enums.MediaType;
                url: string;
            }[];
        };
    }[]>;
}
