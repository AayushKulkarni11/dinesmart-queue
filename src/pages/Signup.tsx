import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, UtensilsCrossed, User2, Phone, ShieldCheck } from "lucide-react";
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

export default function Signup() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("user");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", setupKey: "" });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: keyof typeof form, v: string) => setForm((s) => ({ ...s, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = "Please enter your full name";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email address";
    if (!/^\+?[\d\s-]{7,15}$/.test(form.phone)) e.phone = "Enter a valid contact number";
    if (form.password.length < 8) e.password = "Password must be at least 8 characters";
    if (role === "admin" && !form.setupKey.trim()) e.setupKey = "Admin setup key is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const data = await apiFetch<AuthPayload>(role === "admin" ? "/api/auth/register-admin" : "/api/auth/register", {
        method: "POST",
        body: {
          name: form.name,
          email: form.email,
          contactNumber: form.phone,
          password: form.password,
          ...(role === "admin" ? { setupKey: form.setupKey } : {}),
        },
      });

      login(data);
      toast.success("Account created!", { description: `Welcome, ${data.user.name}` });
      navigate(data.user.role === "admin" ? "/admin" : "/", { replace: true });
    } catch (error) {
      toast.error("Could not create account", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative grid lg:grid-cols-2">
      <div className="hidden lg:block relative overflow-hidden">
        <img src={heroImage} alt="Restaurant" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 flex flex-col justify-between p-12 text-background">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid place-items-center w-10 h-10 rounded-full bg-gradient-gold shadow-gold">
              <UtensilsCrossed className="w-5 h-5 text-accent-foreground" />
            </span>
            <span className="font-display text-2xl font-bold">
              Maison<span className="text-gold">Verde</span>
            </span>
          </Link>
          <div className="max-w-md">
            <h1 className="font-display text-5xl font-bold leading-tight mb-4">
              Join the table. <span className="text-gold">Skip the wait.</span>
            </h1>
            <p className="text-background/80 text-lg">
              Create an account to reserve, order, and enjoy a curated experience tailored to your taste.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12 bg-gradient-warm min-h-screen">
        <div className="w-full max-w-md animate-fade-in">
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <span className="grid place-items-center w-9 h-9 rounded-full bg-gradient-gold shadow-gold">
              <UtensilsCrossed className="w-4 h-4 text-accent-foreground" />
            </span>
            <span className="font-display text-xl font-bold text-primary">
              Maison<span className="text-gold">Verde</span>
            </span>
          </Link>

          <div className="bg-card rounded-3xl shadow-elegant border border-border/50 p-8">
            <h2 className="font-display text-3xl font-bold text-primary mb-2">Create account</h2>
            <p className="text-muted-foreground mb-6 text-sm">A few details and you're in.</p>

            <div className="grid grid-cols-2 gap-2 p-1 bg-secondary rounded-full mb-6">
              {([
                { v: "user", label: "User", icon: User2 },
                { v: "admin", label: "Admin", icon: ShieldCheck },
              ] as const).map(({ v, label, icon: Icon }) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setRole(v)}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2 rounded-full text-sm font-medium transition-all",
                    role === v
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" /> {label}
                </button>
              ))}
            </div>

            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              <Field
                id="name"
                label="Full Name"
                icon={<User2 className="w-3.5 h-3.5 text-accent" />}
                value={form.name}
                onChange={(v) => set("name", v)}
                placeholder="Jane Doe"
                error={errors.name}
              />
              <Field
                id="email"
                label="Email"
                type="email"
                icon={<Mail className="w-3.5 h-3.5 text-accent" />}
                value={form.email}
                onChange={(v) => set("email", v)}
                placeholder="you@example.com"
                error={errors.email}
              />
              <Field
                id="phone"
                label="Contact Number"
                type="tel"
                icon={<Phone className="w-3.5 h-3.5 text-accent" />}
                value={form.phone}
                onChange={(v) => set("phone", v)}
                placeholder="+1 555 010 1234"
                error={errors.phone}
              />
              <Field
                id="password"
                label="Password"
                type="password"
                icon={<Lock className="w-3.5 h-3.5 text-accent" />}
                value={form.password}
                onChange={(v) => set("password", v)}
                placeholder="At least 8 characters"
                error={errors.password}
              />
              {role === "admin" && (
                <Field
                  id="setupKey"
                  label="Admin Setup Key"
                  type="password"
                  icon={<ShieldCheck className="w-3.5 h-3.5 text-accent" />}
                  value={form.setupKey}
                  onChange={(v) => set("setupKey", v)}
                  placeholder="Provided by the server owner"
                  error={errors.setupKey}
                />
              )}

              <Button type="submit" variant="default" size="lg" className="w-full mt-2" disabled={submitting}>
                {submitting ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <p className="text-sm text-muted-foreground text-center mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-accent font-semibold hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  id, label, icon, value, onChange, placeholder, type = "text", error,
}: {
  id: string; label: string; icon: React.ReactNode; value: string;
  onChange: (v: string) => void; placeholder?: string; type?: string; error?: string;
}) {
  return (
    <div>
      <Label htmlFor={id} className="mb-1.5 flex items-center gap-2 text-sm">
        {icon} {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn("h-11 bg-background", error && "border-destructive focus-visible:ring-destructive")}
        aria-invalid={!!error}
      />
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}
