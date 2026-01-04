import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { Request } from 'express';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpenseResponseDto } from './dto/expense-response.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReadOnlyGuard } from '../auth/guards/read-only.guard';
import {
  ApiStandardResponses,
  ApiPaginatedResponse,
  ApiStandardErrorResponses,
  ApiNotFoundResponse,
  ApiSuccessResponse,
} from '../common/decorators/api-responses.decorator';
import { MessageResponseDto } from '../common/dto/success-response.dto';

@ApiTags('Expenses')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, ReadOnlyGuard)
@Controller('expense')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new expense',
    description: 'Create a new expense record for the authenticated user',
  })
  @ApiBody({ type: CreateExpenseDto })
  @ApiStandardResponses(ExpenseResponseDto, 'Expense created successfully', true)
  create(@Body() dto: CreateExpenseDto, @Req() req: Request) {
    const user = req.user as { sub: string };
    return this.expenseService.create(user.sub, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all expenses',
    description: 'Retrieve paginated list of expenses for the authenticated user',
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
  @ApiPaginatedResponse(ExpenseResponseDto, 'Expenses retrieved successfully')
  @ApiStandardErrorResponses()
  findAll(
    @Req() req: Request,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
  ) {
    const user = req.user as { sub: string };
    return this.expenseService.findAll(user.sub, page, Math.min(limit, 100));
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get expense by ID',
    description: 'Retrieve a specific expense record by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Expense ID',
    example: 'clx1234567890abcdef',
    type: String,
  })
  @ApiSuccessResponse(ExpenseResponseDto, 'Expense retrieved successfully')
  @ApiNotFoundResponse('Expense not found')
  @ApiStandardErrorResponses()
  findOne(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as { sub: string };
    return this.expenseService.findOne(user.sub, id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update expense',
    description: 'Update an existing expense record',
  })
  @ApiParam({
    name: 'id',
    description: 'Expense ID',
    example: 'clx1234567890abcdef',
    type: String,
  })
  @ApiBody({ type: UpdateExpenseDto })
  @ApiSuccessResponse(ExpenseResponseDto, 'Expense updated successfully')
  @ApiNotFoundResponse('Expense not found')
  @ApiStandardErrorResponses()
  update(
    @Param('id') id: string,
    @Body() dto: UpdateExpenseDto,
    @Req() req: Request,
  ) {
    const user = req.user as { sub: string };
    return this.expenseService.update(user.sub, id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete expense',
    description: 'Delete an expense record',
  })
  @ApiParam({
    name: 'id',
    description: 'Expense ID',
    example: 'clx1234567890abcdef',
    type: String,
  })
  @ApiSuccessResponse(MessageResponseDto, 'Expense deleted successfully')
  @ApiNotFoundResponse('Expense not found')
  @ApiStandardErrorResponses()
  remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as { sub: string };
    return this.expenseService.remove(user.sub, id);
  }
}
