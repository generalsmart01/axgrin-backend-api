// src/chat-history/dto/chat-history-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class ChatHistoryResponseDto {
  @ApiProperty({
    description: 'Chat history unique identifier',
    example: 'clx1234567890abcdef',
    type: 'string',
  })
  id: string;

  @ApiProperty({
    description: 'User ID who owns this chat history',
    example: 'clx0987654321fedcba',
    type: 'string',
  })
  userId: string;

  @ApiProperty({
    description: 'The user\'s message or question',
    example: 'How can I reduce my monthly expenses?',
    type: 'string',
  })
  message: string;

  @ApiProperty({
    description: 'The AI assistant\'s response',
    example: 'Here are some strategies to reduce your monthly expenses...',
    type: 'string',
  })
  response: string;

  @ApiProperty({
    description: 'When the chat history was created',
    example: '2024-01-15T10:30:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;
}

