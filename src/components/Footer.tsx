import { UtensilsCrossed, MapPin, Phone, Clock, Instagram, Facebook, Twitter } from "lucide-react";

export const Footer = () => (
  <footer className="bg-primary text-primary-foreground pt-20 pb-8">
    <div className="container">
      <div className="grid md:grid-cols-4 gap-10 mb-12">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <span className="grid place-items-center w-9 h-9 rounded-full bg-gradient-gold shadow-gold">
              <UtensilsCrossed className="w-4 h-4 text-accent-foreground" />
            </span>
            <span className="font-display text-xl font-bold">
              Modern <span className="text-gold">Darbar</span>
            </span>
          </div>
          <p className="text-sm text-primary-foreground/70 leading-relaxed">
            Modern dining, intelligently curated. Skip the wait, savor the moment.
          </p>
          <div className="flex gap-3 mt-5">
            {[Instagram, Facebook, Twitter].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="w-9 h-9 grid place-items-center rounded-full bg-primary-foreground/10 hover:bg-accent hover:text-accent-foreground transition-colors"
                aria-label="Social"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-display text-lg font-semibold mb-4 text-accent">Visit Us</h4>
          <ul className="space-y-3 text-sm text-primary-foreground/80">
            <li className="flex gap-3"><MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-accent" /> JM Road, Pune</li>
            <li className="flex gap-3"><Phone className="w-4 h-4 mt-0.5 flex-shrink-0 text-accent" /> +91 98765 43210</li>
            <li className="flex gap-3"><Clock className="w-4 h-4 mt-0.5 flex-shrink-0 text-accent" /> Daily · 10am to 11:30 pm</li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg font-semibold mb-4 text-accent">Explore</h4>
          <ul className="space-y-2 text-sm">
            {["Menu", "Reservations", "Live Queue", "Private Events", "Gift Cards"].map((l) => (
              <li key={l}>
                <a href="#" className="text-primary-foreground/70 hover:text-accent transition-colors">{l}</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg font-semibold mb-4 text-accent">Newsletter</h4>
          <p className="text-sm text-primary-foreground/70 mb-3">Seasonal menus and chef stories.</p>
          <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Your email"
              className="flex-1 bg-primary-foreground/10 border border-primary-foreground/20 rounded-lg px-3 py-2 text-sm placeholder:text-primary-foreground/50 focus:outline-none focus:border-accent"
            />
            <button className="bg-gradient-gold text-accent-foreground rounded-lg px-4 py-2 text-sm font-semibold shadow-gold hover:opacity-90 transition-opacity">
              Join
            </button>
          </form>
        </div>
      </div>

      <div className="pt-6 border-t border-primary-foreground/15 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-primary-foreground/60">
        <p>© {new Date().getFullYear()} Modern Darbar. Crafted with care.</p>
        <div className="flex gap-5">
          <a href="#" className="hover:text-accent">Privacy</a>
          <a href="#" className="hover:text-accent">Terms</a>
          <a href="#" className="hover:text-accent">Cookies</a>
        </div>
      </div>
    </div>
  </footer>
);
