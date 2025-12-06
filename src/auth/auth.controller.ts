// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
  Req,
  Patch,
  BadRequestException,
  Param,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { CreateNewPasswordDto } from './dto/create-new-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Roles } from './roles.decorator';
import { RolesGuard } from './guards/roles.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import {
  ErrorResponseDto,
  ValidationErrorResponseDto,
} from '../common/dto/error-response.dto';
import {
  MessageResponseDto,
  TokenResponseDto,
  EmailVerifiedResponseDto,
  VerificationEmailSentResponseDto,
  PasswordResetResponseDto,
  UserRegisteredResponseDto,
} from '../common/dto/success-response.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { VerifyEmailQueryDto } from './dto/verify-email-query.dto';
import { UpgradeRoleDto } from './dto/upgrade-role.dto';

@ApiTags('Auth') // Groups under "Auth" in Swagger UI
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: UserRegisteredResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validation failed or user already exists',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Sign in returning user' })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in.',
    type: TokenResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials or email not verified',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validation failed',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.authService.login(dto, req);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Send password reset email' })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent successfully',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validation failed or user not found',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Change old password to new password' })
  @ApiBearerAuth()
  @Patch('change-password')
  @ApiResponse({
    status: 200,
    description: 'Password updated successfully',
    type: PasswordResetResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request - Validation failed or current password incorrect',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  async changePassword(@Req() req: Request, @Body() dto: ResetPasswordDto) {
    const user = req.user as { sub: string };
    return this.authService.resetPassword(user.sub, dto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password using token' })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
    type: PasswordResetResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validation failed or invalid token',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  resetPassword(@Body() dto: CreateNewPasswordDto) {
    return this.authService.createNewPassword(dto);
  }

  @Get('verify-email')
  @ApiOperation({ summary: 'Verify email with token' })
  @ApiQuery({
    name: 'token',
    description: 'Email verification token',
    required: true,
    type: 'string',
    example: 'abc123def456ghi789',
  })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully',
    type: EmailVerifiedResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid or expired token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  verifyEmail(@Query() query: VerifyEmailQueryDto) {
    return this.authService.verifyEmail(query.token);
  }

  @Post('resend-verification')
  @ApiOperation({ summary: 'Resend email verification link' })
  @ApiResponse({
    status: 200,
    description: 'Verification email resent successfully',
    type: VerificationEmailSentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validation failed or user not found',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerificationEmail(dto.email);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @Get('admin-only')
  @ApiOperation({ summary: 'Admin-only endpoint' })
  getAdminStuff() {
    return 'Secret admin data';
  }

  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh JWT access token' })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: TokenResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validation failed',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired refresh token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.token);
  }

  // Debug endpoint to check user status
  @Get('debug-user/:email')
  @ApiOperation({ summary: 'Debug user status (temporary)' })
  @ApiResponse({
    status: 200,
    description: 'User status retrieved',
  })
  async debugUser(@Param('email') email: string) {
    return this.authService.debugUser(email);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @Get('admin-stats')
  @ApiOperation({ summary: 'Admin-only stats' })
  getAdminStats() {
    return 'Admin-only data';
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('upgrade-role')
  @ApiOperation({
    summary: 'Upgrade user role',
    description:
      'Upgrade user role (e.g., USER → PREMIUM). Users can self-upgrade to PREMIUM. Admins can assign any role.',
  })
  @ApiResponse({
    status: 200,
    description: 'Role upgraded successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid role or user already has that role',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions to upgrade to this role',
    type: ErrorResponseDto,
  })
  async upgradeRole(
    @Body() dto: UpgradeRoleDto,
    @Req() req: Request,
  ) {
    const user = req.user as { sub: string; role: string };
    return this.authService.upgradeRole(
      user.sub,
      dto.role,
      { userId: user.sub, role: user.role as any },
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @Post('admin/upgrade-role/:userId')
  @ApiOperation({
    summary: 'Admin: Upgrade any user role',
    description: 'Administrators can upgrade or downgrade any user role',
  })
  @ApiResponse({
    status: 200,
    description: 'User role updated successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
    type: ErrorResponseDto,
  })
  async adminUpgradeRole(
    @Param('userId') userId: string,
    @Body() dto: UpgradeRoleDto,
    @Req() req: Request,
  ) {
    const admin = req.user as { sub: string; role: string };
    return this.authService.upgradeRole(
      userId,
      dto.role,
      { userId: admin.sub, role: admin.role as any },
    );
  }
}
