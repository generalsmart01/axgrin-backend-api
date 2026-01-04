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
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { IncomeService } from './income.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { IncomeResponseDto } from './dto/income-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReadOnlyGuard } from '../auth/guards/read-only.guard';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { Request } from 'express';
import {
  ApiStandardResponses,
  ApiPaginatedResponse,
  ApiStandardErrorResponses,
  ApiNotFoundResponse,
  ApiSuccessResponse,
} from '../common/decorators/api-responses.decorator';
import { MessageResponseDto } from '../common/dto/success-response.dto';

@ApiTags('Income')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, ReadOnlyGuard)
@Controller('income')
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}

  @Post()
  @ApiOperation({
    summary: 'Create income record',
    description: 'Create a new income record for the authenticated user',
  })
  @ApiBody({ type: CreateIncomeDto })
  @ApiStandardResponses(IncomeResponseDto, 'Income created successfully', true)
  create(@Body() dto: CreateIncomeDto, @Req() req: Request) {
    const user = req.user as any;
    return this.incomeService.create(user.sub, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all income records',
    description: 'Retrieve paginated list of income records for the authenticated user',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (1-based)',
    example: 1,
    minimum: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
    example: 20,
    minimum: 1,
    maximum: 100,
  })
  @ApiPaginatedResponse(IncomeResponseDto, 'Income records retrieved successfully')
  @ApiStandardErrorResponses()
  findAll(
    @Req() req: Request,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
  ) {
    const user = req.user as any;
    return this.incomeService.findAll(user.sub, page, Math.min(limit, 100));
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get income by ID',
    description: 'Retrieve a specific income record by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Income ID',
    example: 'clx1234567890abcdef',
    type: String,
  })
  @ApiSuccessResponse(IncomeResponseDto, 'Income retrieved successfully')
  @ApiNotFoundResponse('Income not found')
  @ApiStandardErrorResponses()
  findOne(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as any;
    return this.incomeService.findOne(user.sub, id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update income',
    description: 'Update an existing income record',
  })
  @ApiParam({
    name: 'id',
    description: 'Income ID',
    example: 'clx1234567890abcdef',
    type: String,
  })
  @ApiBody({ type: UpdateIncomeDto })
  @ApiSuccessResponse(IncomeResponseDto, 'Income updated successfully')
  @ApiNotFoundResponse('Income not found')
  @ApiStandardErrorResponses()
  update(@Param('id') id: string, @Body() dto: UpdateIncomeDto, @Req() req: Request) {
    const user = req.user as any;
    return this.incomeService.update(user.sub, id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete income',
    description: 'Delete an income record',
  })
  @ApiParam({
    name: 'id',
    description: 'Income ID',
    example: 'clx1234567890abcdef',
    type: String,
  })
  @ApiSuccessResponse(MessageResponseDto, 'Income deleted successfully')
  @ApiNotFoundResponse('Income not found')
  @ApiStandardErrorResponses()
  remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as any;
    return this.incomeService.remove(user.sub, id);
  }
}
