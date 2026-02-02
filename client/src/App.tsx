import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

import Dashboard from "@/pages/Dashboard";
import Medicines from "@/pages/Medicines";
import Billing from "@/pages/Billing";
import Customers from "@/pages/Customers";
import Suppliers from "@/pages/Suppliers";
import Profile from "@/pages/Profile";
import Reports from "@/pages/Reports";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";

function PrivateRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <PrivateRoute component={Dashboard} />} />
      <Route path="/medicines" component={() => <PrivateRoute component={Medicines} />} />
      <Route path="/billing" component={() => <PrivateRoute component={Billing} />} />
      <Route path="/customers" component={() => <PrivateRoute component={Customers} />} />
      <Route path="/suppliers" component={() => <PrivateRoute component={Suppliers} />} />
      <Route path="/profile" component={() => <PrivateRoute component={Profile} />} />
      <Route path="/reports" component={() => <PrivateRoute component={Reports} />} />
      <Route path="/login" component={Login} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
