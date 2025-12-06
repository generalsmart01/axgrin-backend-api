// src/budget-goal/dto/budget-goal-response.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BudgetGoalResponseDto {
  @ApiProperty({
    description: 'Budget goal unique identifier',
    example: 'clx1234567890abcdef',
    type: 'string',
  })
  id: string;

  @ApiProperty({
    description: 'User ID who owns this budget goal',
    example: 'clx0987654321fedcba',
    type: 'string',
  })
  userId: string;

  @ApiProperty({
    description: 'Category ID this budget goal belongs to',
    example: 'clx1234567890abcdef',
    type: 'string',
  })
  categoryId: string;

  @ApiProperty({
    description: 'Target amount to spend within the time period',
    example: 2000.0,
    type: 'number',
  })
  target: number;

  @ApiProperty({
    description: 'Start date of the budget period',
    example: '2024-01-01T00:00:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  startDate: string;

  @ApiProperty({
    description: 'End date of the budget period',
    example: '2024-01-31T23:59:59.000Z',
    type: 'string',
    format: 'date-time',
  })
  endDate: string;

  @ApiProperty({
    description: 'When the budget goal was created',
    example: '2024-01-01T00:00:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the budget goal was last updated',
    example: '2024-01-15T10:30:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  updatedAt: Date;
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

