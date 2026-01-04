import {
  Controller,
  Get,
  Put,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubscriptionManagementService } from './subscription-management.service';
import {
  AdminUpdateSubscriptionDto,
  AdminCancelSubscriptionDto,
  AdminReactivateSubscriptionDto,
} from './dto/manage-subscription.dto';
import { MessageResponseDto } from '../common/dto/success-response.dto';
import {
  ApiStandardErrorResponses,
  ApiSuccessResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
} from '../common/decorators/api-responses.decorator';

@ApiTags('Admin - Subscription Management')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/subscriptions')
export class SubscriptionManagementController {
  constructor(
    private readonly subscriptionManagementService: SubscriptionManagementService,
  ) {}

  @Get('user/:userId')
  @ApiOperation({
    summary: 'Get subscription by user ID',
    description: 'Retrieve subscription details for a specific user',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    example: 'clx1234567890abcdef',
    type: String,
  })
  @ApiOkResponse({
    description: 'Subscription retrieved successfully',
    schema: {
      type: 'object',
    },
  })
  @ApiNotFoundResponse('Subscription not found')
  @ApiForbiddenResponse('Forbidden - Admin access required')
  @ApiStandardErrorResponses()
  async getSubscriptionByUserId(@Param('userId') userId: string) {
    return this.subscriptionManagementService.getUserSubscription(userId);
  }

  @Get(':subscriptionId')
  @ApiOperation({
    summary: 'Get subscription by ID',
    description: 'Retrieve subscription details by subscription ID',
  })
  @ApiParam({
    name: 'subscriptionId',
    description: 'Subscription ID',
    example: 'clx1234567890abcdef',
    type: String,
  })
  @ApiOkResponse({
    description: 'Subscription retrieved successfully',
    schema: {
      type: 'object',
    },
  })
  @ApiNotFoundResponse('Subscription not found')
  @ApiForbiddenResponse('Forbidden - Admin access required')
  @ApiStandardErrorResponses()
  async getSubscriptionById(@Param('subscriptionId') subscriptionId: string) {
    return this.subscriptionManagementService.getSubscriptionById(subscriptionId);
  }

  @Put(':subscriptionId')
  @ApiOperation({
    summary: 'Update subscription',
    description: 'Admin update subscription plan, status, or other properties',
  })
  @ApiParam({
    name: 'subscriptionId',
    description: 'Subscription ID',
    example: 'clx1234567890abcdef',
    type: String,
  })
  @ApiBody({ type: AdminUpdateSubscriptionDto })
  @ApiOkResponse({
    description: 'Subscription updated successfully',
    schema: { type: 'object' },
  })
  @ApiNotFoundResponse('Subscription not found')
  @ApiForbiddenResponse('Forbidden - Admin access required')
  @ApiStandardErrorResponses()
  async updateSubscription(
    @Param('subscriptionId') subscriptionId: string,
    @Body() dto: AdminUpdateSubscriptionDto,
  ) {
    return this.subscriptionManagementService.updateSubscription(
      subscriptionId,
      dto,
    );
  }

  @Post(':subscriptionId/cancel')
  @ApiOperation({
    summary: 'Cancel subscription',
    description:
      'Cancel a subscription immediately or schedule cancellation at period end',
  })
  @ApiParam({
    name: 'subscriptionId',
    description: 'Subscription ID',
    example: 'clx1234567890abcdef',
    type: String,
  })
  @ApiBody({ type: AdminCancelSubscriptionDto })
  @ApiSuccessResponse(MessageResponseDto, 'Subscription canceled successfully')
  @ApiNotFoundResponse('Subscription not found')
  @ApiForbiddenResponse('Forbidden - Admin access required')
  @ApiStandardErrorResponses()
  async cancelSubscription(
    @Param('subscriptionId') subscriptionId: string,
    @Body() dto: AdminCancelSubscriptionDto,
  ) {
    return this.subscriptionManagementService.cancelSubscription(
      subscriptionId,
      dto,
    );
  }

  @Post(':subscriptionId/reactivate')
  @ApiOperation({
    summary: 'Reactivate subscription',
    description: 'Reactivate a canceled or scheduled-for-cancellation subscription',
  })
  @ApiParam({
    name: 'subscriptionId',
    description: 'Subscription ID',
    example: 'clx1234567890abcdef',
    type: String,
  })
  @ApiBody({ type: AdminReactivateSubscriptionDto })
  @ApiOkResponse({
    description: 'Subscription reactivated successfully',
    schema: { type: 'object' },
  })
  @ApiNotFoundResponse('Subscription not found')
  @ApiForbiddenResponse('Forbidden - Admin access required')
  @ApiStandardErrorResponses()
  async reactivateSubscription(
    @Param('subscriptionId') subscriptionId: string,
    @Body() dto: AdminReactivateSubscriptionDto,
  ) {
    return this.subscriptionManagementService.reactivateSubscription(
      subscriptionId,
      dto,
    );
  }

  @Post(':subscriptionId/extend-trial')
  @ApiOperation({
    summary: 'Extend trial period',
    description: 'Extend the trial period for a subscription by additional days',
  })
  @ApiParam({
    name: 'subscriptionId',
    description: 'Subscription ID',
    example: 'clx1234567890abcdef',
    type: String,
  })
  @ApiQuery({
    name: 'days',
    type: Number,
    description: 'Number of additional trial days (1-365)',
    example: 7,
    required: true,
  })
  @ApiOkResponse({
    description: 'Trial period extended successfully',
    schema: { type: 'object' },
  })
  @ApiNotFoundResponse('Subscription not found')
  @ApiForbiddenResponse('Forbidden - Admin access required')
  @ApiStandardErrorResponses()
  async extendTrial(
    @Param('subscriptionId') subscriptionId: string,
    @Query('days', ParseIntPipe) days: number,
  ) {
    return this.subscriptionManagementService.extendTrial(subscriptionId, days);
  }
}
