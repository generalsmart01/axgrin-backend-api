// src/ai/ai-config.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RealAIService } from './real-ai.service';
import { EnhancedAIService } from './enhanced-ai.service';

@Module({
  imports: [ConfigModule],
  providers: [RealAIService, EnhancedAIService],
  exports: [RealAIService, EnhancedAIService],
})
export class AIConfigModule {}
