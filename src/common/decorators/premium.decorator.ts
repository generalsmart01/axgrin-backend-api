// src/common/decorators/premium.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const PREMIUM_KEY = 'premium';
export const Premium = () => SetMetadata(PREMIUM_KEY, true);

