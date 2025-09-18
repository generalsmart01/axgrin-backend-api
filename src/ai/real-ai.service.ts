// src/ai/real-ai.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FinancialContextService } from './financial-context.service';
import { PrismaService } from 'prisma/prisma.service';

// You can use any AI provider - here are examples for different providers
interface AIProvider {
  generateResponse(prompt: string, context?: any): Promise<string>;
}

// OpenAI Integration
class OpenAIProvider implements AIProvider {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl?: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl || 'https://api.openai.com/v1';
  }

  async generateResponse(prompt: string, context?: any): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4', // or 'gpt-3.5-turbo' for cost efficiency
          messages: [
            {
              role: 'system',
              content: this.getSystemPrompt(context),
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      Logger.error('OpenAI API Error:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  private getSystemPrompt(context?: any): string {
    return `You are an expert financial advisor AI assistant for Axgrin, a personal finance management app. 

Your role:
- Provide personalized financial advice based on user's actual financial data
- Be encouraging, helpful, and professional
- Use emojis appropriately to make responses engaging
- Provide specific, actionable recommendations
- Always consider the user's financial context when giving advice

User's Financial Context:
${context ? JSON.stringify(context, null, 2) : 'No context available'}

Guidelines:
- Always base advice on the provided financial data
- Be specific with numbers and percentages when available
- Suggest concrete next steps
- Use a friendly, supportive tone
- Format responses with clear sections and bullet points
- Include relevant emojis for visual appeal

Remember: You're helping users achieve their financial goals through personalized, data-driven advice.`;
  }
}

// Anthropic Claude Integration
class ClaudeProvider implements AIProvider {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl?: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl || 'https://api.anthropic.com/v1';
  }

  async generateResponse(prompt: string, context?: any): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229', // or claude-3-haiku-20240307 for cost efficiency
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: `${this.getSystemPrompt(context)}\n\nUser Question: ${prompt}`,
            },
          ],
        }),
      });

      const data = await response.json();
      return data.content[0].text;
    } catch (error) {
      Logger.error('Claude API Error:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  private getSystemPrompt(context?: any): string {
    return `You are an expert financial advisor AI assistant for Axgrin, a personal finance management app. 

Your role:
- Provide personalized financial advice based on user's actual financial data
- Be encouraging, helpful, and professional
- Use emojis appropriately to make responses engaging
- Provide specific, actionable recommendations
- Always consider the user's financial context when giving advice

User's Financial Context:
${context ? JSON.stringify(context, null, 2) : 'No context available'}

Guidelines:
- Always base advice on the provided financial data
- Be specific with numbers and percentages when available
- Suggest concrete next steps
- Use a friendly, supportive tone
- Format responses with clear sections and bullet points
- Include relevant emojis for visual appeal

Remember: You're helping users achieve their financial goals through personalized, data-driven advice.`;
  }
}

// Local AI Integration (using Ollama or similar)
class LocalAIProvider implements AIProvider {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:11434') {
    this.baseUrl = baseUrl;
  }

  async generateResponse(prompt: string, context?: any): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama2', // or any model you have installed
          prompt: `${this.getSystemPrompt(context)}\n\nUser Question: ${prompt}`,
          stream: false,
        }),
      });

      const data = await response.json();
      return data.response;
    } catch (error) {
      Logger.error('Local AI Error:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  private getSystemPrompt(context?: any): string {
    return `You are an expert financial advisor AI assistant for Axgrin, a personal finance management app. 

Your role:
- Provide personalized financial advice based on user's actual financial data
- Be encouraging, helpful, and professional
- Use emojis appropriately to make responses engaging
- Provide specific, actionable recommendations
- Always consider the user's financial context when giving advice

User's Financial Context:
${context ? JSON.stringify(context, null, 2) : 'No context available'}

Guidelines:
- Always base advice on the provided financial data
- Be specific with numbers and percentages when available
- Suggest concrete next steps
- Use a friendly, supportive tone
- Format responses with clear sections and bullet points
- Include relevant emojis for visual appeal

Remember: You're helping users achieve their financial goals through personalized, data-driven advice.`;
  }
}

@Injectable()
export class RealAIService {
  private aiProvider: AIProvider;
  private logger = new Logger(RealAIService.name);

  constructor(
    private configService: ConfigService,
    private financialContextService: FinancialContextService,
    private prisma: PrismaService,
  ) {
    this.initializeAIProvider();
  }

