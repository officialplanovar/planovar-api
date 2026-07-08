import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { SessionAuthGuard } from '../../common/guards/session-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SetPreferencesDto } from './dto/set-preferences.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(SessionAuthGuard)
@Controller('users')
export class UsersController {
  constructor(@Inject(UsersService) private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get the current user profile with location and preferences' })
  getMe(@Req() req: Request) {
    return this.usersService.getMe((req as any).user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update name, phone, or preferred location' })
  updateMe(@Req() req: Request, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateMe((req as any).user.id, dto);
  }

  @Post('me/preferences')
  @ApiOperation({
    summary: 'Set event category preferences (replaces all existing preferences)',
  })
  setPreferences(@Req() req: Request, @Body() dto: SetPreferencesDto) {
    return this.usersService.setPreferences((req as any).user.id, dto);
  }

  // ─── Device tokens ────────────────────────────────────────────────────────

  @Post('me/device-token')
  @ApiOperation({ summary: 'Register a device push token (FCM or APNs)' })
  registerDeviceToken(
    @Req() req: Request,
    @Body() body: { token: string; platform: string },
  ) {
    return this.usersService.registerDeviceToken(
      (req as any).user.id,
      body.token,
      body.platform,
    );
  }

  @Delete('me/device-token/:token')
  @ApiOperation({ summary: 'Deregister a device push token' })
  removeDeviceToken(@Req() req: Request, @Param('token') token: string) {
    return this.usersService.removeDeviceToken((req as any).user.id, token);
  }

  // ─── Favourites ───────────────────────────────────────────────────────────

  @Get('me/favourites')
  @ApiOperation({ summary: 'List all favourited listings' })
  listFavourites(@Req() req: Request) {
    return this.usersService.listFavourites((req as any).user.id);
  }

  // Vendor favourites — declared before the :listingId routes so the static
  // 'vendors' segment isn't captured as a listing id.
  @Get('me/favourites/vendors')
  @ApiOperation({ summary: 'List all favourited vendors' })
  listVendorFavourites(@Req() req: Request) {
    return this.usersService.listVendorFavourites((req as any).user.id);
  }

  @Post('me/favourites/vendors/:vendorId')
  @ApiOperation({ summary: 'Add a vendor to favourites' })
  addVendorFavourite(@Req() req: Request, @Param('vendorId') vendorId: string) {
    return this.usersService.addVendorFavourite((req as any).user.id, vendorId);
  }

  @Delete('me/favourites/vendors/:vendorId')
  @ApiOperation({ summary: 'Remove a vendor from favourites' })
  removeVendorFavourite(
    @Req() req: Request,
    @Param('vendorId') vendorId: string,
  ) {
    return this.usersService.removeVendorFavourite(
      (req as any).user.id,
      vendorId,
    );
  }

  @Post('me/favourites/:listingId')
  @ApiOperation({ summary: 'Add a listing to favourites' })
  addFavourite(@Req() req: Request, @Param('listingId') listingId: string) {
    return this.usersService.addFavourite((req as any).user.id, listingId);
  }

  @Delete('me/favourites/:listingId')
  @ApiOperation({ summary: 'Remove a listing from favourites' })
  removeFavourite(@Req() req: Request, @Param('listingId') listingId: string) {
    return this.usersService.removeFavourite((req as any).user.id, listingId);
  }
}
