import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Status = "available" | "occupied" | "reserved";
type Table = { id: number; seats: number; status: Status; shape: "round" | "square"; x: number; y: number; size: number };

const tables: Table[] = [
  { id: 1, seats: 2, status: "available", shape: "round", x: 8, y: 12, size: 14 },
  { id: 2, seats: 2, status: "occupied", shape: "round", x: 28, y: 12, size: 14 },
  { id: 3, seats: 4, status: "reserved", shape: "square", x: 50, y: 10, size: 18 },
  { id: 4, seats: 4, status: "available", shape: "square", x: 75, y: 12, size: 18 },
  { id: 5, seats: 6, status: "occupied", shape: "square", x: 12, y: 42, size: 22 },
  { id: 6, seats: 4, status: "available", shape: "round", x: 42, y: 44, size: 18 },
  { id: 7, seats: 2, status: "available", shape: "round", x: 65, y: 44, size: 14 },
  { id: 8, seats: 8, status: "reserved", shape: "square", x: 82, y: 42, size: 24 },
  { id: 9, seats: 2, status: "available", shape: "round", x: 10, y: 76, size: 14 },
  { id: 10, seats: 4, status: "occupied", shape: "square", x: 32, y: 74, size: 18 },
  { id: 11, seats: 4, status: "available", shape: "square", x: 56, y: 74, size: 18 },
  { id: 12, seats: 2, status: "reserved", shape: "round", x: 80, y: 76, size: 14 },
];

const statusColor: Record<Status, string> = {
  available: "bg-success/80 hover:bg-success border-success",
  occupied: "bg-destructive/80 border-destructive",
  reserved: "bg-warning/80 border-warning",
};

const statusLabel: Record<Status, string> = {
  available: "Available",
  occupied: "Occupied",
  reserved: "Reserved",
};

export const TableLayout = () => {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <section id="tables" className="py-24 bg-gradient-warm">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-12 animate-slide-up">
          <p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase mb-3">Floor Plan</p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-primary mb-4">
            Pick the perfect table
          </h2>
          <p className="text-muted-foreground text-lg">
            See the room from above. Hover any table for details, tap to reserve.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <TooltipProvider delayDuration={100}>
            <div className="lg:col-span-3 relative bg-card rounded-3xl shadow-elegant border border-border/50 overflow-hidden aspect-[16/10]">
              {/* Floor texture */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--accent)/0.08),transparent_50%),radial-gradient(circle_at_70%_80%,hsl(var(--primary)/0.08),transparent_50%)]" />
              <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage:
                    "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
              />
              {/* Entrance label */}
              <div className="absolute top-4 left-4 text-xs font-semibold tracking-widest text-muted-foreground">
                ENTRANCE ▸
              </div>
              <div className="absolute bottom-4 right-4 text-xs font-semibold tracking-widest text-muted-foreground">
                ◂ KITCHEN
              </div>

              {tables.map((t) => (
                <Tooltip key={t.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        setSelected(t.id);
                        if (t.status === "available")
                          toast.success(`Table ${t.id} reserved`, { description: `${t.seats} seats` });
                        else toast.error(`Table ${t.id} is ${statusLabel[t.status].toLowerCase()}`);
                      }}
                      className={cn(
                        "absolute border-2 grid place-items-center text-primary-foreground font-bold text-sm shadow-soft transition-all duration-300 hover:scale-110 hover:shadow-elegant",
                        statusColor[t.status],
                        t.shape === "round" ? "rounded-full" : "rounded-lg",
                        selected === t.id && "ring-4 ring-accent ring-offset-2 ring-offset-card"
                      )}
                      style={{
                        left: `${t.x}%`,
                        top: `${t.y}%`,
                        width: `${t.size}%`,
                        aspectRatio: "1",
                      }}
                      aria-label={`Table ${t.id}, ${t.seats} seats, ${statusLabel[t.status]}`}
                    >
                      {t.id}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="font-medium">
                    Table {t.id} – Seats {t.seats} – {statusLabel[t.status]}
                  </TooltipContent>
                </Tooltip>
              ))}
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
                <Stat label="Available" value={tables.filter((t) => t.status === "available").length} accent="text-success" />
                <Stat label="Reserved" value={tables.filter((t) => t.status === "reserved").length} accent="text-warning" />
                <Stat label="Occupied" value={tables.filter((t) => t.status === "occupied").length} accent="text-destructive" />
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
