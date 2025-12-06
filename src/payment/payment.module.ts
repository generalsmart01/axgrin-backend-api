// src/payment/payment.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from './payment.controller';
import { PaymentWebhookController } from './payment-webhook.controller';
import { PaymentService } from './payment.service';
import { PrismaService } from 'prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { NotificationModule } from '../notification/notification.module';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    NotificationModule,
    forwardRef(() => AdminModule),
  ],
  controllers: [PaymentController, PaymentWebhookController],
  providers: [PaymentService, PrismaService],
  exports: [PaymentService],
})
export class PaymentModule {}

