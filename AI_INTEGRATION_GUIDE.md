# Real AI Integration Guide

## Overview

This guide shows how to integrate real AI (OpenAI GPT, Claude, or local AI) into your Axgrin backend.

## 🤖 Supported AI Providers

### 1. OpenAI GPT

- **Models**: GPT-4, GPT-3.5-turbo
- **Cost**: Pay per token
- **Quality**: Excellent
- **Setup**: Requires OpenAI API key

### 2. Anthropic Claude

- **Models**: Claude-3-Sonnet, Claude-3-Haiku
- **Cost**: Pay per token
- **Quality**: Excellent
- **Setup**: Requires Anthropic API key

### 3. Local AI (Ollama)

- **Models**: Llama2, CodeLlama, Mistral, etc.
- **Cost**: Free (runs locally)
- **Quality**: Good
- **Setup**: Requires local Ollama installation

## 🔧 Setup Instructions

### Step 1: Environment Variables

Add these to your `.env` file:

```env
# AI Configuration
AI_PROVIDER="openai" # Options: openai, claude, local
AI_API_KEY="your-ai-api-key-here"

# OpenAI Configuration (if using OpenAI)
OPENAI_API_KEY="sk-your-openai-api-key-here"
OPENAI_BASE_URL="https://api.openai.com/v1"

# Anthropic Claude Configuration (if using Claude)
ANTHROPIC_API_KEY="sk-ant-your-claude-api-key-here"
ANTHROPIC_BASE_URL="https://api.anthropic.com/v1"

# Local AI Configuration (if using local AI)
LOCAL_AI_URL="http://localhost:11434"
LOCAL_AI_MODEL="llama2"

# AI Features
ENABLE_REAL_AI="true"
AI_FALLBACK_ENABLED="true"
AI_RESPONSE_TIMEOUT="30000"
```

### Step 2: Install Dependencies

```bash
# For OpenAI
npm install openai

# For Anthropic
npm install @anthropic-ai/sdk

# For local AI (Ollama)
# No additional packages needed, uses fetch API
```

### Step 3: Update AI Module

Update `src/ai/ai.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { AIService } from './ai.service';
import { AIController } from './ai.controller';
import { FinancialContextService } from './financial-context.service';
import { ResponseTemplateService } from './response-template.service';
import { AIIntegrationService } from './ai-integration.service';
import { RealAIService } from './real-ai.service';
import { EnhancedAIService } from './enhanced-ai.service';
import { PrismaService } from 'prisma/prisma.service';
import { NotificationModule } from '../notification/notification.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule, NotificationModule],
  controllers: [AIController],
  providers: [
    AIService,
    FinancialContextService,
    ResponseTemplateService,
    AIIntegrationService,
    RealAIService,
    EnhancedAIService,
    PrismaService,
  ],
  exports: [
    AIService,
    FinancialContextService,
    AIIntegrationService,
    EnhancedAIService,
  ],
})
export class AIModule {}
```

### Step 4: Update AI Controller

Update `src/ai/ai.controller.ts` to use the enhanced AI service:

```typescript
// Replace AIService with EnhancedAIService
constructor(
  private readonly enhancedAIService: EnhancedAIService,
  private readonly aiIntegrationService: AIIntegrationService,
) {}

// Update the chat method
async chat(
  @Body() dto: ChatRequestDto,
  @Req() req: Request,
): Promise<ChatResponseDto> {
  const user = req.user as any;
  return this.enhancedAIService.processQuery(user.sub, dto.message, dto.context);
}
```

## 🚀 Usage Examples

### Basic Chat with Real AI

```typescript
// POST /ai/chat
{
  "message": "I want to save $5000 for a vacation. How should I budget for this?",
  "context": {
    "includeFinancialData": true,
    "includeInsights": true
  }
}
```

### Response with AI Generation Flag

```json
{
  "response": "Based on your current spending patterns, I can help you save $5000 for your vacation! Here's a personalized plan...",
  "insights": {
    "spendingAnalysis": {
      /* ... */
    },
    "savingsOpportunities": [
      /* ... */
    ]
  },
  "suggestedActions": [
    "Set up automatic savings of $200/month",
    "Reduce dining out by 30%",
    "Create a dedicated vacation fund"
  ],
  "conversationId": "clx1234567890abcdef",
  "confidence": 0.9,
  "aiGenerated": true
}
```

