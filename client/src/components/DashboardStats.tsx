import { 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  Package, 
  Users 
} from "lucide-react";
import { useStats } from "@/hooks/use-invoices";

export function DashboardStats() {
  const { data: stats, isLoading } = useStats();

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-muted/50 rounded-2xl" />
        ))}
      </div>
    );
  }

  const statItems = [
    {
      label: "Today's Sales",
      value: `₹${Number(stats.todaysSales).toLocaleString()}`,
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100"
    },
    {
      label: "Low Stock Items",
      value: stats.lowStockItems,
      icon: AlertTriangle,
      color: "text-rose-600",
      bg: "bg-rose-50",
      border: "border-rose-100"
    },
    {
      label: "Expiring Soon",
      value: stats.expiringSoonItems,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100"
    },
    {
      label: "Total Medicines",
      value: stats.totalMedicines,
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((item) => (
        <div 
          key={item.label}
          className={`relative overflow-hidden rounded-2xl p-6 bg-card border ${item.border} shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1`}
        >
          <div className="flex justify-between items-start z-10 relative">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">{item.label}</p>
              <h3 className="text-3xl font-bold font-display text-foreground">{item.value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${item.bg} ${item.color}`}>
              <item.icon className="h-6 w-6" />
            </div>
          </div>
          {/* Decorative background circle */}
          <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full ${item.bg} opacity-50 z-0`} />
        </div>
      ))}
    </div>
  );
}
