// src/income/dto/income-response.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class IncomeResponseDto {
  @ApiProperty({
    description: 'Income unique identifier',
    example: 'clx1234567890abcdef',
    type: 'string',
  })
  id: string;

  @ApiProperty({
    description: 'User ID who owns this income',
    example: 'clx0987654321fedcba',
    type: 'string',
  })
  userId: string;

  @ApiProperty({
    description: 'Income amount in the user\'s currency',
    example: 5000.0,
    type: 'number',
  })
  amount: number;

  @ApiPropertyOptional({
    description: 'Source of the income',
    example: 'Salary',
    type: 'string',
    nullable: true,
  })
  source?: string | null;

  @ApiProperty({
    description: 'When the income was received',
    example: '2024-01-15T10:30:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  date: Date;

  @ApiProperty({
    description: 'When the income record was created',
    example: '2024-01-15T10:30:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the income record was last updated',
    example: '2024-01-15T10:30:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  updatedAt: Date;
}

