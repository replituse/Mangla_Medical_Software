import { Sidebar } from "@/components/Sidebar";
import { DashboardStats } from "@/components/DashboardStats";
import { useAuth } from "@/hooks/use-auth";
import { useInvoices } from "@/hooks/use-invoices";
import { Link } from "wouter";
import { format } from "date-fns";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: invoices, isLoading } = useInvoices();

  return (
    <div className="flex min-h-screen bg-background font-body">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header */}
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

          {/* Stats Cards */}
          <DashboardStats />

          {/* Recent Invoices Table */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h2 className="text-lg font-bold font-display">Recent Invoices</h2>
              <Link href="/billing" className="text-sm font-medium text-primary hover:underline">View All</Link>
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
                  ) : invoices?.slice(0, 5).map((inv) => (
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
                  {invoices?.length === 0 && (
                    <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No invoices generated yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
