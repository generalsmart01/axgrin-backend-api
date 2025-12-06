// src/common/guards/premium.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PREMIUM_KEY } from '../decorators/premium.decorator';
import { Role } from '@prisma/client';

/**
 * Guard to restrict endpoints to PREMIUM users only
 * PREMIUM and ADMIN roles can access premium features
 */
@Injectable()
export class PremiumGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPremiumRequired = this.reflector.getAllAndOverride<boolean>(
      PREMIUM_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!isPremiumRequired) {
      return true; // No premium requirement
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Allow PREMIUM and ADMIN roles
    if (user.role === Role.PREMIUM || user.role === Role.ADMIN) {
      return true;
    }

    throw new ForbiddenException(
      'Premium subscription required. Please upgrade to PREMIUM to access this feature.',
    );
  }
}

