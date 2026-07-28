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

export async function getQuotationsByAgentId(agentId: string) {
  try {
    const quotations = await prisma.quotation.findMany({
      where: { agentId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { items: true }
        }
      }
    });
    return quotations;
  } catch (error) {
    console.error("Error fetching agent quotations:", error);
    return [];
  }
}

export async function getQuotationById(id: string) {
  try {
    return await prisma.quotation.findUnique({
      where: { id },
      include: {
        agent: {
          select: {
            name: true,
            email: true,
          }
        },
        items: {
          include: {
            package: true,
          }
        }
      }
    });
  } catch (error) {
    console.error("Error fetching quotation details:", error);
    return null;
  }
}
