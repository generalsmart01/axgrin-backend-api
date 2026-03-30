// src/chat-history/chat-history.module.ts
import { Module } from '@nestjs/common';
import { ChatHistoryService } from './chat-history.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChatHistoryController } from './chat-history.controller';

@Module({
  controllers: [ChatHistoryController],
  providers: [ChatHistoryService, PrismaService],
})
export class ChatHistoryModule {}
