import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { UserRole } from '@prisma/client';
import { SessionAuthGuard } from '../../common/guards/session-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CategoriesService } from '../categories/categories.service';
import { CreateCategoryDto } from '../categories/dto/create-category.dto';
import { UpdateCategoryDto } from '../categories/dto/update-category.dto';
import { AuditService } from '../../common/audit/audit.service';

@ApiTags('Admin – Categories')
@ApiBearerAuth()
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/categories')
export class AdminCategoriesController {
  constructor(
    @Inject(CategoriesService) private readonly categoriesService: CategoriesService,
    @Inject(AuditService) private readonly audit: AuditService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all categories (including inactive) with metrics' })
  findAll() {
    // Admin sees every category — active or not — plus listing/children counts.
    return this.categoriesService.findAllAdmin();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new event category' })
  async create(@Req() req: Request, @Body() dto: CreateCategoryDto) {
    const category = await this.categoriesService.create(dto);
    this.audit.record({
      userId: (req as any).user.id,
      action: 'category.created',
      resourceType: 'category',
      resourceId: category.id,
      metadata: { name: category.name, slug: category.slug },
      ipAddress: req.ip,
    });
    return category;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a category (presentation, taxonomy, sort, active state)' })
  @ApiParam({ name: 'id', description: 'Category UUID' })
  async update(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    const category = await this.categoriesService.update(id, dto);
    this.audit.record({
      userId: (req as any).user.id,
      action: 'category.updated',
      resourceType: 'category',
      resourceId: id,
      metadata: { fields: Object.keys(dto) },
      ipAddress: req.ip,
    });
    return category;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a category (sets isActive = false)' })
  @ApiParam({ name: 'id', description: 'Category UUID' })
  async remove(@Req() req: Request, @Param('id') id: string) {
    const category = await this.categoriesService.remove(id);
    this.audit.record({
      userId: (req as any).user.id,
      action: 'category.deactivated',
      resourceType: 'category',
      resourceId: id,
      ipAddress: req.ip,
    });
    return category;
  }
}
