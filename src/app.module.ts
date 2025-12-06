// src/app.module.ts
import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailModule } from './mail/mail.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { RolesGuard } from './auth/guards/roles.guard';
import { ActivityLoggingInterceptor } from './common/interceptors/activity-logging.interceptor';
import { AuthModule } from './auth/auth.module'; // 👈 Add this
import { UsersModule } from './users/users.module';
import { IncomeModule } from './income/income.module';
import { ExpenseModule } from './expense/expense.module';
import { BudgetModule } from './budget-goal/budget-goal.module';
import { CategoryModule } from './category/category.module';
import { NotificationModule } from './notification/notification.module';
import { ChatHistoryModule } from './chat-history/chat-history.module';
import { SettingsModule } from './settings/settings.module';
import { ProfileModule } from './profile/profile.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AIModule } from './ai/ai.module';
import { AdminModule } from './admin/admin.module';
import { ReportsModule } from './reports/reports.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    AuthModule, // 👈 Make sure it's listed here
    UsersModule,
    IncomeModule,
    ExpenseModule,
    BudgetModule,
    CategoryModule,
    NotificationModule,
    ChatHistoryModule,
    SettingsModule,
    ProfileModule,
    AnalyticsModule,
    AIModule,
    AdminModule,
    ReportsModule,
    PaymentModule,
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // Use SSL
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      },
      defaults: {
        from: '"Axgrin Support" <support@axgrin.com>',
      },
      template: {
        dir: __dirname + '/templates',
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),

    MailModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ActivityLoggingInterceptor,
    },
  ],
})
export class AppModule {}
