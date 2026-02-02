import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { RefreshButton } from "@/components/RefreshButton";
import { useMedicines, useCreateMedicine, useDeleteMedicine } from "@/hooks/use-medicines";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMedicineSchema, type InsertMedicine, type Medicine } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Search, Plus, Trash2, Edit2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { z } from "zod";

const formSchema = insertMedicineSchema.extend({
  purchasePrice: z.coerce.number().min(0),
  sellingPrice: z.coerce.number().min(0),
  gstPercentage: z.coerce.number().min(0),
  stockQuantity: z.coerce.number().min(0),
  minStockLevel: z.coerce.number().min(0),
  supplierId: z.coerce.number().optional(),
});

function MedicineForm({ onClose }: { onClose: () => void }) {
  const { mutate, isPending } = useCreateMedicine();
  const form = useForm<InsertMedicine>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "Tablet",
      batchNumber: "",
      purchasePrice: 0,
      sellingPrice: 0,
      gstPercentage: 12,
      stockQuantity: 0,
      minStockLevel: 10,
    }
  });

  function onSubmit(data: any) {
    const formattedData = {
      ...data,
      purchasePrice: data.purchasePrice.toString(),
      sellingPrice: data.sellingPrice.toString(),
      expiryDate: data.expiryDate,
    };
    mutate(formattedData, {
      onSuccess: () => {
        onClose();
        form.reset();
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Medicine Name</FormLabel>
                <FormControl><Input placeholder="Dolo 650mg" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Tablet">Tablet</SelectItem>
                    <SelectItem value="Syrup">Syrup</SelectItem>
                    <SelectItem value="Injection">Injection</SelectItem>
                    <SelectItem value="Capsule">Capsule</SelectItem>
                    <SelectItem value="Cream">Cream</SelectItem>
                    <SelectItem value="Drops">Drops</SelectItem>
                    <SelectItem value="Powder">Powder</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="batchNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Batch No</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="expiryDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expiry Date</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="purchasePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Price</FormLabel>
                <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sellingPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Selling Price (MRP)</FormLabel>
                <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="gstPercentage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GST %</FormLabel>
                <FormControl><Input type="number" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stockQuantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock Qty</FormLabel>
                <FormControl><Input type="number" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isPending} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {isPending ? "Adding..." : "Add Medicine"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function Medicines() {
  const [search, setSearch] = useState("");
  const [showLowStock, setShowLowStock] = useState(false);
  const { data: medicines, isLoading } = useMedicines({ search, lowStock: showLowStock });
  const { mutate: deleteMedicine } = useDeleteMedicine();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background font-body">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 relative">
        <RefreshButton />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold font-display tracking-tight">Medicine Inventory</h1>
                <p className="text-muted-foreground mt-1">Manage stock, prices, and batches.</p>
              </div>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 rounded-xl">
                    <Plus className="mr-2 h-4 w-4" /> Add Medicine
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-xl">
                  <DialogHeader>
                    <DialogTitle>Add New Medicine</DialogTitle>
                  </DialogHeader>
                  <MedicineForm onClose={() => setOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex gap-4 items-center bg-card p-4 rounded-xl border border-border shadow-sm">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search medicines..." 
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button 
                variant={showLowStock ? "destructive" : "outline"} 
                onClick={() => setShowLowStock(!showLowStock)}
                className="gap-2"
              >
                <AlertCircle className="h-4 w-4" />
                Low Stock Only
              </Button>
            </div>

            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                    <tr>
                      <th className="px-6 py-4 font-bold">Name</th>
                      <th className="px-6 py-4 font-bold">Category</th>
                      <th className="px-6 py-4 font-bold">Batch</th>
                      <th className="px-6 py-4 font-bold">Expiry</th>
                      <th className="px-6 py-4 font-bold text-right">Stock</th>
                      <th className="px-6 py-4 font-bold text-right">MRP</th>
                      <th className="px-6 py-4 font-bold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {isLoading ? (
                      <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Loading inventory...</td></tr>
                    ) : medicines?.map((med) => {
                      const isLow = med.stockQuantity <= (med.minStockLevel || 10);
                      return (
                        <tr key={med.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4 font-medium text-foreground">{med.name}</td>
                          <td className="px-6 py-4 text-muted-foreground">
                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium">
                              {med.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs">{med.batchNumber}</td>
                          <td className="px-6 py-4 text-muted-foreground">{format(new Date(med.expiryDate), "MMM yyyy")}</td>
                          <td className={`px-6 py-4 text-right font-bold ${isLow ? "text-destructive" : ""}`}>
                            {med.stockQuantity}
                            {isLow && <AlertCircle className="inline ml-2 h-3 w-3" />}
                          </td>
                          <td className="px-6 py-4 text-right">₹{med.sellingPrice}</td>
                          <td className="px-6 py-4 text-center">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-muted-foreground hover:text-destructive"
                              onClick={() => {
                                if(confirm('Are you sure?')) deleteMedicine(med.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                    {medicines?.length === 0 && (
                      <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No medicines found.</td></tr>
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
