import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "AGENT") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const agentId = session.user.id;
    const commissionRate = session.user.commissionRate;
    const body = await req.json();

    const { customerName, items } = body;

    if (!customerName || !items || items.length === 0) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    // Process items and calculate totals server-side for security
    let totalAmount = 0;
    let totalMarkupApplied = 0;
    
    // First, verify all packages exist and get their costs
    const packageIds = items.map((i: any) => i.packageId);
    const packages = await prisma.package.findMany({
      where: { id: { in: packageIds } }
    });

    const packageMap = new Map(packages.map((p: any) => [p.id, p]));

    const quotationItems = items.map((item: any) => {
      const pkg: any = packageMap.get(item.packageId);
      if (!pkg) {
        throw new Error(`Package ${item.packageId} not found`);
      }

      const unitCost = pkg.baseSupplierCost;
      const markup = unitCost * commissionRate;
      const unitPrice = unitCost + markup;
      const lineTotalPrice = unitPrice * item.quantity;
      totalAmount += lineTotalPrice;
      totalMarkupApplied += (markup * item.quantity);

      return {
        packageId: pkg.id,
        dayNumber: item.dayNumber,
        quantity: item.quantity,
        unitCost: unitCost,
        unitPrice: unitPrice,
      };
    });

    // Save quotation to database
    const quotation = await prisma.quotation.create({
      data: {
        agentId,
        customerName,
        status: "DRAFT",
        markupApplied: totalMarkupApplied,
        totalAmount: totalAmount,
        items: {
          create: quotationItems
        }
      }
    });

    return new Response(JSON.stringify(quotation), { status: 201 });
  } catch (error: any) {
    console.error("Error creating quotation:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal server error" }), { status: 500 });
  }
}
