// src/payment/payment.service.ts
import { Injectable, BadRequestException, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import Stripe from 'stripe';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { SubscriptionPlan, SubscriptionStatus, Role } from '@prisma/client';
import { RoleUpgradeService } from '../auth/services/role-upgrade.service';
import { NotificationService } from '../notification/notification.service';
import { SubscriptionConfigService } from '../admin/subscription-config.service';

@Injectable()
export class PaymentService {
  public stripe: Stripe | null = null;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    @Inject(forwardRef(() => RoleUpgradeService))
    private roleUpgradeService: RoleUpgradeService,
    private notificationService: NotificationService,
    @Inject(forwardRef(() => SubscriptionConfigService))
    private subscriptionConfigService: SubscriptionConfigService,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      console.warn('STRIPE_SECRET_KEY not found. Payment features will be disabled.');
    } else {
      this.stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2025-11-17.clover',
      });
    }
  }

  /**
   * Get Stripe instance (for webhook verification)
   */
  getStripe(): Stripe | null {
    return this.stripe;
  }

  /**
   * Create Stripe checkout session for premium subscription
   */
  async createCheckoutSession(
    userId: string,
    dto: CreateCheckoutDto,
  ): Promise<{ sessionId: string; url: string }> {
    if (!this.stripe) {
      throw new BadRequestException('Payment system is not configured');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user already has active subscription
    const existingSubscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (existingSubscription && existingSubscription.status === 'ACTIVE') {
      throw new BadRequestException('User already has an active subscription');
    }

    // Get or create Stripe customer
    let customerId = existingSubscription?.stripeCustomerId;
    if (!customerId) {
      const customer = await this.stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
        },
      });
      customerId = customer.id;
    }

    // Get subscription configuration (price ID and trial days)
    const config = await this.subscriptionConfigService.getActiveConfigByPlan(dto.plan);
    
    if (!config) {
      throw new BadRequestException(
        `Subscription plan ${dto.plan} is not configured or is inactive`,
      );
    }

    if (!config.isActive) {
      throw new BadRequestException(
        `Subscription plan ${dto.plan} is currently inactive`,
      );
    }

    // Build subscription data with trial period if configured
    const subscriptionData: Stripe.Checkout.SessionCreateParams.SubscriptionData = {
      metadata: {
        userId: user.id,
        plan: dto.plan,
      },
    };

    // Add trial period if trial days are configured
    if (config.trialDays > 0) {
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + config.trialDays);
      subscriptionData.trial_end = Math.floor(trialEnd.getTime() / 1000);
    }

    // Create checkout session
    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: config.stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      subscription_data: subscriptionData,
      success_url: dto.successUrl || `${this.configService.get('FRONTEND_URL')}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: dto.cancelUrl || `${this.configService.get('FRONTEND_URL')}/subscription/cancel`,
      metadata: {
        userId: user.id,
        plan: dto.plan,
      },
    });

    // Save or update subscription record
    await this.prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        stripeCustomerId: customerId,
        plan: dto.plan,
        status: SubscriptionStatus.INCOMPLETE,
      },
      update: {
        stripeCustomerId: customerId,
        plan: dto.plan,
        status: SubscriptionStatus.INCOMPLETE,
      },
    });

    return {
      sessionId: session.id,
      url: session.url || '',
    };
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhook(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  /**
   * Get user's subscription status
   */
  async getSubscriptionStatus(userId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!subscription) {
      return {
        hasSubscription: false,
        isPremium: false,
        subscription: null,
      };
    }

    const isPremium = subscription.user.role === Role.PREMIUM;
    const isActive = subscription.status === SubscriptionStatus.ACTIVE;

    return {
      hasSubscription: true,
      isPremium,
      isActive,
      subscription: {
        id: subscription.id,
        plan: subscription.plan,
        status: subscription.status,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        trialEnd: subscription.trialEnd,
      },
    };
  }

  /**
   * Cancel subscription (at period end)
   */
  async cancelSubscription(userId: string): Promise<{ message: string }> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription || !subscription.stripeSubscriptionId) {
      throw new NotFoundException('Active subscription not found');
    }

    if (!this.stripe) {
      throw new BadRequestException('Payment system is not configured');
    }

    // Cancel at period end
    await this.stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    await this.prisma.subscription.update({
      where: { userId },
      data: {
        cancelAtPeriodEnd: true,
      },
    });

    await this.notificationService.create(userId, {
      message: 'Your premium subscription will be canceled at the end of the current billing period.',
    });

    return {
      message: 'Subscription will be canceled at the end of the current period',
    };
  }

  /**
   * Reactivate canceled subscription
   */
  async reactivateSubscription(userId: string): Promise<{ message: string }> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription || !subscription.stripeSubscriptionId) {
      throw new NotFoundException('Subscription not found');
    }

    if (!this.stripe) {
      throw new BadRequestException('Payment system is not configured');
    }

    // Reactivate subscription
    await this.stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });

    await this.prisma.subscription.update({
      where: { userId },
      data: {
        cancelAtPeriodEnd: false,
      },
    });

    await this.notificationService.create(userId, {
      message: 'Your premium subscription has been reactivated.',
    });

    return {
      message: 'Subscription reactivated successfully',
    };
  }

  /**
   * Get Stripe customer portal URL for subscription management
   */
  async getCustomerPortalUrl(userId: string): Promise<{ url: string }> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription || !subscription.stripeCustomerId) {
      throw new NotFoundException('Subscription not found');
    }

    if (!this.stripe) {
      throw new BadRequestException('Payment system is not configured');
    }

    const session = await this.stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${this.configService.get('FRONTEND_URL')}/subscription`,
    });

    return { url: session.url };
  }

  // Private helper methods

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId;
    if (!userId) return;

    const subscriptionId = session.subscription as string;
    if (!subscriptionId) return;

    if (!this.stripe) return;
    const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
    await this.updateSubscriptionFromStripe(userId, subscription);
  }

  private async handleSubscriptionUpdated(stripeSubscription: Stripe.Subscription) {
    const customerId = stripeSubscription.customer as string;
    const subscription = await this.prisma.subscription.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (subscription) {
      await this.updateSubscriptionFromStripe(subscription.userId, stripeSubscription);
    }
  }

  private async handleSubscriptionDeleted(stripeSubscription: Stripe.Subscription) {
    const customerId = stripeSubscription.customer as string;
    const subscription = await this.prisma.subscription.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (subscription) {
      // Downgrade user to USER role
      await this.roleUpgradeService.upgradeUserRole(
        subscription.userId,
        Role.USER,
      );

      await this.prisma.subscription.update({
        where: { userId: subscription.userId },
        data: {
          status: SubscriptionStatus.CANCELED,
          canceledAt: new Date(),
        },
      });

      await this.notificationService.create(subscription.userId, {
        message: 'Your premium subscription has been canceled. You have been downgraded to a free account.',
      });
    }
  }

  private async handlePaymentSucceeded(invoice: Stripe.Invoice) {
    const customerId = invoice.customer as string;
    const subscription = await this.prisma.subscription.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (subscription) {
      await this.prisma.subscription.update({
        where: { userId: subscription.userId },
        data: {
          status: SubscriptionStatus.ACTIVE,
        },
      });

      // Ensure user has PREMIUM role
      const user = await this.prisma.user.findUnique({
        where: { id: subscription.userId },
      });

      if (user && user.role !== Role.PREMIUM) {
        await this.roleUpgradeService.upgradeUserRole(
          subscription.userId,
          Role.PREMIUM,
        );
      }

      await this.notificationService.create(subscription.userId, {
        message: 'Your premium subscription payment was successful. Thank you for your subscription!',
      });
    }
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice) {
    const customerId = invoice.customer as string;
    const subscription = await this.prisma.subscription.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (subscription) {
      await this.prisma.subscription.update({
        where: { userId: subscription.userId },
        data: {
          status: SubscriptionStatus.PAST_DUE,
        },
      });

      await this.notificationService.create(subscription.userId, {
        message: 'Your premium subscription payment failed. Please update your payment method to continue enjoying premium features.',
      });
    }
  }

  private async updateSubscriptionFromStripe(
    userId: string,
    stripeSubscription: Stripe.Subscription,
  ) {
    const status = this.mapStripeStatusToDbStatus(stripeSubscription.status);
    const plan = stripeSubscription.items.data[0]?.price?.recurring?.interval === 'year'
      ? SubscriptionPlan.YEARLY
      : SubscriptionPlan.MONTHLY;

    // Type assertion to access snake_case properties
    const sub = stripeSubscription as any;

    await this.prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        stripeCustomerId: stripeSubscription.customer as string,
        stripeSubscriptionId: stripeSubscription.id,
        stripePriceId: stripeSubscription.items.data[0]?.price?.id,
        plan,
        status,
        currentPeriodStart: new Date((sub.current_period_start as number) * 1000),
        currentPeriodEnd: new Date((sub.current_period_end as number) * 1000),
        cancelAtPeriodEnd: sub.cancel_at_period_end as boolean,
        trialStart: sub.trial_start
          ? new Date((sub.trial_start as number) * 1000)
          : null,
        trialEnd: sub.trial_end
          ? new Date((sub.trial_end as number) * 1000)
          : null,
      },
      update: {
        stripeSubscriptionId: stripeSubscription.id,
        stripePriceId: stripeSubscription.items.data[0]?.price?.id,
        plan,
        status,
        currentPeriodStart: new Date((sub.current_period_start as number) * 1000),
        currentPeriodEnd: new Date((sub.current_period_end as number) * 1000),
        cancelAtPeriodEnd: sub.cancel_at_period_end as boolean,
        trialStart: sub.trial_start
          ? new Date((sub.trial_start as number) * 1000)
          : null,
        trialEnd: sub.trial_end
          ? new Date((sub.trial_end as number) * 1000)
          : null,
      },
    });

    // Upgrade user to PREMIUM if subscription is active
    if (status === SubscriptionStatus.ACTIVE) {
      await this.roleUpgradeService.upgradeUserRole(userId, Role.PREMIUM);
    }
  }

  private mapStripeStatusToDbStatus(
    stripeStatus: Stripe.Subscription.Status,
  ): SubscriptionStatus {
    switch (stripeStatus) {
      case 'active':
        return SubscriptionStatus.ACTIVE;
      case 'canceled':
        return SubscriptionStatus.CANCELED;
      case 'past_due':
        return SubscriptionStatus.PAST_DUE;
      case 'unpaid':
        return SubscriptionStatus.UNPAID;
      case 'trialing':
        return SubscriptionStatus.TRIALING;
      case 'incomplete':
        return SubscriptionStatus.INCOMPLETE;
      case 'incomplete_expired':
        return SubscriptionStatus.INCOMPLETE_EXPIRED;
      default:
        return SubscriptionStatus.INCOMPLETE;
    }
  }

}

