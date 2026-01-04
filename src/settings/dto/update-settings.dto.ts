// src/settings/dto/update-settings.dto.ts
import { IsOptional, IsString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSettingsDto {
  @ApiPropertyOptional({
    description: 'Currency preference (ISO 4217 currency code)',
    example: 'USD',
    type: String,
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({
    description: 'Theme preference',
    example: 'dark',
    enum: ['light', 'dark', 'system'],
    default: 'system',
  })
  @IsOptional()
  @IsIn(['light', 'dark', 'system'])
  theme?: string;
}
