import { Sidebar } from "@/components/Sidebar";
import { RefreshButton } from "@/components/RefreshButton";
import { DashboardStats } from "@/components/DashboardStats";
import { useAuth } from "@/hooks/use-auth";
import { useInvoices } from "@/hooks/use-invoices";
import { Link } from "wouter";
import { format } from "date-fns";
import { ArrowUpRight, Search, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: invoices, isLoading } = useInvoices();
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "month" | "year">("all");

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

  return (
    <div className="flex min-h-screen bg-background font-body">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 relative">
        <RefreshButton />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-8">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold font-display text-foreground tracking-tight">
                  Welcome back, {user?.firstName}
                </h1>
                <p className="text-muted-foreground mt-1">Here's what's happening at Mangala Medicos today.</p>
              </div>
              <Link href="/billing">
                <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 rounded-xl px-6 h-12">
                  New Bill / POS
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <DashboardStats />

            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="p-6 border-b border-border flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold font-display">Recent Invoices</h2>
                  <Link href="/reports" className="text-sm font-medium text-primary hover:underline">View All</Link>
                </div>
                
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search by invoice # or customer..." 
                      className="pl-10 h-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={dateFilter} onValueChange={(val: any) => setDateFilter(val)}>
                    <SelectTrigger className="w-full md:w-[180px] h-10">
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
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="px-6 py-4 font-medium">Invoice #</th>
                      <th className="px-6 py-4 font-medium">Customer</th>
                      <th className="px-6 py-4 font-medium">Date</th>
                      <th className="px-6 py-4 font-medium text-right">Amount</th>
                      <th className="px-6 py-4 font-medium text-center">Payment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {isLoading ? (
                      <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Loading recent transactions...</td></tr>
                    ) : filteredInvoices.slice(0, 5).map((inv: any) => (
                      <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-mono font-medium">{inv.invoiceNumber}</td>
                        <td className="px-6 py-4 text-foreground font-medium">{inv.customerName || "Walk-in Customer"}</td>
                        <td className="px-6 py-4 text-muted-foreground">{format(new Date(inv.date || new Date()), "MMM dd, yyyy")}</td>
                        <td className="px-6 py-4 text-right font-bold">₹{inv.grandTotal}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                            {inv.paymentMode}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filteredInvoices.length === 0 && !isLoading && (
                      <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No invoices matching filters.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
