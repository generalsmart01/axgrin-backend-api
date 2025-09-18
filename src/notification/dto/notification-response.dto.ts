// src/notification/dto/notification-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class NotificationResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the notification',
    example: 'clx1234567890abcdef',
    type: 'string',
  })
  id: string;

  @ApiProperty({
    description: 'User ID who owns this notification',
    example: 'clx0987654321fedcba',
    type: 'string',
  })
  userId: string;

  @ApiProperty({
    description: 'The notification message content',
    example: 'Your budget goal for Food & Dining has been exceeded by $50.00',
    type: 'string',
  })
  message: string;

  @ApiProperty({
    description: 'Whether the notification has been read',
    example: false,
    type: 'boolean',
  })
  read: boolean;

  @ApiProperty({
    description: 'When the notification was created',
    example: '2024-01-15T10:30:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;
}

export class NotificationListResponseDto {
  @ApiProperty({
    description: 'Array of notifications',
    type: [NotificationResponseDto],
  })
  notifications: NotificationResponseDto[];

  @ApiProperty({
    description: 'Total count of notifications',
    example: 15,
    type: 'number',
  })
  total: number;

  @ApiProperty({
    description: 'Number of unread notifications',
    example: 3,
    type: 'number',
  })
  unreadCount: number;
}
