// src/ai/response-template.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class ResponseTemplateService {
  getBudgetAnalysisTemplate(budgetStatus: any, spendingAnalysis: any): string {
    const { overBudgetCategories, underBudgetCategories, onTrackCategories, totalBudget, totalSpent } = budgetStatus;
    
    let response = `📊 **Budget Analysis for This Month**\n\n`;
    response += `**Overall Status:** $${totalSpent.toFixed(2)} of $${totalBudget.toFixed(2)} budget used\n\n`;

    if (overBudgetCategories.length > 0) {
      response += `⚠️ **Over Budget Categories:**\n`;
      overBudgetCategories.forEach(cat => {
        response += `• ${cat.category}: $${cat.spent.toFixed(2)} of $${cat.budget.toFixed(2)} (${cat.percentage.toFixed(1)}%)\n`;
      });
      response += `\n`;
    }

    if (onTrackCategories.length > 0) {
      response += `✅ **On Track Categories:**\n`;
      onTrackCategories.forEach(cat => {
        response += `• ${cat.category}: $${cat.spent.toFixed(2)} of $${cat.budget.toFixed(2)} (${cat.percentage.toFixed(1)}%)\n`;
      });
      response += `\n`;
    }

    if (underBudgetCategories.length > 0) {
      response += `💰 **Under Budget Categories:**\n`;
      underBudgetCategories.forEach(cat => {
        response += `• ${cat.category}: $${cat.spent.toFixed(2)} of $${cat.budget.toFixed(2)} (${cat.percentage.toFixed(1)}%)\n`;
      });
      response += `\n`;
    }

    response += `**Top Spending Categories:**\n`;
    spendingAnalysis.topCategories.slice(0, 3).forEach((cat, index) => {
      response += `${index + 1}. ${cat.name}: $${cat.amount.toFixed(2)}\n`;
    });

    if (overBudgetCategories.length > 0) {
      response += `\n💡 **Recommendations:**\n`;
      response += `• Review overspending categories and adjust your budget\n`;
      response += `• Consider reducing expenses in over-budget areas\n`;
      response += `• Set up budget alerts to stay on track\n`;
    } else {
      response += `\n🎉 **Great job!** You're staying within your budget this month.\n`;
    }

    return response;
  }

  getSavingsAdviceTemplate(savingsOpportunities: any[]): string {
    let response = `💰 **Savings Opportunities**\n\n`;
    
    if (savingsOpportunities.length === 0) {
      response += `Great news! I don't see any obvious savings opportunities right now.\n\n`;
      response += `**General Tips:**\n`;
      response += `• Review your recurring subscriptions\n`;
      response += `• Look for better deals on insurance and utilities\n`;
      response += `• Consider setting up automatic savings\n`;
      return response;
    }

    const totalPotentialSavings = savingsOpportunities.reduce((sum, opp) => sum + opp.potentialSavings, 0);
    
    response += `**Potential Monthly Savings: $${totalPotentialSavings.toFixed(2)}**\n\n`;

    savingsOpportunities.forEach((opp, index) => {
      response += `**${index + 1}. ${opp.type.replace('_', ' ').toUpperCase()}**\n`;
      
      if (opp.type === 'HIGH_SPENDING') {
        response += `Category: ${opp.category}\n`;
        response += `Current: $${opp.currentAmount.toFixed(2)} | Potential Savings: $${opp.potentialSavings.toFixed(2)}\n`;
      } else {
        response += `Description: ${opp.description}\n`;
        response += `Current: $${opp.currentAmount.toFixed(2)} | Potential Savings: $${opp.potentialSavings.toFixed(2)}\n`;
      }
      
      response += `**Suggestions:**\n`;
      opp.suggestions.forEach(suggestion => {
        response += `• ${suggestion}\n`;
      });
      response += `\n`;
    });

    response += `💡 **Next Steps:**\n`;
    response += `• Choose 2-3 opportunities to focus on\n`;
    response += `• Set up automatic savings for the amount you'll save\n`;
    response += `• Track your progress monthly\n`;

    return response;
  }

  getCategorizationTemplate(uncategorizedExpenses: any[]): string {
    let response = `📝 **Expense Categorization Help**\n\n`;
    
    if (uncategorizedExpenses.length === 0) {
      response += `Great! All your expenses are properly categorized.\n\n`;
      response += `**Tips to stay organized:**\n`;
      response += `• Add notes to your expenses for better categorization\n`;
      response += `• Set up auto-categorization rules\n`;
      response += `• Review categories monthly\n`;
      return response;
    }

    response += `I found ${uncategorizedExpenses.length} uncategorized expenses:\n\n`;

    uncategorizedExpenses.forEach((expense, index) => {
      response += `**${index + 1}. $${expense.amount.toFixed(2)}**\n`;
      response += `Date: ${expense.date.toISOString().split('T')[0]}\n`;
      response += `Note: ${expense.note || 'No note'}\n`;
      response += `Suggested Category: **${expense.suggestedCategory}**\n\n`;
    });

    response += `💡 **Actions:**\n`;
    response += `• Review the suggested categories\n`;
    response += `• Update categories that don't match\n`;
    response += `• Add notes to future expenses for better categorization\n`;

    return response;
  }

  getGoalSettingTemplate(currentGoals: any[], financialContext: any): string {
    let response = `🎯 **Financial Goal Setting**\n\n`;
    
    if (currentGoals.length > 0) {
      response += `**Current Goals:**\n`;
      currentGoals.forEach((goal, index) => {
        response += `${index + 1}. **${goal.category}**: $${goal.target.toFixed(2)} (${goal.progress.toFixed(1)}% complete)\n`;
        response += `   Period: ${goal.startDate.toISOString().split('T')[0]} to ${goal.endDate.toISOString().split('T')[0]}\n\n`;
      });
    } else {
      response += `You don't have any active financial goals yet.\n\n`;
    }

    response += `**Goal Setting Recommendations:**\n\n`;
    
    if (financialContext.netIncome > 0) {
      const suggestedSavings = financialContext.netIncome * 0.2; // 20% of net income
      response += `• **Savings Goal**: Save $${suggestedSavings.toFixed(2)} per month (20% of your net income)\n`;
    }
    
    response += `• **Emergency Fund**: 3-6 months of expenses\n`;
    response += `• **Debt Payoff**: Focus on high-interest debt first\n`;
    response += `• **Retirement**: Start with 10-15% of income\n\n`;

    response += `**SMART Goal Framework:**\n`;
    response += `• **Specific**: Clear and well-defined\n`;
    response += `• **Measurable**: Track progress with numbers\n`;
    response += `• **Achievable**: Realistic given your income\n`;
    response += `• **Relevant**: Aligned with your priorities\n`;
    response += `• **Time-bound**: Set specific deadlines\n\n`;

    response += `Would you like me to help you create a specific goal?`;

    return response;
  }

  getGeneralHelpTemplate(): string {
    return `🤖 **AI Financial Assistant**\n\n` +
      `I'm here to help you with your finances! Here's what I can do:\n\n` +
      `**📊 Budget Analysis**\n` +
      `• Analyze your spending vs budget\n` +
      `• Identify overspending categories\n` +
      `• Track your financial progress\n\n` +
      `**💰 Savings Advice**\n` +
      `• Find savings opportunities\n` +
      `• Suggest money-saving strategies\n` +
      `• Help optimize your spending\n\n` +
      `**📝 Expense Management**\n` +
      `• Help categorize expenses\n` +
      `• Organize your financial data\n` +
      `• Set up better tracking\n\n` +
      `**🎯 Goal Setting**\n` +
      `• Create financial goals\n` +
      `• Track goal progress\n` +
      `• Adjust goals as needed\n\n` +
      `**Just ask me anything about your finances!**\n` +
      `Try: "How am I doing with my budget?" or "How can I save more money?"`;
  }

  getGeneralResponseTemplate(message: string): string {
    return `I understand you're asking about "${message}".\n\n` +
      `I'm your AI financial assistant, and I can help you with:\n\n` +
      `• Budget analysis and tracking\n` +
      `• Savings strategies and opportunities\n` +
      `• Expense categorization and organization\n` +
      `• Financial goal setting and monitoring\n` +
      `• General financial advice and tips\n\n` +
      `Could you be more specific about what you'd like help with? For example:\n` +
      `• "Show me my budget status"\n` +
      `• "Help me save more money"\n` +
      `• "Categorize my expenses"\n` +
      `• "Set up a savings goal"`;
  }

  getWelcomeTemplate(userName?: string): string {
    const greeting = userName ? `Hello ${userName}!` : `Hello!`;
    
    return `${greeting} 👋\n\n` +
      `Welcome to your AI Financial Assistant! I'm here to help you:\n\n` +
      `🎯 **Get started with your finances**\n` +
      `📊 **Track your budget and spending**\n` +
      `💰 **Find ways to save money**\n` +
      `📝 **Organize your expenses**\n` +
      `🎯 **Set and achieve financial goals**\n\n` +
      `**What would you like to work on first?**\n` +
      `Just ask me anything about your finances!`;
  }

  getBudgetAlertTemplate(categoryName: string, spent: number, budget: number, percentage: number): string {
    return `⚠️ **Budget Alert: ${categoryName}**\n\n` +
      `You've spent $${spent.toFixed(2)} of your $${budget.toFixed(2)} budget (${percentage.toFixed(1)}%)\n\n` +
      `**Recommendations:**\n` +
      `• Review recent expenses in this category\n` +
      `• Consider reducing spending for the rest of the period\n` +
      `• Adjust your budget if needed\n\n` +
      `Would you like me to analyze your spending patterns in this category?`;
  }

  getGoalAchievementTemplate(goalName: string, achievedAmount: number, targetAmount: number): string {
    return `🎉 **Goal Achieved: ${goalName}**\n\n` +
      `Congratulations! You've successfully achieved your goal of $${targetAmount.toFixed(2)}!\n\n` +
      `**What's Next?**\n` +
      `• Set a new, more challenging goal\n` +
      `• Celebrate your achievement (within reason!)\n` +
      `• Apply the same strategies to other areas\n\n` +
      `Would you like me to help you set your next financial goal?`;
  }
}

