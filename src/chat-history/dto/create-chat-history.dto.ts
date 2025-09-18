// src/chat-history/dto/create-chat-history.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChatHistoryDto {
  @ApiProperty({
    description: "The user's message or question",
    example: 'How can I reduce my monthly expenses?',
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiProperty({
    description: "The AI assistant's response",
    example:
      'Here are some strategies to reduce your monthly expenses:\n\n1. Track all your spending for a month to identify patterns\n2. Create a realistic budget and stick to it\n3. Cut back on non-essential expenses like dining out\n4. Shop around for better deals on recurring bills\n5. Consider cooking at home more often\n6. Look for free or low-cost entertainment options\n\nWould you like me to help you create a specific budget plan?',
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  response: string;
}
