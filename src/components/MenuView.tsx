import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Utensils, Pizza, Coffee, Dessert, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const categories = [
  { id: "all", name: "All", icon: Utensils },
  { id: "starters", name: "Starters", icon: Pizza },
  { id: "mains", name: "Mains", icon: Utensils },
  { id: "drinks", name: "Drinks", icon: Coffee },
  { id: "desserts", name: "Desserts", icon: Dessert },
];

const menuItems = [
  { id: 1, name: "Truffle Fries", price: "₹249", category: "starters", description: "Crispy fries tossed in truffle oil and parmesan.", image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop" },
  { id: 2, name: "Margherita Pizza", price: "₹499", category: "starters", description: "Fresh mozzarella, basil, and tomato sauce.", image: "https://images.unsplash.com/photo-1574071318508-1cdbad80ad50?w=400&h=300&fit=crop" },
  { id: 3, name: "Wild Mushroom Risotto", price: "₹649", category: "mains", description: "Creamy arborio rice with porcini mushrooms.", image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=300&fit=crop" },
  { id: 4, name: "Grilled Salmon", price: "₹899", category: "mains", description: "Atlantic salmon with roasted seasonal veggies.", image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop" },
  { id: 5, name: "Hazelnut Latte", price: "₹189", category: "drinks", description: "Premium espresso with steamed milk and hazelnut.", image: "https://images.unsplash.com/photo-1541167760496-162955ed8a9f?w=400&h=300&fit=crop" },
  { id: 6, name: "Belgium Chocolate Cake", price: "₹349", category: "desserts", description: "Rich dark chocolate layer cake with ganache.", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop" },
];

export const MenuView = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-background rounded-3xl overflow-hidden border border-border/50 shadow-elegant">
      <div className="p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-b border-border/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="font-display text-3xl font-bold text-primary">Discover our Menu</h3>
            <p className="text-muted-foreground mt-1">Gourmet flavors waiting for you.</p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search dishes..."
              className="pl-10 bg-background/50 h-11"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 mt-8 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={activeCategory === cat.id ? "default" : "outline"}
              className="rounded-full px-6 h-10 shrink-0"
              onClick={() => setActiveCategory(cat.id)}
            >
              <cat.icon className="w-4 h-4 mr-2" />
              {cat.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="p-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[600px] overflow-y-auto no-scrollbar">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              key={item.id}
              className="group bg-card rounded-2xl border border-border/40 overflow-hidden hover-lift shadow-soft"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold shadow-soft">
                  {item.price}
                </div>
              </div>
              <div className="p-5">
                <h4 className="font-display text-lg font-bold text-primary">{item.name}</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                  {item.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-[10px] uppercase tracking-wider font-bold text-accent px-2 py-0.5 bg-accent/10 rounded">
                    {item.category}
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <Info className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
