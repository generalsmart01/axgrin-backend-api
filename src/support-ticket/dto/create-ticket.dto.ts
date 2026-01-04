import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TicketCategory, TicketPriority } from './update-ticket.dto';

export class CreateTicketDto {
  @ApiProperty({ description: 'Ticket title', example: 'Unable to reset password' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Detailed description of the issue', example: 'I am unable to reset my password...' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ 
    enum: TicketCategory, 
    description: 'Ticket category',
    default: TicketCategory.GENERAL 
  })
  @IsEnum(TicketCategory)
  @IsOptional()
  category?: TicketCategory;

  @ApiPropertyOptional({ 
    enum: TicketPriority, 
    description: 'Ticket priority',
    default: TicketPriority.MEDIUM 
  })
  @IsEnum(TicketPriority)
  @IsOptional()
  priority?: TicketPriority;
}

