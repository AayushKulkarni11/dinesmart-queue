import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, UtensilsCrossed, ShoppingBag, LogOut, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

const links = [
  { label: "Home", to: "/" },
  { label: "Menu", to: "/menu" },
  { label: "Book Table", to: "/tables" },
  { label: "Live Queue", to: "/queue" },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const { count, setOpen: setCartOpen } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success("Signed out");
    navigate("/");
  };

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
          scrolled ? "glass shadow-glass py-2.5" : "bg-background/30 backdrop-blur-sm py-3"
        )}
      >
        <Link to="/" className="flex items-center gap-2 group">
          <span className="grid place-items-center w-9 h-9 rounded-full bg-gradient-gold shadow-gold group-hover:scale-110 transition-transform">
            <UtensilsCrossed className="w-4 h-4 text-accent-foreground" />
          </span>
          <span className="font-display text-xl font-bold text-primary">
            Modern <span className="text-gold">Darbar</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.label}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                cn(
                  "px-4 py-2 text-sm font-medium rounded-full transition-colors",
                  isActive
                    ? "bg-accent/15 text-primary"
                    : "text-foreground/80 hover:text-primary hover:bg-accent/10"
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
          {user?.role === "admin" && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                cn(
                  "px-4 py-2 text-sm font-medium rounded-full transition-colors flex items-center gap-1.5",
                  isActive ? "bg-accent/15 text-primary" : "text-foreground/80 hover:text-primary hover:bg-accent/10"
                )
              }
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Admin
            </NavLink>
          )}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <button
            onClick={() => setCartOpen(true)}
            className="relative w-10 h-10 grid place-items-center rounded-full hover:bg-accent/15 transition-colors"
            aria-label="Open cart"
          >
            <ShoppingBag className="w-4 h-4 text-primary" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground shadow-gold">
                {count}
              </span>
            )}
          </button>
          {user ? (
            <>
              <span className="text-sm text-foreground/80 px-2">Hi, {user.name.split(" ")[0]}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" /> Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button variant="gold" size="sm" asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        <div className="lg:hidden flex items-center gap-1">
          <button
            onClick={() => setCartOpen(true)}
            className="relative w-10 h-10 grid place-items-center rounded-full hover:bg-accent/15"
            aria-label="Open cart"
          >
            <ShoppingBag className="w-4 h-4 text-primary" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                {count}
              </span>
            )}
          </button>
          <button
            onClick={() => setOpen((s) => !s)}
            className="p-2 rounded-full hover:bg-accent/10"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden container mt-2 animate-fade-in">
          <div className="glass rounded-2xl p-4 flex flex-col gap-1 shadow-glass">
            {links.map((l) => (
              <NavLink
                key={l.label}
                to={l.to}
                end={l.to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "px-4 py-3 text-sm font-medium rounded-xl",
                    isActive ? "bg-accent/15 text-primary" : "hover:bg-accent/10"
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
            {user?.role === "admin" && (
              <NavLink
                to="/admin"
                onClick={() => setOpen(false)}
                className="px-4 py-3 text-sm font-medium rounded-xl hover:bg-accent/10 flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" /> Admin
              </NavLink>
            )}
            <div className="flex gap-2 mt-2 pt-3 border-t border-border">
              {user ? (
                <Button variant="ghost" size="sm" className="flex-1" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" /> Sign Out
                </Button>
              ) : (
                <>
                  <Button variant="ghost" size="sm" className="flex-1" asChild>
                    <Link to="/login" onClick={() => setOpen(false)}>Login</Link>
                  </Button>
                  <Button variant="gold" size="sm" className="flex-1" asChild>
                    <Link to="/signup" onClick={() => setOpen(false)}>Sign Up</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
