// prisma/seed.ts
import { PrismaClient, SubscriptionPlan } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Seed subscription configurations
  console.log('📦 Seeding subscription configurations...');
  
  const monthlyConfig = await prisma.subscriptionConfig.upsert({
    where: { plan: SubscriptionPlan.MONTHLY },
    update: {},
    create: {
      plan: SubscriptionPlan.MONTHLY,
      stripePriceId: process.env.STRIPE_PRICE_ID_MONTHLY || 'price_monthly_placeholder',
      price: 9.99,
      currency: 'USD',
      trialDays: 7,
      description: 'Monthly premium subscription with all features',
      isActive: true,
    },
  });

  const yearlyConfig = await prisma.subscriptionConfig.upsert({
    where: { plan: SubscriptionPlan.YEARLY },
    update: {},
    create: {
      plan: SubscriptionPlan.YEARLY,
      stripePriceId: process.env.STRIPE_PRICE_ID_YEARLY || 'price_yearly_placeholder',
      price: 99.99,
      currency: 'USD',
      trialDays: 14,
      description: 'Yearly premium subscription with all features (save 17%)',
      isActive: true,
    },
  });

  console.log('✅ Subscription configurations seeded:');
  console.log(`   - Monthly: $${monthlyConfig.price} (${monthlyConfig.trialDays} day trial)`);
  console.log(`   - Yearly: $${yearlyConfig.price} (${yearlyConfig.trialDays} day trial)`);

  console.log('✅ Database seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
