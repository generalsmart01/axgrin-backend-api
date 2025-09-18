// src/chat-history/chat-history.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateChatHistoryDto } from './dto/create-chat-history.dto';

@Injectable()
export class ChatHistoryService {
  constructor(private prisma: PrismaService) {}

  create(userId: string, dto: CreateChatHistoryDto) {
    return this.prisma.chatHistory.create({
      data: {
        userId,
        message: dto.message,
        response: dto.response,
      },
    });
  }

  findAll(userId: string) {
    return this.prisma.chatHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
