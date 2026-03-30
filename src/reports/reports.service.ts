// src/reports/reports.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GenerateReportDto, ReportType, ReportFormat } from './dto/generate-report.dto';
import { ActivityTrackingService } from '../analytics/activity-tracking.service';

@Injectable()
export class ReportsService {
  constructor(
    private prisma: PrismaService,
    private activityTracking: ActivityTrackingService,
  ) { }

  async generateReport(
    userId: string,
    dto: GenerateReportDto,
  ): Promise<{ downloadUrl: string; filename: string; format: string }> {
    const startDate = dto.startDate ? new Date(dto.startDate) : null;
    const endDate = dto.endDate ? new Date(dto.endDate) : new Date();

    let reportData: any;
    let filename: string;

    switch (dto.reportType) {
      case ReportType.EXPENSES:
        reportData = await this.getExpensesReport(userId, startDate, endDate);
        filename = `expenses-report-${Date.now()}`;
        break;

      case ReportType.INCOME:
        reportData = await this.getIncomeReport(userId, startDate, endDate);
        filename = `income-report-${Date.now()}`;
        break;

      case ReportType.BUDGET:
        reportData = await this.getBudgetReport(userId, startDate, endDate);
        filename = `budget-report-${Date.now()}`;
        break;

      case ReportType.FINANCIAL_SUMMARY:
        reportData = await this.getFinancialSummaryReport(
          userId,
          startDate,
          endDate,
        );
        filename = `financial-summary-${Date.now()}`;
        break;

      case ReportType.CATEGORY_BREAKDOWN:
        reportData = await this.getCategoryBreakdownReport(
          userId,
          startDate,
          endDate,
        );
        filename = `category-breakdown-${Date.now()}`;
        break;

      case ReportType.MONTHLY_REPORT:
        reportData = await this.getMonthlyReport(userId, startDate, endDate);
        filename = `monthly-report-${Date.now()}`;
        break;

      case ReportType.ACTIVITY_LOG:
        reportData = await this.getActivityLogReport(userId, startDate, endDate);
        filename = `activity-log-${Date.now()}`;
        break;

      default:
        throw new BadRequestException('Invalid report type');
    }

    // Log the report generation activity
    await this.activityTracking.logActivity(userId, {
      activityType: 'EXPORT',
      entityType: 'Report',
      description: `Generated ${dto.reportType} report in ${dto.format} format`,
      metadata: JSON.stringify({ reportType: dto.reportType, format: dto.format }),
    });

    // In a real implementation, you would generate the actual file here
    // For now, we return a placeholder URL
    const extension = dto.format.toLowerCase();
    return {
      downloadUrl: `/api/reports/download/${filename}.${extension}`,
      filename: `${filename}.${extension}`,
      format: dto.format,
    };
  }

  private async getExpensesReport(userId: string, startDate: Date | null, endDate: Date) {
    const expenses = await this.prisma.expense.findMany({
      where: {
        userId,
        ...(startDate && { date: { gte: startDate, lte: endDate } }),
      },
      include: {
        category: true,
      },
      orderBy: { date: 'desc' },
    });

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    return {
      type: 'EXPENSES',
      period: { startDate, endDate },
      totalExpenses: total,
      totalCount: expenses.length,
      expenses: expenses.map((e) => ({
        id: e.id,
        amount: e.amount,
        category: e.category.name,
        note: e.note,
        date: e.date,
      })),
    };
  }

  private async getIncomeReport(userId: string, startDate: Date | null, endDate: Date) {
    const incomes = await this.prisma.income.findMany({
      where: {
        userId,
        ...(startDate && { date: { gte: startDate, lte: endDate } }),
      },
      orderBy: { date: 'desc' },
    });

    const total = incomes.reduce((sum, i) => sum + i.amount, 0);

    return {
      type: 'INCOME',
      period: { startDate, endDate },
      totalIncome: total,
      totalCount: incomes.length,
      incomes: incomes.map((i) => ({
        id: i.id,
        amount: i.amount,
        source: i.source,
        date: i.date,
      })),
    };
  }

  private async getBudgetReport(userId: string, startDate: Date | null, endDate: Date) {
    const budgets = await this.prisma.budget.findMany({
      where: {
        userId,
        // For reporting, we might want to filter by the months covered by the start/end date
        // but for simplicity, let's just fetch all budgets for now or adapt as needed.
      },
      include: {
        category: true,
      },
    });

    const budgetsWithProgress = await Promise.all(
      budgets.map(async (budget) => {
        const bStartDate = new Date(budget.year, budget.month - 1, 1);
        const bEndDate = new Date(budget.year, budget.month, 0, 23, 59, 59);

        const expenses = await this.prisma.expense.aggregate({
          where: {
            userId,
            categoryId: budget.categoryId,
            date: {
              gte: bStartDate,
              lte: bEndDate,
            },
          },
          _sum: { amount: true },
        });

        const spent = expenses._sum.amount || 0;
        const remaining = budget.amount - spent;
        const progress = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

        return {
          category: budget.category.name,
          budget: budget.amount,
          spent,
          remaining,
          progress: Number(progress.toFixed(2)),
          month: budget.month,
          year: budget.year,
        };
      }),
    );

    return {
      type: 'BUDGET',
      period: { startDate, endDate },
      budgets: budgetsWithProgress,
    };
  }

