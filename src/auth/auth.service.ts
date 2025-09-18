// src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { randomBytes } from 'crypto';
import { addMinutes } from 'date-fns';
import { PrismaService } from 'prisma/prisma.service';
import { MailerService } from '@nestjs-modules/mailer';
import { differenceInMinutes } from 'date-fns';
import { Request } from 'express';
import { CreateNewPasswordDto } from './dto/create-new-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Role } from '@prisma/client';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private mailerService: MailerService,
    private notificationService: NotificationService,
  ) {}

  // Register Auth
  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new BadRequestException('User already exists');

    const hashed = await bcrypt.hash(dto.password, 10);
    const token = randomBytes(32).toString('hex');
    const expiresAt = addMinutes(new Date(), 30);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: 'USER',
        password: hashed,
        emailVerificationToken: token,
        emailVerificationTokenExp: expiresAt,
      },
    });

    // Send welcome notification
    await this.notificationService.sendWelcomeNotification(
      user.id,
      dto.firstName,
    );

    await this.mailerService.sendMail({
      to: dto.email,
      subject: 'Verify your email - Axgrin',
      template: './verify-email',
      context: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        verifyUrl: `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`,
      },
    });

    return { message: 'Account created. Please check your email to verify.' };
  }

  async login(dto: LoginDto, req: Request) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.emailVerified) {
      throw new UnauthorizedException(
        'Please verify your email before logging in.',
      );
    }

    // Log login activity
    await this.prisma.loginActivity.create({
      data: {
        userId: user.id,
        email: user.email,
        ipAddress: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || '',
        timestamp: new Date(),
      },
    });

    // Send login notification
    await this.notificationService.sendLoginNotification(
      user.id,
      req.ip || 'unknown',
      req.headers['user-agent'] || '',
    );

    // Return signed tokens
    return this.signTokens(user.id, user.email, user.role);
  }

  private async signTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role }; // ✅ include role here

    const accessToken = this.jwt.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwt.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken },
    });

    return { accessToken, refreshToken };
  }

  // Forgot Password Auth
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      return {
        message:
          'If an account with that email exists, a reset link has been sent.',
      };
    }

    const token = randomBytes(32).toString('hex');
    const expiration = addMinutes(new Date(), 15);

    await this.prisma.user.update({
      where: { email: dto.email },
      data: { resetToken: token, resetTokenExp: expiration },
    });

    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Reset Your Password - Axgrin',
      template: './reset-password',
      context: {
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User',
        resetUrl,
      },
    });

    return {
      message:
        'If an account with that email exists, a reset link has been sent.',
    };
  }

  // Create New Password
  async createNewPassword(dto: CreateNewPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: dto.token,
        resetTokenExp: { gte: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashed = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        resetToken: null,
        resetTokenExp: null,
      },
    });

    return { message: 'Password has been reset successfully' };
  }

  // Verify Email
  async verifyEmail(token: string) {
    if (!token) {
      throw new BadRequestException('Token is required');
    }

    console.log('Verifying email with token:', token);

    const user = await this.prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationTokenExp: { gte: new Date() },
      },
    });

    if (!user) {
      console.log('No user found with valid token');
      throw new BadRequestException('Invalid or expired token');
    }

    console.log('User found:', {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
    });

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationTokenExp: null,
      },
    });

    console.log('User updated:', {
      id: updatedUser.id,
      emailVerified: updatedUser.emailVerified,
    });

    return { message: 'Email verified successfully' };
  }

  logout() {
    // JWT logout is handled client-side by deleting the token
    return { message: 'Logged out successfully' };
  }

  // Debug method to check user status
  async debugUser(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        emailVerificationToken: true,
        emailVerificationTokenExp: true,
        resetToken: true,
        resetTokenExp: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return { error: 'User not found' };
    }

    return {
      user,
      currentTime: new Date(),
      tokenExpired: user.emailVerificationTokenExp
        ? user.emailVerificationTokenExp < new Date()
        : null,
      resetTokenExpired: user.resetTokenExp
        ? user.resetTokenExp < new Date()
        : null,
    };
  }

  // Resend Verification Email
  async resendVerificationEmail(email: string) {
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) throw new BadRequestException('User not found');
    if (user.emailVerified)
      throw new BadRequestException('Email already verified');

    // Rate limit: allow resend only every 5 minutes
    if (
      user.lastVerificationEmailSentAt &&
      differenceInMinutes(new Date(), user.lastVerificationEmailSentAt) < 5
    ) {
      throw new BadRequestException(
        'You can only request once every 5 minutes',
      );
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = addMinutes(new Date(), 30);

    await this.prisma.user.update({
      where: { email },
      data: {
        emailVerificationToken: token,
        emailVerificationTokenExp: expiresAt,
        lastVerificationEmailSentAt: new Date(),
      },
    });

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Verify your email - Axgrin',
      template: './verify-email',
      context: {
        firstName: user.firstName,
        lastName: user.lastName,
        verifyUrl: `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`,
      },
    });

    return { message: 'Verification email resent successfully' };
  }

  // Refresh Token
  async refreshToken(token: string) {
    if (!token) {
      throw new BadRequestException('Refresh token is required');
    }

    try {
      const payload = this.jwt.verify(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || user.refreshToken !== token) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.signTokens(user.id, user.email, user.role); // ✅ Use user.role
    } catch (e) {
      throw new UnauthorizedException('Token expired or invalid');
    }
  }

  // Inside AuthService
  async resetPassword(userId: string, dto: ResetPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) throw new BadRequestException('User not found');

    const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isMatch)
      throw new BadRequestException('Current password is incorrect');

    const newHashed = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: newHashed },
    });

    return { message: 'Password updated successfully' };
  }
}
