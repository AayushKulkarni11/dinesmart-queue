import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AdminDashboard } from "@/components/AdminDashboard";
import { ShieldCheck } from "lucide-react";

export default function Admin() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-28">
        <div className="container">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-sm font-medium text-primary border border-accent/40 shadow-soft">
            <ShieldCheck className="w-4 h-4 text-accent" /> Admin-only area
          </div>
        </div>
        <AdminDashboard />
      </main>
      <Footer />
    </div>
  );
}
