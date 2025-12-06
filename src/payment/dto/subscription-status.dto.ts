// src/payment/dto/subscription-status.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';

export class SubscriptionStatusDto {
  @ApiProperty({ description: 'Whether user has a subscription record' })
  hasSubscription: boolean;

  @ApiProperty({ description: 'Whether user has PREMIUM role' })
  isPremium: boolean;

  @ApiProperty({ description: 'Whether subscription is currently active' })
  isActive: boolean;

  @ApiPropertyOptional({
    description: 'Subscription details',
    nullable: true,
  })
  subscription?: {
    id: string;
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    currentPeriodStart: Date | null;
    currentPeriodEnd: Date | null;
    cancelAtPeriodEnd: boolean;
    trialEnd: Date | null;
  } | null;
}

