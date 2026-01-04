import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

// Ticket enums (matching Prisma schema)
export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  PENDING = 'PENDING',
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum TicketCategory {
  TECHNICAL = 'TECHNICAL',
  BILLING = 'BILLING',
  ACCOUNT = 'ACCOUNT',
  FEATURE_REQUEST = 'FEATURE_REQUEST',
  BUG_REPORT = 'BUG_REPORT',
  GENERAL = 'GENERAL',
}

export class UpdateTicketDto {
  @ApiPropertyOptional({ description: 'Ticket title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Ticket description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: TicketStatus, description: 'Ticket status' })
  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;

  @ApiPropertyOptional({ enum: TicketPriority, description: 'Ticket priority' })
  @IsEnum(TicketPriority)
  @IsOptional()
  priority?: TicketPriority;

  @ApiPropertyOptional({ enum: TicketCategory, description: 'Ticket category' })
  @IsEnum(TicketCategory)
  @IsOptional()
  category?: TicketCategory;

  @ApiPropertyOptional({ description: 'Assign ticket to staff member (user ID)' })
  @IsString()
  @IsOptional()
  assignedTo?: string;
}

