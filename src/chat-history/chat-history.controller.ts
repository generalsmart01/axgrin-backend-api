// src/chat-history/chat-history.controller.ts
import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ChatHistoryService } from './chat-history.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateChatHistoryDto } from './dto/create-chat-history.dto';

@ApiTags('Chat History')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat-history')
export class ChatHistoryController {
  constructor(private readonly chatService: ChatHistoryService) {}

  @Post()
  create(@Body() dto: CreateChatHistoryDto, @Req() req: Request) {
    const user = req.user as any;
    return this.chatService.create(user.sub, dto);
  }

  @Get()
  findAll(@Req() req: Request) {
    const user = req.user as any;
    return this.chatService.findAll(user.sub);
  }
}
