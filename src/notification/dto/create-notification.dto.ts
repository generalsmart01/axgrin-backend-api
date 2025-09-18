// src/notification/dto/create-notification.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty({
    description: 'The notification message content',
    example: 'Your budget goal for Food & Dining has been exceeded by $50.00',
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}
