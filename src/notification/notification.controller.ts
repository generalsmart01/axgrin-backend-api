// src/notification/notification.controller.ts
import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UseGuards,
  Patch,
  Param,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import {
  NotificationResponseDto,
  NotificationListResponseDto,
} from './dto/notification-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new notification',
    description:
      'Creates a new notification for the authenticated user. Typically used by the system to send alerts about budget goals, expense limits, etc.',
  })
  @ApiCreatedResponse({
    description: 'Notification created successfully',
    type: NotificationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  create(@Body() dto: CreateNotificationDto, @Req() req: Request) {
    const user = req.user as any;
    return this.notificationService.create(user.sub, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all notifications',
    description:
      'Retrieves all notifications for the authenticated user, including read and unread notifications with metadata.',
  })
  @ApiOkResponse({
    description: 'Notifications retrieved successfully',
    type: NotificationListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  findAll(@Req() req: Request) {
    const user = req.user as any;
    return this.notificationService.findAll(user.sub);
  }

  @Patch(':id/read')
  @ApiOperation({
    summary: 'Mark notification as read',
    description:
      'Marks a specific notification as read for the authenticated user.',
  })
  @ApiParam({
    name: 'id',
    description: 'Notification ID to mark as read',
    example: 'clx1234567890abcdef',
    type: 'string',
  })
  @ApiOkResponse({
    description: 'Notification marked as read successfully',
    type: NotificationResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Notification not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  markAsRead(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as any;
    return this.notificationService.markAsRead(id, user.sub);
  }
}
