import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, Users, Hash, TrendingUp, User2, Minus, Plus } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { apiFetch, API_BASE_URL } from "@/lib/api";
import { io, Socket } from "socket.io-client";

type QueueEntry = {
  token: string;
  name: string;
  party: number;
  status: "Waiting" | "Called" | "Seated";
  estimatedWaitMinutes?: number | null;
  you?: boolean;
};

type ApiQueueEntry = {
  _id: string;
  token: string;
  name: string;
  partySize: number;
  preferredTime?: string;
  status: "Waiting" | "Called" | "Seated";
  estimatedWaitMinutes?: number | null;
  createdAt: string;
};

const STORAGE_KEY = "dinesmart.queueToken";
const DEFAULT_WAIT_PER_PARTY_MINUTES = 10;

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
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [joining, setJoining] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentToken, setCurrentToken] = useState<string | null>(() => window.localStorage.getItem(STORAGE_KEY));

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user?.name]);

  useEffect(() => {
    let cancelled = false;
    const load = async (silent = false) => {
      try {
        const data = await apiFetch<{ entries: ApiQueueEntry[] }>("/api/queue");
        if (cancelled) return;
        const mapped: QueueEntry[] = data.entries.map((e) => ({
          token: e.token,
          name: e.token === currentToken ? "You" : e.name,
          party: e.partySize,
          status: e.status,
          estimatedWaitMinutes: e.estimatedWaitMinutes ?? null,
          you: e.token === currentToken,
        }));
        setQueue(mapped);
      } catch (error) {
        if (!silent) {
          toast.error("Could not load queue", {
            description: error instanceof Error ? error.message : "Please try again",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    const socket = io(API_BASE_URL);
    socket.on("queueUpdated", () => {
      load(true);
    });

    socket.on("customerCalled", (data: { name: string; tableNumber: number | null }) => {
      // Use a functional state check to avoid stale closures
      setQueue((currentQueue) => {
        const isMe =
          data.name === "You" ||
          (currentToken && currentQueue.find((q) => q.you)?.name === data.name);
        
        if (isMe) {
          toast.success("Table Ready!", {
            description: data.tableNumber ? `Please proceed to table ${data.tableNumber}` : "Your table is ready",
            duration: 10000,
          });
        }
        return currentQueue;
      });
    });

    return () => {
      cancelled = true;
      socket.disconnect();
    };
  }, [currentToken]);

  const activeQueue = queue.filter((entry) => entry.status !== "Seated");
  const position = activeQueue.findIndex((entry) => entry.you) + 1;
  const totalActive = Math.max(activeQueue.length, 1);
  const progressValue = position > 0 ? ((totalActive - position) / totalActive) * 100 : 0;
  const currentEntry = activeQueue.find((entry) => entry.you) || null;

  const explicitWaitingEstimates = activeQueue
    .filter((entry) => entry.status === "Waiting" && typeof entry.estimatedWaitMinutes === "number")
    .map((entry) => entry.estimatedWaitMinutes as number);

  const fallbackWaitPerParty = explicitWaitingEstimates.length
    ? Math.max(
        DEFAULT_WAIT_PER_PARTY_MINUTES,
        Math.round(explicitWaitingEstimates.reduce((sum, value) => sum + value, 0) / explicitWaitingEstimates.length),
      )
    : DEFAULT_WAIT_PER_PARTY_MINUTES;

  const derivedCurrentWait = currentEntry
    ? currentEntry.status === "Called"
      ? 0
      : activeQueue
          .slice(0, Math.max(position - 1, 0))
          .filter((entry) => entry.status === "Waiting" || entry.status === "Called").length * fallbackWaitPerParty
    : null;

  const estimatedWait =
    currentEntry?.status === "Called"
      ? 0
      : currentEntry?.estimatedWaitMinutes ?? derivedCurrentWait;

  const averageWait = activeQueue.filter((entry) => entry.status === "Waiting").length
    ? Math.round(
        activeQueue
          .filter((entry) => entry.status === "Waiting")
          .reduce((sum, entry, index) => {
            const effectiveWait =
              typeof entry.estimatedWaitMinutes === "number"
                ? entry.estimatedWaitMinutes
                : index * fallbackWaitPerParty;
            return sum + effectiveWait;
          }, 0) / activeQueue.filter((entry) => entry.status === "Waiting").length,
      )
    : null;

  const join = async () => {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    setJoining(true);
    try {
      const data = await apiFetch<{ entry: ApiQueueEntry }>("/api/queue/join", {
        method: "POST",
        body: { name, partySize: people, preferredTime: time },
      });

      window.localStorage.setItem(STORAGE_KEY, data.entry.token);
      setCurrentToken(data.entry.token);
      toast.success("Successfully joined queue", {
        description: `Token ${data.entry.token} · ${data.entry.name} · Party of ${data.entry.partySize}`,
      });

      setQueue((prev) => [
        ...prev.map((entry) => ({ ...entry, you: false })),
        {
          token: data.entry.token,
          name: "You",
          party: data.entry.partySize,
          status: data.entry.status,
          estimatedWaitMinutes: data.entry.estimatedWaitMinutes ?? null,
          you: true,
        },
      ]);
    } catch (error) {
      toast.error("Could not join queue", {
        description: error instanceof Error ? error.message : "Network error",
      });
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
                  <div className="font-display text-3xl font-bold text-primary">{position > 0 ? `#${position}` : "--"}</div>
                </div>
                <div className="bg-background rounded-xl p-4 border border-border/60">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Clock className="w-3 h-3" /> Est. Wait
                  </div>
                  <div className="font-display text-3xl font-bold text-accent">
                    {estimatedWait !== null ? `${estimatedWait}m` : "--"}
                  </div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                  <span>Queue progress</span>
                  <span>{position > 0 ? `${totalActive - position}/${totalActive}` : `0/${totalActive}`}</span>
                </div>
                <Progress value={progressValue} className="h-2.5" />
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
              {queue.map((entry, i) => (
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
              {!loading && queue.length === 0 && (
                <div className="px-4 py-8 text-sm text-muted-foreground text-center rounded-xl border border-dashed border-border/60">
                  The queue is currently empty.
                </div>
              )}
            </div>

            <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
              <TrendingUp className="w-3.5 h-3.5" />
              Average wait time today: {averageWait !== null ? `${averageWait} minutes` : "set by admin"}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
