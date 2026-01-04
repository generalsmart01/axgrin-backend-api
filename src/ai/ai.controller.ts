import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
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
  ApiBody,
} from '@nestjs/swagger';
import {
  ApiStandardResponses,
  ApiStandardErrorResponses,
  ApiSuccessResponse,
} from '../common/decorators/api-responses.decorator';

@ApiTags('AI Financial Assistant')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AIController {
  constructor(
    private readonly aiService: AIService,
    private readonly aiIntegrationService: AIIntegrationService,
  ) {}

  @Post('chat')
  @ApiOperation({
    summary: 'Chat with AI assistant',
    description: 'Send a message to the AI financial assistant and get personalized financial advice based on your financial data. Responses are context-aware and use your actual expense, income, and budget information.',
  })
  @ApiBody({ type: ChatRequestDto })
  @ApiStandardResponses(ChatResponseDto, 'AI response generated successfully', true)
  @ApiStandardErrorResponses()
  async chat(
    @Body() dto: ChatRequestDto,
    @Req() req: Request,
  ): Promise<ChatResponseDto> {
    const user = req.user as any;
    return this.aiService.processQuery(user.sub, dto);
  }

  @Get('insights')
  @ApiOperation({
    summary: 'Get financial insights',
    description: 'Retrieve comprehensive financial insights including spending trends, budget status, savings opportunities, and recommendations. Responses are cached for 10 minutes for performance.',
  })
  @ApiSuccessResponse(FinancialInsightsDto, 'Financial insights retrieved successfully')
  @ApiStandardErrorResponses()
  async getInsights(@Req() req: Request): Promise<FinancialInsightsDto> {
    const user = req.user as any;
    return this.aiService.getFinancialInsights(user.sub);
  }

  @Get('welcome')
  @ApiOperation({
    summary: 'Get welcome message',
    description: 'Get a personalized welcome message from the AI assistant based on your profile information.',
  })
  @ApiSuccessResponse(ChatResponseDto, 'Welcome message generated successfully')
  @ApiStandardErrorResponses()
  async getWelcomeMessage(@Req() req: Request): Promise<ChatResponseDto> {
    const user = req.user as any;
    const userData = await this.aiService.getUserData(user.sub);
    return {
      response: this.aiService.getWelcomeMessage(userData?.firstName),
      insights: undefined,
      suggestedActions: undefined,
      conversationId: undefined,
      confidence: undefined,
    };
  }
}
