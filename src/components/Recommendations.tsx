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
  <section className="py-24 bg-background">
    <div className="container">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4 animate-slide-up">
        <div>
          <p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> For You
          </p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-primary">
            Recommended for You
          </h2>
          <p className="text-muted-foreground text-lg mt-3">
            Curated to your taste — vegetarian, balanced, smart on price.
          </p>
        </div>
        <div className="flex gap-2">
          {["Veg", "Spicy", "Budget", "Bestseller"].map((t) => (
            <button
              key={t}
              className="px-4 py-2 rounded-full text-xs font-medium bg-secondary hover:bg-accent/20 text-secondary-foreground transition-colors border border-border"
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {recommendations.map((r, i) => (
          <article
            key={r.name}
            className="group relative bg-gradient-card rounded-2xl overflow-hidden shadow-soft hover-lift border border-border/50 animate-scale-in"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
              <Badge className="bg-gradient-gold text-accent-foreground border-0 shadow-gold gap-1">
                <Sparkles className="w-3 h-3" /> {r.match}% match
              </Badge>
              <button className="w-9 h-9 grid place-items-center rounded-full glass hover:bg-destructive/20 transition-colors">
                <Heart className="w-4 h-4 text-destructive" />
              </button>
            </div>
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src={r.image}
                alt={r.name}
                loading="lazy"
                width={768}
                height={576}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
            </div>
            <div className="p-6">
              <h3 className="font-display text-xl font-semibold text-primary mb-2">{r.name}</h3>
              <p className="text-sm text-muted-foreground italic mb-4">"{r.reason}"</p>
              <div className="flex items-center justify-between">
                <span className="font-display text-2xl font-bold text-accent">${r.price}</span>
                <Button variant="gold" size="sm" onClick={() => toast.success(`${r.name} added to cart`)}>
                  <Plus className="w-4 h-4" /> Add
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
);
