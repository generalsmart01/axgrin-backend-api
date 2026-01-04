import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiOkResponse,
} from '@nestjs/swagger';
import { SupportTicketService } from './support-ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketResponseDto } from './dto/ticket-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  ApiStandardResponses,
  ApiStandardErrorResponses,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiSuccessResponse,
} from '../common/decorators/api-responses.decorator';
import { MessageResponseDto } from '../common/dto/success-response.dto';
import { AssignTicketDto } from '../common/dto/assign-ticket.dto';

@ApiTags('Support Tickets')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('support-tickets')
export class SupportTicketController {
  constructor(private readonly supportTicketService: SupportTicketService) {}

  @Post()
  @ApiOperation({
    summary: 'Create support ticket',
    description: 'Create a new support ticket. Users can create tickets for assistance.',
  })
  @ApiBody({ type: CreateTicketDto })
  @ApiStandardResponses(TicketResponseDto, 'Ticket created successfully', true)
  @ApiStandardErrorResponses()
  create(@Request() req, @Body() createTicketDto: CreateTicketDto) {
    return this.supportTicketService.create(req.user.userId, createTicketDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all tickets',
    description: 'Retrieve all support tickets. Users see only their own tickets. Admins and Customer Care see all tickets.',
  })
  @ApiSuccessResponse(Array<TicketResponseDto>, 'Tickets retrieved successfully')
  @ApiStandardErrorResponses()
  findAll(@Request() req) {
    return this.supportTicketService.findAll(req.user.userId, req.user.role);
  }

  @Get('statistics')
  @Roles('ADMIN', 'CUSTOMER_CARE')
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Get ticket statistics',
    description: 'Get comprehensive ticket statistics. Available only to Admins and Customer Care staff.',
  })
  @ApiOkResponse({
    description: 'Ticket statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', example: 150 },
        open: { type: 'number', example: 45 },
        inProgress: { type: 'number', example: 12 },
        resolved: { type: 'number', example: 80 },
        closed: { type: 'number', example: 10 },
        pending: { type: 'number', example: 3 },
        averageResponseTime: { type: 'number', example: 240, description: 'Average response time in minutes' },
      },
    },
  })
  @ApiForbiddenResponse('Forbidden - Admin or Customer Care role required')
  @ApiStandardErrorResponses()
  getStatistics() {
    return this.supportTicketService.getTicketStatistics();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get ticket by ID',
    description: 'Retrieve a specific support ticket by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Ticket ID',
    example: 'clx1234567890abcdef',
    type: String,
  })
  @ApiSuccessResponse(TicketResponseDto, 'Ticket retrieved successfully')
  @ApiNotFoundResponse('Ticket not found')
  @ApiForbiddenResponse('Forbidden - You can only view your own tickets')
  @ApiStandardErrorResponses()
  findOne(@Request() req, @Param('id') id: string) {
    return this.supportTicketService.findOne(req.user.userId, id, req.user.role);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update ticket',
    description: 'Update a support ticket. Users can only update their own open tickets. Admins and Customer Care can update any ticket.',
  })
  @ApiParam({
    name: 'id',
    description: 'Ticket ID',
    example: 'clx1234567890abcdef',
    type: String,
  })
  @ApiBody({ type: UpdateTicketDto })
  @ApiSuccessResponse(TicketResponseDto, 'Ticket updated successfully')
  @ApiNotFoundResponse('Ticket not found')
  @ApiForbiddenResponse('Forbidden - Insufficient permissions')
  @ApiStandardErrorResponses()
  update(@Request() req, @Param('id') id: string, @Body() updateTicketDto: UpdateTicketDto) {
    return this.supportTicketService.update(req.user.userId, id, updateTicketDto, req.user.role);
  }

  @Post(':id/assign')
  @Roles('ADMIN', 'CUSTOMER_CARE')
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Assign ticket to staff',
    description: 'Assign a support ticket to a Customer Care staff member or Admin. Available only to Admins and Customer Care.',
  })
  @ApiParam({
    name: 'id',
    description: 'Ticket ID',
    example: 'clx1234567890abcdef',
    type: String,
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['assignToUserId'],
      properties: {
        assignToUserId: {
          type: 'string',
          description: 'User ID of staff member to assign ticket to',
          example: 'clx0987654321fedcba',
        },
      },
    },
  })
  @ApiSuccessResponse(TicketResponseDto, 'Ticket assigned successfully')
  @ApiNotFoundResponse('Ticket not found')
  @ApiForbiddenResponse('Forbidden - Admin or Customer Care role required')
  @ApiStandardErrorResponses()
  assignTicket(
    @Request() req,
    @Param('id') ticketId: string,
    @Body() body: AssignTicketDto,
  ) {
    return this.supportTicketService.assignTicket(req.user.userId, ticketId, body.assignToUserId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Delete ticket',
    description: 'Delete a support ticket. Available only to Admins.',
  })
  @ApiParam({
    name: 'id',
    description: 'Ticket ID',
    example: 'clx1234567890abcdef',
    type: String,
  })
  @ApiSuccessResponse(MessageResponseDto, 'Ticket deleted successfully')
  @ApiNotFoundResponse('Ticket not found')
  @ApiForbiddenResponse('Forbidden - Admin role required')
  @ApiStandardErrorResponses()
  remove(@Request() req, @Param('id') id: string) {
    return this.supportTicketService.remove(req.user.userId, id, req.user.role);
  }
}
