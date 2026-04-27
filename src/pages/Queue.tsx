import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { QueueSection } from "@/components/QueueSection";

export default function Queue() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24">
        <QueueSection />
      </main>
      <Footer />
    </div>
  );
}
