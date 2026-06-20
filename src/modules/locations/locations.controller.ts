import { Controller, Get, Inject, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { LocationsService } from './locations.service';

@ApiTags('Locations')
@Controller('locations')
export class LocationsController {
  constructor(@Inject(LocationsService) private readonly locationsService: LocationsService) {}

  @Get('countries')
  @ApiOperation({ summary: 'List all active countries' })
  findAllCountries() {
    return this.locationsService.findAllCountries();
  }

  @Get('countries/:countryId/cities')
  @ApiOperation({ summary: 'List cities for a given country' })
  @ApiParam({ name: 'countryId', description: 'Country UUID' })
  findCitiesByCountry(@Param('countryId') countryId: string) {
    return this.locationsService.findCitiesByCountry(countryId);
  }
}
