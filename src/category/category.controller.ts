import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReadOnlyGuard } from '../auth/guards/read-only.guard';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { Request } from 'express';
import {
  ApiStandardResponses,
  ApiStandardErrorResponses,
  ApiNotFoundResponse,
  ApiSuccessResponse,
} from '../common/decorators/api-responses.decorator';
import { MessageResponseDto } from '../common/dto/success-response.dto';

@ApiTags('Categories')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, ReadOnlyGuard)
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiOperation({
    summary: 'Create category',
    description: 'Create a new expense category for the authenticated user',
  })
  @ApiBody({ type: CreateCategoryDto })
  @ApiStandardResponses(CategoryResponseDto, 'Category created successfully', true)
  create(@Body() dto: CreateCategoryDto, @Req() req: Request) {
    const user = req.user as { sub: string };
    return this.categoryService.create(user.sub, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all categories',
    description: 'Retrieve all expense categories for the authenticated user',
  })
  @ApiSuccessResponse(Array<CategoryResponseDto>, 'Categories retrieved successfully')
  @ApiStandardErrorResponses()
  findAll(@Req() req: Request) {
    const user = req.user as { sub: string };
    return this.categoryService.findAll(user.sub);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get category by ID',
    description: 'Retrieve a specific category by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Category ID',
    example: 'clx1234567890abcdef',
    type: String,
  })
  @ApiSuccessResponse(CategoryResponseDto, 'Category retrieved successfully')
  @ApiNotFoundResponse('Category not found')
  @ApiStandardErrorResponses()
  findOne(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as { sub: string };
    return this.categoryService.findOne(user.sub, id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update category',
    description: 'Update an existing category',
  })
  @ApiParam({
    name: 'id',
    description: 'Category ID',
    example: 'clx1234567890abcdef',
    type: String,
  })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiSuccessResponse(CategoryResponseDto, 'Category updated successfully')
  @ApiNotFoundResponse('Category not found')
  @ApiStandardErrorResponses()
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto, @Req() req: Request) {
    const user = req.user as { sub: string };
    return this.categoryService.update(user.sub, id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete category',
    description: 'Delete a category. Note: Categories with associated expenses cannot be deleted.',
  })
  @ApiParam({
    name: 'id',
    description: 'Category ID',
    example: 'clx1234567890abcdef',
    type: String,
  })
  @ApiSuccessResponse(MessageResponseDto, 'Category deleted successfully')
  @ApiNotFoundResponse('Category not found')
  @ApiStandardErrorResponses()
  remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as { sub: string };
    return this.categoryService.remove(user.sub, id);
  }
}
