// src/auth/dto/upgrade-role.dto.ts
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class UpgradeRoleDto {
  @ApiProperty({
    description: 'Target role to upgrade to',
    enum: Role,
    example: 'PREMIUM',
  })
  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;
}

