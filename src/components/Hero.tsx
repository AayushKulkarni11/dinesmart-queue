import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Sparkles } from "lucide-react";
import { apiFetch } from "@/lib/api";
import heroImage from "@/assets/hero-restaurant.jpg";

type QueueEntry = {
  status: "Waiting" | "Called" | "Seated";
};

export const Hero = () => {
  const [waitingCount, setWaitingCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await apiFetch<{ entries: QueueEntry[] }>("/api/queue");
        if (cancelled) return;
        setWaitingCount(data.entries.filter((entry) => entry.status === "Waiting").length);
      } catch {
        if (!cancelled) setWaitingCount(null);
      }
    };

    load();
    const interval = window.setInterval(load, 15000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <section id="home" className="relative min-h-[60vh] sm:min-h-[70vh] lg:min-h-[80vh] flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Elegant restaurant ambiance with warm golden lighting"
          className="w-full h-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-hero" />
      </div>

      <div className="container relative z-10 pt-16 sm:pt-20 pb-12 lg:pt-24 lg:pb-16">
        <div className="max-w-3xl animate-fade-in">
          <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-1.5 sm:px-4 sm:py-2 mb-4 sm:mb-6 text-xs sm:text-sm">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-accent" />
            <span className="text-foreground font-medium">Smart Dining Experience</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.05] text-background mb-4 sm:mb-6">
            Skip the wait.
            <br />
            <span className="text-gold">Dine smarter.</span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-background/80 max-w-xl mb-6 sm:mb-8 lg:mb-10 leading-relaxed">
            Reserve your table, join the queue from anywhere, and discover dishes curated
            to your taste — all before you walk through the door.
          </p>

          <div className="flex flex-wrap gap-2 sm:gap-3">
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

          <div className="mt-6 sm:mt-8 lg:mt-10 inline-flex items-center gap-2 sm:gap-3 glass rounded-full px-4 py-2 sm:px-5 sm:py-3 shadow-glass">
            <span className="relative flex w-2 h-2 sm:w-2.5 sm:h-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-success" />
            </span>
            <Users className="w-3 h-3 sm:w-4 sm:h-4 text-foreground/80" />
            <span className="text-xs sm:text-sm font-medium text-foreground">
              {waitingCount === null ? (
                "Live queue status available on the queue page"
              ) : (
                <>
                  <span className="text-primary font-bold">{waitingCount} people</span> currently waiting
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 sm:bottom-6 lg:bottom-8 left-1/2 -translate-x-1/2 animate-float text-background/60 text-[10px] sm:text-xs tracking-widest">
        SCROLL TO EXPLORE
      </div>
    </section>
  );
};
