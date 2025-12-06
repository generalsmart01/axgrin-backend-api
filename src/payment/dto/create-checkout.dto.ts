// src/payment/dto/create-checkout.dto.ts
import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubscriptionPlan } from '@prisma/client';

export class CreateCheckoutDto {
  @ApiProperty({
    description: 'Subscription plan type',
    enum: SubscriptionPlan,
    example: SubscriptionPlan.MONTHLY,
  })
  @IsEnum(SubscriptionPlan)
  plan: SubscriptionPlan;

  @ApiPropertyOptional({
    description: 'Success URL to redirect after payment',
    example: 'https://yourapp.com/success',
  })
  @IsOptional()
  successUrl?: string;

  @ApiPropertyOptional({
    description: 'Cancel URL to redirect if payment is cancelled',
    example: 'https://yourapp.com/cancel',
  })
  @IsOptional()
  cancelUrl?: string;
}


