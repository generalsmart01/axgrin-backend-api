import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ChatHistoryService } from './chat-history.service';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiBody,
} from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ReadOnlyGuard } from 'src/auth/guards/read-only.guard';
import { CreateChatHistoryDto } from './dto/create-chat-history.dto';
import { ChatHistoryResponseDto } from './dto/chat-history-response.dto';
import {
  ApiStandardResponses,
  ApiStandardErrorResponses,
  ApiSuccessResponse,
} from '../common/decorators/api-responses.decorator';
import { ApiOkResponse } from '@nestjs/swagger';

@ApiTags('Chat History')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, ReadOnlyGuard)
@Controller('chat-history')
export class ChatHistoryController {
  constructor(private readonly chatService: ChatHistoryService) {}

  @Post()
  @ApiOperation({
    summary: 'Create chat history entry',
    description: 'Store a conversation between the user and AI assistant for future reference',
  })
  @ApiBody({ type: CreateChatHistoryDto })
  @ApiStandardResponses(ChatHistoryResponseDto, 'Chat history entry created successfully', true)
  @ApiStandardErrorResponses()
  create(@Body() dto: CreateChatHistoryDto, @Req() req: Request) {
    const user = req.user as any;
    return this.chatService.create(user.sub, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all chat history',
    description: 'Retrieve all stored conversations between the user and AI assistant',
  })
  @ApiOkResponse({
    description: 'Chat history entries retrieved successfully',
    type: [ChatHistoryResponseDto],
  })
  @ApiStandardErrorResponses()
  findAll(@Req() req: Request) {
    const user = req.user as any;
    return this.chatService.findAll(user.sub);
  }
}
