import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class VerifyEmailQueryDto {
  @ApiProperty({
    description: 'Email verification token',
    example: 'abc123def456ghi789',
    required: true,
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}
