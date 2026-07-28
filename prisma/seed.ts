import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with users...');

  // 1. Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tripledger.com' },
    update: {},
    create: {
      name: 'System Admin',
      email: 'admin@tripledger.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
      commissionRate: 0,
    },
  });
  console.log(`Created admin: ${admin.email}`);

  // 2. Create Agent 1 (10% commission)
  const agent1Password = await bcrypt.hash('agent123', 10);
  const agent1 = await prisma.user.upsert({
    where: { email: 'agent1@tripledger.com' },
    update: {},
    create: {
      name: 'Travel Agent One',
      email: 'agent1@tripledger.com',
      passwordHash: agent1Password,
      role: 'AGENT',
      commissionRate: 0.10,
    },
  });
  console.log(`Created agent 1: ${agent1.email}`);

  // 3. Create Agent 2 (20% commission)
  const agent2Password = await bcrypt.hash('agent123', 10);
  const agent2 = await prisma.user.upsert({
    where: { email: 'agent2@tripledger.com' },
    update: {},
    create: {
      name: 'Travel Agent Two',
      email: 'agent2@tripledger.com',
      passwordHash: agent2Password,
      role: 'AGENT',
      commissionRate: 0.20,
    },
  });
  console.log(`Created agent 2: ${agent2.email}`);

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
