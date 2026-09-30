import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { UserRole } from '@prisma/client';
import { SessionAuthGuard } from '../../common/guards/session-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { VendorsService } from '../vendors/vendors.service';
import { ReviewKycDto } from '../vendors/dto/review-kyc.dto';
import { AdminService } from './admin.service';
import { AuditService } from '../../common/audit/audit.service';
import { VendorQueryDto } from './dto/admin-query.dto';

@ApiTags('Admin – Vendors')
@ApiBearerAuth()
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/vendors')
export class AdminVendorsController {
  constructor(
    @Inject(VendorsService) private readonly vendorsService: VendorsService,
    @Inject(AdminService) private readonly admin: AdminService,
    @Inject(AuditService) private readonly audit: AuditService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List vendors (filter by KYC status / tier / search)' })
  list(@Query() query: VendorQueryDto) {
    return this.admin.listVendors(query);
  }

  @Get('kyc/pending')
  @ApiOperation({ summary: 'List vendors awaiting KYC review' })
  listPendingKyc() {
    return this.vendorsService.listPendingKyc();
  }

  @Patch(':id/kyc')
  @ApiOperation({ summary: 'Approve or reject a vendor KYC submission' })
  @ApiParam({ name: 'id', description: 'Vendor UUID' })
  async reviewKyc(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: ReviewKycDto,
  ) {
    const adminId = (req as any).user.id;
    const result = await this.vendorsService.reviewKyc(id, dto, adminId);
    this.audit.record({
      userId: adminId,
      action: `vendor.kyc.${dto.decision === 'APPROVE' ? 'approved' : 'rejected'}`,
      resourceType: 'vendor',
      resourceId: id,
      metadata: { decision: dto.decision, reason: dto.rejectionReason ?? null },
      ipAddress: req.ip,
    });
    return result;
  }
}
