// src/admin/admin-dashboard.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import {
  AdminDashboardDto,
  MainPageStatisticsDto,
  UserStatisticsDto,
  CustomerCareStatisticsDto,
} from './dto/admin-dashboard.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AdminDashboardService {
  constructor(private prisma: PrismaService) {}

  async getAdminDashboard(): Promise<AdminDashboardDto> {
    const [mainPage, users, customerCare] = await Promise.all([
      this.getMainPageStatistics(),
      this.getUserStatistics(),
      this.getCustomerCareStatistics(),
    ]);

    return {
      mainPage,
      users,
      customerCare,
      lastUpdated: new Date(),
    };
  }

  private async getMainPageStatistics(): Promise<MainPageStatisticsDto> {
    // Total users
    const totalUsers = await this.prisma.user.count();

    // Active users (logged in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeUsers = await this.prisma.user.count({
      where: {
        updatedAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // New users this month
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const newUsersThisMonth = await this.prisma.user.count({
      where: {
        createdAt: {
          gte: thisMonth,
        },
      },
    });

    // System-wide financial data
    const [systemIncome, systemExpenses] = await Promise.all([
      this.prisma.income.aggregate({
        _sum: { amount: true },
        _count: { id: true },
      }),
      this.prisma.expense.aggregate({
        _sum: { amount: true },
        _count: { id: true },
      }),
    ]);

    const totalSystemIncome = systemIncome._sum.amount || 0;
    const totalSystemExpenses = systemExpenses._sum.amount || 0;
    const systemNetBalance = totalSystemIncome - totalSystemExpenses;
    const totalTransactions =
      (systemIncome._count.id || 0) + (systemExpenses._count.id || 0);

    // Total budget goals and categories
    const [totalBudgetGoals, totalCategories] = await Promise.all([
      this.prisma.budgetGoal.count(),
      this.prisma.category.count(),
    ]);

    // Total chat interactions
    const totalChatInteractions = await this.prisma.chatHistory.count();

    // Most popular category
    const mostPopularCategoryData = await this.prisma.$queryRaw`
      SELECT c.name, COUNT(e.id) as transaction_count
      FROM "Category" c
      JOIN "Expense" e ON c.id = e."categoryId"
      GROUP BY c.id, c.name
      ORDER BY transaction_count DESC
      LIMIT 1
    `;

    const mostPopularCategory =
      (mostPopularCategoryData as any[])[0]?.name || 'N/A';

    // Average user balance
    const userBalances = await this.prisma.user.findMany({
      include: {
        incomes: { select: { amount: true } },
        expenses: { select: { amount: true } },
      },
    });

    const averageUserBalance =
      userBalances.length > 0
        ? userBalances.reduce((sum, user) => {
            const income = user.incomes.reduce((s, i) => s + i.amount, 0);
            const expense = user.expenses.reduce((s, e) => s + e.amount, 0);
            return sum + (income - expense);
          }, 0) / userBalances.length
        : 0;

    return {
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      totalSystemIncome,
      totalSystemExpenses,
      systemNetBalance,
      totalTransactions,
      totalBudgetGoals,
      totalCategories,
      totalChatInteractions,
      mostPopularCategory,
      averageUserBalance,
    };
  }

  private async getUserStatistics(): Promise<UserStatisticsDto> {
    // Users by role
    const usersByRole = await this.prisma.user.groupBy({
      by: ['role'],
      _count: { id: true },
    });

    const roleCounts = usersByRole.reduce(
      (acc, role) => {
        acc[role.role] = role._count.id;
        return acc;
      },
      {
        ADMIN: 0,
        USER: 0,
        PREMIUM: 0,
        VIEWER: 0,
        CUSTOMER_CARE: 0,
      } as Record<string, number>,
    );

    // Verified vs unverified
    const [verifiedUsers, unverifiedUsers] = await Promise.all([
      this.prisma.user.count({ where: { emailVerified: true } }),
      this.prisma.user.count({ where: { emailVerified: false } }),
    ]);

    // New users this week
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);

    const newUsersThisWeek = await this.prisma.user.count({
      where: {
        createdAt: {
          gte: thisWeek,
        },
      },
    });

    // New users today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newUsersToday = await this.prisma.user.count({
      where: {
        createdAt: {
          gte: today,
        },
      },
    });

    // Premium users
    const premiumUsers = roleCounts.PREMIUM || 0;
    const totalUsers = Object.values(roleCounts).reduce((a, b) => a + b, 0);
    const premiumPercentage =
      totalUsers > 0 ? (premiumUsers / totalUsers) * 100 : 0;

    // Users logged in today (check login activity)
    const todayLoginActivities = await this.prisma.loginActivity.findMany({
      where: {
        timestamp: {
          gte: today,
        },
      },
      select: {
        userId: true,
      },
    });
    const usersLoggedInToday = new Set(todayLoginActivities.map(a => a.userId)).size;

    // Users logged in this week
    const weekLoginActivities = await this.prisma.loginActivity.findMany({
      where: {
        timestamp: {
          gte: thisWeek,
        },
      },
      select: {
        userId: true,
      },
    });
    const usersLoggedInThisWeek = new Set(weekLoginActivities.map(a => a.userId)).size;

    // Average accounts per user (categories + budget goals)
    const totalAccounts =
      (await this.prisma.category.count()) +
      (await this.prisma.budgetGoal.count());
    const averageAccountsPerUser =
      totalUsers > 0 ? totalAccounts / totalUsers : 0;

    return {
      usersByRole: {
        ADMIN: roleCounts.ADMIN || 0,
        USER: roleCounts.USER || 0,
        PREMIUM: roleCounts.PREMIUM || 0,
        VIEWER: roleCounts.VIEWER || 0,
        CUSTOMER_CARE: roleCounts.CUSTOMER_CARE || 0,
      },
      verifiedUsers,
      unverifiedUsers,
      newUsersThisWeek,
      newUsersToday,
      premiumUsers,
      premiumPercentage: Number(premiumPercentage.toFixed(2)),
      usersLoggedInToday,
      usersLoggedInThisWeek,
      averageAccountsPerUser: Number(averageAccountsPerUser.toFixed(2)),
    };
  }

  private async getCustomerCareStatistics(): Promise<CustomerCareStatisticsDto> {
    // Total customer care staff
    const totalCustomerCareStaff = await this.prisma.user.count({
      where: { role: Role.CUSTOMER_CARE },
    });

    // Active customer care staff (logged in today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeCustomerCareStaffIds = await this.prisma.loginActivity.findMany({
      where: {
        timestamp: {
          gte: today,
        },
        user: {
          role: Role.CUSTOMER_CARE,
        },
      },
      select: {
        userId: true,
      },
      distinct: ['userId'],
    });

    const activeCustomerCareStaff = activeCustomerCareStaffIds.length;

    // Support tickets statistics
    const ticketStats = await this.prisma.supportTicket.groupBy({
      by: ['status'],
      _count: true,
    });

    const totalSupportTickets = await this.prisma.supportTicket.count();
    const openSupportTickets = ticketStats.find(s => s.status === 'OPEN')?._count || 0;
    const resolvedSupportTickets = ticketStats.find(s => s.status === 'RESOLVED')?._count || 0;

    // Calculate average response time (time from OPEN to RESOLVED)
    const resolvedTickets = await this.prisma.supportTicket.findMany({
      where: { status: 'RESOLVED', resolvedAt: { not: null } },
      select: { createdAt: true, resolvedAt: true },
    });

    let totalResponseTime = 0;
    for (const ticket of resolvedTickets) {
      if (ticket.resolvedAt) {
        totalResponseTime += ticket.resolvedAt.getTime() - ticket.createdAt.getTime();
      }
    }
    const averageResponseTime = resolvedTickets.length > 0
      ? Math.round(totalResponseTime / resolvedTickets.length / (1000 * 60)) // in minutes
      : 0;

    // Customer care activity this week
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);

    const activityThisWeek = await this.prisma.loginActivity.count({
      where: {
        timestamp: {
          gte: thisWeek,
        },
        user: {
          role: Role.CUSTOMER_CARE,
        },
      },
    });

    const activityToday = await this.prisma.loginActivity.count({
      where: {
        timestamp: {
          gte: today,
        },
        user: {
          role: Role.CUSTOMER_CARE,
        },
      },
    });

    // Most active customer care staff
    const mostActiveStaffData = await this.prisma.loginActivity.groupBy({
      by: ['userId'],
      where: {
        timestamp: {
          gte: thisWeek,
        },
        user: {
          role: Role.CUSTOMER_CARE,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 5,
    });

    const mostActiveStaff = await Promise.all(
      mostActiveStaffData.map(async (staff) => {
        const user = await this.prisma.user.findUnique({
          where: { id: staff.userId },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        });

        return {
          id: user?.id || staff.userId,
          email: user?.email || 'Unknown',
          name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Unknown',
          activityCount: staff._count.id,
        };
      }),
    );

    return {
      totalCustomerCareStaff,
      activeCustomerCareStaff,
      totalSupportTickets,
      openSupportTickets,
      resolvedSupportTickets,
      averageResponseTime,
      activityThisWeek,
      activityToday,
      mostActiveStaff,
    };
  }
}

