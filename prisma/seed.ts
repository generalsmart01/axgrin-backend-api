// prisma/seed.ts
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  if (!process.env.ADMIN_PWD) {
    throw new Error('Missing ADMIN_PWD in environment variables');
  }

  const hashed = await bcrypt.hash(process.env.ADMIN_PWD!, 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@axgrin.com' },
    update: {},
    create: {
      email: 'admin@axgrin.com',
      password: hashed,
      role: 'ADMIN',
      firstName: 'Admin',
      lastName: 'User',
      emailVerified: true,
    },
  });

  console.log('Admin created:', admin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
