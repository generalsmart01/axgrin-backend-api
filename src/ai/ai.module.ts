// src/ai/ai.module.ts
import { Module } from '@nestjs/common';
import { AIService } from './ai.service';
import { AIController } from './ai.controller';
import { FinancialContextService } from './financial-context.service';
import { ResponseTemplateService } from './response-template.service';
import { AIIntegrationService } from './ai-integration.service';
import { PrismaService } from 'prisma/prisma.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [NotificationModule],
  controllers: [AIController],
  providers: [
    AIService,
    FinancialContextService,
    ResponseTemplateService,
    AIIntegrationService,
    PrismaService,
  ],
  exports: [AIService, FinancialContextService, AIIntegrationService],
})
export class AIModule {}
