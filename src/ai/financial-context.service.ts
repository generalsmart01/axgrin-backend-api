// src/ai/financial-context.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

export interface FinancialContext {
  userId: string;
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  categories: any[];
  budgetGoals: any[];
  recentExpenses: any[];
  spendingPatterns: any;
}

export interface SpendingAnalysis {
  totalSpent: number;
  averageDaily: number;
  topCategories: any[];
  trends: any[];
  anomalies: any[];
}

export interface BudgetStatus {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  overBudgetCategories: Array<{
    category: string;
    budget: number;
    spent: number;
    overage: number;
    percentage: number;
  }>;
  underBudgetCategories: Array<{
    category: string;
    budget: number;
    spent: number;
    remaining: number;
    percentage: number;
  }>;
  onTrackCategories: Array<{
    category: string;
    budget: number;
    spent: number;
    remaining: number;
    percentage: number;
  }>;
}

@Injectable()
export class FinancialContextService {
  constructor(private prisma: PrismaService) {}

  async getUserFinancialContext(userId: string): Promise<FinancialContext> {
    const [income, expenses, categories, budgetGoals] = await Promise.all([
      this.getTotalIncome(userId),
      this.getTotalExpenses(userId),
      this.getUserCategories(userId),
      this.getUserBudgetGoals(userId),
    ]);

    const recentExpenses = await this.getRecentExpenses(userId, 30);
    const spendingPatterns = await this.analyzeSpendingPatterns(userId);

    return {
      userId,
      totalIncome: income,
      totalExpenses: expenses,
      netIncome: income - expenses,
      categories,
      budgetGoals,
      recentExpenses,
      spendingPatterns,
    };
  }

