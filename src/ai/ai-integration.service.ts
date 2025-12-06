// src/ai/ai-integration.service.ts
import { Injectable } from '@nestjs/common';
import { AIService } from './ai.service';
import { FinancialContextService } from './financial-context.service';
import { NotificationService } from '../notification/notification.service';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class AIIntegrationService {
  constructor(
    private aiService: AIService,
    private financialContextService: FinancialContextService,
    private notificationService: NotificationService,
    private prisma: PrismaService,
  ) {}

  // Proactive AI notifications based on financial patterns
  async checkAndSendProactiveNotifications(userId: string): Promise<void> {
    const budgetStatus =
      await this.financialContextService.getBudgetStatus(userId);
    const spendingAnalysis =
      await this.financialContextService.getSpendingAnalysis(
        userId,
        'current_month',
      );

    // Check for budget alerts
    await this.checkBudgetAlerts(userId, budgetStatus);

    // Check for spending anomalies
    await this.checkSpendingAnomalies(userId, spendingAnalysis);

    // Check for savings opportunities
    await this.checkSavingsOpportunities(userId);

    // Check for goal progress
    await this.checkGoalProgress(userId);
  }

  private async checkBudgetAlerts(
    userId: string,
    budgetStatus: any,
  ): Promise<void> {
    for (const category of budgetStatus.overBudgetCategories) {
      const percentage = Math.round((category.spent / category.budget) * 100);

      if (percentage >= 100) {
        await this.notificationService.sendBudgetExceededNotification(
          userId,
          category.category,
          category.spent,
          category.budget,
        );
      } else if (percentage >= 90) {
        await this.notificationService.sendBudgetAlertNotification(
          userId,
          category.category,
          category.spent,
          category.budget,
        );
      }
    }
  }

  private async checkSpendingAnomalies(
    userId: string,
    spendingAnalysis: any,
  ): Promise<void> {
    if (spendingAnalysis.anomalies.length > 0) {
      const anomaly = spendingAnalysis.anomalies[0]; // Most recent anomaly
      const message =
        `🔍 **Spending Anomaly Detected**\n\n` +
        `I noticed an unusually large expense: $${anomaly.amount.toFixed(2)} on ${anomaly.date.toISOString().split('T')[0]}\n` +
        `Category: ${anomaly.category || 'Unknown'}\n` +
        `Note: ${anomaly.note || 'No note'}\n\n` +
        `This is ${Math.round((anomaly.amount / spendingAnalysis.averageDaily) * 100)}% of your average daily spending.\n\n` +
        `Would you like me to help you review this expense?`;

      await this.notificationService.create(userId, { message });
    }
  }

  private async checkSavingsOpportunities(userId: string): Promise<void> {
    const opportunities =
      await this.financialContextService.getSavingsOpportunities(userId);

    if (opportunities.length > 0) {
      const totalPotential = opportunities.reduce(
        (sum, opp) => sum + opp.potentialSavings,
        0,
      );

      if (totalPotential > 50) {
        // Only notify if potential savings > $50
        const message =
          `💰 **Savings Opportunity Found**\n\n` +
          `I found potential monthly savings of $${totalPotential.toFixed(2)}!\n\n` +
          `Top opportunities:\n` +
          opportunities
            .slice(0, 3)
            .map(
              (opp, index) =>
                `${index + 1}. ${opp.type.replace('_', ' ')}: $${opp.potentialSavings.toFixed(2)}`,
            )
            .join('\n') +
          `\n\n` +
          `Would you like me to help you implement these savings strategies?`;

        await this.notificationService.create(userId, { message });
      }
    }
  }

  private async checkGoalProgress(userId: string): Promise<void> {
    const goals = await this.financialContextService.getCurrentGoals(userId);

    for (const goal of goals) {
      if (goal.progress >= 100) {
        await this.notificationService.sendGoalAchievedNotification(
          userId,
          goal.category,
        );
      } else if (goal.progress >= 80) {
        const message =
          `🎯 **Goal Progress Update**\n\n` +
          `You're ${goal.progress.toFixed(1)}% towards your ${goal.category} goal!\n` +
          `Target: $${goal.target.toFixed(2)}\n` +
          `Time remaining: ${this.getTimeRemaining(goal.endDate)}\n\n` +
          `Keep up the great work! 🚀`;

        await this.notificationService.create(userId, { message });
      }
    }
  }

  // AI-powered expense categorization
  async autoCategorizeExpense(expenseId: string): Promise<boolean> {
    const expense = await this.prisma.expense.findUnique({
      where: { id: expenseId },
      include: { category: true },
    });

    if (!expense || expense.category.name !== 'Uncategorized') {
      return false;
    }

    const suggestedCategory = this.suggestCategory(expense.note || '');

    if (suggestedCategory !== 'Miscellaneous') {
      // Find or create the suggested category
      let category = await this.prisma.category.findFirst({
        where: {
          userId: expense.userId,
          name: suggestedCategory,
        },
      });

      if (!category) {
        category = await this.prisma.category.create({
          data: {
            userId: expense.userId,
            name: suggestedCategory,
          },
        });
      }

      // Update the expense
      await this.prisma.expense.update({
        where: { id: expenseId },
        data: { categoryId: category.id },
      });

      // Send notification
      await this.notificationService.create(expense.userId, {
        message:
          `📝 **Expense Auto-Categorized**\n\n` +
          `I automatically categorized your $${expense.amount.toFixed(2)} expense as "${suggestedCategory}".\n` +
          `Note: ${expense.note || 'No note'}\n\n` +
          `You can change this category anytime if needed.`,
      });

      return true;
    }

    return false;
  }

  // AI-powered budget recommendations
  async generateBudgetRecommendations(userId: string): Promise<any> {
    const context =
      await this.financialContextService.getUserFinancialContext(userId);
    const spendingAnalysis =
      await this.financialContextService.getSpendingAnalysis(
        userId,
        'last_3_months',
      );

    const recommendations: any[] = [];

    // Analyze spending patterns
    const averageMonthly = spendingAnalysis.totalSpent;
    const topCategories = spendingAnalysis.topCategories;

    // Recommend budget allocation based on spending patterns
    for (const category of topCategories) {
      const currentSpending = category.amount;
      const recommendedBudget = currentSpending * 1.1; // 10% buffer

      recommendations.push({
        category: category.name,
        currentSpending,
        recommendedBudget,
        reasoning: `Based on your average spending of $${currentSpending.toFixed(2)}/month`,
        priority: 'high',
      });
    }

    // Add emergency fund recommendation
    if (context.netIncome > 0) {
      const emergencyFund = context.totalExpenses * 3; // 3 months of expenses
      recommendations.push({
        type: 'emergency_fund',
        amount: emergencyFund,
        reasoning: '3 months of expenses for financial security',
        priority: 'critical',
      });
    }

    return {
      recommendations,
      totalRecommendedBudget: recommendations
        .filter((r) => r.recommendedBudget)
        .reduce((sum, r) => sum + r.recommendedBudget, 0),
      emergencyFund:
        recommendations.find((r) => r.type === 'emergency_fund')?.amount || 0,
    };
  }

  // AI-powered financial health assessment
  async assessFinancialHealth(userId: string): Promise<any> {
    const context =
      await this.financialContextService.getUserFinancialContext(userId);
    const budgetStatus =
      await this.financialContextService.getBudgetStatus(userId);
    const healthScore =
      await this.financialContextService.getFinancialHealthScore(userId);

    const assessment = {
      score: healthScore,
      level: this.getHealthLevel(healthScore),
      strengths: [] as string[],
      weaknesses: [] as string[],
      recommendations: [] as string[],
    };

    // Analyze strengths
    if (budgetStatus.overBudgetCategories.length === 0) {
      assessment.strengths.push('Staying within budget');
    }

    if (context.netIncome > 0) {
      assessment.strengths.push('Positive cash flow');
    }

    if (
      budgetStatus.onTrackCategories.length >
      budgetStatus.overBudgetCategories.length
    ) {
      assessment.strengths.push('Good budget management');
    }

    // Analyze weaknesses
    if (budgetStatus.overBudgetCategories.length > 0) {
      assessment.weaknesses.push('Overspending in some categories');
    }

    if (context.netIncome < 0) {
      assessment.weaknesses.push('Negative cash flow');
    }

    if (
      budgetStatus.underBudgetCategories.length >
      budgetStatus.onTrackCategories.length
    ) {
      assessment.weaknesses.push('Underutilized budget allocation');
    }

    // Generate recommendations
    if (assessment.weaknesses.includes('Overspending in some categories')) {
      assessment.recommendations.push(
        'Review and adjust budget limits for overspending categories',
      );
    }

    if (assessment.weaknesses.includes('Negative cash flow')) {
      assessment.recommendations.push(
        'Focus on reducing expenses or increasing income',
      );
    }

    if (assessment.weaknesses.includes('Underutilized budget allocation')) {
      assessment.recommendations.push(
        'Consider reallocating budget to better match spending patterns',
      );
    }

    return assessment;
  }

  // Helper methods
  private suggestCategory(note: string): string {
    const lowerNote = note.toLowerCase();

    if (
      lowerNote.includes('food') ||
      lowerNote.includes('restaurant') ||
      lowerNote.includes('grocery')
    ) {
      return 'Food & Dining';
    }
    if (
      lowerNote.includes('gas') ||
      lowerNote.includes('uber') ||
      lowerNote.includes('transport')
    ) {
      return 'Transportation';
    }
    if (
      lowerNote.includes('movie') ||
      lowerNote.includes('entertainment') ||
      lowerNote.includes('netflix')
    ) {
      return 'Entertainment';
    }
    if (
      lowerNote.includes('medical') ||
      lowerNote.includes('pharmacy') ||
      lowerNote.includes('health')
    ) {
      return 'Healthcare';
    }
    if (
      lowerNote.includes('rent') ||
      lowerNote.includes('mortgage') ||
      lowerNote.includes('housing')
    ) {
      return 'Housing';
    }
    if (
      lowerNote.includes('utility') ||
      lowerNote.includes('electric') ||
      lowerNote.includes('water')
    ) {
      return 'Utilities';
    }

    return 'Miscellaneous';
  }

  private getTimeRemaining(endDate: Date): string {
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return 'Goal period ended';
    if (diffDays === 1) return '1 day';
    if (diffDays < 7) return `${diffDays} days`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks`;
    return `${Math.ceil(diffDays / 30)} months`;
  }

  private getHealthLevel(score: number): string {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Fair';
    if (score >= 60) return 'Poor';
    return 'Critical';
  }
}
