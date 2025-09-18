import {
  Controller,
  Get,
  UseGuards,
  Req,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { Request } from 'express';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import {
  DashboardAnalyticsDto,
  UserAnalyticsDto,
  MonthlyAnalyticsDto,
  CategoryAnalyticsDto,
  BudgetGoalAnalyticsDto,
  AdminAnalyticsDto,
} from './dto/analytics-response.dto';
import {
  ErrorResponseDto,
  ValidationErrorResponseDto,
} from '../common/dto/error-response.dto';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @Roles('ADMIN', 'USER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get comprehensive dashboard analytics' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard analytics retrieved successfully',
    type: DashboardAnalyticsDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  async getDashboardAnalytics(@Req() req: Request) {
    const user = req.user as { sub: string; role: string };
    return this.analyticsService.getDashboardAnalytics(user.sub, user.role);
  }

  @Get('user')
  @Roles('ADMIN', 'USER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user-specific analytics' })
  @ApiResponse({
    status: 200,
    description: 'User analytics retrieved successfully',
    type: UserAnalyticsDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  async getUserAnalytics(@Req() req: Request) {
    const user = req.user as { sub: string };
    return this.analyticsService.getUserAnalytics(user.sub);
  }

  @Get('monthly')
  @Roles('ADMIN', 'USER')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get monthly analytics for the specified number of months',
  })
  @ApiQuery({
    name: 'months',
    description: 'Number of months to retrieve (default: 6)',
    required: false,
    type: 'number',
    example: 6,
  })
  @ApiResponse({
    status: 200,
    description: 'Monthly analytics retrieved successfully',
    type: [MonthlyAnalyticsDto],
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid months parameter',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  async getMonthlyAnalytics(
    @Req() req: Request,
    @Query('months', new DefaultValuePipe(6), ParseIntPipe) months: number,
  ) {
    const user = req.user as { sub: string };
    return this.analyticsService.getMonthlyAnalytics(user.sub, months);
  }

  @Get('categories')
  @Roles('ADMIN', 'USER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get category breakdown analytics' })
  @ApiResponse({
    status: 200,
    description: 'Category analytics retrieved successfully',
    type: [CategoryAnalyticsDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  async getCategoryAnalytics(@Req() req: Request) {
    const user = req.user as { sub: string };
    return this.analyticsService.getCategoryAnalytics(user.sub);
  }

  @Get('budget-goals')
  @Roles('ADMIN', 'USER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get budget goals progress analytics' })
  @ApiResponse({
    status: 200,
    description: 'Budget goals analytics retrieved successfully',
    type: [BudgetGoalAnalyticsDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  async getBudgetGoalsAnalytics(@Req() req: Request) {
    const user = req.user as { sub: string };
    return this.analyticsService.getBudgetGoalsAnalytics(user.sub);
  }

  @Get('admin')
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get admin analytics (ADMIN only)' })
  @ApiResponse({
    status: 200,
    description: 'Admin analytics retrieved successfully',
    type: AdminAnalyticsDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  async getAdminAnalytics() {
    return this.analyticsService.getAdminAnalytics();
  }
}
