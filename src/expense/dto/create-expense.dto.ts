// src/expense/dto/create-expense.dto.ts
import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateExpenseDto {
  @ApiProperty({
    description: "The expense amount in the user's currency",
    example: 150.5,
    type: 'number',
    minimum: 0,
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: 'UUID of the category this expense belongs to',
    example: 'clx1234567890abcdef',
    type: 'string',
    format: 'uuid',
  })
  @IsUUID()
  categoryId: string;

  @ApiPropertyOptional({
    description: 'Additional notes or description for the expense',
    example: 'Grocery shopping at Whole Foods',
    type: 'string',
  })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({
    description: 'When the expense occurred (defaults to current timestamp)',
    example: '2024-01-15T10:30:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  @IsOptional()
  date?: Date;
}
