// src/admin/subscription-management.controller.ts
import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseEnumPipe,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubscriptionPlan } from '@prisma/client';
import { SubscriptionManagementService } from './subscription-management.service';
import {
  AdminUpdateSubscriptionDto,
  AdminCancelSubscriptionDto,
  AdminReactivateSubscriptionDto,
} from './dto/manage-subscription.dto';
import { ErrorResponseDto, ValidationErrorResponseDto } from '../common/dto/error-response.dto';
import { MessageResponseDto } from '../common/dto/success-response.dto';

@ApiTags('Admin - Subscription Management')
@ApiBearerAuth()
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
  })
  @ApiOkResponse({
    description: 'Subscription retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Subscription not found',
    type: ErrorResponseDto,
  })
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
  })
  @ApiOkResponse({
    description: 'Subscription retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Subscription not found',
    type: ErrorResponseDto,
  })
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
  })
  @ApiOkResponse({
    description: 'Subscription updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input or operation',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Subscription not found',
    type: ErrorResponseDto,
  })
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
  })
  @ApiOkResponse({
    description: 'Subscription canceled successfully',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Subscription not found',
    type: ErrorResponseDto,
  })
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
  })
  @ApiOkResponse({
    description: 'Subscription reactivated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Subscription is already active',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Subscription not found',
    type: ErrorResponseDto,
  })
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
  })
  @ApiQuery({
    name: 'days',
    type: Number,
    description: 'Number of additional trial days (1-365)',
    example: 7,
  })
  @ApiOkResponse({
    description: 'Trial period extended successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid number of days or subscription has no trial',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Subscription not found',
    type: ErrorResponseDto,
  })
  async extendTrial(
    @Param('subscriptionId') subscriptionId: string,
    @Query('days', ParseIntPipe) days: number,
  ) {
    return this.subscriptionManagementService.extendTrial(subscriptionId, days);
  }
}

