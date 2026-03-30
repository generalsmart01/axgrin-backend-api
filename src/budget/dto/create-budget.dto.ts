import { IsString, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBudgetDto {
  @ApiProperty({
    description: 'UUID of the category for this budget',
    example: 'clx1234567890abcdef',
    type: 'string',
  })
  @IsString()
  categoryId: string;

  @ApiProperty({
    description: 'Amount set for the budget',
    example: 2000.0,
    type: 'number',
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({
    description: 'Month of the budget (1-12)',
    example: 1,
    type: 'number',
    minimum: 1,
    maximum: 12,
  })
  @IsNumber()
  @Min(1)
  @Max(12)
  month: number;

  @ApiProperty({
    description: 'Year of the budget',
    example: 2024,
    type: 'number',
  })
  @IsNumber()
  year: number;
}
