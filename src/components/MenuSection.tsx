import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flame, Leaf, Star, Plus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import salmon from "@/assets/dish-salmon.jpg";
import risotto from "@/assets/dish-risotto.jpg";
import burger from "@/assets/dish-burger.jpg";
import salad from "@/assets/dish-salad.jpg";
import dessert from "@/assets/dish-dessert.jpg";
import brunch from "@/assets/dish-brunch.jpg";

type Dish = {
  name: string;
  price: number;
  image: string;
  category: "Lunch" | "Dinner" | "Brunch" | "Main Course";
  tags: ("Veg" | "Spicy" | "Bestseller")[];
  description: string;
};

const dishes: Dish[] = [
  { name: "Cedar-Grilled Salmon", price: 28, image: salmon, category: "Dinner", tags: ["Bestseller"], description: "Atlantic salmon, citrus glaze, fresh dill" },
  { name: "Truffle Wild Risotto", price: 24, image: risotto, category: "Main Course", tags: ["Veg", "Bestseller"], description: "Arborio rice, black truffle, parmesan" },
  { name: "Wagyu Signature Burger", price: 22, image: burger, category: "Lunch", tags: ["Spicy"], description: "A5 wagyu, brioche, sweet potato fries" },
  { name: "Garden Harvest Bowl", price: 16, image: salad, category: "Lunch", tags: ["Veg"], description: "Avocado, heirloom tomatoes, microgreens" },
  { name: "Avocado Sunrise Toast", price: 14, image: brunch, category: "Brunch", tags: ["Veg", "Bestseller"], description: "Sourdough, smashed avocado, poached egg" },
  { name: "Molten Dark Chocolate", price: 12, image: dessert, category: "Dinner", tags: ["Bestseller"], description: "Valrhona ganache, vanilla bean ice cream" },
];

const categories = ["All", "Lunch", "Dinner", "Brunch", "Main Course"] as const;

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

export const MenuSection = () => {
  const [active, setActive] = useState<(typeof categories)[number]>("All");
  const filtered = active === "All" ? dishes : dishes.filter((d) => d.category === active);

  return (
    <section id="menu" className="py-10 md:py-16 bg-gradient-warm">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-8 md:mb-10 animate-slide-up">
          <p className="text-xs sm:text-sm font-semibold tracking-[0.2em] text-accent uppercase mb-2 sm:mb-3">Our Menu</p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-3 sm:mb-4">
            Crafted with intention,<br />served with care
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Browse our seasonal selections — no login required. Discover what's waiting on your plate.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-8 md:mb-10">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={cn(
                "px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300",
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
          <h3 className="font-display text-lg sm:text-2xl font-semibold text-primary">Popular Dishes</h3>
          <div className="flex-1 h-px bg-border" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {filtered.map((dish, i) => (
            <article
              key={dish.name}
              className="group bg-card rounded-2xl overflow-hidden shadow-soft hover-lift border border-border/50 animate-scale-in"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={dish.image}
                  alt={dish.name}
                  loading="lazy"
                  width={768}
                  height={576}
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
                  <h4 className="font-display text-base sm:text-xl font-semibold text-primary leading-snug line-clamp-2">{dish.name}</h4>
                  <span className="font-display text-base sm:text-xl font-bold text-accent whitespace-nowrap">${dish.price}</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2">{dish.description}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => toast.success(`${dish.name} added to cart`)}
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
};
