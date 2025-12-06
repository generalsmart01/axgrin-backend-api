// src/admin/dto/subscription-config.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, IsEnum, Min, Max } from 'class-validator';
import { SubscriptionPlan } from '@prisma/client';

export class CreateSubscriptionConfigDto {
  @ApiProperty({
    description: 'Subscription plan type',
    enum: SubscriptionPlan,
    example: SubscriptionPlan.MONTHLY,
  })
  @IsEnum(SubscriptionPlan)
  plan: SubscriptionPlan;

  @ApiProperty({
    description: 'Stripe Price ID for this plan',
    example: 'price_1234567890',
  })
  @IsString()
  stripePriceId: string;

  @ApiProperty({
    description: 'Price in USD',
    example: 9.99,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    description: 'Currency code',
    default: 'USD',
    example: 'USD',
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({
    description: 'Number of trial days',
    example: 7,
    minimum: 0,
    maximum: 365,
  })
  @IsNumber()
  @Min(0)
  @Max(365)
  trialDays: number;

  @ApiPropertyOptional({
    description: 'Plan description',
    example: 'Monthly premium subscription with all features',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether this plan is active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateSubscriptionConfigDto {
  @ApiPropertyOptional({
    description: 'Stripe Price ID for this plan',
    example: 'price_1234567890',
  })
  @IsOptional()
  @IsString()
  stripePriceId?: string;

  @ApiPropertyOptional({
    description: 'Price in USD',
    example: 9.99,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({
    description: 'Currency code',
    example: 'USD',
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({
    description: 'Number of trial days',
    example: 7,
    minimum: 0,
    maximum: 365,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(365)
  trialDays?: number;

  @ApiPropertyOptional({
    description: 'Plan description',
    example: 'Monthly premium subscription with all features',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether this plan is active',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class SubscriptionConfigResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: SubscriptionPlan })
  plan: SubscriptionPlan;

  @ApiProperty()
  stripePriceId: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  trialDays: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ nullable: true })
  description: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

