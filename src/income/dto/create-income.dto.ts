// src/income/dto/create-income.dto.ts
import { IsNumber, IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateIncomeDto {
  @ApiProperty({
    description: 'Income amount in the user\'s currency',
    example: 5000.00,
    type: 'number',
    minimum: 0,
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: 'Source of the income',
    example: 'Salary',
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  source: string;

  @ApiPropertyOptional({
    description: 'Date when income was received (defaults to current timestamp)',
    example: '2024-01-15T10:30:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  @IsOptional()
  date?: Date;
}
