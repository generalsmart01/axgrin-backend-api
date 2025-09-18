// src/auth/guards/roles.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Debug logging
    console.log('RolesGuard Debug:');
    console.log('Required roles:', requiredRoles);
    console.log('User object:', user);
    console.log('User role:', user?.role);
    console.log('User role type:', typeof user?.role);
    console.log(
      'Required roles types:',
      requiredRoles.map((r) => typeof r),
    );

    if (!user || !requiredRoles.includes(user.role)) {
      console.log('Role check failed!');
      throw new ForbiddenException('You do not have permission (role)');
    }

    return requiredRoles.includes(user.role); // 👈 This must match the `role` in the JWT
  }
}
