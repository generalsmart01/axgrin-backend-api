// src/ai/dto/chat-response.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChatResponseDto {
  @ApiProperty({
    description: 'The AI assistant response message',
    example: 'Based on your spending this month, you\'re doing well overall! Here\'s the breakdown...',
    type: 'string',
  })
  response: string;

  @ApiPropertyOptional({
    description: 'Financial insights and analysis data',
    type: 'object',
    properties: {
      spendingAnalysis: {
        type: 'object',
        description: 'Analysis of user spending patterns',
      },
      savingsOpportunities: {
        type: 'array',
        description: 'List of potential savings opportunities',
      },
      recommendations: {
        type: 'array',
        description: 'Financial recommendations based on analysis',
      },
    },
  })
  insights?: {
    spendingAnalysis?: any;
    savingsOpportunities?: any[];
    recommendations?: any[];
  };

  @ApiPropertyOptional({
    description: 'Suggested actions for the user to take',
    type: 'array',
    items: { type: 'string' },
    example: ['Review your Transportation budget', 'Set up a savings goal', 'Track your progress weekly'],
  })
  suggestedActions?: string[];

  @ApiPropertyOptional({
    description: 'Unique identifier for this conversation',
    example: 'clx1234567890abcdef',
    type: 'string',
  })
  conversationId?: string;

  @ApiPropertyOptional({
    description: 'Confidence score for the AI response (0-1)',
    example: 0.9,
    type: 'number',
    minimum: 0,
    maximum: 1,
  })
  confidence?: number;
}

export class FinancialInsightsDto {
  @ApiProperty({
    description: 'Spending trends over time',
    type: 'object',
  })
  spendingTrends: any;

  @ApiProperty({
    description: 'Current budget status and performance',
    type: 'object',
  })
  budgetStatus: any;

  @ApiProperty({
    description: 'Potential savings opportunities',
    type: 'array',
  })
  savingsOpportunities: any[];

  @ApiProperty({
    description: 'Overall financial health score (0-100)',
    example: 85,
    type: 'number',
  })
  financialHealth: number;

  @ApiProperty({
    description: 'When the insights were last updated',
    example: '2024-01-15T10:30:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  lastUpdated: Date;
}

