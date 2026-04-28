import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TableLayout } from "@/components/TableLayout";

export default function Tables() {
  return (
    <div className="bg-background">
      <Navbar />
      <main className="pt-16 sm:pt-20 pb-12 md:pb-16">
        <TableLayout />
      </main>
      <Footer />
    </div>
  );
}
