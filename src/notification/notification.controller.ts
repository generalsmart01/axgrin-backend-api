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
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { Request } from 'express';
import {
  ApiStandardResponses,
  ApiStandardErrorResponses,
  ApiNotFoundResponse,
  ApiSuccessResponse,
} from '../common/decorators/api-responses.decorator';

@ApiTags('Notifications')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @ApiOperation({
    summary: 'Create notification',
    description: 'Create a new notification for the authenticated user. Typically used by the system for alerts.',
  })
  @ApiBody({ type: CreateNotificationDto })
  @ApiStandardResponses(NotificationResponseDto, 'Notification created successfully', true)
  @ApiStandardErrorResponses()
  create(@Body() dto: CreateNotificationDto, @Req() req: Request) {
    const user = req.user as any;
    return this.notificationService.create(user.sub, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all notifications',
    description: 'Retrieve all notifications for the authenticated user, including read and unread status.',
  })
  @ApiSuccessResponse(NotificationListResponseDto, 'Notifications retrieved successfully')
  @ApiStandardErrorResponses()
  findAll(@Req() req: Request) {
    const user = req.user as any;
    return this.notificationService.findAll(user.sub);
  }

  @Patch(':id/read')
  @ApiOperation({
    summary: 'Mark notification as read',
    description: 'Mark a specific notification as read for the authenticated user.',
  })
  @ApiParam({
    name: 'id',
    description: 'Notification ID',
    example: 'clx1234567890abcdef',
    type: String,
  })
  @ApiSuccessResponse(NotificationResponseDto, 'Notification marked as read successfully')
  @ApiNotFoundResponse('Notification not found')
  @ApiStandardErrorResponses()
  markAsRead(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as any;
    return this.notificationService.markAsRead(id, user.sub);
  }
}
