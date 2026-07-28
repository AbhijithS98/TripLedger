import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getQuotationById } from "@/lib/data/quotations";
import { notFound, redirect } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import QuotationActions from "./QuotationActions";

export default async function QuotationDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  
  // Basic protection: Agents can view their own, Admins can view any.
  if (!session?.user?.id) {
    redirect("/login");
  }

  const quote = await getQuotationById(params.id);

  if (!quote) {
    notFound();
  }

  if (session.user.role === "AGENT" && quote.agentId !== session.user.id) {
    return (
      <div className="p-8 text-center text-red-500">
        You are not authorized to view this quotation.
      </div>
    );
  }

  // Sort items by day number
  const sortedItems = [...quote.items].sort((a, b) => a.dayNumber - b.dayNumber);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href={session.user.role === "ADMIN" ? "/admin" : "/agent"}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              Quotation #{quote.id.slice(-6).toUpperCase()}
              <Badge variant={quote.status === "CONFIRMED" ? "default" : "secondary"}>
                {quote.status}
              </Badge>
            </h2>
            <p className="text-muted-foreground mt-1">
              Created on {new Date(quote.createdAt).toLocaleDateString()} for {quote.customerName}
            </p>
          </div>
        </div>
        <QuotationActions 
          quoteId={quote.id} 
          initialStatus={quote.status} 
          isAgent={session.user.role === "AGENT"} 
        />
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h3 className="text-lg font-semibold">Itinerary Details</h3>
            <p className="text-sm text-muted-foreground">Prepared by: {quote.agent?.name}</p>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Day</TableHead>
              <TableHead>Package</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Line Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.dayNumber}</TableCell>
                <TableCell>
                  <div className="font-medium">{item.package.title}</div>
                  <div className="text-xs text-muted-foreground">{item.package.destination} • {item.package.nights} Night(s)</div>
                </TableCell>
                <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
                <TableCell className="text-right font-medium">
                  ${(item.unitPrice * item.quantity).toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="mt-8 border-t pt-6 flex justify-end">
          <div className="w-64 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${quote.totalAmount.toFixed(2)}</span>
            </div>
            {/* Real app might have taxes, fees, etc here */}
            <div className="flex justify-between text-lg font-bold border-t pt-3">
              <span>Total Amount</span>
              <span>${quote.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
