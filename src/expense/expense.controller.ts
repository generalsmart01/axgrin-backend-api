// src/expense/expense.controller.ts
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
} from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReadOnlyGuard } from '../auth/guards/read-only.guard';
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import {
  ErrorResponseDto,
  ValidationErrorResponseDto,
} from '../common/dto/error-response.dto';
import { ExpenseResponseDto } from './dto/expense-response.dto';
import { MessageResponseDto } from '../common/dto/success-response.dto';

@ApiTags('Expense')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ReadOnlyGuard)
@Controller('expense')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new expense record' })
  @ApiBody({ type: CreateExpenseDto })
  @ApiCreatedResponse({
    description: 'Expense created successfully',
    type: ExpenseResponseDto,
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
  create(@Body() dto: CreateExpenseDto, @Req() req: Request) {
    const user = req.user as { sub: string };
    return this.expenseService.create(user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all expense records for current user' })
  @ApiOkResponse({
    description: 'Expense records retrieved successfully',
    type: [ExpenseResponseDto],
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
    return this.expenseService.findAll(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get expense record by ID' })
  @ApiOkResponse({
    description: 'Expense record retrieved successfully',
    type: ExpenseResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Expense record not found',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  findOne(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as { sub: string };
    return this.expenseService.findOne(user.sub, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update expense record by ID' })
  @ApiBody({ type: UpdateExpenseDto })
  @ApiOkResponse({
    description: 'Expense record updated successfully',
    type: ExpenseResponseDto,
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
    description: 'Expense record not found',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateExpenseDto,
    @Req() req: Request,
  ) {
    const user = req.user as { sub: string };
    return this.expenseService.update(user.sub, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete expense record by ID' })
  @ApiOkResponse({
    description: 'Expense record deleted successfully',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Expense record not found',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as { sub: string };
    return this.expenseService.remove(user.sub, id);
  }
}
