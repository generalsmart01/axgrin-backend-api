// src/ai/ai-premium.controller.ts
import {
  Controller,
  Post,
  Get,
  UseGuards,
  Req,
  Body,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PremiumGuard } from '../common/guards/premium.guard';
import { Premium } from '../common/decorators/premium.decorator';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../common/dto/error-response.dto';

/**
 * Premium AI Features Controller
 * These endpoints are only accessible to PREMIUM and ADMIN users
 */
@ApiTags('AI Premium Features')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PremiumGuard)
@Controller('ai/premium')
export class AIPremiumController {
  @Post('export-chat-history')
  @Premium()
  @ApiOperation({
    summary: 'Export chat history to PDF (Premium)',
    description: 'Export your AI chat history to PDF format. Premium feature.',
  })
  @ApiOkResponse({
    description: 'Chat history exported successfully',
    schema: {
      type: 'object',
      properties: {
        downloadUrl: { type: 'string' },
        filename: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Premium subscription required',
    type: ErrorResponseDto,
  })
  async exportChatHistory(@Req() req: Request) {
    const user = req.user as any;
    // Implementation would export chat history to PDF
    return {
      message: 'Chat history export (Premium feature)',
      downloadUrl: `/exports/chat-history-${user.sub}.pdf`,
      filename: `chat-history-${Date.now()}.pdf`,
    };
  }

  @Get('advanced-insights')
  @Premium()
  @ApiOperation({
    summary: 'Get advanced financial insights (Premium)',
    description:
      'Get advanced AI-powered financial insights with detailed analysis. Premium feature.',
  })
  @ApiOkResponse({
    description: 'Advanced insights retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Premium subscription required',
    type: ErrorResponseDto,
  })
  async getAdvancedInsights(@Req() req: Request) {
    const user = req.user as any;
    // Implementation would provide advanced insights
    return {
      message: 'Advanced financial insights (Premium feature)',
      insights: {
        predictiveAnalysis: 'Future spending predictions',
        investmentRecommendations: 'Investment opportunities',
        taxOptimization: 'Tax saving strategies',
      },
    };
  }

  @Post('unlimited-chat')
  @Premium()
  @ApiOperation({
    summary: 'Unlimited AI chat (Premium)',
    description:
      'Unlimited AI chat queries without rate limits. Premium feature.',
  })
  @ApiOkResponse({
    description: 'AI response generated successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Premium subscription required',
    type: ErrorResponseDto,
  })
  async unlimitedChat(@Body() body: { message: string }, @Req() req: Request) {
    const user = req.user as any;
    // Implementation would process unlimited chat
    return {
      message: 'Unlimited AI chat (Premium feature)',
      response: 'AI response here...',
    };
  }
}

