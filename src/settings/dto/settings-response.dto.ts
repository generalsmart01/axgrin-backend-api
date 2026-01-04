import { ApiProperty } from '@nestjs/swagger';

export class SettingsResponseDto {
  @ApiProperty({
    description: 'Settings ID',
    example: 'clx1234567890abcdef',
  })
  id: string;

  @ApiProperty({
    description: 'User ID',
    example: 'clx0987654321fedcba',
  })
  userId: string;

  @ApiProperty({
    description: 'Currency preference',
    example: 'USD',
    default: 'USD',
  })
  currency: string;

  @ApiProperty({
    description: 'Theme preference',
    example: 'dark',
    default: 'system',
    enum: ['light', 'dark', 'system'],
  })
  theme: string;

  @ApiProperty({
    description: 'When settings were created',
    example: '2024-01-15T10:30:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When settings were last updated',
    example: '2024-01-15T10:30:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  updatedAt: Date;
}
