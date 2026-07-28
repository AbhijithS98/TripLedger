"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CartItem = {
  id: string; // temp id for React mapping
  pkg: any;
  dayNumber: number;
  quantity: number;
};

export default function BuilderClient({ 
  packages, 
  commissionRate 
}: { 
  packages: any[], 
  commissionRate: number 
}) {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Form states per package card
  const [dayInputs, setDayInputs] = useState<Record<string, number>>({});
  const [qtyInputs, setQtyInputs] = useState<Record<string, number>>({});

  const addToCart = (pkg: any) => {
    const dayNumber = dayInputs[pkg.id] || 1;
    const quantity = qtyInputs[pkg.id] || 1;

    setCart(prev => [
      ...prev,
      { id: Math.random().toString(), pkg, dayNumber, quantity }
    ]);

    // Reset inputs for this card
    setDayInputs(prev => ({ ...prev, [pkg.id]: 1 }));
    setQtyInputs(prev => ({ ...prev, [pkg.id]: 1 }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const calculateItemPrice = (baseCost: number) => {
    return baseCost + (baseCost * commissionRate);
  };

  const handleSave = async () => {
    if (!customerName || cart.length === 0) return;
    
    setIsSaving(true);
    try {
      const payload = {
        customerName,
        items: cart.map(c => ({
          packageId: c.pkg.id,
          dayNumber: c.dayNumber,
          quantity: c.quantity
        }))
      };

      const res = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/agent/quotations/${data.id}`);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save quotation");
      }
    } catch (e) {
      console.error(e);
      alert("An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const cartTotal = cart.reduce((sum, item) => {
    return sum + (calculateItemPrice(item.pkg.baseSupplierCost) * item.quantity);
  }, 0);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Packages Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
        {packages.map(pkg => (
          <Card key={pkg.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{pkg.title}</CardTitle>
              <CardDescription>{pkg.destination} • {pkg.nights} Night(s)</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground mb-4">{pkg.description}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor={`day-${pkg.id}`} className="text-xs">Day #</Label>
                  <Input 
                    id={`day-${pkg.id}`}
                    type="number" 
                    min="1" 
                    value={dayInputs[pkg.id] || 1} 
                    onChange={e => setDayInputs(prev => ({ ...prev, [pkg.id]: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`qty-${pkg.id}`} className="text-xs">Quantity</Label>
                  <Input 
                    id={`qty-${pkg.id}`}
                    type="number" 
                    min="1" 
                    value={qtyInputs[pkg.id] || 1} 
                    onChange={e => setQtyInputs(prev => ({ ...prev, [pkg.id]: parseInt(e.target.value) || 1 }))}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
              <div className="text-sm font-medium">
                Client Price: ${calculateItemPrice(pkg.baseSupplierCost).toFixed(2)}
              </div>
              <Button onClick={() => addToCart(pkg)}>Add to Itinerary</Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Cart / Sidebar */}
      <div className="w-full lg:w-[400px] shrink-0">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 sticky top-6">
          <h3 className="text-xl font-bold mb-4">Current Itinerary</h3>
          
          <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2">
            {cart.length === 0 ? (
              <p className="text-sm text-muted-foreground italic text-center py-4">No items added yet.</p>
            ) : (
              cart.map(item => (
                <div key={item.id} className="text-sm border-b pb-3 dark:border-gray-700">
                  <div className="flex justify-between font-medium">
                    <span>{item.pkg.title}</span>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="text-muted-foreground mt-1 flex justify-between">
                    <span>Day {item.dayNumber} • Qty {item.quantity}</span>
                    <span>${(calculateItemPrice(item.pkg.baseSupplierCost) * item.quantity).toFixed(2)}</span>
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">
                    Cost: ${item.pkg.baseSupplierCost.toFixed(2)} + {(commissionRate * 100)}% markup
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t dark:border-gray-700 pt-4 mb-6">
            <div className="flex justify-between items-center font-bold text-lg">
              <span>Total Quote:</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input 
                id="customerName" 
                placeholder="e.g. John Smith" 
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
              />
            </div>
            
            <Button 
              className="w-full" 
              size="lg"
              disabled={cart.length === 0 || !customerName.trim() || isSaving}
              onClick={handleSave}
            >
              {isSaving ? "Saving..." : "Save Quotation"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
