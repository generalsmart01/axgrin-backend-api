// src/ai/dto/chat-request.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChatRequestDto {
  @ApiProperty({
    description: 'The user message or question for the AI assistant',
    example: 'How am I doing with my budget this month?',
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({
    description: 'Additional context for the AI response',
    type: 'object',
    properties: {
      includeFinancialData: {
        type: 'boolean',
        description: 'Whether to include user financial data in the response',
        example: true,
      },
      includeInsights: {
        type: 'boolean',
        description: 'Whether to include financial insights and recommendations',
        example: true,
      },
    },
  })
  @IsOptional()
  context?: {
    includeFinancialData?: boolean;
    includeInsights?: boolean;
  };
}

