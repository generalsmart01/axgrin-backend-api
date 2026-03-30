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
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReadOnlyGuard } from '../auth/guards/read-only.guard';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { Request } from 'express';
import { BudgetService } from './budget.service';
import {
  BudgetResponseDto,
  RemainingBudgetResponseDto,
  BudgetSummaryResponseDto,
} from './dto/budget-response.dto';
import {
  ApiStandardResponses,
  ApiStandardErrorResponses,
  ApiNotFoundResponse,
  ApiSuccessResponse,
} from '../common/decorators/api-responses.decorator';
import { MessageResponseDto } from '../common/dto/success-response.dto';

@ApiTags('Budgets')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, ReadOnlyGuard)
@Controller('budget')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) { }

  @Post()
  @ApiOperation({
    summary: 'Create budget goal',
    description: 'Create a new budget goal for a specific category and time period',
  })
  @ApiBody({ type: CreateBudgetDto })
  @ApiStandardResponses(BudgetResponseDto, 'Budget goal created successfully', true)
  create(@Body() dto: CreateBudgetDto, @Req() req: Request) {
    const user = req.user as { sub: string };
    return this.budgetService.create(user.sub, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all budget goals',
    description: 'Retrieve all budget goals for the authenticated user',
  })
  @ApiSuccessResponse(Array<BudgetResponseDto>, 'Budget goals retrieved successfully')
  @ApiStandardErrorResponses()
  findAll(@Req() req: Request) {
    const user = req.user as { sub: string };
    return this.budgetService.findAll(user.sub);
  }

  @Get('summary')
  @ApiOperation({
    summary: 'Get budget summary',
    description: 'Get comprehensive budget summary with spending analysis for all active budget goals',
  })
  @ApiSuccessResponse(BudgetSummaryResponseDto, 'Budget summary retrieved successfully')
  @ApiStandardErrorResponses()
  getSummary(@Req() req: Request) {
    const user = req.user as { sub: string };
    return this.budgetService.getBudgetSummary(user.sub);
  }

  @Get('remaining/:categoryId')
  @ApiOperation({
    summary: 'Get remaining budget',
    description: 'Get remaining budget for a specific category\'s active budget goal',
  })
  @ApiParam({
    name: 'categoryId',
    description: 'Category ID',
    example: 'clx1234567890abcdef',
    type: String,
  })
  @ApiSuccessResponse(RemainingBudgetResponseDto, 'Remaining budget retrieved successfully')
  @ApiStandardErrorResponses()
  getRemainingBudget(@Param('categoryId') categoryId: string, @Req() req: Request) {
    const user = req.user as { sub: string };
    return this.budgetService.getRemainingBudget(user.sub, categoryId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get budget goal by ID',
    description: 'Retrieve a specific budget goal by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Budget goal ID',
    example: 'clx1234567890abcdef',
    type: String,
  })
  @ApiSuccessResponse(BudgetResponseDto, 'Budget goal retrieved successfully')
  @ApiNotFoundResponse('Budget goal not found')
  @ApiStandardErrorResponses()
  findOne(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as { sub: string };
    return this.budgetService.findOne(user.sub, id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update budget goal',
    description: 'Update an existing budget goal',
  })
  @ApiParam({
    name: 'id',
    description: 'Budget goal ID',
    example: 'clx1234567890abcdef',
    type: String,
  })
  @ApiBody({ type: UpdateBudgetDto })
  @ApiSuccessResponse(BudgetResponseDto, 'Budget goal updated successfully')
  @ApiNotFoundResponse('Budget goal not found')
  @ApiStandardErrorResponses()
  update(@Param('id') id: string, @Body() dto: UpdateBudgetDto, @Req() req: Request) {
    const user = req.user as { sub: string };
    return this.budgetService.update(user.sub, id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete budget goal',
    description: 'Delete a budget goal',
  })
  @ApiParam({
    name: 'id',
    description: 'Budget goal ID',
    example: 'clx1234567890abcdef',
    type: String,
  })
  @ApiSuccessResponse(MessageResponseDto, 'Budget goal deleted successfully')
  @ApiNotFoundResponse('Budget goal not found')
  @ApiStandardErrorResponses()
  remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as { sub: string };
    return this.budgetService.remove(user.sub, id);
  }
}
