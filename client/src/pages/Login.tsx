import { Pill } from "lucide-react";

export default function Login() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left Panel: Hero */}
      <div className="relative bg-emerald-900 flex flex-col justify-center p-12 lg:p-20 overflow-hidden">
        {/* Background texture/gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-800 to-emerald-950 z-0" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-700/30 rounded-full blur-3xl z-0" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-3xl z-0" />
        
        <div className="relative z-10 space-y-8">
          <div className="flex items-center gap-3 text-white">
            <Pill className="h-10 w-10" />
            <h1 className="text-3xl font-bold font-display tracking-tight">Mangala Medicos</h1>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight font-display">
              Advanced Pharmacy <br /> Management System
            </h2>
            <p className="text-emerald-100 text-lg max-w-lg leading-relaxed">
              Streamline your medical inventory, billing, and customer management with our professional solution designed for modern pharmacies.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-8 max-w-md">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
              <h3 className="text-white font-bold text-lg mb-1">Fast Billing</h3>
              <p className="text-emerald-100 text-sm">POS system with GST calculations</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
              <h3 className="text-white font-bold text-lg mb-1">Smart Inventory</h3>
              <p className="text-emerald-100 text-sm">Expiry and low stock alerts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Login */}
      <div className="bg-background flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold font-display text-foreground">Welcome Back</h2>
            <p className="text-muted-foreground">Sign in to access your dashboard</p>
          </div>

          <button
            onClick={handleLogin}
            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-emerald-900/10 text-lg font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Login with Replit
          </button>
          
          <p className="text-xs text-muted-foreground mt-8">
            Restricted access for authorized staff only.
          </p>
        </div>
      </div>
    </div>
  );
}
