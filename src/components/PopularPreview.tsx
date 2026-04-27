import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Plus, Star } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { dishes } from "@/data/menu";

const popularIds = ["m1", "l1", "br1"];

export const PopularPreview = () => {
  const { add } = useCart();
  const popular = dishes.filter((d) => popularIds.includes(d.id));

  return (
    <section className="py-24 bg-gradient-warm">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4 animate-slide-up">
          <div>
            <p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 fill-current" /> Tonight's Favourites
            </p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-primary">
              Popular dishes guests love
            </h2>
            <p className="text-muted-foreground text-lg mt-3">
              A taste of what's waiting on the menu.
            </p>
          </div>
          <Button variant="default" size="lg" asChild>
            <Link to="/menu">View Full Menu <ArrowRight className="w-4 h-4" /></Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {popular.map((dish, i) => (
            <article
              key={dish.id}
              className="group bg-card rounded-2xl overflow-hidden shadow-soft hover-lift border border-border/50 animate-scale-in"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={dish.image}
                  alt={dish.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-display text-xl font-semibold text-primary">{dish.name}</h3>
                  <span className="font-display text-xl font-bold text-accent">${dish.price}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{dish.description}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    add({ id: dish.id, name: dish.name, price: dish.price, image: dish.image });
                    toast.success("Item added to cart", { description: dish.name });
                  }}
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
