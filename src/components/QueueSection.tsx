import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, Users, Hash, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

type QueueEntry = { token: string; party: number; status: "Waiting" | "Called" | "Seated"; you?: boolean };

const initialQueue: QueueEntry[] = [
  { token: "A21", party: 2, status: "Seated" },
  { token: "A22", party: 4, status: "Called" },
  { token: "A23", party: 3, status: "Waiting" },
  { token: "A24", party: 2, status: "Waiting", you: true },
  { token: "A25", party: 5, status: "Waiting" },
  { token: "A26", party: 2, status: "Waiting" },
];

const statusStyles: Record<QueueEntry["status"], string> = {
  Waiting: "bg-warning/15 text-warning border-warning/30",
  Called: "bg-accent/20 text-accent-foreground border-accent/40 animate-pulse-dot",
  Seated: "bg-success/15 text-success border-success/30",
};

export const QueueSection = () => {
  const [people, setPeople] = useState(2);
  const [time, setTime] = useState("19:30");
  const [position] = useState(4);
  const totalAhead = 12;

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
                <Label htmlFor="people" className="mb-2 flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-accent" /> Number of People
                </Label>
                <Input
                  id="people"
                  type="number"
                  min={1}
                  max={20}
                  value={people}
                  onChange={(e) => setPeople(Number(e.target.value))}
                  className="bg-background h-12"
                />
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
              <Button
                variant="default"
                size="lg"
                className="w-full"
                onClick={() => toast.success("Successfully joined queue", { description: `Token A27 · Party of ${people}` })}
              >
                Join Queue
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
                <div className="col-span-3">Token</div>
                <div className="col-span-3">Party</div>
                <div className="col-span-6">Status</div>
              </div>
              {initialQueue.map((entry, i) => (
                <div
                  key={entry.token}
                  className={`grid grid-cols-12 gap-3 items-center px-4 py-4 rounded-xl border transition-all animate-fade-in ${
                    entry.you
                      ? "bg-accent-soft border-accent shadow-soft ring-1 ring-accent/40"
                      : "bg-background border-border/50 hover:border-border"
                  }`}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="col-span-3 font-display text-lg font-bold text-primary">
                    {entry.token}
                    {entry.you && <span className="ml-2 text-xs font-sans text-accent">YOU</span>}
                  </div>
                  <div className="col-span-3 flex items-center gap-1.5 text-sm">
                    <Users className="w-3.5 h-3.5 text-muted-foreground" /> {entry.party}
                  </div>
                  <div className="col-span-6">
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
