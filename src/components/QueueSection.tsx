import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, Users, Hash, TrendingUp, User2, Minus, Plus } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

type QueueEntry = {
  token: string;
  name: string;
  party: number;
  status: "Waiting" | "Called" | "Seated";
  you?: boolean;
};

type ApiQueueEntry = {
  _id: string;
  token: string;
  name: string;
  partySize: number;
  preferredTime?: string;
  status: "Waiting" | "Called" | "Seated";
  createdAt: string;
};

const initialQueue: QueueEntry[] = [
  { token: "A21", name: "Olivia M.", party: 2, status: "Seated" },
  { token: "A22", name: "Lucas R.", party: 4, status: "Called" },
  { token: "A23", name: "Sophia K.", party: 3, status: "Waiting" },
  { token: "A24", name: "You", party: 2, status: "Waiting", you: true },
  { token: "A25", name: "Ethan T.", party: 5, status: "Waiting" },
  { token: "A26", name: "Mia L.", party: 2, status: "Waiting" },
];

const statusStyles: Record<QueueEntry["status"], string> = {
  Waiting: "bg-warning/15 text-warning border-warning/30",
  Called: "bg-accent/20 text-accent-foreground border-accent/40 animate-pulse-dot",
  Seated: "bg-success/15 text-success border-success/30",
};

export const QueueSection = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [people, setPeople] = useState(2);
  const [time, setTime] = useState("19:30");
  const [queue, setQueue] = useState<QueueEntry[]>(initialQueue);
  const [joining, setJoining] = useState(false);

  const apiBaseUrl = useMemo(() => {
    const v = (import.meta as any)?.env?.VITE_API_BASE_URL;
    return typeof v === "string" && v.length ? v : "http://localhost:5056";
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/api/queue`);
        if (!res.ok) return;
        const data = (await res.json()) as { entries?: ApiQueueEntry[] };
        if (!data?.entries || cancelled) return;
        const mapped: QueueEntry[] = data.entries.map((e) => ({
          token: e.token,
          name: e.name,
          party: e.partySize,
          status: e.status,
        }));
        setQueue(mapped);
      } catch {
        // ignore initial load errors; UI still works with local mock
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [apiBaseUrl]);

  const position = Math.max(1, queue.findIndex((q) => q.you) + 1 || 1);
  const totalAhead = Math.max(queue.length, 1);

  const join = async () => {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    setJoining(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/queue/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, partySize: people, preferredTime: time }),
      });
      const data = (await res.json()) as { entry?: ApiQueueEntry; message?: string };
      if (!res.ok || !data?.entry) {
        toast.error("Could not join queue", { description: data?.message || "Please try again" });
        return;
      }

      toast.success("Successfully joined queue", {
        description: `Token ${data.entry.token} · ${data.entry.name} · Party of ${data.entry.partySize}`,
      });

      setQueue((prev) => [
        ...prev.map((p) => ({ ...p, you: false, name: p.you ? p.name : p.name })),
        { token: data.entry.token, name: "You", party: data.entry.partySize, status: data.entry.status, you: true },
      ]);
    } catch {
      toast.error("Could not join queue", { description: "Network error" });
    } finally {
      setJoining(false);
    }
  };

  return (
    <section id="queue" className="py-24 bg-background">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-12 animate-slide-up">
          <p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase mb-3">Live Queue</p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-primary mb-4">
            Reserve your spot in seconds
          </h2>
          <p className="text-muted-foreground text-lg">
            No more standing in line. Track your position and arrive right on time.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Booking card */}
          <div className="lg:col-span-2 bg-gradient-card rounded-2xl p-7 shadow-elegant border border-border/50">
            <h3 className="font-display text-2xl font-semibold text-primary mb-6">Join the Queue</h3>
            <div className="space-y-5">
              <div>
                <Label htmlFor="qname" className="mb-2 flex items-center gap-2 text-sm">
                  <User2 className="w-4 h-4 text-accent" /> Your Name
                </Label>
                <Input
                  id="qname"
                  type="text"
                  placeholder="e.g. Alex Carter"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-background h-12"
                />
              </div>
              <div>
                <Label className="mb-2 flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-accent" /> Number of People
                </Label>
                <div className="inline-flex items-center bg-background rounded-xl border border-border/60 p-1 w-full justify-between h-12">
                  <button
                    type="button"
                    onClick={() => setPeople((p) => Math.max(1, p - 1))}
                    className="w-10 h-10 grid place-items-center rounded-lg hover:bg-accent/15 transition-colors"
                    aria-label="Decrease"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-display text-2xl font-bold text-primary w-10 text-center">{people}</span>
                  <button
                    type="button"
                    onClick={() => setPeople((p) => Math.min(20, p + 1))}
                    className="w-10 h-10 grid place-items-center rounded-lg hover:bg-accent/15 transition-colors"
                    aria-label="Increase"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <Label htmlFor="time" className="mb-2 flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-accent" /> Preferred Time
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="bg-background h-12"
                />
              </div>
              <Button variant="default" size="lg" className="w-full" onClick={join}>
                {joining ? "Joining..." : "Join Queue"}
              </Button>
            </div>

            {/* Status */}
            <div className="mt-7 pt-6 border-t border-border space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-background rounded-xl p-4 border border-border/60">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Hash className="w-3 h-3" /> Position
                  </div>
                  <div className="font-display text-3xl font-bold text-primary">#{position}</div>
                </div>
                <div className="bg-background rounded-xl p-4 border border-border/60">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Clock className="w-3 h-3" /> Est. Wait
                  </div>
                  <div className="font-display text-3xl font-bold text-accent">18m</div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                  <span>Queue progress</span>
                  <span>{totalAhead - position}/{totalAhead}</span>
                </div>
                <Progress value={((totalAhead - position) / totalAhead) * 100} className="h-2.5" />
              </div>
            </div>
          </div>

          {/* Live list */}
          <div className="lg:col-span-3 bg-card rounded-2xl p-7 shadow-soft border border-border/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-2xl font-semibold text-primary">Live Queue Status</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="relative flex w-2 h-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
                </span>
                Live
              </div>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-3 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <div className="col-span-2">Token</div>
                <div className="col-span-4">Name</div>
                <div className="col-span-2">Party</div>
                <div className="col-span-4">Status</div>
              </div>
              {initialQueue.map((entry, i) => (
                <div
                  key={entry.token}
                  className={`grid grid-cols-12 gap-3 items-center px-4 py-4 rounded-xl border transition-all animate-fade-in ${
                    entry.you
                      ? "bg-accent-soft border-accent shadow-soft ring-2 ring-accent/40 scale-[1.01]"
                      : "bg-background border-border/50 hover:border-border"
                  }`}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="col-span-2 font-display text-lg font-bold text-primary">{entry.token}</div>
                  <div className="col-span-4 flex items-center gap-2 text-sm font-medium">
                    {entry.name}
                    {entry.you && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-accent text-accent-foreground">
                        You
                      </span>
                    )}
                  </div>
                  <div className="col-span-2 flex items-center gap-1.5 text-sm">
                    <Users className="w-3.5 h-3.5 text-muted-foreground" /> {entry.party}
                  </div>
                  <div className="col-span-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusStyles[entry.status]}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {entry.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
              <TrendingUp className="w-3.5 h-3.5" />
              Average wait time today: 22 minutes
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
