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
  ApiQuery,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
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
import { UpgradeRoleResponseDto } from './dto/upgrade-role-response.dto';
import {
  ApiStandardResponses,
  ApiStandardErrorResponses,
  ApiSuccessResponse,
  ApiForbiddenResponse,
} from '../common/decorators/api-responses.decorator';
import { ApiOkResponse } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register new user',
    description: 'Create a new user account. Email verification is required before login.',
  })
  @ApiBody({ type: RegisterDto })
  @ApiStandardResponses(UserRegisteredResponseDto, 'User registered successfully', true)
  @ApiStandardErrorResponses()
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticate user and receive JWT tokens. Email must be verified.',
  })
  @ApiBody({ type: LoginDto })
  @ApiSuccessResponse(TokenResponseDto, 'User successfully logged in')
  @ApiStandardErrorResponses()
  login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.authService.login(dto, req);
  }

  @Post('forgot-password')
  @ApiOperation({
    summary: 'Request password reset',
    description: 'Send password reset email to user',
  })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiSuccessResponse(MessageResponseDto, 'Password reset email sent successfully')
  @ApiStandardErrorResponses()
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Change password',
    description: 'Change password for authenticated user using current password',
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiSuccessResponse(PasswordResetResponseDto, 'Password updated successfully')
  @ApiStandardErrorResponses()
  async changePassword(@Req() req: Request, @Body() dto: ResetPasswordDto) {
    const user = req.user as { sub: string };
    return this.authService.resetPassword(user.sub, dto);
  }

  @Post('reset-password')
  @ApiOperation({
    summary: 'Reset password with token',
    description: 'Reset password using token from password reset email',
  })
  @ApiBody({ type: CreateNewPasswordDto })
  @ApiSuccessResponse(PasswordResetResponseDto, 'Password reset successfully')
  @ApiStandardErrorResponses()
  resetPassword(@Body() dto: CreateNewPasswordDto) {
    return this.authService.createNewPassword(dto);
  }

  @Get('verify-email')
  @ApiOperation({
    summary: 'Verify email address',
    description: 'Verify email address using token sent to user\'s email',
  })
  @ApiQuery({
    name: 'token',
    description: 'Email verification token',
    required: true,
    type: 'string',
    example: 'abc123def456ghi789',
  })
  @ApiSuccessResponse(EmailVerifiedResponseDto, 'Email verified successfully')
  @ApiStandardErrorResponses()
  verifyEmail(@Query() query: VerifyEmailQueryDto) {
    return this.authService.verifyEmail(query.token);
  }

  @Post('resend-verification')
  @ApiOperation({
    summary: 'Resend verification email',
    description: 'Resend email verification link to user',
  })
  @ApiBody({ type: ResendVerificationDto })
  @ApiSuccessResponse(VerificationEmailSentResponseDto, 'Verification email resent successfully')
  @ApiStandardErrorResponses()
  resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerificationEmail(dto.email);
  }

  @Post('refresh-token')
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Generate a new access token using refresh token',
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiSuccessResponse(TokenResponseDto, 'Token refreshed successfully')
  @ApiStandardErrorResponses()
  refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.token);
  }

  @Post('upgrade-role')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Upgrade user role',
    description:
      'Upgrade user role (e.g., USER → PREMIUM). Users can self-upgrade to PREMIUM. Admins can assign any role.',
  })
  @ApiBody({ type: UpgradeRoleDto })
  @ApiSuccessResponse(UpgradeRoleResponseDto, 'Role upgraded successfully')
  @ApiForbiddenResponse('Forbidden - Insufficient permissions to upgrade to this role')
  @ApiStandardErrorResponses()
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

  @Post('admin/upgrade-role/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Admin: Upgrade any user role',
    description: 'Administrators can upgrade or downgrade any user role',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID to upgrade',
    example: 'clx1234567890abcdef',
    type: String,
  })
  @ApiBody({ type: UpgradeRoleDto })
  @ApiSuccessResponse(UpgradeRoleResponseDto, 'User role updated successfully')
  @ApiForbiddenResponse('Forbidden - Admin access required')
  @ApiStandardErrorResponses()
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

  @Get('admin-only')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Admin-only endpoint',
    description: 'Example admin-only endpoint for testing role-based access',
  })
  @ApiOkResponse({
    description: 'Admin data retrieved',
    schema: {
      type: 'string',
      example: 'Secret admin data',
    },
  })
  @ApiForbiddenResponse('Forbidden - Admin access required')
  @ApiStandardErrorResponses()
  getAdminStuff() {
    return 'Secret admin data';
  }

  @Get('admin-stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Admin-only stats',
    description: 'Example admin-only stats endpoint',
  })
  @ApiOkResponse({
    description: 'Admin stats retrieved',
    schema: {
      type: 'string',
      example: 'Admin-only data',
    },
  })
  @ApiForbiddenResponse('Forbidden - Admin access required')
  @ApiStandardErrorResponses()
  getAdminStats() {
    return 'Admin-only data';
  }

  @Get('debug-user/:email')
  @ApiOperation({
    summary: 'Debug user status',
    description: 'Debug endpoint to check user status (temporary)',
  })
  @ApiParam({
    name: 'email',
    description: 'User email address',
    example: 'user@example.com',
    type: String,
  })
  @ApiOkResponse({
    description: 'User status retrieved',
    schema: {
      type: 'object',
    },
  })
  @ApiStandardErrorResponses()
  async debugUser(@Param('email') email: string) {
    return this.authService.debugUser(email);
  }
}
