import { useState, useRef } from "react";
import { Sidebar } from "@/components/Sidebar";
import { RefreshButton } from "@/components/RefreshButton";
import { useMedicines } from "@/hooks/use-medicines";
import { useCreateInvoice } from "@/hooks/use-invoices";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ShoppingCart, Trash2, Printer, CheckCircle, Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Medicine } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useReactToPrint } from "react-to-print";
import { InvoiceTemplate } from "@/components/InvoiceTemplate";

type CartItem = Medicine & { quantity: number; total: number };

export default function Billing() {
  const [search, setSearch] = useState("");
  const { data: medicines } = useMedicines({ search });
  const [cart, setCart] = useState<CartItem[]>([]);
  const { mutate: createInvoice, isPending } = useCreateInvoice();
  
  // Checkout State
  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [discount, setDiscount] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastInvoice, setLastInvoice] = useState<any>(null);

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  const addToCart = (med: Medicine) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === med.id);
      if (existing) {
        return prev.map((item) =>
          item.id === med.id
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * Number(item.sellingPrice) }
            : item
        );
      }
      return [...prev, { ...med, quantity: 1, total: Number(med.sellingPrice) }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: number, qty: number) => {
    if (qty < 1) return;
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: qty, total: qty * Number(item.sellingPrice) }
          : item
      )
    );
  };

  const subtotal = cart.reduce((acc, item) => acc + item.total, 0);
  const gstTotal = cart.reduce((acc, item) => acc + (item.total * (item.gstPercentage / 100)), 0);
  const grandTotal = subtotal + gstTotal - discount;

  const handleCheckout = () => {
    if (!customerName || !customerMobile) {
      alert("Please enter customer details");
      return;
    }

    const payload = {
      customerName,
      customerMobile,
      items: cart.map((item) => ({
        medicineId: item.id,
        quantity: item.quantity,
      })),
      discount,
      paymentMode,
    };

    createInvoice(payload, {
      onSuccess: (data) => {
        // Fetch the full invoice details including items for the success modal
        fetch(`/api/invoices/${data.id}`)
          .then(res => res.json())
          .then(fullInvoice => {
            setLastInvoice(fullInvoice);
            setShowSuccess(true);
            setCart([]);
            setCustomerName("");
            setCustomerMobile("");
          });
      },
    });
  };

  return (
    <div className="flex h-screen bg-background font-body overflow-hidden">
      <Sidebar />
      <RefreshButton />
      <main className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
        
        {/* LEFT: Medicine Selection */}
        <div className="flex-1 flex flex-col border-r border-border bg-muted/10 p-6 overflow-hidden">
          <div className="mb-6 space-y-2">
            <h1 className="text-2xl font-bold font-display">New Sale</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by medicine name..." 
                className="pl-10 h-12 text-lg bg-background shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <ScrollArea className="flex-1 pr-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {medicines?.map((med) => (
                <div 
                  key={med.id} 
                  className="bg-card p-4 rounded-xl border border-border shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group"
                  onClick={() => addToCart(med)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{med.name}</h3>
                      <p className="text-sm text-muted-foreground">{med.category} • {med.batchNumber}</p>
                    </div>
                    <span className="font-bold text-lg text-emerald-600">₹{med.sellingPrice}</span>
                  </div>
                  <div className="mt-2 flex justify-between items-end">
                    <div className="text-xs text-muted-foreground">
                      Stock: <span className={med.stockQuantity < 10 ? "text-destructive font-bold" : ""}>{med.stockQuantity}</span>
                    </div>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full bg-primary/10 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* RIGHT: Cart & Checkout */}
        <div className="w-full md:w-[450px] bg-card flex flex-col shadow-xl z-10">
          <div className="p-6 border-b border-border bg-primary/5">
            <h2 className="text-xl font-bold font-display flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" /> Current Bill
            </h2>
          </div>

          {/* Cart Items */}
          <ScrollArea className="flex-1 p-6">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 space-y-4">
                <ShoppingCart className="h-16 w-16" />
                <p>Cart is empty. Select medicines to begin.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg border border-border">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">₹{item.sellingPrice} x {item.quantity}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</Button>
                      <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                      <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</Button>
                    </div>
                    <div className="text-right w-16 font-bold text-sm">₹{item.total}</div>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => removeFromCart(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Totals & Actions */}
          <div className="p-6 border-t border-border bg-background space-y-4">
            <div className="space-y-3">
              <Input 
                placeholder="Customer Name" 
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="bg-muted/30"
              />
              <Input 
                placeholder="Mobile Number" 
                value={customerMobile}
                onChange={(e) => setCustomerMobile(e.target.value)}
                className="bg-muted/30"
              />
              <div className="grid grid-cols-2 gap-3">
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                </select>
                <Input 
                  type="number" 
                  placeholder="Discount" 
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-1 pt-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>GST</span>
                <span>₹{gstTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-foreground border-t border-border pt-2 mt-2">
                <span>Total Amount</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <Button 
              className="w-full h-12 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
              disabled={cart.length === 0 || isPending}
              onClick={handleCheckout}
            >
              {isPending ? "Processing..." : `Complete Sale • ₹${grandTotal.toFixed(2)}`}
            </Button>
          </div>
        </div>
      </main>

      {/* Success Modal with Print Option */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-600">
              <CheckCircle className="h-6 w-6" /> Sale Completed Successfully
            </DialogTitle>
          </DialogHeader>
          <div className="py-6 flex flex-col items-center gap-4">
             <p className="text-center text-muted-foreground">
               Invoice #{lastInvoice?.invoiceNumber} has been generated for {lastInvoice?.customerName}.
             </p>
             <div className="flex gap-4 w-full">
               <Button variant="outline" className="flex-1" onClick={() => setShowSuccess(false)}>
                 New Sale
               </Button>
               <Button className="flex-1 gap-2" onClick={() => { handlePrint(); }}>
                 <Printer className="h-4 w-4" /> Print Invoice
               </Button>
             </div>
             
             {/* Hidden Print Component */}
             <div style={{ display: 'none' }}>
               {lastInvoice && <InvoiceTemplate ref={printRef as any} invoice={lastInvoice} />}
             </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
