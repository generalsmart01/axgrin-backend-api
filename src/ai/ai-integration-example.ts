// src/ai/ai-integration-example.ts
// This file shows how to integrate real AI into your existing system

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Example: Simple OpenAI integration
@Injectable()
export class SimpleAIIntegration {
  constructor(private configService: ConfigService) {}

  async generateResponse(
    userMessage: string,
    financialContext: any,
  ): Promise<string> {
    const apiKey = this.configService.get('OPENAI_API_KEY');

    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `You are a financial advisor AI. Help users with their finances based on their data:
    
    User's Financial Data:
    ${JSON.stringify(financialContext, null, 2)}
    
    Guidelines:
    - Be helpful and encouraging
    - Use specific numbers from their data
    - Provide actionable advice
    - Use emojis appropriately
    - Format responses clearly with bullet points`;

    try {
      const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userMessage },
            ],
            max_tokens: 500,
            temperature: 0.7,
          }),
        },
      );

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error('Failed to generate AI response');
    }
  }
}

// Example: How to use in your existing AI service
export class UpdatedAIService {
  constructor(
    private simpleAI: SimpleAIIntegration,
    private financialContextService: any, // Your existing service
  ) {}

  async processQuery(userId: string, message: string) {
    try {
      // Get user's financial context
      const financialContext =
        await this.financialContextService.getUserFinancialContext(userId);

      // Generate AI response
      const aiResponse = await this.simpleAI.generateResponse(
        message,
        financialContext,
      );

      return {
        response: aiResponse,
        confidence: 0.9,
        aiGenerated: true,
      };
    } catch (error) {
      // Fallback to your existing rule-based system
      return this.getFallbackResponse(message);
    }
  }

  private getFallbackResponse(message: string) {
    // Your existing rule-based logic here
    return {
      response:
        "I'm having trouble connecting to my AI system. Let me help you with basic financial guidance...",
      confidence: 0.5,
      aiGenerated: false,
    };
  }
}
