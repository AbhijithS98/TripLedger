import { getAllPackages } from "@/lib/data/packages";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import BuilderClient from "./BuilderClient"; // IDE Cache Bust

export default async function NewQuotationPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "AGENT") {
    redirect("/login");
  }

  const packages = await getAllPackages();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Quotation Builder</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Select packages to add to your client's itinerary.
        </p>
      </div>

      <BuilderClient
        packages={packages}
        commissionRate={session.user.commissionRate}
      />
    </div>
  );
}
