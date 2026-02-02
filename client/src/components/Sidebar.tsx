import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Pill, 
  Users, 
  Truck, 
  LogOut, 
  FileText
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: ShoppingCart, label: "POS Billing", href: "/billing" },
  { icon: Pill, label: "Medicines", href: "/medicines" },
  { icon: Users, label: "Customers", href: "/customers" },
  { icon: Truck, label: "Suppliers", href: "/suppliers" },
  { icon: FileText, label: "Reports", href: "/reports" },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen w-64 flex-col bg-card border-r border-border shadow-xl z-20 sticky top-0">
      <div className="flex h-16 items-center px-6 border-b border-border bg-primary/5">
        <Pill className="h-6 w-6 text-primary mr-2" />
        <span className="text-xl font-bold font-display text-primary tracking-tight">
          Mangala Medicos
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-3">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div 
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer group",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                      : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  )}
                >
                  <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary")} />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-border p-4 bg-muted/20">
        <Link href="/profile">
          <div className="flex items-center mb-4 px-2 cursor-pointer hover:bg-primary/5 rounded-lg p-2 transition-colors">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden">
              {user?.profileImageUrl ? (
                <img src={user.profileImageUrl} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                user?.firstName?.charAt(0) || "U"
              )}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-semibold truncate text-foreground">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          </div>
        </Link>
        <button
          onClick={() => logout()}
          className="flex w-full items-center justify-center px-4 py-2 text-sm font-medium text-destructive bg-destructive/10 rounded-lg hover:bg-destructive hover:text-destructive-foreground transition-colors"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
