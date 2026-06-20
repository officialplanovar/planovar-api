import { Controller, Get, Inject, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(@Inject(CategoriesService) private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List all active event categories' })
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single category with its subcategories' })
  @ApiParam({ name: 'id', description: 'Category UUID' })
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }
}
