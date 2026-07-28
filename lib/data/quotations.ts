import prisma from "@/lib/prisma";

export async function getAllQuotationsAdmin() {
  try {
    const quotations = await prisma.quotation.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        agent: {
          select: {
            name: true,
          }
        },
        _count: {
          select: { items: true }
        }
      }
    });
    return quotations;
  } catch (error) {
    console.error("Error fetching admin quotations:", error);
    return [];
  }
}