  async getSpendingAnalysis(
    userId: string,
    period: string,
  ): Promise<SpendingAnalysis> {
    const startDate = this.getPeriodStartDate(period);
    const expenses = await this.prisma.expense.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
        },
      },
      include: {
        category: true,
      },
    });

    const totalSpent = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0,
    );
    const daysInPeriod = this.getDaysInPeriod(period);
    const averageDaily = totalSpent / daysInPeriod;

    const categoryTotals = this.groupExpensesByCategory(expenses);
    const topCategories = this.getTopCategories(categoryTotals);
    const trends = this.analyzeTrends(expenses);
    const anomalies = this.detectAnomalies(expenses);

    return {
      totalSpent,
      averageDaily,
      topCategories,
      trends,
      anomalies,
    };
  }

  async getBudgetStatus(userId: string): Promise<BudgetStatus> {
    const currentMonth = new Date();
    const startOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1,
    );
    const endOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0,
    );

    const budgetGoals = await this.prisma.budgetGoal.findMany({
      where: {
        userId,
        startDate: { lte: endOfMonth },
        endDate: { gte: startOfMonth },
      },
      include: {
        category: true,
      },
    });

    const totalBudget = budgetGoals.reduce((sum, goal) => sum + goal.target, 0);

    const categorySpending = await this.getCategorySpending(
      userId,
      startOfMonth,
      endOfMonth,
    );

    const overBudgetCategories: Array<{
      category: string;
      budget: number;
      spent: number;
      overage: number;
      percentage: number;
    }> = [];
    const underBudgetCategories: Array<{
      category: string;
      budget: number;
      spent: number;
      remaining: number;
      percentage: number;
    }> = [];
    const onTrackCategories: Array<{
      category: string;
      budget: number;
      spent: number;
      remaining: number;
      percentage: number;
    }> = [];
    let totalSpent = 0;

    for (const goal of budgetGoals) {
      const spent = categorySpending[goal.categoryId] || 0;
      totalSpent += spent;

      const percentage = (spent / goal.target) * 100;

      if (percentage > 100) {
        overBudgetCategories.push({
          category: goal.category.name,
          budget: goal.target,
          spent,
          overage: spent - goal.target,
          percentage,
        });
      } else if (percentage < 80) {
        underBudgetCategories.push({
          category: goal.category.name,
          budget: goal.target,
          spent,
          remaining: goal.target - spent,
          percentage,
        });
      } else {
        onTrackCategories.push({
          category: goal.category.name,
          budget: goal.target,
          spent,
          remaining: goal.target - spent,
          percentage,
        });
      }
    }

    return {
      totalBudget,
      totalSpent,
      remaining: totalBudget - totalSpent,
      overBudgetCategories,
      underBudgetCategories,
      onTrackCategories,
    };
  }

  async getSavingsOpportunities(userId: string): Promise<any[]> {
    const spendingAnalysis = await this.getSpendingAnalysis(
      userId,
      'current_month',
    );
    const opportunities: any[] = [];

    // Analyze high-spending categories
    for (const category of spendingAnalysis.topCategories) {
      if (category.amount > 200) {
        // Categories with more than $200 spending
        opportunities.push({
          type: 'HIGH_SPENDING',
          category: category.name,
          currentAmount: category.amount,
          potentialSavings: category.amount * 0.2, // 20% potential savings
          suggestions: this.getSavingsSuggestions(category.name),
        });
      }
    }

    // Analyze recurring expenses
    const recurringExpenses = await this.getRecurringExpenses(userId);
    for (const expense of recurringExpenses) {
      opportunities.push({
        type: 'RECURRING_EXPENSE',
        description: expense.note || 'Recurring expense',
        currentAmount: expense.amount,
        potentialSavings: expense.amount * 0.1, // 10% potential savings
        suggestions: [
          'Review if this expense is necessary',
          'Look for cheaper alternatives',
        ],
      });
    }

    return opportunities;
  }

  async getUncategorizedExpenses(userId: string): Promise<any[]> {
    const expenses = await this.prisma.expense.findMany({
      where: {
        userId,
        category: {
          name: 'Uncategorized', // Assuming you have an uncategorized category
        },
      },
      orderBy: { date: 'desc' },
      take: 10,
    });

    return expenses.map((expense) => ({
      id: expense.id,
      amount: expense.amount,
      note: expense.note,
      date: expense.date,
      suggestedCategory: this.suggestCategory(expense.note || ''),
    }));
  }

  async getCurrentGoals(userId: string): Promise<any[]> {
    const goals = await this.prisma.budgetGoal.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { startDate: 'desc' },
    });

    return Promise.all(
      goals.map(async (goal) => ({
        id: goal.id,
        category: goal.category.name,
        target: goal.target,
        startDate: goal.startDate,
        endDate: goal.endDate,
        progress: await this.calculateGoalProgress(goal.id),
      })),
    );
  }

  async getSpendingTrends(userId: string): Promise<any> {
    const last6Months: Array<{
      month: string;
      total: number;
      count: number;
    }> = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const expenses = await this.prisma.expense.findMany({
        where: {
          userId,
          date: { gte: startOfMonth, lte: endOfMonth },
        },
      });

      const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      last6Months.push({
        month: date.toISOString().slice(0, 7),
        total,
        count: expenses.length,
      });
    }

    return {
      monthlyTrends: last6Months,
      averageMonthly:
        last6Months.reduce((sum, month) => sum + month.total, 0) / 6,
      trend: this.calculateTrend(last6Months),
    };
  }

  async getFinancialHealthScore(userId: string): Promise<number> {
    const context = await this.getUserFinancialContext(userId);
    const budgetStatus = await this.getBudgetStatus(userId);

    let score = 100;

    // Deduct points for overspending
    score -= budgetStatus.overBudgetCategories.length * 10;

    // Deduct points for negative net income
    if (context.netIncome < 0) {
      score -= 30;
    }

    // Add points for having budget goals
    if (context.budgetGoals.length > 0) {
      score += 10;
    }

    // Add points for good spending patterns
    if (
      budgetStatus.onTrackCategories.length >
      budgetStatus.overBudgetCategories.length
    ) {
      score += 15;
    }

    return Math.max(0, Math.min(100, score));
  }

  // Helper methods
  private async getTotalIncome(userId: string): Promise<number> {
    const incomes = await this.prisma.income.findMany({
      where: { userId },
    });
    return incomes.reduce((sum, income) => sum + income.amount, 0);
  }

  private async getTotalExpenses(userId: string): Promise<number> {
    const expenses = await this.prisma.expense.findMany({
      where: { userId },
    });
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }

  private async getUserCategories(userId: string): Promise<any[]> {
    return this.prisma.category.findMany({
      where: { userId },
    });
  }

  private async getUserBudgetGoals(userId: string): Promise<any[]> {
    return this.prisma.budgetGoal.findMany({
      where: { userId },
      include: { category: true },
    });
  }

  private async getRecentExpenses(
    userId: string,
    days: number,
  ): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.prisma.expense.findMany({
      where: {
        userId,
        date: { gte: startDate },
      },
      include: { category: true },
      orderBy: { date: 'desc' },
      take: 20,
    });
  }

  private async analyzeSpendingPatterns(userId: string): Promise<any> {
    const expenses = await this.getRecentExpenses(userId, 30);
    const categoryTotals = this.groupExpensesByCategory(expenses);
    const categoryValues = Object.values(categoryTotals) as any[];

    return {
      totalCategories: categoryValues.length,
      averagePerCategory:
        categoryValues.reduce((sum: number, cat: any) => sum + cat.amount, 0) /
        categoryValues.length,
      mostSpentCategory: this.getTopCategories(categoryTotals)[0],
    };
  }

  private getPeriodStartDate(period: string): Date {
    const now = new Date();
    switch (period) {
      case 'current_month':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case 'last_month':
        return new Date(now.getFullYear(), now.getMonth() - 1, 1);
      case 'last_30_days':
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return thirtyDaysAgo;
      default:
        return new Date(now.getFullYear(), now.getMonth(), 1);
    }
  }

  private getDaysInPeriod(period: string): number {
    switch (period) {
      case 'current_month':
        return new Date().getDate();
      case 'last_month':
        return new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          0,
        ).getDate();
      case 'last_30_days':
        return 30;
      default:
        return 30;
    }
  }

  private groupExpensesByCategory(expenses: any[]): any {
    const grouped = {};
    expenses.forEach((expense) => {
      const categoryName = expense.category?.name || 'Uncategorized';
      if (!grouped[categoryName]) {
        grouped[categoryName] = { name: categoryName, amount: 0, count: 0 };
      }
      grouped[categoryName].amount += expense.amount;
      grouped[categoryName].count += 1;
    });
    return grouped;
  }

  private getTopCategories(categoryTotals: any): any[] {
    return Object.values(categoryTotals)
      .sort((a: any, b: any) => b.amount - a.amount)
      .slice(0, 5);
  }

  private analyzeTrends(expenses: any[]): any[] {
    // Simple trend analysis - can be enhanced
    const dailyTotals = {};
    expenses.forEach((expense) => {
      const day = expense.date.toISOString().split('T')[0];
      dailyTotals[day] = (dailyTotals[day] || 0) + expense.amount;
    });

    return Object.entries(dailyTotals).map(([date, amount]) => ({
      date,
      amount,
    }));
  }

  private detectAnomalies(expenses: any[]): any[] {
    // Simple anomaly detection - can be enhanced
    const amounts = expenses.map((e) => e.amount);
    const average =
      amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
    const threshold = average * 2; // 2x average is considered anomaly

    return expenses
      .filter((expense) => expense.amount > threshold)
      .map((expense) => ({
        id: expense.id,
        amount: expense.amount,
        note: expense.note,
        date: expense.date,
        category: expense.category?.name,
      }));
  }

  private async getCategorySpending(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    const expenses = await this.prisma.expense.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      include: { category: true },
    });

    const categorySpending = {};
    expenses.forEach((expense) => {
      const categoryId = expense.categoryId;
      categorySpending[categoryId] =
        (categorySpending[categoryId] || 0) + expense.amount;
    });

    return categorySpending;
  }

  private getSavingsSuggestions(categoryName: string): string[] {
    const suggestions = {
      'Food & Dining': [
        'Meal plan for the week',
        'Cook at home more often',
        'Look for restaurant deals',
        'Buy generic brands',
      ],
      Transportation: [
        'Use public transportation',
        'Carpool with colleagues',
        'Walk or bike for short trips',
        'Compare gas prices',
      ],
      Entertainment: [
        'Look for free events',
        'Use streaming services instead of cable',
        'Find local deals and discounts',
        'Host gatherings at home',
      ],
    };

    return (
      suggestions[categoryName] || [
        'Review if this expense is necessary',
        'Look for cheaper alternatives',
        'Set a spending limit',
      ]
    );
  }

  private suggestCategory(note: string): string {
    const lowerNote = note.toLowerCase();

    if (
      lowerNote.includes('food') ||
      lowerNote.includes('restaurant') ||
      lowerNote.includes('grocery')
    ) {
      return 'Food & Dining';
    }
    if (
      lowerNote.includes('gas') ||
      lowerNote.includes('uber') ||
      lowerNote.includes('transport')
    ) {
      return 'Transportation';
    }
    if (
      lowerNote.includes('movie') ||
      lowerNote.includes('entertainment') ||
      lowerNote.includes('netflix')
    ) {
      return 'Entertainment';
    }
    if (
      lowerNote.includes('medical') ||
      lowerNote.includes('pharmacy') ||
      lowerNote.includes('health')
    ) {
      return 'Healthcare';
    }

    return 'Miscellaneous';
  }

  private async getRecurringExpenses(userId: string): Promise<any[]> {
    // This is a simplified version - in reality, you'd need more sophisticated logic
    const expenses = await this.prisma.expense.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 100,
    });

    // Group by note/description to find recurring patterns
    const grouped = {};
    expenses.forEach((expense) => {
      const key = expense.note || 'Unknown';
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(expense);
    });

    // Find expenses that appear multiple times
    const recurring: any[] = [];
    Object.entries(grouped).forEach(([note, expenseList]: [string, any[]]) => {
      if (expenseList.length >= 2) {
        recurring.push(expenseList[0]); // Take the most recent one
      }
    });

    return recurring;
  }

  private async calculateGoalProgress(goalId: string): Promise<number> {
    const goal = await this.prisma.budgetGoal.findUnique({
      where: { id: goalId },
    });

    if (!goal) return 0;

    const expenses = await this.prisma.expense.findMany({
      where: {
        categoryId: goal.categoryId,
        date: { gte: goal.startDate, lte: goal.endDate },
      },
    });

    const spent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    return Math.min(100, (spent / goal.target) * 100);
  }

  private calculateTrend(monthlyData: any[]): string {
    if (monthlyData.length < 2) return 'stable';

    const recent = monthlyData.slice(-2);
    const change =
      ((recent[1].total - recent[0].total) / recent[0].total) * 100;

    if (change > 10) return 'increasing';
    if (change < -10) return 'decreasing';
    return 'stable';
  }
}
