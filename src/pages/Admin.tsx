import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AdminDashboard } from "@/components/AdminDashboard";
import { ShieldCheck } from "lucide-react";

export default function Admin() {
  return (
    <div className="bg-background">
      <Navbar />
      <main className="pt-16 sm:pt-20 pb-12 md:pb-16">
        <div className="container">
          <div className="inline-flex items-center gap-2 glass rounded-full px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium text-primary border border-accent/40 shadow-soft mb-4 sm:mb-6">
            <ShieldCheck className="w-3 h-3 sm:w-4 sm:h-4 text-accent" /> Admin-only area
          </div>
        </div>
        <AdminDashboard />
      </main>
      <Footer />
    </div>
  );
}
