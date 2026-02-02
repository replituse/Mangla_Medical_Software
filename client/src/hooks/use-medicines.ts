import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertMedicine, type Medicine } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useMedicines(filters?: { search?: string; lowStock?: boolean; expiring?: boolean }) {
  // Construct query string manually if buildUrl doesn't support query params object spread directly
  // The shared route definition uses a path without query params, so we append them.
  const queryKey = [api.medicines.list.path, filters];
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      let url = api.medicines.list.path;
      if (filters) {
        const params = new URLSearchParams();
        if (filters.search) params.append("search", filters.search);
        if (filters.lowStock) params.append("lowStock", "true");
        if (filters.expiring) params.append("expiring", "true");
        if (params.toString()) url += `?${params.toString()}`;
      }
      
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch medicines");
      return api.medicines.list.responses[200].parse(await res.json());
    },
  });
}

export function useMedicine(id: number | null) {
  return useQuery({
    queryKey: [api.medicines.get.path, id],
    queryFn: async () => {
      if (!id) return null;
      const url = buildUrl(api.medicines.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch medicine");
      return api.medicines.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateMedicine() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertMedicine) => {
      const res = await fetch(api.medicines.create.path, {
        method: api.medicines.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create medicine");
      }
      return api.medicines.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.medicines.list.path] });
      toast({ title: "Success", description: "Medicine added successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateMedicine() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<InsertMedicine> & { id: number }) => {
      const url = buildUrl(api.medicines.update.path, { id });
      const res = await fetch(url, {
        method: api.medicines.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to update medicine");
      return api.medicines.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.medicines.list.path] });
      toast({ title: "Success", description: "Medicine updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteMedicine() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.medicines.delete.path, { id });
      const res = await fetch(url, {
        method: api.medicines.delete.method,
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to delete medicine");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.medicines.list.path] });
      toast({ title: "Success", description: "Medicine deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}
