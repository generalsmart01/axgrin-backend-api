import { ApiProperty } from '@nestjs/swagger';

export class MessageResponseDto {
  @ApiProperty({
    description: 'Response message',
    example: 'Operation completed successfully',
  })
  message: string;
}

export class EmailVerifiedResponseDto {
  @ApiProperty({
    description: 'Email verification success message',
    example: 'Email verified successfully',
  })
  message: string;
}

export class VerificationEmailSentResponseDto {
  @ApiProperty({
    description: 'Verification email sent message',
    example: 'Verification email resent successfully',
  })
  message: string;
}

export class PasswordResetResponseDto {
  @ApiProperty({
    description: 'Password reset success message',
    example: 'Password has been reset successfully',
  })
  message: string;
}

export class UserRegisteredResponseDto {
  @ApiProperty({
    description: 'User registration success message',
    example: 'Account created. Please check your email to verify.',
  })
  message: string;
}

export class TokenResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;
}
