"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle } from "lucide-react";

export default function QuotationActions({ 
  quoteId, 
  initialStatus,
  isAgent
}: { 
  quoteId: string, 
  initialStatus: string,
  isAgent: boolean
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    if (!confirm("Are you sure you want to confirm this quotation? It can no longer be edited.")) return;

    setIsConfirming(true);
    try {
      const res = await fetch(`/api/quotations/${quoteId}/confirm`, {
        method: "PATCH"
      });

      if (res.ok) {
        setStatus("CONFIRMED");
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to confirm");
      }
    } catch (e) {
      console.error(e);
      alert("Unexpected error");
    } finally {
      setIsConfirming(false);
    }
  };

  const handleDownload = () => {
    // We open the PDF generation route in a new tab to trigger download/view
    window.open(`/api/quotations/${quoteId}/pdf`, "_blank");
  };

  if (status === "DRAFT" && isAgent) {
    return (
      <Button 
        onClick={handleConfirm} 
        disabled={isConfirming}
        className="gap-2"
      >
        <CheckCircle className="h-4 w-4" />
        {isConfirming ? "Confirming..." : "Confirm Quotation"}
      </Button>
    );
  }

  if (status === "CONFIRMED") {
    return (
      <Button 
        onClick={handleDownload}
        variant="default" 
        className="gap-2"
      >
        <FileText className="h-4 w-4" />
        Download PDF Voucher
      </Button>
    );
  }

  return null;
}
