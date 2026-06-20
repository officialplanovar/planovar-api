import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SetPreferencesDto } from './dto/set-preferences.dto';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getMe(userId: string): Promise<{
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
    updateMe(userId: string, dto: UpdateProfileDto): Promise<{
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
    setPreferences(userId: string, dto: SetPreferencesDto): Promise<{
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
    completeOnboarding(userId: string): Promise<{
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
    listFavourites(userId: string): Promise<{
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
}
