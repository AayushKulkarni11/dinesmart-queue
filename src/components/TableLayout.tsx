import { useEffect, useMemo, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";

type Status = "available" | "occupied" | "reserved";
type Table = { id: string; tableNumber: number; seats: number; status: Status };

const statusColor: Record<Status, string> = {
  available: "bg-success/85 hover:bg-success border-success text-white",
  occupied: "bg-destructive/85 border-destructive text-white",
  reserved: "bg-warning/85 border-warning text-white",
};

const statusLabel: Record<Status, string> = {
  available: "Available",
  occupied: "Occupied",
  reserved: "Reserved",
};

export const TableLayout = () => {
  const [selected, setSelected] = useState<number | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);

  const counts = useMemo(
    () => ({
      available: tables.filter((t) => t.status === "available").length,
      reserved: tables.filter((t) => t.status === "reserved").length,
      occupied: tables.filter((t) => t.status === "occupied").length,
    }),
    [tables]
  );

  useEffect(() => {
    let cancelled = false;

    const load = async (silent = false) => {
      try {
        const data = await apiFetch<{
          tables: Array<{ _id: string; tableNumber: number; capacity: number; status: Status }>;
        }>("/api/tables");
        if (cancelled) return;
        setTables(
          data.tables.map((table) => ({
            id: table._id,
            tableNumber: table.tableNumber,
            seats: table.capacity,
            status: table.status,
          })),
        );
      } catch (error) {
        if (!silent) {
          toast.error("Could not load tables", {
            description: error instanceof Error ? error.message : "Please try again",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    const interval = window.setInterval(() => {
      load(true);
    }, 15000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const handleClick = async (t: Table) => {
    setSelected(t.tableNumber);
    if (t.status === "available") {
      try {
        await apiFetch<{ table: { _id: string; status: Status } }>(`/api/tables/${t.id}/status`, {
          method: "PUT",
          body: { status: "reserved" },
        });
        setTables((curr) =>
          curr.map((x) => (x.id === t.id ? { ...x, status: "reserved" } : x)),
        );
        toast.success(`Table ${t.tableNumber} reserved`, { description: `${t.seats} seats` });
      } catch (error) {
        toast.error("Could not reserve table", {
          description: error instanceof Error ? error.message : "Please try again",
        });
      }
    } else {
      toast.error(`Table ${t.tableNumber} is ${statusLabel[t.status].toLowerCase()}`);
    }
  };

  return (
    <section id="tables" className="py-24 bg-gradient-warm">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-12 animate-slide-up">
          <p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase mb-3">Floor Plan</p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-primary mb-4">
            Pick the perfect table
          </h2>
          <p className="text-muted-foreground text-lg">
            30 tables across the floor — hover any table for details, tap to reserve.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <TooltipProvider delayDuration={100}>
            <div className="lg:col-span-3 relative bg-card rounded-3xl shadow-elegant border border-border/50 p-6 sm:p-8 overflow-hidden">
              {/* Floor texture */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--accent)/0.08),transparent_50%),radial-gradient(circle_at_70%_80%,hsl(var(--primary)/0.08),transparent_50%)] pointer-events-none" />
              <div
                className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{
                  backgroundImage:
                    "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
              />

              <div className="relative flex items-center justify-between mb-5 text-xs font-semibold tracking-widest text-muted-foreground">
                <span>ENTRANCE ▸</span>
                <span>◂ KITCHEN</span>
              </div>

              <div className="relative grid grid-cols-5 sm:grid-cols-6 gap-3 sm:gap-4">
                {tables.map((t) => (
                  <Tooltip key={t.id}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => handleClick(t)}
                        className={cn(
                          "relative aspect-square border-2 grid place-items-center rounded-xl shadow-soft transition-all duration-300 hover:scale-110 hover:shadow-elegant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                          statusColor[t.status],
                          selected === t.tableNumber && "ring-4 ring-accent ring-offset-2 ring-offset-card"
                        )}
                        aria-label={`Table ${t.tableNumber}, ${t.seats} seats, ${statusLabel[t.status]}`}
                      >
                        <div className="text-center leading-tight">
                          <div className="font-display text-base sm:text-lg font-bold">T{t.tableNumber}</div>
                          <div className="text-[10px] opacity-90">{t.seats} seats</div>
                        </div>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="font-medium">
                      Table {t.tableNumber} - Seats {t.seats} - {statusLabel[t.status]}
                    </TooltipContent>
                  </Tooltip>
                ))}
                {!loading && tables.length === 0 && (
                  <div className="col-span-full rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
                    No table data available right now.
                  </div>
                )}
              </div>
            </div>
          </TooltipProvider>

          {/* Legend & summary */}
          <div className="space-y-4">
            <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50">
              <h3 className="font-display text-lg font-semibold text-primary mb-4">Legend</h3>
              <div className="space-y-3">
                {(["available", "reserved", "occupied"] as Status[]).map((s) => (
                  <div key={s} className="flex items-center gap-3 text-sm">
                    <span className={cn("w-4 h-4 rounded border-2", statusColor[s])} />
                    <span className="capitalize">{statusLabel[s]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-card rounded-2xl p-6 shadow-soft border border-border/50">
              <h3 className="font-display text-lg font-semibold text-primary mb-4">Tonight</h3>
              <div className="space-y-3">
                <Stat label="Available" value={counts.available} accent="text-success" />
                <Stat label="Reserved" value={counts.reserved} accent="text-warning" />
                <Stat label="Occupied" value={counts.occupied} accent="text-destructive" />
                <div className="pt-3 border-t border-border flex items-baseline justify-between">
                  <span className="text-sm text-muted-foreground">Total tables</span>
                  <span className="font-display text-2xl font-bold text-primary">{tables.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Stat = ({ label, value, accent }: { label: string; value: number; accent: string }) => (
  <div className="flex items-baseline justify-between">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className={cn("font-display text-2xl font-bold", accent)}>{value}</span>
  </div>
);
