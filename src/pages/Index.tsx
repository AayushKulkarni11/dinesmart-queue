import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { PopularPreview } from "@/components/PopularPreview";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="bg-background">
      <Navbar />
      <main>
        <Hero />
        <PopularPreview />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
