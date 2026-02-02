import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { RefreshButton } from "@/components/RefreshButton";
import { useSuppliers, useCreateSupplier } from "@/hooks/use-suppliers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSupplierSchema, type InsertSupplier } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus, Truck } from "lucide-react";

function SupplierForm({ onClose }: { onClose: () => void }) {
  const { mutate, isPending } = useCreateSupplier();
  const form = useForm<InsertSupplier>({
    resolver: zodResolver(insertSupplierSchema),
    defaultValues: {
      name: "",
      contactNumber: "",
      address: "",
      gstNumber: "",
    }
  });

  function onSubmit(data: InsertSupplier) {
    mutate(data, {
      onSuccess: () => {
        onClose();
        form.reset();
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Supplier Name</FormLabel>
              <FormControl><Input placeholder="Pharma Distributors Ltd." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contactNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Number</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="gstNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>GST Number</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isPending} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {isPending ? "Adding..." : "Add Supplier"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function Suppliers() {
  const { data: suppliers, isLoading } = useSuppliers();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background font-body">
      <Sidebar />
      <RefreshButton />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold font-display tracking-tight">Suppliers</h1>
              <p className="text-muted-foreground mt-1">Manage medicine distributors.</p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 rounded-xl">
                  <Plus className="mr-2 h-4 w-4" /> Add Supplier
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Supplier</DialogTitle>
                </DialogHeader>
                <SupplierForm onClose={() => setOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>

          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 font-bold">Name</th>
                  <th className="px-6 py-4 font-bold">Contact</th>
                  <th className="px-6 py-4 font-bold">GST</th>
                  <th className="px-6 py-4 font-bold">Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Loading suppliers...</td></tr>
                ) : suppliers?.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-foreground flex items-center gap-2">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      {s.name}
                    </td>
                    <td className="px-6 py-4 font-mono text-muted-foreground">{s.contactNumber}</td>
                    <td className="px-6 py-4 font-mono text-muted-foreground">{s.gstNumber}</td>
                    <td className="px-6 py-4 text-muted-foreground">{s.address}</td>
                  </tr>
                ))}
                {suppliers?.length === 0 && (
                  <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No suppliers found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
