import { ApiProperty } from '@nestjs/swagger';

export class UserAnalyticsDto {
  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'User email' })
  email: string;

  @ApiProperty({ description: 'User name' })
  name: string;

  @ApiProperty({ description: 'Total income count' })
  totalIncomes: number;

  @ApiProperty({ description: 'Total expense count' })
  totalExpenses: number;

  @ApiProperty({ description: 'Total budget goals count' })
  totalBudgetGoals: number;

  @ApiProperty({ description: 'Total categories count' })
  totalCategories: number;

  @ApiProperty({ description: 'Total income amount' })
  totalIncomeAmount: number;

  @ApiProperty({ description: 'Total expense amount' })
  totalExpenseAmount: number;

  @ApiProperty({ description: 'Net balance (income - expenses)' })
  netBalance: number;

  @ApiProperty({ description: 'Account creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last activity date' })
  lastActivity: Date;
}

export class MonthlyAnalyticsDto {
  @ApiProperty({ description: 'Month (YYYY-MM format)' })
  month: string;

  @ApiProperty({ description: 'Total income for the month' })
  totalIncome: number;

  @ApiProperty({ description: 'Total expenses for the month' })
  totalExpenses: number;

  @ApiProperty({ description: 'Net balance for the month' })
  netBalance: number;

  @ApiProperty({ description: 'Income count for the month' })
  incomeCount: number;

  @ApiProperty({ description: 'Expense count for the month' })
  expenseCount: number;
}

export class CategoryAnalyticsDto {
  @ApiProperty({ description: 'Category ID' })
  categoryId: string;

  @ApiProperty({ description: 'Category name' })
  categoryName: string;

  @ApiProperty({ description: 'Total amount spent in this category' })
  totalAmount: number;

  @ApiProperty({ description: 'Number of transactions in this category' })
  transactionCount: number;

  @ApiProperty({ description: 'Percentage of total expenses' })
  percentage: number;
}

export class BudgetGoalAnalyticsDto {
  @ApiProperty({ description: 'Budget goal ID' })
  goalId: string;

  @ApiProperty({ description: 'Goal name' })
  goalName: string;

  @ApiProperty({ description: 'Target amount' })
  targetAmount: number;

  @ApiProperty({ description: 'Current progress amount' })
  currentAmount: number;

  @ApiProperty({ description: 'Progress percentage' })
  progressPercentage: number;

  @ApiProperty({ description: 'Goal status' })
  status: 'ON_TRACK' | 'AT_RISK' | 'EXCEEDED' | 'COMPLETED';
}

export class AdminAnalyticsDto {
  @ApiProperty({ description: 'Total users count' })
  totalUsers: number;

  @ApiProperty({ description: 'Active users count (logged in last 30 days)' })
  activeUsers: number;

  @ApiProperty({ description: 'New users this month' })
  newUsersThisMonth: number;

  @ApiProperty({ description: 'Total income across all users' })
  totalSystemIncome: number;

  @ApiProperty({ description: 'Total expenses across all users' })
  totalSystemExpenses: number;

  @ApiProperty({ description: 'System net balance' })
  systemNetBalance: number;

  @ApiProperty({ description: 'Most popular category' })
  mostPopularCategory: string;

  @ApiProperty({ description: 'Average user balance' })
  averageUserBalance: number;

  @ApiProperty({ description: 'User analytics by role' })
  usersByRole: {
    ADMIN: number;
    USER: number;
  };

  @ApiProperty({ description: 'Monthly system analytics' })
  monthlySystemAnalytics: MonthlyAnalyticsDto[];
}

export class DashboardAnalyticsDto {
  @ApiProperty({ description: 'User-specific analytics' })
  userAnalytics: UserAnalyticsDto;

  @ApiProperty({ description: 'Monthly analytics for the last 6 months' })
  monthlyAnalytics: MonthlyAnalyticsDto[];

  @ApiProperty({ description: 'Category breakdown' })
  categoryAnalytics: CategoryAnalyticsDto[];

  @ApiProperty({ description: 'Budget goals progress' })
  budgetGoalsAnalytics: BudgetGoalAnalyticsDto[];

  @ApiProperty({ description: 'Admin analytics (only for ADMIN users)' })
  adminAnalytics?: AdminAnalyticsDto;
}