## 🔄 Fallback System

The system automatically falls back to rule-based responses if:

- AI API is unavailable
- API key is invalid
- Response timeout occurs
- Any other AI-related error

## 💰 Cost Optimization

### OpenAI

- Use `gpt-3.5-turbo` instead of `gpt-4` for cost efficiency
- Set appropriate `max_tokens` limits
- Implement response caching

### Claude

- Use `claude-3-haiku` for simple queries
- Use `claude-3-sonnet` for complex financial advice

### Local AI

- Completely free but requires local setup
- Good for development and testing
- May have slower response times

## 🛠️ Advanced Configuration

### Custom System Prompts

Modify the system prompt in `src/ai/real-ai.service.ts`:

```typescript
private getSystemPrompt(context?: any): string {
  return `You are an expert financial advisor AI assistant for Axgrin...

  // Add your custom instructions here
  - Always be encouraging and supportive
  - Use specific numbers and percentages
  - Provide actionable next steps
  - Include relevant emojis for engagement
  `;
}
```

### Response Caching

Add response caching to reduce API calls:

```typescript
// In RealAIService
private responseCache = new Map<string, string>();

async generateResponse(prompt: string, context?: any): Promise<string> {
  const cacheKey = this.generateCacheKey(prompt, context);

  if (this.responseCache.has(cacheKey)) {
    return this.responseCache.get(cacheKey);
  }

  const response = await this.aiProvider.generateResponse(prompt, context);
  this.responseCache.set(cacheKey, response);

  return response;
}
```

### Rate Limiting

Implement rate limiting to control costs:

```typescript
// Add rate limiting logic
private async checkRateLimit(userId: string): Promise<boolean> {
  const userRequests = await this.getUserRequestCount(userId);
  const maxRequests = 100; // per day

  return userRequests < maxRequests;
}
```

## 🔍 Testing

### Test AI Connection

```typescript
// GET /ai/test-connection
async testConnection(@Req() req: Request) {
  const isConnected = await this.realAIService.testAIConnection();
  return {
    connected: isConnected,
    provider: process.env.AI_PROVIDER,
    timestamp: new Date()
  };
}
```

### Monitor AI Usage

```typescript
// Track AI usage for monitoring
private async trackAIUsage(userId: string, tokensUsed: number, cost: number) {
  await this.prisma.aiUsage.create({
    data: {
      userId,
      tokensUsed,
      cost,
      timestamp: new Date()
    }
  });
}
```

## 🚨 Error Handling

The system includes comprehensive error handling:

1. **API Failures**: Falls back to rule-based system
2. **Timeout Errors**: Returns cached response or fallback
3. **Invalid Responses**: Validates and sanitizes AI output
4. **Rate Limiting**: Graceful degradation when limits exceeded

## 📊 Monitoring

Track AI performance and costs:

```typescript
// Add monitoring endpoints
@Get('ai/status')
async getAIStatus() {
  return {
    provider: process.env.AI_PROVIDER,
    connected: await this.realAIService.testAIConnection(),
    totalRequests: await this.getTotalRequests(),
    totalCost: await this.getTotalCost(),
    averageResponseTime: await this.getAverageResponseTime()
  };
}
```

## 🎯 Best Practices

1. **Start with OpenAI GPT-3.5-turbo** for cost efficiency
2. **Implement response caching** to reduce API calls
3. **Set up monitoring** to track usage and costs
4. **Use fallback system** for reliability
5. **Test thoroughly** with different AI providers
6. **Monitor response quality** and adjust prompts as needed

## 🔧 Troubleshooting

### Common Issues

1. **API Key Invalid**: Check environment variables
2. **Rate Limit Exceeded**: Implement exponential backoff
3. **Response Timeout**: Increase timeout or use faster model
4. **Poor Response Quality**: Adjust system prompt
5. **High Costs**: Implement caching and rate limiting

### Debug Mode

Enable debug logging:

```typescript
// In your .env
DEBUG_AI = 'true';

// In RealAIService
if (process.env.DEBUG_AI === 'true') {
  this.logger.debug('AI Request:', { prompt, context });
  this.logger.debug('AI Response:', response);
}
```

This integration provides a robust, scalable AI system that can handle real-world financial advice while maintaining reliability through fallback mechanisms.
