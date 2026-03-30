// src/admin/admin.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminDashboardService } from './admin-dashboard.service';
import { SubscriptionConfigController } from './subscription-config.controller';
import { SubscriptionConfigService } from './subscription-config.service';
import { SubscriptionAnalyticsController } from './subscription-analytics.controller';
import { SubscriptionAnalyticsService } from './subscription-analytics.service';
import { SubscriptionManagementController } from './subscription-management.controller';
import { SubscriptionManagementService } from './subscription-management.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaymentModule } from '../payment/payment.module';
import { NotificationModule } from '../notification/notification.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    forwardRef(() => PaymentModule),
    NotificationModule,
    AuthModule,
  ],
  controllers: [
    AdminDashboardController,
    SubscriptionConfigController,
    SubscriptionAnalyticsController,
    SubscriptionManagementController,
  ],
  providers: [
    AdminDashboardService,
    SubscriptionConfigService,
    SubscriptionAnalyticsService,
    SubscriptionManagementService,
    PrismaService,
  ],
  exports: [
    AdminDashboardService,
    SubscriptionConfigService,
    SubscriptionAnalyticsService,
    SubscriptionManagementService,
  ],
})
export class AdminModule {}

