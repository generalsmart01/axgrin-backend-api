import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  UserAnalyticsDto,
  MonthlyAnalyticsDto,
  CategoryAnalyticsDto,
  BudgetAnalyticsDto,
  AdminAnalyticsDto,
  DashboardAnalyticsDto,
} from './dto/analytics-response.dto';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) { }

  async getUserAnalytics(userId: string): Promise<UserAnalyticsDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        incomes: true,
        expenses: true,
        budgets: true,
        categories: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const totalIncomeAmount = user.incomes.reduce(
      (sum, income) => sum + income.amount,
      0,
    );
    const totalExpenseAmount = user.expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0,
    );
    const netBalance = totalIncomeAmount - totalExpenseAmount;

    // Get last activity date
    const lastIncome = await this.prisma.income.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    const lastExpense = await this.prisma.expense.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    const lastActivity = [lastIncome?.date, lastExpense?.date, user.updatedAt]
      .filter((date): date is Date => date !== undefined)
      .sort((a, b) => b.getTime() - a.getTime())[0];

    return {
      userId: user.id,
      email: user.email,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User',
      totalIncomes: user.incomes.length,
      totalExpenses: user.expenses.length,
      totalBudgets: user.budgets.length,
      totalCategories: user.categories.length,
      totalIncomeAmount,
      totalExpenseAmount,
      netBalance,
      createdAt: user.createdAt,
      lastActivity: lastActivity || user.createdAt,
    };
  }

  async getMonthlyAnalytics(
    userId: string,
    months: number = 6,
  ): Promise<MonthlyAnalyticsDto[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const monthlyData = await this.prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', date) as month,
        COALESCE(SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END), 0) as total_expenses,
        COUNT(CASE WHEN type = 'INCOME' THEN 1 END) as income_count,
        COUNT(CASE WHEN type = 'EXPENSE' THEN 1 END) as expense_count
      FROM (
        SELECT amount, 'INCOME' as type, date FROM "Income" WHERE "userId" = ${userId}
        UNION ALL
        SELECT amount, 'EXPENSE' as type, date FROM "Expense" WHERE "userId" = ${userId}
      ) combined
      WHERE date >= ${startDate} AND date <= ${endDate}
      GROUP BY DATE_TRUNC('month', date)
      ORDER BY month DESC
    `;

    return (monthlyData as any[]).map((row) => ({
      month: row.month.toISOString().substring(0, 7), // YYYY-MM format
      totalIncome: Number(row.total_income),
      totalExpenses: Number(row.total_expenses),
      netBalance: Number(row.total_income) - Number(row.total_expenses),
      incomeCount: Number(row.income_count),
      expenseCount: Number(row.expense_count),
    }));
  }

  async getCategoryAnalytics(userId: string): Promise<CategoryAnalyticsDto[]> {
    const categoryData = await this.prisma.$queryRaw`
      SELECT 
        c.id as "categoryId",
        c.name as "categoryName",
        COALESCE(SUM(e.amount), 0) as "totalAmount",
        COUNT(e.id) as "transactionCount"
      FROM "Category" c
      LEFT JOIN "Expense" e ON c.id = e."categoryId" AND e."userId" = ${userId}
      WHERE c."userId" = ${userId}
      GROUP BY c.id, c.name
      HAVING COUNT(e.id) > 0
      ORDER BY "totalAmount" DESC
    `;

    const totalExpenses = (categoryData as any[]).reduce(
      (sum, cat) => sum + Number(cat.totalAmount),
      0,
    );

    return (categoryData as any[]).map((row) => ({
      categoryId: row.categoryId,
      categoryName: row.categoryName,
      totalAmount: Number(row.totalAmount),
      transactionCount: Number(row.transactionCount),
      percentage:
        totalExpenses > 0 ? (Number(row.totalAmount) / totalExpenses) * 100 : 0,
    }));
  }

  async getBudgetGoalsAnalytics(
    userId: string,
  ): Promise<BudgetAnalyticsDto[]> {
    const budgets = await this.prisma.budget.findMany({
      where: { userId },
      include: {
        category: true,
      },
    });

    const goalsWithProgress = await Promise.all(
      budgets.map(async (budget) => {
        const startDate = new Date(budget.year, budget.month - 1, 1);
        const endDate = new Date(budget.year, budget.month, 0, 23, 59, 59);

        const currentAmount = await this.prisma.expense.aggregate({
          where: {
            userId,
            categoryId: budget.categoryId,
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
          _sum: {
            amount: true,
          },
        });

        const progress = currentAmount._sum?.amount || 0;
        const progressPercentage =
          budget.amount > 0 ? (progress / budget.amount) * 100 : 0;

        let status: 'ON_TRACK' | 'AT_RISK' | 'EXCEEDED' | 'COMPLETED';
        if (progress >= budget.amount) {
          status = 'COMPLETED';
        } else if (progressPercentage >= 90) {
          status = 'AT_RISK';
        } else if (progressPercentage >= 100) {
          status = 'EXCEEDED';
        } else {
          status = 'ON_TRACK';
        }

        return {
          goalId: budget.id,
          goalName: budget.category.name,
          targetAmount: budget.amount,
          currentAmount: Number(progress),
          progressPercentage: Math.min(progressPercentage, 100),
          status,
        };
      }),
    );

    return goalsWithProgress;
  }

  async getAdminAnalytics(): Promise<AdminAnalyticsDto> {
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
    const systemIncome = await this.prisma.income.aggregate({
      _sum: {
        amount: true,
      },
    });

    const systemExpenses = await this.prisma.expense.aggregate({
      _sum: {
        amount: true,
      },
    });

    const totalSystemIncome = systemIncome._sum.amount || 0;
    const totalSystemExpenses = systemExpenses._sum.amount || 0;
    const systemNetBalance = totalSystemIncome - totalSystemExpenses;

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

    // Users by role
    const usersByRole = await this.prisma.user.groupBy({
      by: ['role'],
      _count: {
        id: true,
      },
    });

    const roleCounts = usersByRole.reduce(
      (acc, role) => {
        acc[role.role] = role._count.id;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Monthly system analytics
    const monthlySystemData = await this.prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', date) as month,
        COALESCE(SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END), 0) as total_expenses,
        COUNT(CASE WHEN type = 'INCOME' THEN 1 END) as income_count,
        COUNT(CASE WHEN type = 'EXPENSE' THEN 1 END) as expense_count
      FROM (
        SELECT amount, 'INCOME' as type, date FROM "Income"
        UNION ALL
        SELECT amount, 'EXPENSE' as type, date FROM "Expense"
      ) combined
      WHERE date >= ${thisMonth}
      GROUP BY DATE_TRUNC('month', date)
      ORDER BY month DESC
    `;

    const monthlySystemAnalytics = (monthlySystemData as any[]).map((row) => ({
      month: row.month.toISOString().substring(0, 7),
      totalIncome: Number(row.total_income),
      totalExpenses: Number(row.total_expenses),
      netBalance: Number(row.total_income) - Number(row.total_expenses),
      incomeCount: Number(row.income_count),
      expenseCount: Number(row.expense_count),
    }));

    return {
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      totalSystemIncome: Number(totalSystemIncome),
      totalSystemExpenses: Number(totalSystemExpenses),
      systemNetBalance: Number(systemNetBalance),
      mostPopularCategory,
      averageUserBalance:
        totalUsers > 0 ? Number(systemNetBalance) / totalUsers : 0,
      usersByRole: {
        ADMIN: roleCounts.ADMIN || 0,
        USER: roleCounts.USER || 0,
      },
      monthlySystemAnalytics,
    };
  }

  async getDashboardAnalytics(
    userId: string,
    userRole: string,
  ): Promise<DashboardAnalyticsDto> {
    const userAnalytics = await this.getUserAnalytics(userId);
    const monthlyAnalytics = await this.getMonthlyAnalytics(userId);
    const categoryAnalytics = await this.getCategoryAnalytics(userId);
    const budgetsAnalytics = await this.getBudgetGoalsAnalytics(userId);

    const dashboardData: DashboardAnalyticsDto = {
      userAnalytics,
      monthlyAnalytics,
      categoryAnalytics,
      budgetsAnalytics,
    };

    // Add admin analytics if user is ADMIN
    if (userRole === 'ADMIN') {
      dashboardData.adminAnalytics = await this.getAdminAnalytics();
    }

    return dashboardData;
  }
}
