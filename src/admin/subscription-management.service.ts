// src/admin/subscription-management.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { SubscriptionPlan, SubscriptionStatus, Role } from '@prisma/client';
import { PaymentService } from '../payment/payment.service';
import { NotificationService } from '../notification/notification.service';
import { RoleUpgradeService } from '../auth/services/role-upgrade.service';
import {
  AdminUpdateSubscriptionDto,
  AdminCancelSubscriptionDto,
  AdminReactivateSubscriptionDto,
} from './dto/manage-subscription.dto';

@Injectable()
export class SubscriptionManagementService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => PaymentService))
    private paymentService: PaymentService,
    private notificationService: NotificationService,
    @Inject(forwardRef(() => RoleUpgradeService))
    private roleUpgradeService: RoleUpgradeService,
  ) {}

  /**
   * Get user subscription by user ID
   */
  async getUserSubscription(userId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found for this user');
    }

    return subscription;
  }

  /**
   * Get subscription by subscription ID
   */
  async getSubscriptionById(subscriptionId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return subscription;
  }

  /**
   * Admin update subscription
   */
  async updateSubscription(
    subscriptionId: string,
    dto: AdminUpdateSubscriptionDto,
  ) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { user: true },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    // If updating plan, validate with Stripe if subscription exists
    if (dto.plan && dto.plan !== subscription.plan) {
      if (subscription.stripeSubscriptionId && this.paymentService.getStripe()) {
        // Update plan in Stripe
        try {
          const stripe = this.paymentService.getStripe();
          if (stripe) {
            // Get new price ID from config
            const config = await this.prisma.subscriptionConfig.findUnique({
              where: { plan: dto.plan },
            });

            if (!config || !config.isActive) {
              throw new BadRequestException(
                `Plan ${dto.plan} is not configured or inactive`,
              );
            }

            // Update subscription in Stripe
            await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
              items: [
                {
                  id: subscription.stripeSubscriptionId,
                  price: config.stripePriceId,
                },
              ],
              proration_behavior: 'create_prorations',
            });
          }
        } catch (error: any) {
          throw new BadRequestException(
            `Failed to update subscription in Stripe: ${error.message}`,
          );
        }
      }
    }

    // Update subscription in database
    const updated = await this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        ...(dto.plan && { plan: dto.plan }),
        ...(dto.status && { status: dto.status }),
        ...(dto.cancelAtPeriodEnd !== undefined && {
          cancelAtPeriodEnd: dto.cancelAtPeriodEnd,
        }),
        ...(dto.stripeSubscriptionId && {
          stripeSubscriptionId: dto.stripeSubscriptionId,
        }),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    // Update user role if status changed to ACTIVE
    if (dto.status === SubscriptionStatus.ACTIVE && updated.user.role !== Role.PREMIUM) {
      await this.roleUpgradeService.upgradeUserRole(
        updated.userId,
        Role.PREMIUM,
      );
    }

    // Downgrade user role if status changed to CANCELED
    if (dto.status === SubscriptionStatus.CANCELED && updated.user.role === Role.PREMIUM) {
      await this.roleUpgradeService.upgradeUserRole(
        updated.userId,
        Role.USER,
      );
    }

    // Send notification
    await this.notificationService.create(updated.userId, {
      message: `Your subscription has been updated by an administrator.`,
    });

    return updated;
  }

  /**
   * Admin cancel subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    dto: AdminCancelSubscriptionDto,
  ) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { user: true },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (dto.immediate) {
      // Cancel immediately in Stripe
      if (subscription.stripeSubscriptionId && this.paymentService.getStripe()) {
        try {
          const stripe = this.paymentService.getStripe();
          if (stripe) {
            await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
          }
        } catch (error: any) {
          console.error('Failed to cancel subscription in Stripe:', error);
          // Continue with database update even if Stripe fails
        }
      }

      // Update database
      await this.prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: SubscriptionStatus.CANCELED,
          canceledAt: new Date(),
          cancelAtPeriodEnd: false,
        },
      });

      // Downgrade user role
      if (subscription.user.role === Role.PREMIUM) {
        await this.roleUpgradeService.upgradeUserRole(
          subscription.userId,
          Role.USER,
        );
      }

      await this.notificationService.create(subscription.userId, {
        message: `Your subscription has been canceled immediately. ${dto.reason ? `Reason: ${dto.reason}` : ''}`,
      });
    } else {
      // Cancel at period end
      if (subscription.stripeSubscriptionId && this.paymentService.getStripe()) {
        try {
          const stripe = this.paymentService.getStripe();
          if (stripe) {
            await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
              cancel_at_period_end: true,
            });
          }
        } catch (error: any) {
          console.error('Failed to update subscription in Stripe:', error);
        }
      }

      await this.prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          cancelAtPeriodEnd: true,
        },
      });

      await this.notificationService.create(subscription.userId, {
        message: `Your subscription will be canceled at the end of the current billing period. ${dto.reason ? `Reason: ${dto.reason}` : ''}`,
      });
    }

    return {
      message: dto.immediate
        ? 'Subscription canceled immediately'
        : 'Subscription will be canceled at period end',
    };
  }

  /**
   * Admin reactivate subscription
   */
  async reactivateSubscription(
    subscriptionId: string,
    dto: AdminReactivateSubscriptionDto,
  ) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { user: true },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (subscription.status === SubscriptionStatus.ACTIVE && !subscription.cancelAtPeriodEnd) {
      throw new BadRequestException('Subscription is already active');
    }

    // Reactivate in Stripe
    if (subscription.stripeSubscriptionId && this.paymentService.getStripe()) {
      try {
        const stripe = this.paymentService.getStripe();
        if (stripe) {
          await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
            cancel_at_period_end: false,
          });
        }
      } catch (error: any) {
        console.error('Failed to reactivate subscription in Stripe:', error);
      }
    }

    // Update database
    const updated = await this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: SubscriptionStatus.ACTIVE,
        cancelAtPeriodEnd: false,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    // Upgrade user role
    if (updated.user.role !== Role.PREMIUM) {
      await this.roleUpgradeService.upgradeUserRole(
        updated.userId,
        Role.PREMIUM,
      );
    }

    await this.notificationService.create(updated.userId, {
      message: `Your subscription has been reactivated. ${dto.reason ? `Reason: ${dto.reason}` : ''}`,
    });

    return updated;
  }

  /**
   * Admin extend trial period
   */
  async extendTrial(subscriptionId: string, additionalDays: number) {
    if (additionalDays < 1 || additionalDays > 365) {
      throw new BadRequestException(
        'Additional trial days must be between 1 and 365',
      );
    }

    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { user: true },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (!subscription.trialEnd) {
      throw new BadRequestException('Subscription does not have an active trial');
    }

    const newTrialEnd = new Date(subscription.trialEnd);
    newTrialEnd.setDate(newTrialEnd.getDate() + additionalDays);

    // Update in Stripe if subscription exists
    if (subscription.stripeSubscriptionId && this.paymentService.getStripe()) {
      try {
        const stripe = this.paymentService.getStripe();
        if (stripe) {
          await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
            trial_end: Math.floor(newTrialEnd.getTime() / 1000),
          });
        }
      } catch (error: any) {
        console.error('Failed to extend trial in Stripe:', error);
      }
    }

    const updated = await this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        trialEnd: newTrialEnd,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    await this.notificationService.create(updated.userId, {
      message: `Your trial period has been extended by ${additionalDays} days.`,
    });

    return updated;
  }
}

