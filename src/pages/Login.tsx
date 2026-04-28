import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, UtensilsCrossed, ShieldCheck, User2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth, Role } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";
import heroImage from "@/assets/hero-restaurant.jpg";

type AuthPayload = {
  token: string;
  user: {
    _id: string;
    name: string;
    email: string;
    contactNumber: string;
    role: Role;
  };
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: string } };
  const [role, setRole] = useState<Role>("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Enter a valid email address";
    if (password.length < 6) e.password = "Password must be at least 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const data = await apiFetch<AuthPayload>(role === "admin" ? "/api/auth/admin-login" : "/api/auth/login", {
        method: "POST",
        body: { email, password },
      });
      login(data);
      toast.success("Welcome back!", { description: `Signed in as ${data.user.role}` });
      const dest = data.user.role === "admin" ? "/admin" : location.state?.from || "/";
      navigate(dest, { replace: true });
    } catch (error) {
      toast.error("Could not sign in", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-background min-h-screen relative grid lg:grid-cols-2">
      {/* Visual side */}
      <div className="hidden lg:block relative overflow-hidden">
        <img src={heroImage} alt="Restaurant" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-12 text-background">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid place-items-center w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-gradient-gold shadow-gold">
              <UtensilsCrossed className="w-4 sm:w-5 h-4 sm:h-5 text-accent-foreground" />
            </span>
            <span className="font-display text-lg sm:text-2xl font-bold">
              Maison<span className="text-gold">Verde</span>
            </span>
          </Link>
          <div className="max-w-md">
            <h1 className="font-display text-3xl sm:text-5xl font-bold leading-tight mb-3 sm:mb-4">
              Welcome to a smarter dining experience.
            </h1>
            <p className="text-background/80 text-base sm:text-lg">
              Sign in to track queues, reserve tables and discover dishes curated to your taste.
            </p>
          </div>
        </div>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center p-4 sm:p-6 md:p-12 bg-gradient-warm">
        <div className="w-full max-w-md animate-fade-in px-4">
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-6 sm:mb-8 justify-center">
            <span className="grid place-items-center w-8 sm:w-9 h-8 sm:h-9 rounded-full bg-gradient-gold shadow-gold">
              <UtensilsCrossed className="w-4 h-4 text-accent-foreground" />
            </span>
            <span className="font-display text-lg sm:text-xl font-bold text-primary">
              Maison<span className="text-gold">Verde</span>
            </span>
          </Link>

          <div className="bg-card rounded-2xl sm:rounded-3xl shadow-elegant border border-border/50 p-6 sm:p-8">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-primary mb-2">Sign in</h2>
            <p className="text-muted-foreground mb-4 sm:mb-6 text-xs sm:text-sm">Welcome back. Choose your role to continue.</p>

            {/* Role toggle */}
            <div className="grid grid-cols-2 gap-1 sm:gap-2 p-1 bg-secondary rounded-full mb-4 sm:mb-6">
              {([
                { v: "user", label: "User", icon: User2 },
                { v: "admin", label: "Admin", icon: ShieldCheck },
              ] as const).map(({ v, label, icon: Icon }) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setRole(v)}
                  className={cn(
                    "flex items-center justify-center gap-1 sm:gap-2 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all",
                    role === v
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {label}
                </button>
              ))}
            </div>

            <form onSubmit={onSubmit} className="space-y-3 sm:space-y-4" noValidate>
              <div>
                <Label htmlFor="email" className="mb-1 flex items-center gap-2 text-xs sm:text-sm">
                  <Mail className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-accent" /> Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={cn("h-10 sm:h-11 bg-background text-sm", errors.email && "border-destructive focus-visible:ring-destructive")}
                  aria-invalid={!!errors.email}
                />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
              </div>
              <div>
                <Label htmlFor="password" className="mb-1 flex items-center gap-2 text-xs sm:text-sm">
                  <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-accent" /> Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={cn("h-10 sm:h-11 bg-background text-sm", errors.password && "border-destructive focus-visible:ring-destructive")}
                  aria-invalid={!!errors.password}
                />
                {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
              </div>

              <Button type="submit" variant="default" size="lg" className="w-full mt-2 text-sm" disabled={submitting}>
                {submitting ? "Signing In..." : `Sign In as ${role === "admin" ? "Admin" : "User"}`}
              </Button>
            </form>

            <p className="text-xs sm:text-sm text-muted-foreground text-center mt-4 sm:mt-6">
              Don't have an account?{" "}
              <Link to="/signup" className="text-accent font-semibold hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
