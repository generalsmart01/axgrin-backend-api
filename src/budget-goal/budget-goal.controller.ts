// src/budget/budget.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CreateBudgetGoalDto } from './dto/create-budget-goal.dto';
import { UpdateBudgetGoalDto } from './dto/update-budget-goal.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReadOnlyGuard } from '../auth/guards/read-only.guard';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { BudgetService } from './budget-goal.service';
import {
  ErrorResponseDto,
  ValidationErrorResponseDto,
} from '../common/dto/error-response.dto';
import {
  BudgetGoalResponseDto,
  RemainingBudgetResponseDto,
  BudgetSummaryResponseDto,
} from './dto/budget-goal-response.dto';
import { MessageResponseDto } from '../common/dto/success-response.dto';

@ApiTags('Budget Goals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ReadOnlyGuard)
@Controller('budget-goal')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new budget goal' })
  @ApiBody({ type: CreateBudgetGoalDto })
  @ApiCreatedResponse({
    description: 'Budget goal created successfully',
    type: BudgetGoalResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validation failed',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  create(@Body() dto: CreateBudgetGoalDto, @Req() req: Request) {
    const user = req.user as { sub: string };
    return this.budgetService.create(user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all budget goals for current user' })
  @ApiOkResponse({
    description: 'Budget goals retrieved successfully',
    type: [BudgetGoalResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  findAll(@Req() req: Request) {
    const user = req.user as { sub: string };
    return this.budgetService.findAll(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get budget goal by ID' })
  @ApiParam({
    name: 'id',
    description: 'Budget goal ID',
    type: 'string',
    example: 'clx1234567890abcdef',
  })
  @ApiOkResponse({
    description: 'Budget goal retrieved successfully',
    type: BudgetGoalResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Budget goal not found',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  findOne(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as { sub: string };
    return this.budgetService.findOne(user.sub, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update budget goal by ID' })
  @ApiParam({
    name: 'id',
    description: 'Budget goal ID',
    type: 'string',
    example: 'clx1234567890abcdef',
  })
  @ApiBody({ type: UpdateBudgetGoalDto })
  @ApiOkResponse({
    description: 'Budget goal updated successfully',
    type: BudgetGoalResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validation failed',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Budget goal not found',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBudgetGoalDto,
    @Req() req: Request,
  ) {
    const user = req.user as { sub: string };
    return this.budgetService.update(user.sub, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete budget goal by ID' })
  @ApiParam({
    name: 'id',
    description: 'Budget goal ID',
    type: 'string',
    example: 'clx1234567890abcdef',
  })
  @ApiOkResponse({
    description: 'Budget goal deleted successfully',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Budget goal not found',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as { sub: string };
    return this.budgetService.remove(user.sub, id);
  }

  @Get('remaining')
  @ApiOperation({
    summary: 'Get remaining budget for a category',
    description: 'Calculate remaining budget for a specific category within active budget goals',
  })
  @ApiQuery({
    name: 'categoryId',
    description: 'Category ID to check remaining budget for',
    type: 'string',
    required: true,
    example: 'clx1234567890abcdef',
  })
  @ApiOkResponse({
    description: 'Remaining budget calculated successfully',
    type: RemainingBudgetResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  getRemainingBudget(
    @Req() req: Request,
    @Query('categoryId') categoryId: string,
  ) {
    const user = req.user as { sub: string };
    return this.budgetService.getRemainingBudget(user.sub, categoryId);
  }

  @Get('summary')
  @ApiOperation({
    summary: 'Get budget summary',
    description: 'Get a summary of all budget goals with their progress',
  })
  @ApiOkResponse({
    description: 'Budget summary retrieved successfully',
    type: BudgetSummaryResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  getBudgetSummary(@Req() req: Request) {
    const user = req.user as { sub: string };
    return this.budgetService.getBudgetSummary(user.sub);
  }
}