  private async getFinancialSummaryReport(
    userId: string,
    startDate: Date | null,
    endDate: Date,
  ) {
    const [incomes, expenses] = await Promise.all([
      this.prisma.income.findMany({
        where: {
          userId,
          ...(startDate && { date: { gte: startDate, lte: endDate } }),
        },
      }),
      this.prisma.expense.findMany({
        where: {
          userId,
          ...(startDate && { date: { gte: startDate, lte: endDate } }),
        },
        include: { category: true },
      }),
    ]);

    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netBalance = totalIncome - totalExpenses;

    // Category breakdown
    const categoryBreakdown = expenses.reduce((acc, e) => {
      const catName = e.category.name;
      acc[catName] = (acc[catName] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);

    return {
      type: 'FINANCIAL_SUMMARY',
      period: { startDate, endDate },
      summary: {
        totalIncome,
        totalExpenses,
        netBalance,
        transactionCount: incomes.length + expenses.length,
      },
      categoryBreakdown,
      topExpenses: expenses
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 10)
        .map((e) => ({
          amount: e.amount,
          category: e.category.name,
          note: e.note,
          date: e.date,
        })),
    };
  }

  private async getCategoryBreakdownReport(
    userId: string,
    startDate: Date | null,
    endDate: Date,
  ) {
    const expenses = await this.prisma.expense.findMany({
      where: {
        userId,
        ...(startDate && { date: { gte: startDate, lte: endDate } }),
      },
      include: { category: true },
    });

    const categoryData = expenses.reduce((acc, e) => {
      const catName = e.category.name;
      if (!acc[catName]) {
        acc[catName] = { total: 0, count: 0 };
      }
      acc[catName].total += e.amount;
      acc[catName].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    return {
      type: 'CATEGORY_BREAKDOWN',
      period: { startDate, endDate },
      totalExpenses: total,
      categories: Object.entries(categoryData).map(([name, data]) => ({
        category: name,
        total: data.total,
        count: data.count,
        percentage: (data.total / total) * 100,
      })),
    };
  }

  private async getMonthlyReport(userId: string, startDate: Date | null, endDate: Date) {
    const actualStartDate = startDate || new Date(new Date().setMonth(new Date().getMonth() - 6));

    const [incomes, expenses] = await Promise.all([
      this.prisma.income.findMany({
        where: {
          userId,
          date: { gte: actualStartDate, lte: endDate },
        },
      }),
      this.prisma.expense.findMany({
        where: {
          userId,
          date: { gte: actualStartDate, lte: endDate },
        },
      }),
    ]);

    // Group by month
    const monthlyData: Record<string, { income: number; expenses: number }> = {};

    incomes.forEach((income) => {
      const month = income.date.toISOString().substring(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expenses: 0 };
      }
      monthlyData[month].income += income.amount;
    });

    expenses.forEach((expense) => {
      const month = expense.date.toISOString().substring(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expenses: 0 };
      }
      monthlyData[month].expenses += expense.amount;
    });

    return {
      type: 'MONTHLY_REPORT',
      period: { startDate: actualStartDate, endDate },
      monthlyData: Object.entries(monthlyData)
        .map(([month, data]) => ({
          month,
          income: data.income,
          expenses: data.expenses,
          netBalance: data.income - data.expenses,
        }))
        .sort((a, b) => a.month.localeCompare(b.month)),
    };
  }

  private async getActivityLogReport(
    userId: string,
    startDate: Date | null,
    endDate: Date,
  ) {
    const activities = await this.prisma.activityLog.findMany({
      where: {
        userId,
        ...(startDate && { createdAt: { gte: startDate, lte: endDate } }),
      },
      orderBy: { createdAt: 'desc' },
    });

    const activitySummary = activities.reduce((acc, activity) => {
      acc[activity.activityType] = (acc[activity.activityType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      type: 'ACTIVITY_LOG',
      period: { startDate, endDate },
      totalActivities: activities.length,
      activitySummary,
      activities: activities.map((a) => ({
        type: a.activityType,
        entityType: a.entityType,
        description: a.description,
        timestamp: a.createdAt,
        metadata: a.metadata ? JSON.parse(a.metadata) : null,
      })),
    };
  }
}

