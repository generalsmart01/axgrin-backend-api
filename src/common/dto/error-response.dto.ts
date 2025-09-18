import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ description: 'HTTP status code', example: 400 })
  statusCode: number;

  @ApiProperty({ description: 'Error message', example: 'Bad Request' })
  message: string;

  @ApiProperty({ description: 'Error details', example: 'Validation failed' })
  error: string;

  @ApiProperty({
    description: 'Timestamp of the error',
    example: '2024-01-01T00:00:00.000Z',
  })
  timestamp: string;

  @ApiProperty({ description: 'Request path', example: '/api/users' })
  path: string;
}

export class ValidationErrorResponseDto {
  @ApiProperty({ description: 'HTTP status code', example: 400 })
  statusCode: number;

  @ApiProperty({
    description: 'Array of validation error messages',
    example: [
      'email must be a valid email',
      'password must be at least 6 characters',
    ],
  })
  message: string[];

  @ApiProperty({ description: 'Error type', example: 'Bad Request' })
  error: string;

  @ApiProperty({
    description: 'Timestamp of the error',
    example: '2024-01-01T00:00:00.000Z',
  })
  timestamp: string;

  @ApiProperty({ description: 'Request path', example: '/api/auth/register' })
  path: string;
}

export class ErrorResponseDtoWithStringMessage {
  @ApiProperty({ description: 'HTTP status code', example: 400 })
  statusCode: number;

  @ApiProperty({ description: 'Error message', example: 'Bad Request' })
  message: string;

  @ApiProperty({ description: 'Error details', example: 'Validation failed' })
  error: string;

  @ApiProperty({
    description: 'Timestamp of the error',
    example: '2024-01-01T00:00:00.000Z',
  })
  timestamp: string;

  @ApiProperty({ description: 'Request path', example: '/api/users' })
  path: string;
}
