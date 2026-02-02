import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useCustomers } from "@/hooks/use-customers";
import { Input } from "@/components/ui/input";
import { Search, Users } from "lucide-react";

export default function Customers() {
  const [search, setSearch] = useState("");
  const { data: customers, isLoading } = useCustomers(search);

  return (
    <div className="flex min-h-screen bg-background font-body">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold font-display tracking-tight">Customer Database</h1>
              <p className="text-muted-foreground mt-1">View and manage customer history.</p>
            </div>
            <div className="bg-primary/10 p-3 rounded-full text-primary">
              <Users className="h-6 w-6" />
            </div>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or mobile..." 
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 font-bold">Name</th>
                  <th className="px-6 py-4 font-bold">Mobile</th>
                  <th className="px-6 py-4 font-bold">Address</th>
                  <th className="px-6 py-4 font-bold">First Visit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Loading customers...</td></tr>
                ) : customers?.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-foreground">{c.name}</td>
                    <td className="px-6 py-4 font-mono text-muted-foreground">{c.mobileNumber}</td>
                    <td className="px-6 py-4 text-muted-foreground">{c.address || "-"}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "-"}
                    </td>
                  </tr>
                ))}
                {customers?.length === 0 && (
                  <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No customers found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
