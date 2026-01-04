import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseEnumPipe,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';
import { SubscriptionAnalyticsService } from './subscription-analytics.service';
import {
  SubscriptionAnalyticsDto,
  SubscriptionTrendDto,
  SubscriptionDetailsDto,
} from './dto/subscription-analytics.dto';
import {
  ApiStandardErrorResponses,
  ApiSuccessResponse,
  ApiForbiddenResponse,
} from '../common/decorators/api-responses.decorator';

@ApiTags('Admin - Subscription Analytics')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/subscription-analytics')
export class SubscriptionAnalyticsController {
  constructor(
    private readonly subscriptionAnalyticsService: SubscriptionAnalyticsService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get comprehensive subscription analytics',
    description:
      'Retrieve overall subscription metrics including counts, revenue estimates, and breakdowns by plan and status',
  })
  @ApiSuccessResponse(SubscriptionAnalyticsDto, 'Subscription analytics retrieved successfully')
  @ApiForbiddenResponse('Forbidden - Admin access required')
  @ApiStandardErrorResponses()
  async getAnalytics(): Promise<SubscriptionAnalyticsDto> {
    return this.subscriptionAnalyticsService.getSubscriptionAnalytics();
  }

  @Get('trends')
  @ApiOperation({
    summary: 'Get subscription trends over time',
    description:
      'Retrieve subscription trends showing new subscriptions, cancellations, and net changes over a specified period',
  })
  @ApiQuery({
    name: 'days',
    required: false,
    type: Number,
    description: 'Number of days to analyze (default: 30, max: 365)',
    example: 30,
  })
  @ApiOkResponse({
    description: 'Subscription trends retrieved successfully',
    type: [SubscriptionTrendDto],
  })
  @ApiForbiddenResponse('Forbidden - Admin access required')
  @ApiStandardErrorResponses()
  async getTrends(
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
  ): Promise<SubscriptionTrendDto[]> {
    const validDays = Math.min(Math.max(days, 1), 365);
    return this.subscriptionAnalyticsService.getSubscriptionTrends(validDays);
  }

  @Get('details')
  @ApiOperation({
    summary: 'Get detailed subscription list',
    description:
      'Retrieve detailed list of subscriptions with optional filtering by status and plan',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: SubscriptionStatus,
    description: 'Filter by subscription status',
  })
  @ApiQuery({
    name: 'plan',
    required: false,
    enum: SubscriptionPlan,
    description: 'Filter by subscription plan',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of results to return (default: 50, max: 100)',
    example: 50,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Number of results to skip (default: 0)',
    example: 0,
  })
  @ApiOkResponse({
    description: 'Subscription details retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        subscriptions: {
          type: 'array',
          items: { $ref: '#/components/schemas/SubscriptionDetailsDto' },
        },
        total: { type: 'number', example: 150 },
      },
    },
  })
  @ApiForbiddenResponse('Forbidden - Admin access required')
  @ApiStandardErrorResponses()
  async getDetails(
    @Query('status') status?: SubscriptionStatus,
    @Query('plan', new ParseEnumPipe(SubscriptionPlan, { optional: true })) plan?: SubscriptionPlan,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
  ): Promise<{ subscriptions: SubscriptionDetailsDto[]; total: number }> {
    const validLimit = Math.min(Math.max(limit || 50, 1), 100);
    return this.subscriptionAnalyticsService.getSubscriptionDetails(
      status,
      plan,
      validLimit,
      offset || 0,
    );
  }
}
