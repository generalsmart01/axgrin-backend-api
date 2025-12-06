// src/admin/subscription-analytics.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import {
  SubscriptionAnalyticsDto,
  SubscriptionTrendDto,
  SubscriptionDetailsDto,
} from './dto/subscription-analytics.dto';
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';

@Injectable()
export class SubscriptionAnalyticsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get comprehensive subscription analytics
   */
  async getSubscriptionAnalytics(): Promise<SubscriptionAnalyticsDto> {
    const [
      totalSubscriptions,
      activeSubscriptions,
      canceledSubscriptions,
      trialingSubscriptions,
      pastDueSubscriptions,
      subscriptionsByPlan,
      subscriptionsByStatus,
      recentSubscriptions,
      expiringSoon,
      scheduledCancellations,
      allSubscriptions,
    ] = await Promise.all([
      this.prisma.subscription.count(),
      this.prisma.subscription.count({
        where: { status: SubscriptionStatus.ACTIVE },
      }),
      this.prisma.subscription.count({
        where: { status: SubscriptionStatus.CANCELED },
      }),
      this.prisma.subscription.count({
        where: { status: SubscriptionStatus.TRIALING },
      }),
      this.prisma.subscription.count({
        where: { status: SubscriptionStatus.PAST_DUE },
      }),
      this.getSubscriptionsByPlan(),
      this.getSubscriptionsByStatus(),
      this.prisma.subscription.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
      this.prisma.subscription.count({
        where: {
          currentPeriodEnd: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
          },
          status: SubscriptionStatus.ACTIVE,
        },
      }),
      this.prisma.subscription.count({
        where: {
          cancelAtPeriodEnd: true,
          status: SubscriptionStatus.ACTIVE,
        },
      }),
      this.prisma.subscription.findMany({
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
      }),
    ]);

    // Calculate estimated revenue
    const { monthlyRevenue, yearlyRevenue } = await this.calculateEstimatedRevenue();

    return {
      totalSubscriptions,
      activeSubscriptions,
      canceledSubscriptions,
      trialingSubscriptions,
      pastDueSubscriptions,
      subscriptionsByPlan,
      subscriptionsByStatus,
      recentSubscriptions,
      expiringSoon,
      scheduledCancellations,
      estimatedMonthlyRevenue: monthlyRevenue,
      estimatedYearlyRevenue: yearlyRevenue,
    };
  }

  /**
   * Get subscription trends over time
   */
  async getSubscriptionTrends(
    days: number = 30,
  ): Promise<SubscriptionTrendDto[]> {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        createdAt: true,
        status: true,
        canceledAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by date
    const trendsMap = new Map<string, SubscriptionTrendDto>();
    let runningTotal = await this.prisma.subscription.count({
      where: {
        createdAt: {
          lt: startDate,
        },
        status: SubscriptionStatus.ACTIVE,
      },
    });

    // Initialize all dates in range
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      trendsMap.set(dateStr, {
        date: dateStr,
        newSubscriptions: 0,
        canceledSubscriptions: 0,
        netChange: 0,
        totalActive: runningTotal,
      });
    }

    // Process subscriptions
    subscriptions.forEach((sub) => {
      const createdDate = sub.createdAt.toISOString().split('T')[0];
      const canceledDate = sub.canceledAt
        ? sub.canceledAt.toISOString().split('T')[0]
        : null;

      if (trendsMap.has(createdDate)) {
        const trend = trendsMap.get(createdDate)!;
        trend.newSubscriptions++;
        trend.netChange++;
        if (sub.status === SubscriptionStatus.ACTIVE) {
          runningTotal++;
        }
        trend.totalActive = runningTotal;
      }

      if (canceledDate && trendsMap.has(canceledDate)) {
        const trend = trendsMap.get(canceledDate)!;
        trend.canceledSubscriptions++;
        trend.netChange--;
        runningTotal--;
        trend.totalActive = runningTotal;
      }
    });

    return Array.from(trendsMap.values());
  }

  /**
   * Get detailed subscription list with filters
   */
  async getSubscriptionDetails(
    status?: SubscriptionStatus,
    plan?: SubscriptionPlan,
    limit: number = 50,
    offset: number = 0,
  ): Promise<{ subscriptions: SubscriptionDetailsDto[]; total: number }> {
    const where: any = {};
    if (status) where.status = status;
    if (plan) where.plan = plan;

    const [subscriptions, total] = await Promise.all([
      this.prisma.subscription.findMany({
        where,
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      this.prisma.subscription.count({ where }),
    ]);

    return {
      subscriptions: subscriptions.map((sub) => ({
        id: sub.id,
        userId: sub.userId,
        userEmail: sub.user.email,
        plan: sub.plan,
        status: sub.status,
        currentPeriodStart: sub.currentPeriodStart,
        currentPeriodEnd: sub.currentPeriodEnd,
        cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
        trialEnd: sub.trialEnd,
        createdAt: sub.createdAt,
      })),
      total,
    };
  }

  // Private helper methods

  private async getSubscriptionsByPlan(): Promise<
    { plan: SubscriptionPlan; count: number; active: number }[]
  > {
    const plans = [SubscriptionPlan.MONTHLY, SubscriptionPlan.YEARLY];
    const results = await Promise.all(
      plans.map(async (plan) => {
        const [count, active] = await Promise.all([
          this.prisma.subscription.count({ where: { plan } }),
          this.prisma.subscription.count({
            where: { plan, status: SubscriptionStatus.ACTIVE },
          }),
        ]);
        return { plan, count, active };
      }),
    );
    return results;
  }

  private async getSubscriptionsByStatus(): Promise<
    { status: SubscriptionStatus; count: number }[]
  > {
    const statuses = Object.values(SubscriptionStatus);
    const results = await Promise.all(
      statuses.map(async (status) => {
        const count = await this.prisma.subscription.count({ where: { status } });
        return { status, count };
      }),
    );
    return results.filter((r) => r.count > 0);
  }

  private async calculateEstimatedRevenue(): Promise<{
    monthlyRevenue: number;
    yearlyRevenue: number;
  } {
    // Get active subscriptions with their plans
    const activeSubscriptions = await this.prisma.subscription.findMany({
      where: {
        status: SubscriptionStatus.ACTIVE,
      },
      select: {
        plan: true,
      },
    });

    // Get subscription configs for pricing
    const configs = await this.prisma.subscriptionConfig.findMany({
      where: {
        isActive: true,
      },
    });

    const monthlyPrice =
      configs.find((c) => c.plan === SubscriptionPlan.MONTHLY)?.price || 0;
    const yearlyPrice =
      configs.find((c) => c.plan === SubscriptionPlan.YEARLY)?.price || 0;

    let monthlyRevenue = 0;
    let yearlyRevenue = 0;

    activeSubscriptions.forEach((sub) => {
      if (sub.plan === SubscriptionPlan.MONTHLY) {
        monthlyRevenue += Number(monthlyPrice);
      } else if (sub.plan === SubscriptionPlan.YEARLY) {
        yearlyRevenue += Number(yearlyPrice);
        // Also add to monthly (yearly / 12)
        monthlyRevenue += Number(yearlyPrice) / 12;
      }
    });

    return {
      monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
      yearlyRevenue: Math.round(yearlyRevenue * 100) / 100,
    };
  }
}

