// src/budget-goal/dto/budget-goal-response.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BudgetResponseDto {
  @ApiProperty({
    description: 'Budget unique identifier',
    example: 'clx1234567890abcdef',
    type: 'string',
  })
  id: string;

  @ApiProperty({
    description: 'User ID who owns this budget',
    example: 'clx0987654321fedcba',
    type: 'string',
  })
  userId: string;

  @ApiProperty({
    description: 'Category ID this budget belongs to',
    example: 'clx1234567890abcdef',
    type: 'string',
  })
  categoryId: string;

  @ApiProperty({
    description: 'Amount set for the budget',
    example: 2000.0,
    type: 'number',
  })
  amount: number;

  @ApiProperty({
    description: 'Month of the budget (1-12)',
    example: 1,
    type: 'number',
  })
  month: number;

  @ApiProperty({
    description: 'Year of the budget',
    example: 2024,
    type: 'number',
  })
  year: number;
}

export class RemainingBudgetResponseDto {
  @ApiProperty({
    description: 'Category ID',
    example: 'clx1234567890abcdef',
    type: 'string',
  })
  categoryId: string;

  @ApiProperty({
    description: 'Remaining budget amount',
    example: 500.0,
    type: 'number',
  })
  remaining: number;

  @ApiProperty({
    description: 'Amount already spent',
    example: 1500.0,
    type: 'number',
  })
  spent: number;

  @ApiProperty({
    description: 'Total budget amount',
    example: 2000.0,
    type: 'number',
  })
  budget: number;
}

export class BudgetSummaryItemDto {
  @ApiProperty({
    description: 'Category ID',
    example: 'clx1234567890abcdef',
    type: 'string',
  })
  categoryId: string;

  @ApiProperty({
    description: 'Target budget amount',
    example: 2000.0,
    type: 'number',
  })
  target: number;

  @ApiProperty({
    description: 'Amount spent',
    example: 1500.0,
    type: 'number',
  })
  spent: number;

  @ApiProperty({
    description: 'Remaining budget',
    example: 500.0,
    type: 'number',
  })
  remaining: number;
}

export class BudgetSummaryResponseDto {
  @ApiProperty({
    description: 'Total number of budget goals',
    example: 5,
    type: 'number',
  })
  totalBudgets: number;

  @ApiProperty({
    description: 'Total amount spent across all budgets',
    example: 7500.0,
    type: 'number',
  })
  totalSpent: number;

  @ApiProperty({
    description: 'Total remaining budget across all budgets',
    example: 2500.0,
    type: 'number',
  })
  totalRemaining: number;

  @ApiProperty({
    description: 'List of individual budget goals with their progress',
    type: [BudgetSummaryItemDto],
  })
  budgets: BudgetSummaryItemDto[];
}

