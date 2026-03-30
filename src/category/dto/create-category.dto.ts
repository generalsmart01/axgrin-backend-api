// src/category/dto/create-category.dto.ts
import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'The name of the category',
    example: 'Food & Dining',
    type: 'string',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({
    description: 'The color of the category (e.g., hex code)',
    example: '#FF5733',
    type: 'string',
    required: false,
  })
  @IsString()
  color?: string;
}
