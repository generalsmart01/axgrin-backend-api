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
}
