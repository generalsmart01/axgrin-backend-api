// src/payment/payment.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiResponse,
} from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { ErrorResponseDto, ValidationErrorResponseDto } from '../common/dto/error-response.dto';
import { MessageResponseDto } from '../common/dto/success-response.dto';

@ApiTags('Payment & Subscriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('checkout')
  @ApiOperation({
    summary: 'Create checkout session for premium subscription',
    description:
      'Create a Stripe checkout session to subscribe to premium. Returns a URL to redirect the user to Stripe payment page.',
  })
  @ApiCreatedResponse({
    description: 'Checkout session created successfully',
    schema: {
      type: 'object',
      properties: {
        sessionId: {
          type: 'string',
          example: 'cs_test_...',
        },
        url: {
          type: 'string',
          example: 'https://checkout.stripe.com/pay/cs_test_...',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid plan or user already has active subscription',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    type: ErrorResponseDto,
  })
  async createCheckout(
    @Body() dto: CreateCheckoutDto,
    @Req() req: Request,
  ) {
    const user = req.user as { sub: string };
    return this.paymentService.createCheckoutSession(user.sub, dto);
  }

  @Get('subscription/status')
  @ApiOperation({
    summary: 'Get my subscription status',
    description: 'Get current subscription status and premium access information',
  })
  @ApiOkResponse({
    description: 'Subscription status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        hasSubscription: { type: 'boolean' },
        isPremium: { type: 'boolean' },
        isActive: { type: 'boolean' },
        subscription: {
          type: 'object',
          nullable: true,
          properties: {
            id: { type: 'string' },
            plan: { type: 'string', enum: ['MONTHLY', 'YEARLY'] },
            status: { type: 'string' },
            currentPeriodStart: { type: 'string', format: 'date-time' },
            currentPeriodEnd: { type: 'string', format: 'date-time' },
            cancelAtPeriodEnd: { type: 'boolean' },
            trialEnd: { type: 'string', format: 'date-time', nullable: true },
          },
        },
      },
    },
  })
  async getSubscriptionStatus(@Req() req: Request) {
    const user = req.user as { sub: string };
    return this.paymentService.getSubscriptionStatus(user.sub);
  }

  @Post('subscription/cancel')
  @ApiOperation({
    summary: 'Cancel subscription',
    description:
      'Cancel premium subscription. Subscription will remain active until the end of the current billing period.',
  })
  @ApiOkResponse({
    description: 'Subscription cancellation scheduled',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Active subscription not found',
    type: ErrorResponseDto,
  })
  async cancelSubscription(@Req() req: Request) {
    const user = req.user as { sub: string };
    return this.paymentService.cancelSubscription(user.sub);
  }

  @Post('subscription/reactivate')
  @ApiOperation({
    summary: 'Reactivate canceled subscription',
    description:
      'Reactivate a subscription that was scheduled for cancellation',
  })
  @ApiOkResponse({
    description: 'Subscription reactivated successfully',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Subscription not found',
    type: ErrorResponseDto,
  })
  async reactivateSubscription(@Req() req: Request) {
    const user = req.user as { sub: string };
    return this.paymentService.reactivateSubscription(user.sub);
  }

  @Post('customer-portal')
  @ApiOperation({
    summary: 'Get Stripe customer portal URL',
    description:
      'Get a URL to access Stripe customer portal where users can manage their subscription, payment methods, and billing history',
  })
  @ApiOkResponse({
    description: 'Customer portal URL generated successfully',
    schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          example: 'https://billing.stripe.com/p/session_...',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Subscription not found',
    type: ErrorResponseDto,
  })
  async getCustomerPortal(@Req() req: Request) {
    const user = req.user as { sub: string };
    return this.paymentService.getCustomerPortalUrl(user.sub);
  }
}
