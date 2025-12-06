// src/analytics/activity-analytics.controller.ts
import {
  Controller,
  Get,
  UseGuards,
  Req,
  Query,
  Param,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { ActivityTrackingService } from './activity-tracking.service';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { ActivityType } from '@prisma/client';

@ApiTags('Activity Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics/activities')
export class ActivityAnalyticsController {
  constructor(
    private readonly activityTracking: ActivityTrackingService,
  ) {}

  @Get('my-activities')
  @ApiOperation({
    summary: 'Get my activity logs',
    description: 'Get activity logs for the authenticated user',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: 'string',
    description: 'Start date (ISO 8601 format)',
    example: '2024-01-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: 'string',
    description: 'End date (ISO 8601 format)',
    example: '2024-12-31T23:59:59.000Z',
  })
  @ApiQuery({
    name: 'activityType',
    required: false,
    enum: ActivityType,
    description: 'Filter by activity type',
  })
  @ApiQuery({
    name: 'entityType',
    required: false,
    type: 'string',
    description: 'Filter by entity type (e.g., "Expense", "Income")',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: 'number',
    description: 'Number of results to return',
    example: 100,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: 'number',
    description: 'Number of results to skip',
    example: 0,
  })
  @ApiOkResponse({
    description: 'Activity logs retrieved successfully',
  })
  async getMyActivities(
    @Req() req: Request,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('activityType') activityType?: ActivityType,
    @Query('entityType') entityType?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const user = req.user as { sub: string };
    return this.activityTracking.getUserActivities(user.sub, {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      activityType,
      entityType,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  @Get('statistics')
  @ApiOperation({
    summary: 'Get activity statistics',
    description:
      'Get activity statistics for the authenticated user or all users (admin only)',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: 'string',
    description: 'Start date (ISO 8601 format)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: 'string',
    description: 'End date (ISO 8601 format)',
  })
  @ApiOkResponse({
    description: 'Activity statistics retrieved successfully',
  })
  async getActivityStatistics(
    @Req() req: Request,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const user = req.user as { sub: string; role: string };
    const userId = user.role === 'ADMIN' ? undefined : user.sub;
    return this.activityTracking.getActivityStatistics(
      userId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('most-active-users')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'CUSTOMER_CARE')
  @ApiOperation({
    summary: 'Get most active users (Admin/Customer Care only)',
    description: 'Get list of most active users based on activity count',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: 'number',
    description: 'Number of users to return',
    example: 10,
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: 'string',
    description: 'Start date (ISO 8601 format)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: 'string',
    description: 'End date (ISO 8601 format)',
  })
  @ApiOkResponse({
    description: 'Most active users retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin or Customer Care access required',
    type: ErrorResponseDto,
  })
  async getMostActiveUsers(
    @Query('limit') limit?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.activityTracking.getMostActiveUsers(
      limit ? parseInt(limit, 10) : 10,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('user/:userId')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'CUSTOMER_CARE')
  @ApiOperation({
    summary: 'Get activity logs for a specific user (Admin/Customer Care only)',
    description: 'View activity logs for any user',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID to get activities for',
    type: 'string',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: 'string',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: 'string',
  })
  @ApiOkResponse({
    description: 'User activity logs retrieved successfully',
  })
  async getUserActivities(
    @Param('userId') userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.activityTracking.getUserActivities(userId, {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }
}

