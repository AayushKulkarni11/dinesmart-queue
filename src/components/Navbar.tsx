import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { label: "Home", href: "#home" },
  { label: "View Menu", href: "#menu" },
  { label: "Book Table", href: "#tables" },
  { label: "Live Queue", href: "#queue" },
  { label: "Dashboard", href: "#admin" },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-500",
        scrolled ? "py-2" : "py-4"
      )}
    >
      <div
        className={cn(
          "container flex items-center justify-between rounded-full transition-all duration-500 px-5 md:px-7",
          scrolled
            ? "glass shadow-glass py-2.5"
            : "bg-background/30 backdrop-blur-sm py-3"
        )}
      >
        <a href="#home" className="flex items-center gap-2 group">
          <span className="grid place-items-center w-9 h-9 rounded-full bg-gradient-gold shadow-gold group-hover:scale-110 transition-transform">
            <UtensilsCrossed className="w-4 h-4 text-accent-foreground" />
          </span>
          <span className="font-display text-xl font-bold text-primary">
            Maison<span className="text-gold">Verde</span>
          </span>
        </a>

        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-primary rounded-full hover:bg-accent/10 transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <Button variant="ghost" size="sm">Login</Button>
          <Button variant="gold" size="sm">Sign Up</Button>
        </div>

        <button
          onClick={() => setOpen((s) => !s)}
          className="lg:hidden p-2 rounded-full hover:bg-accent/10"
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden container mt-2 animate-fade-in">
          <div className="glass rounded-2xl p-4 flex flex-col gap-1 shadow-glass">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="px-4 py-3 text-sm font-medium rounded-xl hover:bg-accent/10"
              >
                {l.label}
              </a>
            ))}
            <div className="flex gap-2 mt-2 pt-3 border-t border-border">
              <Button variant="ghost" size="sm" className="flex-1">Login</Button>
              <Button variant="gold" size="sm" className="flex-1">Sign Up</Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
