// @ts-ignore
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up existing database...');
  await prisma.quotationItem.deleteMany();
  await prisma.quotation.deleteMany();
  await prisma.package.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding initial data...');

  // 1. Create Admin User
  const adminPassword = await bcrypt.hash('password123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tripledger.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@tripledger.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log(`Created admin: ${admin.email}`);

  // 2. Create Agent 1
  const agent1Password = await bcrypt.hash('password123', 10);
  const agent1 = await prisma.user.upsert({
    where: { email: 'agent1@tripledger.com' },
    update: {},
    create: {
      name: 'Sarah Agent',
      email: 'agent1@tripledger.com',
      passwordHash: agent1Password,
      role: 'AGENT',
      commissionRate: 0.15, // 15% markup
    },
  });
  console.log(`Created agent 1: ${agent1.email}`);

  // 3. Create Agent 2
  const agent2Password = await bcrypt.hash('password123', 10);
  const agent2 = await prisma.user.upsert({
    where: { email: 'agent2@tripledger.com' },
    update: {},
    create: {
      name: 'Michael Agent',
      email: 'agent2@tripledger.com',
      passwordHash: agent2Password,
      role: 'AGENT',
      commissionRate: 0.20, // 20% markup
    },
  });
  console.log(`Created agent 2: ${agent2.email}`);

  // 4. Create Packages
  console.log('Seeding packages...');
  const packagesData = [
    { title: 'Dubai City Tour', destination: 'Dubai', nights: 1, baseSupplierCost: 50, description: 'Half day city tour including museum.' },
    { title: 'Desert Safari', destination: 'Dubai', nights: 1, baseSupplierCost: 65, description: 'Evening desert safari with BBQ dinner.' },
    { title: 'Burj Khalifa At The Top', destination: 'Dubai', nights: 1, baseSupplierCost: 45, description: '124th floor entry ticket.' },
    { title: 'Maldives Overwater Villa', destination: 'Maldives', nights: 4, baseSupplierCost: 1200, description: '4 nights in a premium overwater villa.' },
    { title: 'Male Island Hopping', destination: 'Maldives', nights: 1, baseSupplierCost: 80, description: 'Day trip across 3 local islands.' },
    { title: 'Eiffel Tower Summit', destination: 'Paris', nights: 1, baseSupplierCost: 35, description: 'Skip the line summit access.' },
    { title: 'Seine River Cruise', destination: 'Paris', nights: 1, baseSupplierCost: 20, description: '1 hour evening cruise.' },
    { title: 'Louvre Museum Pass', destination: 'Paris', nights: 1, baseSupplierCost: 25, description: 'Full day access to Louvre.' },
  ];

  const packages = [];
  for (const pkg of packagesData) {
    const created = await prisma.package.create({ data: pkg });
    packages.push(created);
  }
  console.log('Created packages.');

  // 5. Create a DRAFT quotation for Agent 1
  const draftQuote = await prisma.quotation.create({
    data: {
      agentId: agent1.id,
      customerName: 'John Doe',
      status: 'DRAFT',
      totalAmount: (50 * 1.15) + (65 * 1.15),
      markupApplied: (50 * 0.15) + (65 * 0.15),
      items: {
        create: [
          { packageId: packages[0].id, dayNumber: 1, quantity: 2, unitCost: 50, unitPrice: 50 * 1.15 },
          { packageId: packages[1].id, dayNumber: 2, quantity: 2, unitCost: 65, unitPrice: 65 * 1.15 }
        ]
      }
    }
  });
  console.log(`Created DRAFT quote for Agent 1`);

  // 6. Create a CONFIRMED quotation for Agent 1 (for Demo)
  const confirmedQuote = await prisma.quotation.create({
    data: {
      agentId: agent1.id,
      customerName: 'Alice Smith',
      status: 'CONFIRMED',
      totalAmount: (1200 * 1.15) * 2,
      markupApplied: (1200 * 0.15) * 2,
      items: {
        create: [
          { packageId: packages[3].id, dayNumber: 1, quantity: 2, unitCost: 1200, unitPrice: 1200 * 1.15 }
        ]
      }
    }
  });
  console.log(`Created CONFIRMED quote for Agent 1`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
