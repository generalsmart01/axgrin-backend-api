import { ApiProperty } from '@nestjs/swagger';

export class UpgradeRoleResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Role upgraded successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Updated user information',
    type: 'object',
    properties: {
      id: { type: 'string', example: 'clx1234567890abcdef' },
      email: { type: 'string', example: 'user@example.com' },
      role: { type: 'string', enum: ['USER', 'ADMIN', 'PREMIUM', 'VIEWER', 'CUSTOMER_CARE'] },
    },
  })
  user: {
    id: string;
    email: string;
    role: string;
  };
}
