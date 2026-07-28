import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "AGENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agentId = session.user.id;
    const { id } = params;

    const quotation = await prisma.quotation.findUnique({
      where: { id }
    });

    if (!quotation) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    }

    if (quotation.agentId !== agentId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (quotation.status === "CONFIRMED") {
      return NextResponse.json({ error: "Quotation is already confirmed" }, { status: 400 });
    }

    const updated = await prisma.quotation.update({
      where: { id },
      data: { status: "CONFIRMED" }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error confirming quotation:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
