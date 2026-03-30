import { ApiProperty } from '@nestjs/swagger';
import { Gender, Role } from '@prisma/client';

export class ProfileResponseDto {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'User email' })
  email: string;

  @ApiProperty({
    description: 'User first name',
    nullable: true,
    type: 'string',
  })
  firstName: string | null;

  @ApiProperty({
    description: 'User last name',
    nullable: true,
    type: 'string',
  })
  lastName: string | null;

  @ApiProperty({ description: 'User role', enum: Role })
  role: Role;

  @ApiProperty({
    description: 'User gender',
    enum: Gender,
    nullable: true,
    type: 'string',
  })
  gender: Gender | null;

  @ApiProperty({ description: 'Verification status' })
  isVerified: boolean;

  @ApiProperty({
    description: 'Account creation date',
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last profile update date',
    type: 'string',
    format: 'date-time',
  })
  updatedAt: Date;

  @ApiProperty({ description: 'Profile bio', nullable: true, type: 'string' })
  bio: string | null;

  @ApiProperty({
    description: 'Profile avatar URL',
    nullable: true,
    type: 'string',
  })
  avatarUrl: string | null;

  @ApiProperty({
    description: 'Last verification email sent date',
    nullable: true,
    type: 'string',
    format: 'date-time',
  })
  lastVerificationEmailSentAt: Date | null;

  @ApiProperty({
    description: 'User settings',
    nullable: true,
    type: 'object',
    properties: {
      currency: { type: 'string' },
      theme: { type: 'string' },
    },
  })
  settings: {
    currency: string;
    theme: string;
  } | null;

  @ApiProperty({ description: 'Total income count' })
  totalIncomes: number;

  @ApiProperty({ description: 'Total expense count' })
  totalExpenses: number;

  @ApiProperty({ description: 'Total budgets count' })
  totalBudgets: number;

  @ApiProperty({ description: 'Total categories count' })
  totalCategories: number;
}
