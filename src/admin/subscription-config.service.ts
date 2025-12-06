// src/admin/subscription-config.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { SubscriptionPlan } from '@prisma/client';
import {
  CreateSubscriptionConfigDto,
  UpdateSubscriptionConfigDto,
  SubscriptionConfigResponseDto,
} from './dto/subscription-config.dto';

@Injectable()
export class SubscriptionConfigService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create or update subscription configuration
   */
  async upsertConfig(
    dto: CreateSubscriptionConfigDto,
  ): Promise<SubscriptionConfigResponseDto> {
    const config = await this.prisma.subscriptionConfig.upsert({
      where: { plan: dto.plan },
      create: {
        plan: dto.plan,
        stripePriceId: dto.stripePriceId,
        price: dto.price,
        currency: dto.currency || 'USD',
        trialDays: dto.trialDays,
        description: dto.description,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
      },
      update: {
        stripePriceId: dto.stripePriceId,
        price: dto.price,
        currency: dto.currency || 'USD',
        trialDays: dto.trialDays,
        description: dto.description,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
      },
    });
    return this.mapToDto(config);
  }

  /**
   * Update subscription configuration
   */
  async updateConfig(
    plan: SubscriptionPlan,
    dto: UpdateSubscriptionConfigDto,
  ): Promise<SubscriptionConfigResponseDto> {
    const config = await this.prisma.subscriptionConfig.findUnique({
      where: { plan },
    });

    if (!config) {
      throw new NotFoundException(`Subscription config for plan ${plan} not found`);
    }

    const updated = await this.prisma.subscriptionConfig.update({
      where: { plan },
      data: {
        ...(dto.stripePriceId && { stripePriceId: dto.stripePriceId }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.currency && { currency: dto.currency }),
        ...(dto.trialDays !== undefined && { trialDays: dto.trialDays }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
    return this.mapToDto(updated);
  }

  /**
   * Get all subscription configurations
   */
  async getAllConfigs(): Promise<SubscriptionConfigResponseDto[]> {
    const configs = await this.prisma.subscriptionConfig.findMany({
      orderBy: { plan: 'asc' },
    });
    return configs.map((config) => this.mapToDto(config));
  }

  /**
   * Get subscription configuration by plan
   */
  async getConfigByPlan(plan: SubscriptionPlan): Promise<SubscriptionConfigResponseDto> {
    const config = await this.prisma.subscriptionConfig.findUnique({
      where: { plan },
    });

    if (!config) {
      throw new NotFoundException(`Subscription config for plan ${plan} not found`);
    }

    return this.mapToDto(config);
  }

  /**
   * Get active subscription configuration by plan
   */
  async getActiveConfigByPlan(plan: SubscriptionPlan): Promise<SubscriptionConfigResponseDto | null> {
    const config = await this.prisma.subscriptionConfig.findFirst({
      where: {
        plan,
        isActive: true,
      },
    });
    return config ? this.mapToDto(config) : null;
  }

  /**
   * Delete subscription configuration
   */
  async deleteConfig(plan: SubscriptionPlan): Promise<{ message: string }> {
    const config = await this.prisma.subscriptionConfig.findUnique({
      where: { plan },
    });

    if (!config) {
      throw new NotFoundException(`Subscription config for plan ${plan} not found`);
    }

    await this.prisma.subscriptionConfig.delete({
      where: { plan },
    });

    return { message: `Subscription config for ${plan} plan deleted successfully` };
  }

  /**
   * Map Prisma model to DTO, converting Decimal to number
   */
  private mapToDto(config: any): SubscriptionConfigResponseDto {
    return {
      ...config,
      price: Number(config.price),
    };
  }
}

