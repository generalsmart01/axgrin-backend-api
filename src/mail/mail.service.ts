// mail.service.ts
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendVerificationEmail(email: string, token: string, firstName?: string) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    await this.mailerService.sendMail({
      to: email,
      subject: 'Verify Your Email - Axgrin',
      template: './verify-email',
      context: {
        firstName: firstName || 'User',
        verifyUrl: `${frontendUrl}/auth/verify-email?token=${token}`,
      },
    });
  }

  async sendPasswordResetEmail(email: string, resetToken: string, firstName?: string) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    await this.mailerService.sendMail({
      to: email,
      subject: 'Reset Your Password - Axgrin',
      template: './reset-password',
      context: {
        name: firstName || 'User',
        resetUrl: `${frontendUrl}/auth/reset-password?token=${resetToken}`,
      },
    });
  }

  async sendTrialEndingEmail(
    email: string,
    firstName: string,
    plan: string,
    trialEndDate: Date,
  ) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    await this.mailerService.sendMail({
      to: email,
      subject: 'Your Premium Trial Ends Soon - Axgrin',
      template: './subscription-trial-ending',
      context: {
        firstName,
        plan,
        trialEndDate: trialEndDate.toLocaleDateString(),
        manageSubscriptionUrl: `${frontendUrl}/subscription/manage`,
      },
    });
  }

  async sendPaymentFailedEmail(
    email: string,
    firstName: string,
    plan: string,
    nextRetryDate: Date,
  ) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    await this.mailerService.sendMail({
      to: email,
      subject: 'Payment Failed - Update Your Payment Method',
      template: './subscription-payment-failed',
      context: {
        firstName,
        plan,
        nextRetryDate: nextRetryDate.toLocaleDateString(),
        updatePaymentUrl: `${frontendUrl}/subscription/payment-method`,
      },
    });
  }

  async sendBudgetAlertEmail(
    email: string,
    firstName: string,
    categoryName: string,
    budgetAmount: number,
    spentAmount: number,
    remainingAmount: number,
    percentageUsed: number,
    isOverBudget: boolean,
  ) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    await this.mailerService.sendMail({
      to: email,
      subject: `Budget Alert: ${categoryName} - Axgrin`,
      template: './budget-alert',
      context: {
        firstName,
        categoryName,
        budgetAmount: budgetAmount.toFixed(2),
        spentAmount: spentAmount.toFixed(2),
        remainingAmount: remainingAmount.toFixed(2),
        percentageUsed: percentageUsed.toFixed(1),
        percentageRemaining: (100 - percentageUsed).toFixed(1),
        isOverBudget,
        dashboardUrl: `${frontendUrl}/dashboard/budgets`,
      },
    });
  }

  async sendFinancialInsightsDigest(
    email: string,
    firstName: string,
    data: {
      totalIncome: number;
      totalExpenses: number;
      netBalance: number;
      topCategories?: Array<{ name: string; amount: number; percentage: number }>;
      budgetAlerts?: Array<{ category: string; status: string; percentage: number }>;
      insights?: string[];
    },
  ) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    await this.mailerService.sendMail({
      to: email,
      subject: 'Your Weekly Financial Insights - Axgrin',
      template: './financial-insights-digest',
      context: {
        firstName,
        totalIncome: data.totalIncome.toFixed(2),
        totalExpenses: data.totalExpenses.toFixed(2),
        netBalance: data.netBalance.toFixed(2),
        topCategories: data.topCategories || [],
        budgetAlerts: data.budgetAlerts || [],
        insights: data.insights || [],
        dashboardUrl: `${frontendUrl}/dashboard`,
      },
    });
  }

  async sendTicketNotificationEmail(
    email: string,
    firstName: string,
    ticketId: string,
    ticketTitle: string,
    ticketStatus: string,
    message?: string,
    assignedStaff?: string,
  ) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    await this.mailerService.sendMail({
      to: email,
      subject: `Support Ticket Update: ${ticketTitle} - Axgrin`,
      template: './ticket-notification',
      context: {
        firstName,
        ticketId: ticketId.substring(0, 8),
        ticketTitle,
        ticketStatus,
        message,
        assignedStaff,
        ticketUrl: `${frontendUrl}/support/tickets/${ticketId}`,
      },
    });
  }
}
