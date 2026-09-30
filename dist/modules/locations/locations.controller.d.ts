import { LocationsService } from './locations.service';
export declare class LocationsController {
    private readonly locationsService;
    constructor(locationsService: LocationsService);
    findAllCountries(): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
        code: string;
        dialCode: string;
        flagEmoji: string | null;
    }[]>;
    findCitiesByCountry(countryId: string): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
        state: string | null;
        latitude: import("@prisma/client-runtime-utils").Decimal;
        longitude: import("@prisma/client-runtime-utils").Decimal;
    }[]>;
}
