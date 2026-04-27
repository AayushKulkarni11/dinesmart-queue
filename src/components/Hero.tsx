import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-restaurant.jpg";

export const Hero = () => (
  <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
    <div className="absolute inset-0">
      <img
        src={heroImage}
        alt="Elegant restaurant ambiance with warm golden lighting"
        className="w-full h-full object-cover scale-105"
        width={1920}
        height={1080}
      />
      <div className="absolute inset-0 bg-gradient-hero" />
    </div>

    <div className="container relative z-10 pt-32 pb-20">
      <div className="max-w-3xl animate-fade-in">
        <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-6 text-sm">
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="text-foreground font-medium">Smart Dining Experience</span>
        </div>

        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] text-background mb-6">
          Skip the wait.
          <br />
          <span className="text-gold">Dine smarter.</span>
        </h1>

        <p className="text-lg sm:text-xl text-background/80 max-w-xl mb-10 leading-relaxed">
          Reserve your table, join the queue from anywhere, and discover dishes curated
          to your taste — all before you walk through the door.
        </p>

        <div className="flex flex-wrap gap-3">
          <Button variant="hero" size="xl" asChild>
            <Link to="/menu">View Menu <ArrowRight className="w-4 h-4" /></Link>
          </Button>
          <Button variant="glass" size="xl" asChild>
            <Link to="/queue">Join Queue</Link>
          </Button>
          <Button variant="glass" size="xl" asChild>
            <Link to="/tables">Book Table</Link>
          </Button>
        </div>

        <div className="mt-10 inline-flex items-center gap-3 glass rounded-full px-5 py-3 shadow-glass">
          <span className="relative flex w-2.5 h-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success" />
          </span>
          <Users className="w-4 h-4 text-foreground/80" />
          <span className="text-sm font-medium text-foreground">
            <span className="text-primary font-bold">12 people</span> currently waiting
          </span>
        </div>
      </div>
    </div>

    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float text-background/60 text-xs tracking-widest">
      SCROLL TO EXPLORE
    </div>
  </section>
);
