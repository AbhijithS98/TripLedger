import prisma from '../prisma';

export async function getPackageById(id: string) {
  return await prisma.package.findUnique({
    where: { id },
  });
}

export async function getAllPackages() {
  return await prisma.package.findMany({
    orderBy: { createdAt: 'desc' },
  });
}
