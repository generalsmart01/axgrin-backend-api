// src/auth/guards/read-only.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';

/**
 * Guard to restrict VIEWER role to read-only operations
 * VIEWER users can only access GET endpoints
 */
@Injectable()
export class ReadOnlyGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // If user is VIEWER, only allow GET requests
    if (user?.role === Role.VIEWER) {
      const method = request.method;
      if (method !== 'GET') {
        throw new ForbiddenException(
          'VIEWER role has read-only access. Cannot perform write operations.',
        );
      }
    }

    return true;
  }
}

