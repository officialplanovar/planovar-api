import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LocationsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  findAllCountries() {
    return this.prisma.country.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        code: true,
        dialCode: true,
        flagEmoji: true,
      },
    });
  }

  findCitiesByCountry(countryId: string) {
    return this.prisma.city.findMany({
      where: { countryId, isActive: true },
      orderBy: [{ state: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        state: true,
        latitude: true,
        longitude: true,
      },
    });
  }
}
