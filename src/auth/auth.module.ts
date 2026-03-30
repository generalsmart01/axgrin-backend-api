// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtStrategy } from './strategies/jwt.strategies';
import { AuthController } from './auth.controller'; // ✅ Import the controller
import { UsersModule } from 'src/users/users.module';
import { NotificationModule } from '../notification/notification.module';
import { RoleUpgradeService } from './services/role-upgrade.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
    UsersModule, // 👈 Add this
    NotificationModule, // 👈 Add this for notifications
  ],

  controllers: [AuthController], // ✅ Register the controller here
  providers: [AuthService, JwtStrategy, PrismaService, RoleUpgradeService],
  exports: [AuthService, RoleUpgradeService],
})
export class AuthModule {}
