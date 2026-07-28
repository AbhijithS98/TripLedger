// @ts-ignore
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

  // 4. Create Packages
  console.log('Seeding packages...');
  const packages = [
    { title: 'Dubai City Tour', destination: 'Dubai', nights: 1, baseSupplierCost: 50, description: 'Half day city tour including museum.' },
    { title: 'Desert Safari', destination: 'Dubai', nights: 1, baseSupplierCost: 65, description: 'Evening desert safari with BBQ dinner.' },
    { title: 'Burj Khalifa At The Top', destination: 'Dubai', nights: 1, baseSupplierCost: 45, description: '124th floor entry ticket.' },
    { title: 'Maldives Overwater Villa', destination: 'Maldives', nights: 4, baseSupplierCost: 1200, description: '4 nights in a premium overwater villa.' },
    { title: 'Male Island Hopping', destination: 'Maldives', nights: 1, baseSupplierCost: 80, description: 'Day trip across 3 local islands.' },
    { title: 'Eiffel Tower Summit', destination: 'Paris', nights: 1, baseSupplierCost: 35, description: 'Skip the line summit access.' },
    { title: 'Seine River Cruise', destination: 'Paris', nights: 1, baseSupplierCost: 20, description: '1 hour evening cruise.' },
    { title: 'Louvre Museum Pass', destination: 'Paris', nights: 1, baseSupplierCost: 25, description: 'Full day access to Louvre.' },
  ];

  for (const pkg of packages) {
    await prisma.package.create({ data: pkg });
  }
  console.log('Created packages.');

  // 5. Create a dummy Quotation for Agent 1
  console.log('Seeding quotation...');
  const dubaiTour = await prisma.package.findFirst({ where: { title: 'Dubai City Tour' } });
  if (dubaiTour) {
    const markup = dubaiTour.baseSupplierCost * agent1.commissionRate;
    const unitPrice = dubaiTour.baseSupplierCost + markup;
    
    await prisma.quotation.create({
      data: {
        agentId: agent1.id,
        customerName: 'John Doe',
        status: 'DRAFT',
        markupApplied: markup,
        totalAmount: unitPrice, // quantity 1
        items: {
          create: {
            packageId: dubaiTour.id,
            dayNumber: 1,
            quantity: 1,
            unitCost: dubaiTour.baseSupplierCost,
            unitPrice: unitPrice,
          }
        }
      }
    });
    console.log('Created dummy quotation.');
  }

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
