// src/admin/dto/subscription-analytics.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';

export class SubscriptionAnalyticsDto {
  @ApiProperty({ description: 'Total number of subscriptions' })
  totalSubscriptions: number;

  @ApiProperty({ description: 'Number of active subscriptions' })
  activeSubscriptions: number;

  @ApiProperty({ description: 'Number of canceled subscriptions' })
  canceledSubscriptions: number;

  @ApiProperty({ description: 'Number of subscriptions in trial' })
  trialingSubscriptions: number;

  @ApiProperty({ description: 'Number of past due subscriptions' })
  pastDueSubscriptions: number;

  @ApiProperty({ description: 'Subscriptions by plan type' })
  subscriptionsByPlan: {
    plan: SubscriptionPlan;
    count: number;
    active: number;
  }[];

  @ApiProperty({ description: 'Subscriptions by status' })
  subscriptionsByStatus: {
    status: SubscriptionStatus;
    count: number;
  }[];

  @ApiProperty({ description: 'Recent subscriptions (last 30 days)' })
  recentSubscriptions: number;

  @ApiProperty({ description: 'Subscriptions expiring soon (next 7 days)' })
  expiringSoon: number;

  @ApiProperty({ description: 'Subscriptions scheduled for cancellation' })
  scheduledCancellations: number;

  @ApiProperty({ description: 'Total revenue (estimated from active subscriptions)' })
  estimatedMonthlyRevenue: number;

  @ApiProperty({ description: 'Total yearly revenue (estimated)' })
  estimatedYearlyRevenue: number;
}

export class SubscriptionTrendDto {
  @ApiProperty({ description: 'Date' })
  date: string;

  @ApiProperty({ description: 'Number of new subscriptions' })
  newSubscriptions: number;

  @ApiProperty({ description: 'Number of canceled subscriptions' })
  canceledSubscriptions: number;

  @ApiProperty({ description: 'Net change in subscriptions' })
  netChange: number;

  @ApiProperty({ description: 'Total active subscriptions at this date' })
  totalActive: number;
}

export class SubscriptionDetailsDto {
  @ApiProperty({ description: 'Subscription ID' })
  id: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'User email' })
  userEmail: string;

  @ApiProperty({ enum: SubscriptionPlan })
  plan: SubscriptionPlan;

  @ApiProperty({ enum: SubscriptionStatus })
  status: SubscriptionStatus;

  @ApiProperty({ nullable: true })
  currentPeriodStart: Date | null;

  @ApiProperty({ nullable: true })
  currentPeriodEnd: Date | null;

  @ApiProperty()
  cancelAtPeriodEnd: boolean;

  @ApiProperty({ nullable: true })
  trialEnd: Date | null;

  @ApiProperty()
  createdAt: Date;
}

