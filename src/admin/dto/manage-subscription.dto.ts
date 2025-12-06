// src/admin/dto/manage-subscription.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';

export class AdminUpdateSubscriptionDto {
  @ApiPropertyOptional({
    description: 'Update subscription plan',
    enum: SubscriptionPlan,
  })
  @IsOptional()
  @IsEnum(SubscriptionPlan)
  plan?: SubscriptionPlan;

  @ApiPropertyOptional({
    description: 'Update subscription status',
    enum: SubscriptionStatus,
  })
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;

  @ApiPropertyOptional({
    description: 'Cancel at period end',
  })
  @IsOptional()
  @IsBoolean()
  cancelAtPeriodEnd?: boolean;

  @ApiPropertyOptional({
    description: 'Stripe subscription ID (if updating from Stripe)',
  })
  @IsOptional()
  @IsString()
  stripeSubscriptionId?: string;
}

export class AdminCancelSubscriptionDto {
  @ApiPropertyOptional({
    description: 'Cancel immediately or at period end',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  immediate?: boolean;

  @ApiPropertyOptional({
    description: 'Reason for cancellation',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class AdminReactivateSubscriptionDto {
  @ApiPropertyOptional({
    description: 'Reason for reactivation',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

