// src/admin/dto/admin-dashboard.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class MainPageStatisticsDto {
  @ApiProperty({ description: 'Total number of users', example: 1250 })
  totalUsers: number;

  @ApiProperty({ description: 'Active users (last 30 days)', example: 850 })
  activeUsers: number;

  @ApiProperty({ description: 'New users this month', example: 120 })
  newUsersThisMonth: number;

  @ApiProperty({ description: 'Total system income', example: 5000000.0 })
  totalSystemIncome: number;

  @ApiProperty({ description: 'Total system expenses', example: 4500000.0 })
  totalSystemExpenses: number;

  @ApiProperty({ description: 'System net balance', example: 500000.0 })
  systemNetBalance: number;

  @ApiProperty({ description: 'Total transactions count', example: 50000 })
  totalTransactions: number;

  @ApiProperty({ description: 'Total budget goals', example: 3500 })
  totalBudgetGoals: number;

  @ApiProperty({ description: 'Total categories created', example: 2500 })
  totalCategories: number;

  @ApiProperty({ description: 'Total AI chat interactions', example: 15000 })
  totalChatInteractions: number;

  @ApiProperty({ description: 'Most popular category', example: 'Food & Dining' })
  mostPopularCategory: string;

  @ApiProperty({ description: 'Average user balance', example: 4000.0 })
  averageUserBalance: number;
}

export class UserStatisticsDto {
  @ApiProperty({ description: 'Users by role breakdown' })
  usersByRole: {
    ADMIN: number;
    USER: number;
    PREMIUM: number;
    VIEWER: number;
    CUSTOMER_CARE: number;
  };

  @ApiProperty({ description: 'Email verified users count', example: 1100 })
  verifiedUsers: number;

  @ApiProperty({ description: 'Unverified users count', example: 150 })
  unverifiedUsers: number;

  @ApiProperty({ description: 'Users registered this week', example: 45 })
  newUsersThisWeek: number;

  @ApiProperty({ description: 'Users registered today', example: 5 })
  newUsersToday: number;

  @ApiProperty({ description: 'Users with active subscriptions (PREMIUM)', example: 320 })
  premiumUsers: number;

  @ApiProperty({ description: 'Percentage of premium users', example: 25.6 })
  premiumPercentage: number;

  @ApiProperty({ description: 'Users who logged in today', example: 150 })
  usersLoggedInToday: number;

  @ApiProperty({ description: 'Users who logged in this week', example: 650 })
  usersLoggedInThisWeek: number;

  @ApiProperty({ description: 'Average accounts per user', example: 3.5 })
  averageAccountsPerUser: number;
}

export class CustomerCareStatisticsDto {
  @ApiProperty({ description: 'Total customer care staff', example: 12 })
  totalCustomerCareStaff: number;

  @ApiProperty({ description: 'Active customer care staff (logged in today)', example: 8 })
  activeCustomerCareStaff: number;

  @ApiProperty({ description: 'Total support tickets (if implemented)', example: 0 })
  totalSupportTickets: number;

  @ApiProperty({ description: 'Open support tickets', example: 0 })
  openSupportTickets: number;

  @ApiProperty({ description: 'Resolved support tickets', example: 0 })
  resolvedSupportTickets: number;

  @ApiProperty({ description: 'Average response time (hours)', example: 2.5 })
  averageResponseTime: number;

  @ApiProperty({ description: 'Customer care activity this week', example: 45 })
  activityThisWeek: number;

  @ApiProperty({ description: 'Customer care activity today', example: 8 })
  activityToday: number;

  @ApiProperty({ description: 'Most active customer care staff', example: [] })
  mostActiveStaff: Array<{
    id: string;
    email: string;
    name: string;
    activityCount: number;
  }>;
}

export class AdminDashboardDto {
  @ApiProperty({ description: 'Main page statistics', type: MainPageStatisticsDto })
  mainPage: MainPageStatisticsDto;

  @ApiProperty({ description: 'User statistics', type: UserStatisticsDto })
  users: UserStatisticsDto;

  @ApiProperty({ description: 'Customer care statistics', type: CustomerCareStatisticsDto })
  customerCare: CustomerCareStatisticsDto;

  @ApiProperty({ description: 'Last updated timestamp', example: '2024-01-15T10:30:00.000Z' })
  lastUpdated: Date;
}

