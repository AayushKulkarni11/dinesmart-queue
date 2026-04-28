import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flame, Leaf, Star, Plus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { dishes, categories, type Category } from "@/data/menu";
import { useCart } from "@/context/CartContext";

const tagStyles: Record<string, string> = {
  Veg: "bg-success/15 text-success border-success/30",
  Spicy: "bg-destructive/10 text-destructive border-destructive/30",
  Bestseller: "bg-accent/20 text-accent-foreground border-accent/40",
};

const tagIcons: Record<string, JSX.Element> = {
  Veg: <Leaf className="w-3 h-3" />,
  Spicy: <Flame className="w-3 h-3" />,
  Bestseller: <Star className="w-3 h-3 fill-current" />,
};

export default function Menu() {
  const [active, setActive] = useState<Category>("Starters");
  const { add, setOpen } = useCart();
  const filtered = dishes.filter((d) => d.category === active);

  const handleAdd = (d: typeof dishes[number]) => {
    add({ id: d.id, name: d.name, price: d.price, image: d.image });
    toast.success("Item added to cart", { description: d.name });
  };

  return (
    <div className="bg-background">
      <Navbar />
      <main className="pt-16 sm:pt-20 pb-12 md:pb-16">
        <section className="bg-gradient-warm py-8 md:py-12 mb-8 md:mb-10">
          <div className="container text-center max-w-2xl mx-auto animate-slide-up">
            <p className="text-xs sm:text-sm font-semibold tracking-[0.2em] text-accent uppercase mb-2 sm:mb-3">Our Menu</p>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-3 sm:mb-4">
              Crafted with intention,<br />served with care
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Browse seasonal selections by category — add favourites to your cart as you go.
            </p>
          </div>
        </section>

        <div className="container">
          {/* Category tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-6 md:mb-8 sticky top-24 z-30 py-3 -mx-2 px-2 bg-background/80 backdrop-blur-md rounded-full">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActive(c)}
                className={cn(
                  "px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300",
                  active === c
                    ? "bg-primary text-primary-foreground shadow-elegant"
                    : "bg-card text-foreground hover:bg-secondary border border-border"
                )}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="mb-6 md:mb-8 flex items-center gap-2 sm:gap-3">
            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-accent fill-accent" />
            <h2 className="font-display text-lg sm:text-2xl font-semibold text-primary">{active}</h2>
            <span className="text-xs sm:text-sm text-muted-foreground">({filtered.length} dishes)</span>
            <div className="flex-1 h-px bg-border" />
            <Button variant="gold" size="sm" onClick={() => setOpen(true)}>View Cart</Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {filtered.map((dish, i) => (
              <article
                key={dish.id}
                className="group bg-card rounded-2xl overflow-hidden shadow-soft hover-lift border border-border/50 animate-scale-in"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    {dish.tags.map((t) => (
                      <Badge key={t} variant="outline" className={cn("backdrop-blur-md gap-1 text-[10px] sm:text-xs", tagStyles[t])}>
                        {tagIcons[t]} {t}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="p-3 sm:p-4 md:p-5">
                  <div className="flex items-start justify-between gap-2 sm:gap-3 mb-1 sm:mb-2">
                    <h3 className="font-display text-base sm:text-lg sm:text-xl font-semibold text-primary leading-snug line-clamp-2">{dish.name}</h3>
                    <span className="font-display text-base sm:text-lg sm:text-xl font-bold text-accent whitespace-nowrap">${dish.price}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2">{dish.description}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleAdd(dish)}
                  >
                    <Plus className="w-4 h-4" /> Add to Cart
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
