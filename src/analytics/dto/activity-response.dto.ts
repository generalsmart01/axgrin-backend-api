// src/analytics/dto/activity-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { ActivityType } from '@prisma/client';

export class ActivityLogDto {
  @ApiProperty({ description: 'Activity log ID' })
  id: string;

  @ApiProperty({ description: 'Activity type', enum: ActivityType })
  activityType: ActivityType;

  @ApiProperty({ description: 'Entity type (e.g., Expense, Income)', example: 'Expense' })
  entityType: string;

  @ApiProperty({ description: 'Entity ID', nullable: true })
  entityId?: string | null;

  @ApiProperty({ description: 'Activity description' })
  description: string;

  @ApiProperty({ description: 'Additional metadata (JSON)', nullable: true })
  metadata?: any;

  @ApiProperty({ description: 'When the activity occurred' })
  createdAt: Date;

  @ApiProperty({ description: 'User who performed the activity' })
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
}

export class ActivityStatisticsDto {
  @ApiProperty({ description: 'Total number of activities' })
  totalActivities: number;

  @ApiProperty({
    description: 'Activities grouped by type',
    example: { CREATE: 150, UPDATE: 200, DELETE: 50, VIEW: 500 },
  })
  activitiesByType: Record<string, number>;

  @ApiProperty({
    description: 'Activities grouped by entity type',
    example: { Expense: 300, Income: 200, BudgetGoal: 100 },
  })
  activitiesByEntity: Record<string, number>;

  @ApiProperty({ description: 'Recent activities', type: [ActivityLogDto] })
  recentActivities: ActivityLogDto[];
}

export class MostActiveUserDto {
  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Number of activities' })
  activityCount: number;

  @ApiProperty({ description: 'User information', nullable: true })
  user: {
    email: string;
    name: string;
    role: string;
  } | null;
}

