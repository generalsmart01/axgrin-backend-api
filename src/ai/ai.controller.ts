// src/ai/ai.controller.ts
import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Param,
} from '@nestjs/common';
import { AIService } from './ai.service';
import { AIIntegrationService } from './ai-integration.service';
import { ChatRequestDto, ChatResponseDto, FinancialInsightsDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';

@ApiTags('AI Financial Assistant')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AIController {
  constructor(
    private readonly aiService: AIService,
    private readonly aiIntegrationService: AIIntegrationService,
  ) {}

  @Post('chat')
  @ApiOperation({
    summary: 'Chat with AI Financial Assistant',
    description:
      'Send a message to the AI financial assistant and get personalized financial advice based on your data.',
  })
  @ApiCreatedResponse({
    description: 'AI response generated successfully',
    type: ChatResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async chat(
    @Body() dto: ChatRequestDto,
    @Req() req: Request,
  ): Promise<ChatResponseDto> {
    const user = req.user as any;
    return this.aiService.processQuery(user.sub, dto);
  }

  @Get('insights')
  @ApiOperation({
    summary: 'Get Financial Insights',
    description:
      'Retrieve comprehensive financial insights including spending trends, budget status, and savings opportunities.',
  })
  @ApiOkResponse({
    description: 'Financial insights retrieved successfully',
    type: FinancialInsightsDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getInsights(@Req() req: Request): Promise<FinancialInsightsDto> {
    const user = req.user as any;
    return this.aiService.getFinancialInsights(user.sub);
  }

  @Get('welcome')
  @ApiOperation({
    summary: 'Get Welcome Message',
    description: 'Get a personalized welcome message from the AI assistant.',
  })
  @ApiOkResponse({
    description: 'Welcome message generated successfully',
    type: ChatResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getWelcomeMessage(@Req() req: Request): Promise<ChatResponseDto> {
    const user = req.user as any;

    // Get user's first name for personalization
    const userData = await this.aiService.getUserData(user.sub);

    return {
      response: this.aiService.getWelcomeMessage(userData?.firstName),
      confidence: 1.0,
    };
  }

  @Post('auto-categorize/:expenseId')
  @ApiOperation({
    summary: 'Auto-categorize an expense',
    description:
      'Use AI to automatically categorize an uncategorized expense based on its description.',
  })
  @ApiOkResponse({
    description: 'Expense categorized successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        suggestedCategory: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Expense not found',
  })
  async autoCategorizeExpense(
    @Param('expenseId') expenseId: string,
    @Req() req: Request,
  ): Promise<{
    success: boolean;
    message: string;
    suggestedCategory?: string;
  }> {
    const user = req.user as any;
    const success =
      await this.aiIntegrationService.autoCategorizeExpense(expenseId);

    return {
      success,
      message: success
        ? 'Expense categorized successfully'
        : 'Could not categorize expense automatically',
    };
  }

  @Get('budget-recommendations')
  @ApiOperation({
    summary: 'Get AI-powered budget recommendations',
    description:
      'Get personalized budget recommendations based on your spending patterns and financial data.',
  })
  @ApiOkResponse({
    description: 'Budget recommendations generated successfully',
    schema: {
      type: 'object',
      properties: {
        recommendations: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              category: { type: 'string' },
              currentSpending: { type: 'number' },
              recommendedBudget: { type: 'number' },
              reasoning: { type: 'string' },
              priority: { type: 'string' },
            },
          },
        },
        totalRecommendedBudget: { type: 'number' },
        emergencyFund: { type: 'number' },
      },
    },
  })
  async getBudgetRecommendations(@Req() req: Request): Promise<any> {
    const user = req.user as any;
    return this.aiIntegrationService.generateBudgetRecommendations(user.sub);
  }

  @Get('financial-health')
  @ApiOperation({
    summary: 'Get financial health assessment',
    description:
      'Get a comprehensive AI-powered assessment of your financial health with scores and recommendations.',
  })
  @ApiOkResponse({
    description: 'Financial health assessment generated successfully',
    schema: {
      type: 'object',
      properties: {
        score: { type: 'number', minimum: 0, maximum: 100 },
        level: { type: 'string' },
        strengths: { type: 'array', items: { type: 'string' } },
        weaknesses: { type: 'array', items: { type: 'string' } },
        recommendations: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  async getFinancialHealthAssessment(@Req() req: Request): Promise<any> {
    const user = req.user as any;
    return this.aiIntegrationService.assessFinancialHealth(user.sub);
  }

  @Post('proactive-check')
  @ApiOperation({
    summary: 'Trigger proactive AI analysis',
    description:
      'Manually trigger AI analysis to check for budget alerts, spending anomalies, and savings opportunities.',
  })
  @ApiOkResponse({
    description: 'Proactive analysis completed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        notificationsSent: { type: 'number' },
      },
    },
  })
  async triggerProactiveCheck(
    @Req() req: Request,
  ): Promise<{ success: boolean; message: string; notificationsSent: number }> {
    const user = req.user as any;

    // Get notification count before
    const beforeCount = await this.aiService.getNotificationCount(user.sub);

    // Run proactive analysis
    await this.aiIntegrationService.checkAndSendProactiveNotifications(
      user.sub,
    );

    // Get notification count after
    const afterCount = await this.aiService.getNotificationCount(user.sub);
    const notificationsSent = afterCount - beforeCount;

    return {
      success: true,
      message: `Proactive analysis completed. ${notificationsSent} new notifications sent.`,
      notificationsSent,
    };
  }
}
