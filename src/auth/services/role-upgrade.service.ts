// src/auth/services/role-upgrade.service.ts
import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class RoleUpgradeService {
  constructor(private prisma: PrismaService) {}

  /**
   * Upgrade user role (typically USER → PREMIUM)
   * Only ADMIN can upgrade roles, or users can self-upgrade to PREMIUM via payment
   */
  async upgradeUserRole(
    userId: string,
    targetRole: Role,
    requestedBy?: { userId: string; role: Role },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Validate role upgrade path
    this.validateRoleUpgrade(user.role, targetRole, requestedBy);

    // Update user role
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { role: targetRole },
    });

    return {
      message: `User role upgraded from ${user.role} to ${targetRole}`,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    };
  }

  /**
   * Validate if role upgrade is allowed
   */
  private validateRoleUpgrade(
    currentRole: Role,
    targetRole: Role,
    requestedBy?: { userId: string; role: Role },
  ) {
    // Only ADMIN can downgrade or change to ADMIN/VIEWER
    if (targetRole === Role.ADMIN || targetRole === Role.VIEWER) {
      if (!requestedBy || requestedBy.role !== Role.ADMIN) {
        throw new ForbiddenException(
          'Only administrators can assign ADMIN or VIEWER roles',
        );
      }
    }

    // Users can self-upgrade to PREMIUM (via payment)
    if (targetRole === Role.PREMIUM) {
      if (currentRole === Role.PREMIUM) {
        throw new BadRequestException('User is already a PREMIUM member');
      }
      // Allow self-upgrade to PREMIUM
      return true;
    }

    // Prevent downgrades (unless admin)
    if (requestedBy && requestedBy.role !== Role.ADMIN) {
      const roleHierarchy = {
        [Role.VIEWER]: 0,
        [Role.USER]: 1,
        [Role.PREMIUM]: 2,
        [Role.ADMIN]: 3,
      };

      if (roleHierarchy[targetRole] < roleHierarchy[currentRole]) {
        throw new ForbiddenException('Cannot downgrade user role');
      }
    }

    return true;
  }

  /**
   * Check if user has premium features
   */
  async hasPremiumAccess(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    return user?.role === Role.PREMIUM || user?.role === Role.ADMIN;
  }

  /**
   * Check if user has read-only access
   */
  async hasReadOnlyAccess(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    return user?.role === Role.VIEWER;
  }
}

