// src/ai/enhanced-ai.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { RealAIService } from './real-ai.service';
import { FinancialContextService } from './financial-context.service';
import { ResponseTemplateService } from './response-template.service';
import { PrismaService } from 'src/prisma/prisma.service';

export interface EnhancedAIResponse {
  response: string;
  insights?: {
    spendingAnalysis?: any;
    savingsOpportunities?: any[];
    recommendations?: any[];
    budgetStatus?: any;
    uncategorizedExpenses?: any[];
    currentGoals?: any[];
  };
  suggestedActions?: string[];
  conversationId?: string;
  confidence?: number;
  aiGenerated?: boolean; // Flag to indicate if response was AI-generated
}

@Injectable()
export class EnhancedAIService {
  private logger = new Logger(EnhancedAIService.name);

  constructor(
    private realAIService: RealAIService,
    private financialContextService: FinancialContextService,
    private responseTemplateService: ResponseTemplateService,
    private prisma: PrismaService,
  ) {}

  async processQuery(
    userId: string,
    message: string,
    context?: {
      includeFinancialData?: boolean;
      includeInsights?: boolean;
    },
  ): Promise<EnhancedAIResponse> {
    try {
      // Check if real AI is available
      const isAIAvailable = await this.realAIService.testAIConnection();

      if (isAIAvailable) {
        this.logger.log('Using real AI for query processing');
        return await this.processWithRealAI(userId, message, context);
      } else {
        this.logger.log('Real AI not available, using fallback system');
        return await this.processWithFallback(userId, message, context);
      }
    } catch (error) {
      this.logger.error('Error in enhanced AI processing:', error);
      return await this.processWithFallback(userId, message, context);
    }
  }

  private async processWithRealAI(
    userId: string,
    message: string,
    context?: any,
  ): Promise<EnhancedAIResponse> {
    // Use real AI to generate response
    const aiResult = await this.realAIService.processQuery(userId, message);

    // Store conversation in chat history
    const chatHistory = await this.prisma.chatHistory.create({
      data: {
        userId,
        message,
        response: aiResult.response,
      },
    });

    // Get additional insights if requested
    let insights;
    if (context?.includeInsights) {
      insights = await this.getAdditionalInsights(userId);
    }

    return {
      response: aiResult.response,
      insights,
      suggestedActions: aiResult.suggestedActions,
      conversationId: chatHistory.id,
      confidence: aiResult.confidence,
      aiGenerated: true,
    };
  }

  private async processWithFallback(
    userId: string,
    message: string,
    context?: any,
  ): Promise<EnhancedAIResponse> {
    // Use the original rule-based system as fallback
    const intent = this.analyzeIntent(message);

    let financialContext: any = null;
    if (context?.includeFinancialData) {
      financialContext =
        await this.financialContextService.getUserFinancialContext(userId);
    }

    const response = await this.generateFallbackResponse(
      userId,
      message,
      intent,
      financialContext,
    );

    // Store conversation in chat history
    const chatHistory = await this.prisma.chatHistory.create({
      data: {
        userId,
        message,
        response: response.response,
      },
    });

    return {
      ...response,
      conversationId: chatHistory.id,
      aiGenerated: false,
    };
  }

  private analyzeIntent(message: string): string {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('budget') || lowerMessage.includes('spending')) {
      return 'BUDGET_ANALYSIS';
    }
    if (lowerMessage.includes('save') || lowerMessage.includes('saving')) {
      return 'SAVINGS_ADVICE';
    }
    if (lowerMessage.includes('categor') || lowerMessage.includes('organize')) {
      return 'EXPENSE_CATEGORIZATION';
    }
    if (lowerMessage.includes('goal') || lowerMessage.includes('target')) {
      return 'GOAL_SETTING';
    }
    if (lowerMessage.includes('help') || lowerMessage.includes('advice')) {
      return 'GENERAL_HELP';
    }

