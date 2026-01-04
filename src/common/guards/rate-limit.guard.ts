import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { CacheService } from '../../cache/cache.service';

export const RateLimit = (limit: number, windowMs: number) => SetMetadata('rateLimit', { limit, windowMs });

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private cacheService: CacheService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const handler = context.getHandler();
    
    // Get rate limit metadata
    const rateLimitMeta = this.reflector.get<{ limit: number; windowMs: number }>(
      'rateLimit',
      handler,
    );

    if (!rateLimitMeta) {
      return true; // No rate limit configured
    }

    const { limit, windowMs } = rateLimitMeta;
    const user = (request as any).user;
    const userId = user?.userId || user?.sub || request.ip;
    const endpoint = `${request.method}:${request.path}`;
    
    // Different limits for premium users
    const userRole = user?.role;
    const actualLimit = userRole === 'PREMIUM' || userRole === 'ADMIN' 
      ? limit * 3  // Premium users get 3x limit
      : limit;

    const key = `rateLimit:${userId}:${endpoint}`;
    const current = await this.cacheService.get<number>(key) || 0;

    if (current >= actualLimit) {
      const resetTime = Math.ceil(windowMs / 1000);
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many requests, please try again later',
          retryAfter: resetTime,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Increment counter
    const newCount = current + 1;
    await this.cacheService.set(key, newCount, Math.ceil(windowMs / 1000));

    // Add rate limit headers
    const response = context.switchToHttp().getResponse();
    response.setHeader('X-RateLimit-Limit', actualLimit);
    response.setHeader('X-RateLimit-Remaining', Math.max(0, actualLimit - newCount));
    response.setHeader('X-RateLimit-Reset', new Date(Date.now() + windowMs).toISOString());

    return true;
  }
}
