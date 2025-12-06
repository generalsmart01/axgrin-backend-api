// src/expense/dto/expense-response.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExpenseResponseDto {
  @ApiProperty({
    description: 'Expense unique identifier',
    example: 'clx1234567890abcdef',
    type: 'string',
  })
  id: string;

  @ApiProperty({
    description: 'User ID who owns this expense',
    example: 'clx0987654321fedcba',
    type: 'string',
  })
  userId: string;

  @ApiProperty({
    description: 'Expense amount in the user\'s currency',
    example: 150.5,
    type: 'number',
  })
  amount: number;

  @ApiProperty({
    description: 'Category ID this expense belongs to',
    example: 'clx1234567890abcdef',
    type: 'string',
  })
  categoryId: string;

  @ApiPropertyOptional({
    description: 'Additional notes or description for the expense',
    example: 'Grocery shopping at Whole Foods',
    type: 'string',
    nullable: true,
  })
  note?: string | null;

  @ApiProperty({
    description: 'When the expense occurred',
    example: '2024-01-15T10:30:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  date: Date;

  @ApiProperty({
    description: 'When the expense was created',
    example: '2024-01-15T10:30:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the expense was last updated',
    example: '2024-01-15T10:30:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  updatedAt: Date;
}

