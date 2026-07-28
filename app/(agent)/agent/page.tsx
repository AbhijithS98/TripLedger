import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getQuotationsByAgentId } from "@/lib/data/quotations";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AgentDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const quotations = await getQuotationsByAgentId(session.user.id);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">My Quotations</h2>
          <p className="text-gray-600 dark:text-gray-300">
            View and manage your past travel quotations.
          </p>
        </div>
        <Link href="/agent/quote/new">
          <Button>Create New Quotation</Button>
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotations.map((quote: any) => (
              <TableRow key={quote.id}>
                <TableCell className="font-mono text-xs">{quote.id.slice(-6).toUpperCase()}</TableCell>
                <TableCell className="font-medium">{quote.customerName}</TableCell>
                <TableCell>{quote._count.items}</TableCell>
                <TableCell>
                  <Badge variant={quote.status === 'CONFIRMED' ? 'default' : 'secondary'}>
                    {quote.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">${quote.totalAmount.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <Link href={`/agent/quotations/${quote.id}`}>
                    <Button variant="ghost" size="sm">View Details</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {quotations.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  You haven't created any quotations yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
