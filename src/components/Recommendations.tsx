import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Plus, Heart } from "lucide-react";
import { toast } from "sonner";
import salmon from "@/assets/dish-salmon.jpg";
import risotto from "@/assets/dish-risotto.jpg";
import salad from "@/assets/dish-salad.jpg";

const recommendations = [
  { name: "Truffle Wild Risotto", reason: "Matches your love for vegetarian comfort", price: 24, image: risotto, match: 96 },
  { name: "Garden Harvest Bowl", reason: "Light, fresh — under your $20 budget", price: 16, image: salad, match: 92 },
  { name: "Cedar-Grilled Salmon", reason: "Highly rated by similar guests", price: 28, image: salmon, match: 88 },
];

export const Recommendations = () => (
  <section className="py-10 md:py-16 bg-background">
    <div className="container">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 md:mb-8 gap-4 animate-slide-up">
        <div>
          <p className="text-xs sm:text-sm font-semibold tracking-[0.2em] text-accent uppercase mb-2 sm:mb-3 flex items-center gap-2">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" /> For You
          </p>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary">
            Recommended for You
          </h2>
          <p className="text-muted-foreground text-sm sm:text-lg mt-2 sm:mt-3">
            Curated to your taste — vegetarian, balanced, smart on price.
          </p>
        </div>
        <div className="flex gap-1 sm:gap-2">
          {["Veg", "Spicy", "Budget", "Bestseller"].map((t) => (
            <button
              key={t}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-medium bg-secondary hover:bg-accent/20 text-secondary-foreground transition-colors border border-border"
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {recommendations.map((r, i) => (
          <article
            key={r.name}
            className="group relative bg-gradient-card rounded-2xl overflow-hidden shadow-soft hover-lift border border-border/50 animate-scale-in"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10 flex flex-col gap-1 sm:gap-2">
              <Badge className="bg-gradient-gold text-accent-foreground border-0 shadow-gold gap-1 text-[10px] sm:text-xs">
                <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {r.match}% match
              </Badge>
              <button className="w-8 h-8 sm:w-9 sm:h-9 grid place-items-center rounded-full glass hover:bg-destructive/20 transition-colors">
                <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-destructive" />
              </button>
            </div>
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src={r.image}
                alt={r.name}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
            </div>
            <div className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-2 sm:gap-3 mb-2">
                <h3 className="font-display text-lg sm:text-xl font-semibold text-primary line-clamp-2">{r.name}</h3>
                <span className="font-display text-lg sm:text-xl font-bold text-accent whitespace-nowrap">${r.price}</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2">{r.reason}</p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => toast.success(`${r.name} added to cart`, { description: r.reason })}
              >
                <Plus className="w-4 h-4" /> Add to Cart
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
);
