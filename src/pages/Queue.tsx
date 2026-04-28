import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { QueueSection } from "@/components/QueueSection";

export default function Queue() {
  return (
    <div className="bg-background">
      <Navbar />
      <main className="pt-16 sm:pt-20 pb-12 md:pb-16">
        <QueueSection />
      </main>
      <Footer />
    </div>
  );
}
