import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { ActivityAnalyticsController } from './activity-analytics.controller';
import { AnalyticsService } from './analytics.service';
import { ActivityTrackingService } from './activity-tracking.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [AnalyticsController, ActivityAnalyticsController],
  providers: [AnalyticsService, ActivityTrackingService, PrismaService],
  exports: [ActivityTrackingService],
})
export class AnalyticsModule { }
