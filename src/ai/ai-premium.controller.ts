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
  ApiBody,
  ApiOkResponse,
} from '@nestjs/swagger';
import {
  ApiStandardErrorResponses,
  ApiForbiddenResponse,
} from '../common/decorators/api-responses.decorator';

/**
 * Premium AI Features Controller
 * These endpoints are only accessible to PREMIUM and ADMIN users
 */
@ApiTags('AI Premium Features')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, PremiumGuard)
@Controller('ai/premium')
export class AIPremiumController {
  @Post('export-chat-history')
  @Premium()
  @ApiOperation({
    summary: 'Export chat history to PDF',
    description: 'Export your AI chat history to PDF format. Premium feature.',
  })
  @ApiOkResponse({
    description: 'Chat history exported successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Chat history export (Premium feature)' },
        downloadUrl: {
          type: 'string',
          example: '/exports/chat-history-1234567890.pdf',
        },
        filename: { type: 'string', example: 'chat-history-1234567890.pdf' },
      },
    },
  })
  @ApiForbiddenResponse('Forbidden - Premium subscription required')
  @ApiStandardErrorResponses()
  async exportChatHistory(@Req() req: Request) {
    const user = req.user as any;
    return {
      message: 'Chat history export (Premium feature)',
      downloadUrl: `/exports/chat-history-${user.sub}.pdf`,
      filename: `chat-history-${Date.now()}.pdf`,
    };
  }

  @Get('advanced-insights')
  @Premium()
  @ApiOperation({
    summary: 'Get advanced financial insights',
    description:
      'Get advanced AI-powered financial insights with detailed analysis. Premium feature.',
  })
  @ApiOkResponse({
    description: 'Advanced insights retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        insights: {
          type: 'object',
          properties: {
            predictiveAnalysis: { type: 'string' },
            investmentRecommendations: { type: 'string' },
            taxOptimization: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiForbiddenResponse('Forbidden - Premium subscription required')
  @ApiStandardErrorResponses()
  async getAdvancedInsights(@Req() req: Request) {
    const user = req.user as any;
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
    summary: 'Unlimited AI chat',
    description:
      'Unlimited AI chat queries without rate limits. Premium feature.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'What are my spending trends?' },
      },
      required: ['message'],
    },
  })
  @ApiOkResponse({
    description: 'AI response generated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        response: { type: 'string' },
      },
    },
  })
  @ApiForbiddenResponse('Forbidden - Premium subscription required')
  @ApiStandardErrorResponses()
  async unlimitedChat(@Body() body: { message: string }, @Req() req: Request) {
    const user = req.user as any;
    return {
      message: 'Unlimited AI chat (Premium feature)',
      response: 'AI response here...',
    };
  }
}
