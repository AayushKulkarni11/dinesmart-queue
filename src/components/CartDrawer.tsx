import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Minus, Plus, Trash2, Phone, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

export const CartDrawer = () => {
  const { items, open, setOpen, inc, dec, remove, total, clear } = useCart();

  const placeOrder = () => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    toast.success("Order placed successfully", { description: `Total $${total.toFixed(2)} — heading to your table` });
    clear();
    setOpen(false);
  };

  const callCaptain = () => {
    toast.success("Captain notified", { description: "A team member is on the way" });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0 bg-card">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2 font-display text-2xl text-primary">
            <ShoppingBag className="w-5 h-5 text-accent" />
            Your Cart
            {items.length > 0 && (
              <span className="text-sm font-sans font-normal text-muted-foreground">
                ({items.length} item{items.length > 1 ? "s" : ""})
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="h-full grid place-items-center text-center text-muted-foreground">
              <div>
                <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="font-medium">Your cart is empty</p>
                <p className="text-sm mt-1">Add dishes from the menu to get started.</p>
              </div>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((it) => (
                <li
                  key={it.id}
                  className="flex gap-3 p-3 rounded-xl bg-background border border-border/60 animate-fade-in"
                >
                  <img src={it.image} alt={it.name} className="w-16 h-16 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display text-base font-semibold text-primary leading-tight truncate">
                        {it.name}
                      </h3>
                      <button
                        onClick={() => remove(it.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-accent font-bold mt-0.5">${it.price}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="inline-flex items-center bg-secondary rounded-full">
                        <button
                          onClick={() => dec(it.id)}
                          className="w-7 h-7 grid place-items-center rounded-full hover:bg-accent/20 transition-colors"
                          aria-label="Decrease"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-7 text-center text-sm font-semibold">{it.qty}</span>
                        <button
                          onClick={() => inc(it.id)}
                          className="w-7 h-7 grid place-items-center rounded-full hover:bg-accent/20 transition-colors"
                          aria-label="Increase"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-sm font-semibold text-primary">
                        ${(it.price * it.qty).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-border px-6 py-5 space-y-3 bg-gradient-card">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Subtotal</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between font-display text-2xl font-bold text-primary">
            <span>Total</span>
            <span className="text-accent">${total.toFixed(2)}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button variant="outline" onClick={callCaptain}>
              <Phone className="w-4 h-4" /> Call Captain
            </Button>
            <Button variant="default" onClick={placeOrder}>
              <Check className="w-4 h-4" /> Place Order
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
