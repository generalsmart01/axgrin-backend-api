import { ApiProperty } from '@nestjs/swagger';

export class CheckoutResponseDto {
  @ApiProperty({
    description: 'Stripe checkout session ID',
    example: 'cs_test_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
  })
  sessionId: string;

  @ApiProperty({
    description: 'Stripe checkout URL to redirect user to',
    example: 'https://checkout.stripe.com/pay/cs_test_...',
  })
  url: string;
}
