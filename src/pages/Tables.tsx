import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TableLayout } from "@/components/TableLayout";

export default function Tables() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24">
        <TableLayout />
      </main>
      <Footer />
    </div>
  );
}
