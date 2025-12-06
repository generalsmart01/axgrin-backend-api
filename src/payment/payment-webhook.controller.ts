// src/payment/payment-webhook.controller.ts
import {
  Controller,
  Post,
  Headers,
  Req,
  RawBodyRequest,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { PaymentService } from './payment.service';
import Stripe from 'stripe';

/**
 * Separate webhook controller that doesn't require authentication
 * Stripe webhooks need to be accessible without JWT tokens
 */
@Controller('payment/webhook')
export class PaymentWebhookController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not configured');
      return { received: false, error: 'Webhook secret not configured' };
    }

    // Access raw body - Express needs to be configured to parse raw body for webhooks
    const rawBody = req.rawBody;

    if (!rawBody) {
      return { received: false, error: 'No request body' };
    }

    if (!signature) {
      return { received: false, error: 'No Stripe signature' };
    }

    let event: Stripe.Event;

    try {
      // Get Stripe instance from service
      const stripe = this.paymentService.getStripe();
      if (!stripe) {
        return { received: false, error: 'Stripe not configured' };
      }

      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return { received: false, error: 'Webhook signature verification failed' };
    }

    await this.paymentService.handleWebhook(event);

    return { received: true };
  }
}

