import { Button } from "@/components/ui/button";
import { Users, Clock, TrendingUp, DollarSign, Phone, Check, X } from "lucide-react";
import { toast } from "sonner";

const stats = [
  { label: "Customers Today", value: "247", icon: Users, change: "+12%", accent: "text-primary" },
  { label: "Active Queue", value: "12", icon: Clock, change: "Live", accent: "text-accent" },
  { label: "Tables Turned", value: "38", icon: TrendingUp, change: "+8%", accent: "text-success" },
  { label: "Revenue", value: "$8.4k", icon: DollarSign, change: "+15%", accent: "text-accent" },
];

const queueQueue = [
  { token: "A24", party: 2, waited: "8m" },
  { token: "A25", party: 5, waited: "5m" },
  { token: "A26", party: 2, waited: "3m" },
];

const tableControls = [
  { id: 1, status: "available" },
  { id: 2, status: "occupied" },
  { id: 3, status: "reserved" },
  { id: 4, status: "available" },
  { id: 5, status: "occupied" },
  { id: 6, status: "available" },
];

const statusBadge: Record<string, string> = {
  available: "bg-success/15 text-success border-success/30",
  occupied: "bg-destructive/15 text-destructive border-destructive/30",
  reserved: "bg-warning/15 text-warning border-warning/30",
};

export const AdminDashboard = () => (
  <section id="admin" className="py-24 bg-gradient-warm">
    <div className="container">
      <div className="mb-10 animate-slide-up">
        <p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase mb-3">Admin</p>
        <h2 className="font-display text-4xl sm:text-5xl font-bold text-primary">Operations Dashboard</h2>
        <p className="text-muted-foreground text-lg mt-3">Real-time floor & queue control.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="bg-card rounded-2xl p-5 shadow-soft border border-border/50 hover-lift animate-scale-in"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-accent/15 grid place-items-center">
                <s.icon className={`w-5 h-5 ${s.accent}`} />
              </div>
              <span className="text-xs font-semibold text-success">{s.change}</span>
            </div>
            <div className="font-display text-3xl font-bold text-primary">{s.value}</div>
            <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Queue control */}
        <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-2xl font-semibold text-primary">Queue Control</h3>
            <Button variant="gold" size="sm" onClick={() => toast.success("Calling A24 — Party of 2")}>
              <Phone className="w-4 h-4" /> Call Next
            </Button>
          </div>
          <div className="space-y-2">
            {queueQueue.map((q) => (
              <div key={q.token} className="flex items-center justify-between p-4 rounded-xl bg-background border border-border/60">
                <div className="flex items-center gap-4">
                  <div className="font-display text-xl font-bold text-primary w-12">{q.token}</div>
                  <div className="text-sm">
                    <div className="font-medium">Party of {q.party}</div>
                    <div className="text-muted-foreground text-xs">Waited {q.waited}</div>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <Button variant="ghost" size="icon" onClick={() => toast.success(`${q.token} seated`)}>
                    <Check className="w-4 h-4 text-success" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => toast.error(`${q.token} removed`)}>
                    <X className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Table control */}
        <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50">
          <h3 className="font-display text-2xl font-semibold text-primary mb-5">Table Management</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {tableControls.map((t) => (
              <div key={t.id} className="bg-background rounded-xl p-4 border border-border/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display text-lg font-bold text-primary">T{t.id}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wider ${statusBadge[t.status]}`}>
                    {t.status}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() =>
                    toast.success(`Table ${t.id} marked ${t.status === "available" ? "occupied" : "available"}`)
                  }
                >
                  Toggle
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);
