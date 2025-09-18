// src/budget/dto/create-budget-goal.dto.ts
import { IsString, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBudgetGoalDto {
  @ApiProperty({
    description: 'UUID of the category for this budget goal',
    example: 'clx1234567890abcdef',
    type: 'string',
    format: 'uuid',
  })
  @IsString()
  categoryId: string;

  @ApiProperty({
    description: 'Target amount to spend within the time period',
    example: 2000.0,
    type: 'number',
    minimum: 0,
  })
  @IsNumber()
  target: number;

  @ApiProperty({
    description: 'Start date of the budget period (ISO 8601 format)',
    example: '2024-01-01T00:00:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'End date of the budget period (ISO 8601 format)',
    example: '2024-01-31T23:59:59.000Z',
    type: 'string',
    format: 'date-time',
  })
  @IsDateString()
  endDate: string;
}