    return 'GENERAL_QUERY';
  }

  private async generateFallbackResponse(
    userId: string,
    message: string,
    intent: string,
    financialContext: any,
  ): Promise<EnhancedAIResponse> {
    switch (intent) {
      case 'BUDGET_ANALYSIS':
        return await this.generateBudgetAnalysisResponse(
          userId,
          financialContext,
        );

      case 'SAVINGS_ADVICE':
        return await this.generateSavingsAdviceResponse(
          userId,
          financialContext,
        );

      case 'EXPENSE_CATEGORIZATION':
        return await this.generateCategorizationResponse(userId);

      case 'GOAL_SETTING':
        return await this.generateGoalSettingResponse(userId, financialContext);

      case 'GENERAL_HELP':
        return await this.generateGeneralHelpResponse();

      default:
        return await this.generateGeneralResponse(message);
    }
  }

  private async generateBudgetAnalysisResponse(
    userId: string,
    financialContext: any,
  ): Promise<EnhancedAIResponse> {
    if (!financialContext) {
      financialContext =
        await this.financialContextService.getUserFinancialContext(userId);
    }

    const budgetStatus =
      await this.financialContextService.getBudgetStatus(userId);
    const spendingAnalysis =
      await this.financialContextService.getSpendingAnalysis(
        userId,
        'current_month',
      );

    const response = this.responseTemplateService.getBudgetAnalysisTemplate(
      budgetStatus,
      spendingAnalysis,
    );

    return {
      response,
      insights: {
        spendingAnalysis,
        budgetStatus,
      },
      suggestedActions: this.generateBudgetActions(budgetStatus),
      confidence: 0.8,
    };
  }

  private async generateSavingsAdviceResponse(
    userId: string,
    financialContext: any,
  ): Promise<EnhancedAIResponse> {
    if (!financialContext) {
      financialContext =
        await this.financialContextService.getUserFinancialContext(userId);
    }

    const savingsOpportunities =
      await this.financialContextService.getSavingsOpportunities(userId);
    const response =
      this.responseTemplateService.getSavingsAdviceTemplate(
        savingsOpportunities,
      );

    return {
      response,
      insights: {
        savingsOpportunities,
      },
      suggestedActions: this.generateSavingsActions(savingsOpportunities),
      confidence: 0.8,
    };
  }

  private async generateCategorizationResponse(
    userId: string,
  ): Promise<EnhancedAIResponse> {
    const uncategorizedExpenses =
      await this.financialContextService.getUncategorizedExpenses(userId);
    const response = this.responseTemplateService.getCategorizationTemplate(
      uncategorizedExpenses,
    );

    return {
      response,
      insights: {
        uncategorizedExpenses,
      },
      suggestedActions: [
        'Review suggested categories',
        'Update expense categories',
        'Set up auto-categorization rules',
      ],
      confidence: 0.8,
    };
  }

  private async generateGoalSettingResponse(
    userId: string,
    financialContext: any,
  ): Promise<EnhancedAIResponse> {
    if (!financialContext) {
      financialContext =
        await this.financialContextService.getUserFinancialContext(userId);
    }

    const currentGoals =
      await this.financialContextService.getCurrentGoals(userId);
    const response = this.responseTemplateService.getGoalSettingTemplate(
      currentGoals,
      financialContext,
    );

    return {
      response,
      insights: {
        currentGoals,
      },
      suggestedActions: [
        'Set up a savings goal',
        'Create a budget goal',
        'Track your progress',
      ],
      confidence: 0.8,
    };
  }

  private async generateGeneralHelpResponse(): Promise<EnhancedAIResponse> {
    const response = this.responseTemplateService.getGeneralHelpTemplate();

    return {
      response,
      suggestedActions: [
        'Ask about your budget',
        'Get savings advice',
        'Organize your expenses',
        'Set financial goals',
      ],
      confidence: 1.0,
    };
  }

  private async generateGeneralResponse(
    message: string,
  ): Promise<EnhancedAIResponse> {
    const response =
      this.responseTemplateService.getGeneralResponseTemplate(message);

    return {
      response,
      confidence: 0.7,
    };
  }

  private async getAdditionalInsights(userId: string): Promise<any> {
    const spendingTrends =
      await this.financialContextService.getSpendingTrends(userId);
    const budgetStatus =
      await this.financialContextService.getBudgetStatus(userId);
    const savingsOpportunities =
      await this.financialContextService.getSavingsOpportunities(userId);
    const financialHealth =
      await this.financialContextService.getFinancialHealthScore(userId);

    return {
      spendingTrends,
      budgetStatus,
      savingsOpportunities,
      financialHealth,
    };
  }

  private generateBudgetActions(budgetStatus: any): string[] {
    const actions: string[] = [];

    if (budgetStatus.overBudgetCategories.length > 0) {
      actions.push('Review overspending categories');
      actions.push('Adjust budget limits');
    }

    if (budgetStatus.underBudgetCategories.length > 0) {
      actions.push('Consider reallocating budget');
    }

    actions.push('Set up budget alerts');
    actions.push('Track progress weekly');

    return actions;
  }

  private generateSavingsActions(savingsOpportunities: any[]): string[] {
    const actions: string[] = [];

    if (savingsOpportunities.length > 0) {
      actions.push('Implement suggested savings strategies');
      actions.push('Set up automatic savings');
    }

    actions.push('Create a savings goal');
    actions.push('Track your progress');

    return actions;
  }

  async getFinancialInsights(userId: string): Promise<any> {
    const spendingTrends =
      await this.financialContextService.getSpendingTrends(userId);
    const budgetStatus =
      await this.financialContextService.getBudgetStatus(userId);
    const savingsOpportunities =
      await this.financialContextService.getSavingsOpportunities(userId);
    const financialHealth =
      await this.financialContextService.getFinancialHealthScore(userId);

    return {
      spendingTrends,
      budgetStatus,
      savingsOpportunities,
      financialHealth,
      lastUpdated: new Date(),
    };
  }

  async getUserData(userId: string): Promise<any> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });
  }

  getWelcomeMessage(firstName?: string): string {
    return this.responseTemplateService.getWelcomeTemplate(firstName);
  }

  async getNotificationCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { userId },
    });
  }
}
