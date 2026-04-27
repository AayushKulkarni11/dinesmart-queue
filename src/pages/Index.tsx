import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { MenuSection } from "@/components/MenuSection";
import { QueueSection } from "@/components/QueueSection";
import { TableLayout } from "@/components/TableLayout";
import { Recommendations } from "@/components/Recommendations";
import { AdminDashboard } from "@/components/AdminDashboard";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <MenuSection />
        <Recommendations />
        <QueueSection />
        <TableLayout />
        <AdminDashboard />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
