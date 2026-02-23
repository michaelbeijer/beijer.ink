import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

async function main() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    console.error('ADMIN_PASSWORD environment variable is required');
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, SALT_ROUNDS);

  await prisma.user.upsert({
    where: { id: 'admin' },
    update: { passwordHash: hash },
    create: { id: 'admin', passwordHash: hash },
  });

  console.log('Admin password set successfully');
}

main()
  .finally(() => prisma.$disconnect());
