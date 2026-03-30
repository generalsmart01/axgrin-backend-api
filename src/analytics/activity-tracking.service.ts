// src/analytics/activity-tracking.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ActivityType } from '@prisma/client';

export interface LogActivityParams {
  activityType: ActivityType;
  entityType: string;
  description: string;
  entityId?: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class ActivityTrackingService {
  constructor(private prisma: PrismaService) {}

  /**
   * Log a user activity
   */
  async logActivity(userId: string, params: LogActivityParams): Promise<void> {
    try {
      await this.prisma.activityLog.create({
        data: {
          userId,
          activityType: params.activityType,
          entityType: params.entityType,
          entityId: params.entityId,
          description: params.description,
          metadata: params.metadata ? JSON.stringify(params.metadata) : null,
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
        },
      });
    } catch (error) {
      // Log error but don't throw - activity logging should not break the main flow
      console.error('Failed to log activity:', error);
    }
  }

  /**
   * Get user activity logs
   */
  async getUserActivities(
    userId: string,
    options?: {
      startDate?: Date;
      endDate?: Date;
      activityType?: ActivityType;
      entityType?: string;
      limit?: number;
      offset?: number;
    },
  ) {
    const where: any = { userId };

    if (options?.startDate || options?.endDate) {
      where.createdAt = {};
      if (options.startDate) where.createdAt.gte = options.startDate;
      if (options.endDate) where.createdAt.lte = options.endDate;
    }

    if (options?.activityType) {
      where.activityType = options.activityType;
    }

    if (options?.entityType) {
      where.entityType = options.entityType;
    }

    const [activities, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: options?.limit || 100,
        skip: options?.offset || 0,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      this.prisma.activityLog.count({ where }),
    ]);

    return {
      activities: activities.map((a) => ({
        id: a.id,
        activityType: a.activityType,
        entityType: a.entityType,
        entityId: a.entityId,
        description: a.description,
        metadata: a.metadata ? JSON.parse(a.metadata) : null,
        createdAt: a.createdAt,
        user: a.user,
      })),
      total,
      limit: options?.limit || 100,
      offset: options?.offset || 0,
    };
  }

  /**
   * Get activity statistics
   */
  async getActivityStatistics(
    userId?: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    const where: any = {};
    if (userId) where.userId = userId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [totalActivities, activitiesByType, activitiesByEntity, recentActivities] =
      await Promise.all([
        this.prisma.activityLog.count({ where }),
        this.prisma.activityLog.groupBy({
          by: ['activityType'],
          where,
          _count: { id: true },
        }),
        this.prisma.activityLog.groupBy({
          by: ['entityType'],
          where,
          _count: { id: true },
        }),
        this.prisma.activityLog.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            user: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        }),
      ]);

    return {
      totalActivities,
      activitiesByType: activitiesByType.reduce(
        (acc, item) => {
          acc[item.activityType] = item._count.id;
          return acc;
        },
        {} as Record<string, number>,
      ),
      activitiesByEntity: activitiesByEntity.reduce(
        (acc, item) => {
          acc[item.entityType] = item._count.id;
          return acc;
        },
        {} as Record<string, number>,
      ),
      recentActivities: recentActivities.map((a) => ({
        id: a.id,
        activityType: a.activityType,
        entityType: a.entityType,
        description: a.description,
        createdAt: a.createdAt,
        user: a.user,
      })),
    };
  }

  /**
   * Get most active users
   */
  async getMostActiveUsers(limit: number = 10, startDate?: Date, endDate?: Date) {
    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const userActivities = await this.prisma.activityLog.groupBy({
      by: ['userId'],
      where,
      _count: { id: true },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: limit,
    });

    const userIds = userActivities.map((ua) => ua.userId);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    return userActivities.map((ua) => {
      const user = users.find((u) => u.id === ua.userId);
      return {
        userId: ua.userId,
        activityCount: ua._count.id,
        user: user
          ? {
              email: user.email,
              name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User',
              role: user.role,
            }
          : null,
      };
    });
  }
}

