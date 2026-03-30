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
  ApiQuery,
} from '@nestjs/swagger';
import {
  DashboardAnalyticsDto,
  UserAnalyticsDto,
  MonthlyAnalyticsDto,
  CategoryAnalyticsDto,
  BudgetAnalyticsDto,
  AdminAnalyticsDto,
} from './dto/analytics-response.dto';
import {
  ApiStandardErrorResponses,
  ApiSuccessResponse,
  ApiForbiddenResponse,
} from '../common/decorators/api-responses.decorator';
import { ApiOkResponse } from '@nestjs/swagger';

@ApiTags('Analytics')
@ApiBearerAuth('JWT-auth')
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) { }

  @Get('dashboard')
  @Roles('ADMIN', 'USER', 'PREMIUM')
  @ApiOperation({
    summary: 'Get dashboard analytics',
    description: 'Get comprehensive dashboard analytics including spending, income, budgets, and trends. Responses are cached for 10 minutes.',
  })
  @ApiSuccessResponse(DashboardAnalyticsDto, 'Dashboard analytics retrieved successfully')
  @ApiForbiddenResponse('Forbidden - Premium feature (USER role limited)')
  @ApiStandardErrorResponses()
  async getDashboardAnalytics(@Req() req: Request) {
    const user = req.user as { sub: string; role: string };
    return this.analyticsService.getDashboardAnalytics(user.sub, user.role);
  }

  @Get('user')
  @Roles('ADMIN', 'USER', 'PREMIUM')
  @ApiOperation({
    summary: 'Get user analytics',
    description: 'Get user-specific analytics including spending patterns and financial health metrics',
  })
  @ApiSuccessResponse(UserAnalyticsDto, 'User analytics retrieved successfully')
  @ApiForbiddenResponse('Forbidden - Premium feature (USER role limited)')
  @ApiStandardErrorResponses()
  async getUserAnalytics(@Req() req: Request) {
    const user = req.user as { sub: string; role: string };
    return this.analyticsService.getUserAnalytics(user.sub);
  }

  @Get('monthly')
  @Roles('ADMIN', 'USER', 'PREMIUM')
  @ApiOperation({
    summary: 'Get monthly analytics',
    description: 'Get monthly analytics for the last N months with detailed breakdowns',
  })
  @ApiQuery({
    name: 'months',
    required: false,
    type: Number,
    description: 'Number of months to retrieve (defaults to 6)',
    example: 6,
    minimum: 1,
    maximum: 24,
  })
  @ApiSuccessResponse(MonthlyAnalyticsDto, 'Monthly analytics retrieved successfully')
  @ApiForbiddenResponse('Forbidden - Premium feature (USER role limited)')
  @ApiStandardErrorResponses()
  async getMonthlyAnalytics(
    @Req() req: Request,
    @Query('months', new DefaultValuePipe(6), ParseIntPipe) months?: number,
  ) {
    const user = req.user as { sub: string; role: string };
    return this.analyticsService.getMonthlyAnalytics(user.sub, months || 6);
  }

  @Get('category')
  @Roles('ADMIN', 'USER', 'PREMIUM')
  @ApiOperation({
    summary: 'Get category analytics',
    description: 'Get analytics broken down by expense categories',
  })
  @ApiSuccessResponse(CategoryAnalyticsDto, 'Category analytics retrieved successfully')
  @ApiForbiddenResponse('Forbidden - Premium feature (USER role limited)')
  @ApiStandardErrorResponses()
  async getCategoryAnalytics(@Req() req: Request) {
    const user = req.user as { sub: string; role: string };
    return this.analyticsService.getCategoryAnalytics(user.sub);
  }

  @Get('budget')
  @Roles('ADMIN', 'USER', 'PREMIUM')
  @ApiOperation({
    summary: 'Get budget goal analytics',
    description: 'Get analytics for all budget goals including progress and performance',
  })
  @ApiSuccessResponse(BudgetAnalyticsDto, 'Budget analytics retrieved successfully')
  @ApiForbiddenResponse('Forbidden - Premium feature (USER role limited)')
  @ApiStandardErrorResponses()
  async getBudgetGoalAnalytics(@Req() req: Request) {
    const user = req.user as { sub: string; role: string };
    return this.analyticsService.getBudgetGoalsAnalytics(user.sub);
  }

  @Get('admin')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Get admin analytics',
    description: 'Get system-wide analytics. Available only to Admins.',
  })
  @ApiSuccessResponse(AdminAnalyticsDto, 'Admin analytics retrieved successfully')
  @ApiForbiddenResponse('Forbidden - Admin access required')
  @ApiStandardErrorResponses()
  async getAdminAnalytics() {
    return this.analyticsService.getAdminAnalytics();
  }
}
