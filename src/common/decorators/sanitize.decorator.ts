import { UsePipes } from '@nestjs/common';
import { SanitizePipe } from '../pipes/sanitize.pipe';

/**
 * Decorator to sanitize request body/query params to prevent XSS
 * Usage: @Sanitize() on controller methods
 */
export const Sanitize = () => UsePipes(new SanitizePipe());
