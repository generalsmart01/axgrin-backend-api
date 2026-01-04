import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TicketStatus, TicketPriority, TicketCategory } from './update-ticket.dto';

export class TicketResponseDto {
  @ApiProperty({ description: 'Ticket ID' })
  id: string;

  @ApiProperty({ description: 'User ID who created the ticket' })
  userId: string;

  @ApiPropertyOptional({ description: 'Staff member assigned to ticket' })
  assignedTo?: string;

  @ApiProperty({ description: 'Ticket title' })
  title: string;

  @ApiProperty({ description: 'Ticket description' })
  description: string;

  @ApiProperty({ enum: TicketCategory, description: 'Ticket category' })
  category: TicketCategory;

  @ApiProperty({ enum: TicketStatus, description: 'Ticket status' })
  status: TicketStatus;

  @ApiProperty({ enum: TicketPriority, description: 'Ticket priority' })
  priority: TicketPriority;

  @ApiPropertyOptional({ description: 'When ticket was resolved' })
  resolvedAt?: Date;

  @ApiProperty({ description: 'When ticket was created' })
  createdAt: Date;

  @ApiProperty({ description: 'When ticket was last updated' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'User information' })
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };

  @ApiPropertyOptional({ description: 'Assigned staff information' })
  assignedStaff?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

