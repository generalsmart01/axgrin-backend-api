// src/notification/notification.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        userId,
        message: dto.message,
      },
    });
  }

  async findAll(userId: string) {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const unreadCount = await this.prisma.notification.count({
      where: { userId, read: false },
    });

    return {
      notifications,
      total: notifications.length,
      unreadCount,
    };
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification || notification.userId !== userId) return null;

    return this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  // Automatic notification methods
  async sendWelcomeNotification(userId: string, firstName?: string) {
    const name = firstName ? `, ${firstName}` : '';
    const message = `🎉 Welcome to Axgrin${name}! Start by creating your first expense category to begin tracking your finances.`;

    return this.prisma.notification.create({
      data: {
        userId,
        message,
      },
    });
  }

  async sendLoginNotification(
    userId: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const location = ipAddress ? ` from ${ipAddress}` : '';
    const message = `🔐 You've successfully logged in${location}. Welcome back!`;

    return this.prisma.notification.create({
      data: {
        userId,
        message,
      },
    });
  }

  async sendBudgetAlertNotification(
    userId: string,
    categoryName: string,
    spent: number,
    budget: number,
  ) {
    const percentage = Math.round((spent / budget) * 100);
    const message = `⚠️ Budget Alert: You've spent ${percentage}% of your ${categoryName} budget ($${spent.toFixed(2)} of $${budget.toFixed(2)})`;

    return this.prisma.notification.create({
      data: {
        userId,
        message,
      },
    });
  }

  async sendBudgetExceededNotification(
    userId: string,
    categoryName: string,
    spent: number,
    budget: number,
  ) {
    const overage = spent - budget;
    const message = `🚨 Budget Exceeded: You've exceeded your ${categoryName} budget by $${overage.toFixed(2)} ($${spent.toFixed(2)} of $${budget.toFixed(2)})`;

    return this.prisma.notification.create({
      data: {
        userId,
        message,
      },
    });
  }

  async sendGoalAchievedNotification(userId: string, categoryName: string) {
    const message = `🎉 Goal Achieved: Congratulations! You've successfully stayed within your ${categoryName} budget this month.`;

    return this.prisma.notification.create({
      data: {
        userId,
        message,
      },
    });
  }

  async sendMonthlyReportNotification(userId: string) {
    const message = `📊 Your monthly expense report is ready! Check your analytics dashboard for insights into your spending patterns.`;

    return this.prisma.notification.create({
      data: {
        userId,
        message,
      },
    });
  }

  async sendExpenseLimitWarningNotification(
    userId: string,
    dailyLimit: number,
    spent: number,
  ) {
    const message = `⚠️ Daily Limit Warning: You've spent $${spent.toFixed(2)} of your $${dailyLimit.toFixed(2)} daily limit. Consider reviewing your expenses.`;

    return this.prisma.notification.create({
      data: {
        userId,
        message,
      },
    });
  }
}
