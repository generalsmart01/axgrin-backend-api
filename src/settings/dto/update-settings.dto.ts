// src/settings/dto/update-settings.dto.ts
import { IsOptional, IsString, IsIn } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsIn(['light', 'dark', 'system'])
  theme?: string;
}
