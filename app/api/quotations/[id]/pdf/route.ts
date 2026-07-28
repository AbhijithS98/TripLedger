import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getQuotationById } from "@/lib/data/quotations";
import { renderToStream } from "@react-pdf/renderer";
import VoucherDocument from "@/components/pdf/VoucherDocument";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const quote = await getQuotationById(id);

    if (!quote) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    }

    // Agent can only download their own quotes. Admin can download any.
    if (session.user.role === "AGENT" && quote.agentId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (quote.status !== "CONFIRMED") {
      return NextResponse.json({ error: "Quotation must be confirmed before downloading a voucher." }, { status: 400 });
    }

    // Render PDF to stream
    const stream = await renderToStream(VoucherDocument({ quote }));

    return new NextResponse(stream as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="voucher-${quote.id.slice(-6).toUpperCase()}.pdf"`
      }
    });
  } catch (error: any) {
    console.error("Error generating PDF:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
