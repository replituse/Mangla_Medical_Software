import { useInvoices, useInvoice } from "@/hooks/use-invoices";
import { Sidebar } from "@/components/Sidebar";
import { RefreshButton } from "@/components/RefreshButton";
import { format, isWithinInterval, startOfDay, endOfDay, parseISO } from "date-fns";
import { 
  FileText, 
  Download, 
  Printer, 
  Search, 
  Calendar as CalendarIcon,
  Filter,
  Eye
} from "lucide-react";
import { useState, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { InvoiceTemplate } from "@/components/InvoiceTemplate";
import { useReactToPrint } from "react-to-print";

export default function Reports() {
  const { data: invoices, isLoading } = useInvoices();
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "month" | "year">("all");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
  const { data: selectedInvoice, isLoading: isLoadingInvoice } = useInvoice(selectedInvoiceId);
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  const filteredInvoices = useMemo(() => {
    if (!invoices) return [];
    
    return invoices.filter((inv: any) => {
      const matchesSearch = 
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inv.customerName || "Walk-in Customer").toLowerCase().includes(searchTerm.toLowerCase());
      
      const invDate = new Date(inv.date || new Date());
      const now = new Date();
      
      let matchesDate = true;
      if (dateFilter === "today") {
        matchesDate = invDate.toDateString() === now.toDateString();
      } else if (dateFilter === "month") {
        matchesDate = invDate.getMonth() === now.getMonth() && invDate.getFullYear() === now.getFullYear();
      } else if (dateFilter === "year") {
        matchesDate = invDate.getFullYear() === now.getFullYear();
      }
      
      return matchesSearch && matchesDate;
    });
  }, [invoices, searchTerm, dateFilter]);

  const handlePrintAction = (invoiceId: number) => {
    setSelectedInvoiceId(invoiceId);
    setTimeout(() => {
      handlePrint();
    }, 500);
  };

  const handleDownload = (invoice: any) => {
    toast({ title: "Downloading", description: `Downloading invoice ${invoice.invoiceNumber} as PDF...` });
  };

  return (
    <div className="flex h-screen bg-background font-body">
      <Sidebar />
      <RefreshButton />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold font-display text-foreground tracking-tight flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                Reports & Invoices
              </h1>
              <p className="text-muted-foreground mt-1">Manage and track your pharmacy sales reports.</p>
            </div>
          </div>

          <Card className="border-border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search by invoice # or customer..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={dateFilter} onValueChange={(val: any) => setDateFilter(val)}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Date Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-6 py-4 font-medium">Invoice #</th>
                    <th className="px-6 py-4 font-medium">Customer</th>
                    <th className="px-6 py-4 font-medium">Date & Time</th>
                    <th className="px-6 py-4 font-medium">Amount</th>
                    <th className="px-6 py-4 font-medium">Payment</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoading ? (
                    <tr><td colSpan={6} className="p-12 text-center text-muted-foreground">Loading reports...</td></tr>
                  ) : filteredInvoices.map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-mono font-medium text-primary">{inv.invoiceNumber}</td>
                      <td className="px-6 py-4 text-foreground font-medium">{inv.customerName || "Walk-in Customer"}</td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {format(new Date(inv.date || new Date()), "MMM dd, yyyy HH:mm")}
                      </td>
                      <td className="px-6 py-4 font-bold text-foreground">₹{inv.grandTotal}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          inv.paymentMode === 'Cash' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {inv.paymentMode}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-primary hover:bg-primary/10"
                          onClick={() => setSelectedInvoiceId(inv.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-primary hover:bg-primary/10"
                          onClick={() => handlePrintAction(inv.id)}
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-primary hover:bg-primary/10"
                          onClick={() => handleDownload(inv)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredInvoices.length === 0 && !isLoading && (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-muted-foreground">
                        No reports found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <Dialog open={!!selectedInvoiceId} onOpenChange={(open) => !open && setSelectedInvoiceId(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex justify-between items-center">
                <span>Invoice Preview</span>
                <div className="flex gap-2">
                  <Button onClick={() => handlePrint()} disabled={isLoadingInvoice}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="bg-slate-100 p-8 rounded-lg overflow-x-auto">
              <div ref={printRef}>
                {selectedInvoice ? (
                  <InvoiceTemplate invoice={selectedInvoice} />
                ) : (
                  <div className="h-96 flex items-center justify-center text-muted-foreground">
                    Loading invoice details...
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
