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
  ApiBody,
  ApiOkResponse,
} from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { SubscriptionStatusDto } from './dto/subscription-status.dto';
import { CheckoutResponseDto } from './dto/checkout-response.dto';
import {
  ApiStandardResponses,
  ApiStandardErrorResponses,
  ApiSuccessResponse,
  ApiNotFoundResponse,
} from '../common/decorators/api-responses.decorator';
import { MessageResponseDto } from '../common/dto/success-response.dto';

@ApiTags('Payment & Subscriptions')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('checkout')
  @ApiOperation({
    summary: 'Create checkout session',
    description: 'Create a Stripe checkout session to subscribe to premium. Returns a URL to redirect the user to Stripe payment page. Trial periods are applied automatically based on subscription configuration.',
  })
  @ApiBody({ type: CreateCheckoutDto })
  @ApiStandardResponses(CheckoutResponseDto, 'Checkout session created successfully', true)
  @ApiStandardErrorResponses()
  async createCheckout(
    @Body() dto: CreateCheckoutDto,
    @Req() req: Request,
  ) {
    const user = req.user as { sub: string };
    return this.paymentService.createCheckoutSession(user.sub, dto);
  }

  @Get('subscription/status')
  @ApiOperation({
    summary: 'Get subscription status',
    description: 'Get current subscription status and premium access information for the authenticated user',
  })
  @ApiOkResponse({
    description: 'Subscription status retrieved successfully',
    type: SubscriptionStatusDto,
  })
  @ApiStandardErrorResponses()
  async getSubscriptionStatus(@Req() req: Request) {
    const user = req.user as { sub: string };
    return this.paymentService.getSubscriptionStatus(user.sub);
  }

  @Post('subscription/cancel')
  @ApiOperation({
    summary: 'Cancel subscription',
    description: 'Cancel the current subscription. The subscription will remain active until the end of the current billing period, then the user will be downgraded to USER role.',
  })
  @ApiSuccessResponse(MessageResponseDto, 'Subscription cancellation scheduled successfully')
  @ApiNotFoundResponse('Active subscription not found')
  @ApiStandardErrorResponses()
  async cancelSubscription(@Req() req: Request) {
    const user = req.user as { sub: string };
    return this.paymentService.cancelSubscription(user.sub);
  }

  @Post('subscription/reactivate')
  @ApiOperation({
    summary: 'Reactivate subscription',
    description: 'Reactivate a canceled subscription before the current period ends',
  })
  @ApiSuccessResponse(MessageResponseDto, 'Subscription reactivated successfully')
  @ApiNotFoundResponse('Subscription not found')
  @ApiStandardErrorResponses()
  async reactivateSubscription(@Req() req: Request) {
    const user = req.user as { sub: string };
    return this.paymentService.reactivateSubscription(user.sub);
  }

  @Post('customer-portal')
  @ApiOperation({
    summary: 'Get customer portal URL',
    description: 'Get a Stripe customer portal URL where users can manage their subscription, update payment methods, and view billing history',
  })
  @ApiOkResponse({
    description: 'Customer portal URL generated successfully',
    schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          example: 'https://billing.stripe.com/p/session_...',
          description: 'Stripe customer portal URL',
        },
      },
    },
  })
  @ApiStandardErrorResponses()
  async getCustomerPortal(@Req() req: Request) {
    const user = req.user as { sub: string };
    return this.paymentService.getCustomerPortalUrl(user.sub);
  }
}
