// src/common/interceptors/activity-logging.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { ActivityTrackingService } from '../../analytics/activity-tracking.service';
import { ActivityType } from '@prisma/client';

@Injectable()
export class ActivityLoggingInterceptor implements NestInterceptor {
  constructor(private moduleRef: ModuleRef) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, route, body, params, query } = request;
    const user = (request as any).user;

    if (!user) {
      return next.handle(); // Skip logging if user is not authenticated
    }

    // Determine activity type based on HTTP method
    let activityType: ActivityType;
    switch (method) {
      case 'POST':
        activityType = ActivityType.CREATE;
        break;
      case 'PATCH':
      case 'PUT':
        activityType = ActivityType.UPDATE;
        break;
      case 'DELETE':
        activityType = ActivityType.DELETE;
        break;
      case 'GET':
        activityType = ActivityType.VIEW;
        break;
      default:
        return next.handle();
    }

    // Determine entity type from route
    const routePath = route?.path || request.url;
    const entityType = this.getEntityTypeFromRoute(routePath);

    // Skip logging for certain endpoints
    if (this.shouldSkipLogging(routePath)) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(() => {
        // Log activity asynchronously (don't wait for it)
        this.logActivity(user.sub, {
          activityType,
          entityType,
          entityId: params?.id || body?.id || null,
          description: this.getDescription(method, entityType, params, body),
          metadata: {
            method,
            route: routePath,
            params,
            query,
          },
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
        }).catch((err) => {
          console.error('Failed to log activity:', err);
        });
      }),
    );
  }

  private async logActivity(userId: string, params: any) {
    try {
      const activityTracking = this.moduleRef.get(ActivityTrackingService, { strict: false });
      if (activityTracking) {
        await activityTracking.logActivity(userId, params);
      }
    } catch (error) {
      // Service might not be available, fail silently
      console.error('Activity tracking service not available:', error);
    }
  }

  private getEntityTypeFromRoute(route: string): string {
    // Extract entity type from route
    const segments = route.split('/').filter(Boolean);
    if (segments.length > 0) {
      const entity = segments[0];
      // Capitalize first letter
      return entity.charAt(0).toUpperCase() + entity.slice(1).replace(/-/g, '');
    }
    return 'Unknown';
  }

  private getDescription(
    method: string,
    entityType: string,
    params: any,
    body: any,
  ): string {
    switch (method) {
      case 'POST':
        return `Created new ${entityType}`;
      case 'PATCH':
      case 'PUT':
        return `Updated ${entityType}${params?.id ? ` (ID: ${params.id})` : ''}`;
      case 'DELETE':
        return `Deleted ${entityType}${params?.id ? ` (ID: ${params.id})` : ''}`;
      case 'GET':
        return `Viewed ${entityType}${params?.id ? ` (ID: ${params.id})` : ' list'}`;
      default:
        return `${method} ${entityType}`;
    }
  }

  private shouldSkipLogging(route: string): boolean {
    // Skip logging for these routes
    const skipRoutes = [
      '/auth/login',
      '/auth/register',
      '/auth/refresh-token',
      '/analytics',
      '/reports/download',
    ];

    return skipRoutes.some((skipRoute) => route.includes(skipRoute));
  }
}

