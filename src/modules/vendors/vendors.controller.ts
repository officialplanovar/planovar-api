import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { SessionAuthGuard } from '../../common/guards/session-auth.guard';
import { OnboardVendorDto } from './dto/onboard-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { SubmitKycDto } from './dto/submit-kyc.dto';
import { VendorsService } from './vendors.service';

@ApiTags('Vendors')
@Controller('vendors')
export class VendorsController {
  constructor(@Inject(VendorsService) private readonly vendorsService: VendorsService) {}

  @Post('onboard')
  @UseGuards(SessionAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Onboard current user as a vendor' })
  onboard(@Req() req: Request, @Body() dto: OnboardVendorDto) {
    return this.vendorsService.onboard((req as any).user.id, dto);
  }

  @Get('me')
  @UseGuards(SessionAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the current vendor profile' })
  getMyProfile(@Req() req: Request) {
    return this.vendorsService.getMyProfile((req as any).user.id);
  }

  @Patch('me')
  @UseGuards(SessionAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update the current vendor profile' })
  updateMyProfile(@Req() req: Request, @Body() dto: UpdateVendorDto) {
    return this.vendorsService.updateMyProfile((req as any).user.id, dto);
  }

  @Post('me/kyc')
  @UseGuards(SessionAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Submit KYC documents (NIN, + CAC for licensed businesses) for verification',
  })
  submitKyc(@Req() req: Request, @Body() dto: SubmitKycDto) {
    return this.vendorsService.submitKyc((req as any).user.id, dto);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get a public vendor profile by slug' })
  @ApiParam({ name: 'slug', description: 'Vendor slug' })
  getBySlug(@Param('slug') slug: string) {
    return this.vendorsService.getBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a public vendor profile by ID' })
  @ApiParam({ name: 'id', description: 'Vendor UUID' })
  getPublicProfile(@Param('id') id: string) {
    return this.vendorsService.getPublicProfile(id);
  }
}
