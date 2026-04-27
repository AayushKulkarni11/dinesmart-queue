import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Users, Clock, TrendingUp, Phone, Check, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";

type QueueItem = {
  id: string;
  token: string;
  name: string;
  numberOfPeople: number;
  status: "Waiting" | "Called" | "Seated";
  position: number;
  tableAssigned: number | null;
};

type TableItem = {
  _id: string;
  tableNumber: number;
  capacity: number;
  status: "available" | "occupied" | "reserved";
};

type DashboardData = {
  queue: QueueItem[];
  tables: TableItem[];
  summary: {
    totalPeopleWaiting: number;
    totalTablesAvailable: number;
    totalTablesOccupied: number;
  };
};

const statusBadge: Record<TableItem["status"], string> = {
  available: "bg-success/15 text-success border-success/30",
  occupied: "bg-destructive/15 text-destructive border-destructive/30",
  reserved: "bg-warning/15 text-warning border-warning/30",
};

const queueButtonState = new Set(["Waiting", "Called"]);

export const AdminDashboard = () => {
  const { token, logout } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const stats = useMemo(() => {
    const queue = dashboard?.queue || [];
    const tables = dashboard?.tables || [];
    const seatedCount = queue.filter((entry) => entry.status === "Seated").length;

    return [
      { label: "People Waiting", value: String(dashboard?.summary.totalPeopleWaiting ?? 0), icon: Users, accent: "text-primary" },
      { label: "Active Queue", value: String(queue.filter((entry) => queueButtonState.has(entry.status)).length), icon: Clock, accent: "text-accent" },
      { label: "Tables Available", value: String(dashboard?.summary.totalTablesAvailable ?? 0), icon: TrendingUp, accent: "text-success" },
      { label: "Guests Seated", value: String(seatedCount), icon: Check, accent: "text-accent" },
      { label: "Total Tables", value: String(tables.length), icon: Users, accent: "text-primary" },
    ];
  }, [dashboard]);

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async (silent = false) => {
      if (!token) return;

      try {
        const data = await apiFetch<DashboardData>("/api/admin/dashboard", { token });
        if (!cancelled) {
          setDashboard(data);
        }
      } catch (error) {
        if (error instanceof Error && error.message === "Not authorized") {
          logout();
        }
        if (!silent) {
          toast.error("Could not load admin dashboard", {
            description: error instanceof Error ? error.message : "Please try again",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadDashboard();
    const interval = window.setInterval(() => {
      loadDashboard(true);
    }, 10000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [logout, token]);

  const mutate = async (
    key: string,
    request: () => Promise<unknown>,
    successMessage: string,
    successDescription?: string,
  ) => {
    setBusyKey(key);
    try {
      await request();
      toast.success(successMessage, successDescription ? { description: successDescription } : undefined);
      if (!token) return;
      const next = await apiFetch<DashboardData>("/api/admin/dashboard", { token });
      setDashboard(next);
    } catch (error) {
      toast.error("Action failed", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setBusyKey(null);
    }
  };

  const queue = dashboard?.queue || [];
  const tables = dashboard?.tables || [];

  return (
    <section id="admin" className="py-24 bg-gradient-warm">
      <div className="container">
        <div className="mb-10 animate-slide-up">
          <p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase mb-3">Admin</p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-primary">Operations Dashboard</h2>
          <p className="text-muted-foreground text-lg mt-3">Live queue, table status, and seating actions.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
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
              </div>
              <div className="font-display text-3xl font-bold text-primary">{s.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-2xl font-semibold text-primary">Queue Control</h3>
              <span className="text-sm text-muted-foreground">{queue.length} entries</span>
            </div>

            <div className="space-y-2">
              {queue.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between gap-3 p-4 rounded-xl bg-background border border-border/60">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="font-display text-xl font-bold text-primary w-16">{entry.token}</div>
                    <div className="text-sm min-w-0">
                      <div className="font-medium truncate">{entry.name}</div>
                      <div className="text-muted-foreground text-xs">
                        Party of {entry.numberOfPeople} · Position #{entry.position} · {entry.status}
                        {entry.tableAssigned ? ` · Table ${entry.tableAssigned}` : ""}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={busyKey === `call-${entry.id}` || entry.status !== "Waiting"}
                      onClick={() =>
                        mutate(
                          `call-${entry.id}`,
                          () => apiFetch(`/api/admin/queue/${entry.id}/call`, { method: "PUT", token }),
                          `${entry.token} called`,
                          entry.tableAssigned ? `Assigned table ${entry.tableAssigned}` : undefined,
                        )
                      }
                    >
                      <Phone className="w-4 h-4 text-accent" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={busyKey === `seat-${entry.id}` || entry.status === "Seated"}
                      onClick={() =>
                        mutate(
                          `seat-${entry.id}`,
                          () => apiFetch(`/api/admin/queue/${entry.id}/seat`, { method: "PUT", token }),
                          `${entry.token} seated`,
                        )
                      }
                    >
                      <Check className="w-4 h-4 text-success" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={busyKey === `remove-${entry.id}`}
                      onClick={() =>
                        mutate(
                          `remove-${entry.id}`,
                          () => apiFetch(`/api/admin/queue/${entry.id}`, { method: "DELETE", token }),
                          `${entry.token} removed`,
                        )
                      }
                    >
                      <X className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}

              {!loading && queue.length === 0 && (
                <div className="rounded-xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
                  No guests are currently in the queue.
                </div>
              )}
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50">
            <h3 className="font-display text-2xl font-semibold text-primary mb-5">Table Management</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tables.map((table) => (
                <div key={table._id} className="bg-background rounded-xl p-4 border border-border/60">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-display text-lg font-bold text-primary">T{table.tableNumber}</div>
                      <div className="text-xs text-muted-foreground">{table.capacity} seats</div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wider ${statusBadge[table.status]}`}>
                      {table.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(["available", "reserved", "occupied"] as const).map((status) => (
                      <Button
                        key={status}
                        variant={table.status === status ? "default" : "outline"}
                        size="sm"
                        disabled={busyKey === `table-${table._id}-${status}`}
                        onClick={() =>
                          mutate(
                            `table-${table._id}-${status}`,
                            () =>
                              apiFetch(`/api/admin/tables/${table._id}/status`, {
                                method: "PUT",
                                token,
                                body: { status },
                              }),
                            `Table ${table.tableNumber} updated`,
                            `Marked ${status}`,
                          )
                        }
                      >
                        {status}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}

              {!loading && tables.length === 0 && (
                <div className="sm:col-span-2 rounded-xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
                  No table data is available right now.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
