// src/chat-history/chat-history.controller.ts
import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ChatHistoryService } from './chat-history.service';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBody,
} from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ReadOnlyGuard } from 'src/auth/guards/read-only.guard';
import { CreateChatHistoryDto } from './dto/create-chat-history.dto';
import {
  ErrorResponseDto,
  ValidationErrorResponseDto,
} from '../common/dto/error-response.dto';
import { ChatHistoryResponseDto } from './dto/chat-history-response.dto';

@ApiTags('Chat History')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ReadOnlyGuard)
@Controller('chat-history')
export class ChatHistoryController {
  constructor(private readonly chatService: ChatHistoryService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new chat history entry',
    description:
      'Store a conversation between the user and AI assistant for future reference',
  })
  @ApiBody({ type: CreateChatHistoryDto })
  @ApiCreatedResponse({
    description: 'Chat history entry created successfully',
    type: ChatHistoryResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validation failed',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  create(@Body() dto: CreateChatHistoryDto, @Req() req: Request) {
    const user = req.user as any;
    return this.chatService.create(user.sub, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all chat history entries for current user',
    description: 'Retrieve all stored conversations between the user and AI assistant',
  })
  @ApiOkResponse({
    description: 'Chat history entries retrieved successfully',
    type: [ChatHistoryResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  findAll(@Req() req: Request) {
    const user = req.user as any;
    return this.chatService.findAll(user.sub);
  }
}