  private initializeAIProvider() {
    const provider = this.configService.get('AI_PROVIDER', 'openai');
    const apiKey = this.configService.get('AI_API_KEY');

    if (!apiKey) {
      this.logger.warn('No AI API key found. Using fallback responses.');
      return;
    }

    switch (provider.toLowerCase()) {
      case 'openai':
        this.aiProvider = new OpenAIProvider(apiKey);
        break;
      case 'claude':
        this.aiProvider = new ClaudeProvider(apiKey);
        break;
      case 'local':
        const localUrl = this.configService.get(
          'LOCAL_AI_URL',
          'http://localhost:11434',
        );
        this.aiProvider = new LocalAIProvider(localUrl);
        break;
      default:
        this.logger.warn(
          `Unknown AI provider: ${provider}. Using fallback responses.`,
        );
    }
  }

  async processQuery(
    userId: string,
    message: string,
  ): Promise<{
    response: string;
    confidence: number;
    insights?: any;
    suggestedActions?: string[];
  }> {
    try {
      // Get user's financial context
      const financialContext =
        await this.financialContextService.getUserFinancialContext(userId);
      const budgetStatus =
        await this.financialContextService.getBudgetStatus(userId);
      const spendingAnalysis =
        await this.financialContextService.getSpendingAnalysis(
          userId,
          'current_month',
        );

      // Prepare context for AI
      const context = {
        financialContext,
        budgetStatus,
        spendingAnalysis,
        userPreferences: await this.getUserPreferences(userId),
        recentExpenses: await this.getRecentExpenses(userId, 10),
      };

      // Generate AI response
      const aiResponse = await this.generateAIResponse(message, context);

      // Extract insights and actions from response
      const { response, insights, suggestedActions } =
        this.parseAIResponse(aiResponse);

      return {
        response,
        confidence: 0.9, // High confidence for real AI
        insights,
        suggestedActions,
      };
    } catch (error) {
      this.logger.error('Error processing AI query:', error);

      // Fallback to rule-based response
      return this.getFallbackResponse(message);
    }
  }

  private async generateAIResponse(
    message: string,
    context: any,
  ): Promise<string> {
    if (!this.aiProvider) {
      return this.getFallbackResponse(message).response;
    }

    try {
      return await this.aiProvider.generateResponse(message, context);
    } catch (error) {
      this.logger.error('AI provider error:', error);
      return this.getFallbackResponse(message).response;
    }
  }

  private parseAIResponse(aiResponse: string): {
    response: string;
    insights?: any;
    suggestedActions?: string[];
  } {
    // Try to extract structured data from AI response
    // This is a simple implementation - you might want to use more sophisticated parsing
    const insights = this.extractInsights(aiResponse);
    const suggestedActions = this.extractActions(aiResponse);

    return {
      response: aiResponse,
      insights,
      suggestedActions,
    };
  }

  private extractInsights(response: string): any {
    // Simple regex-based extraction - you might want to use more sophisticated NLP
    const insights: any = {};

    // Extract numbers that might be insights
    const numbers = response.match(/\$[\d,]+\.?\d*/g);
    if (numbers) {
      insights.mentionedAmounts = numbers;
    }

    // Extract percentages
    const percentages = response.match(/\d+%/g);
    if (percentages) {
      insights.percentages = percentages;
    }

    return Object.keys(insights).length > 0 ? insights : undefined;
  }

  private extractActions(response: string): string[] {
    // Extract action items from response
    const actionRegex = /(?:•|-) (.+)/g;
    const actions: string[] = [];
    let match;

    while ((match = actionRegex.exec(response)) !== null) {
      actions.push(match[1].trim());
    }

    return actions.length > 0 ? actions : undefined;
  }

  private async getUserPreferences(userId: string): Promise<any> {
    // Get user preferences from database
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        firstName: true,
        lastName: true,
        settings: true,
      },
    });

    return user;
  }

  private async getRecentExpenses(
    userId: string,
    limit: number,
  ): Promise<any[]> {
    return this.prisma.expense.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { date: 'desc' },
      take: limit,
    });
  }

  private getFallbackResponse(message: string): {
    response: string;
    confidence: number;
  } {
    // Fallback response when AI is not available
    return {
      response: `I understand you're asking about "${message}". I'm currently experiencing technical difficulties with my AI system, but I can still help you with basic financial guidance. Please try again later or contact support if you need immediate assistance.`,
      confidence: 0.3,
    };
  }

  // Method to test AI connection
  async testAIConnection(): Promise<boolean> {
    if (!this.aiProvider) {
      return false;
    }

    try {
      await this.aiProvider.generateResponse('Hello, are you working?');
      return true;
    } catch (error) {
      this.logger.error('AI connection test failed:', error);
      return false;
    }
  }
}
