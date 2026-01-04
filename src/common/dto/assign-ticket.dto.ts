import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignTicketDto {
  @ApiProperty({
    description: 'User ID of staff member to assign ticket to',
    example: 'clx0987654321fedcba',
  })
  @IsString()
  @IsNotEmpty()
  assignToUserId: string;
}

