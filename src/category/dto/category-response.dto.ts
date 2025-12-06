// src/category/dto/category-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({
    description: 'Category unique identifier',
    example: 'clx1234567890abcdef',
    type: 'string',
  })
  id: string;

  @ApiProperty({
    description: 'User ID who owns this category',
    example: 'clx0987654321fedcba',
    type: 'string',
  })
  userId: string;

  @ApiProperty({
    description: 'Category name',
    example: 'Food & Dining',
    type: 'string',
  })
  name: string;

  @ApiProperty({
    description: 'When the category was created',
    example: '2024-01-01T00:00:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the category was last updated',
    example: '2024-01-15T10:30:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  updatedAt: Date;
}

