import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { TrendingUp, Users, Clock, Calendar } from "lucide-react";

const waitTimeData = [
  { time: "18:00", wait: 10 },
  { time: "18:30", wait: 15 },
  { time: "19:00", wait: 25 },
  { time: "19:30", wait: 45 },
  { time: "20:00", wait: 50 },
  { time: "20:30", wait: 35 },
  { time: "21:00", wait: 20 },
  { time: "21:30", wait: 10 },
];

const trafficData = [
  { day: "Mon", count: 45 },
  { day: "Tue", count: 52 },
  { day: "Wed", count: 48 },
  { day: "Thu", count: 61 },
  { day: "Fri", count: 85 },
  { day: "Sat", count: 110 },
  { day: "Sun", count: 95 },
];

const COLORS = ["#FF7F50", "#FF4500", "#FFD700", "#32CD32", "#4169E1"];

export const AnalyticsDashboard = () => {
  const stats = [
    { label: "Avg Wait Time", value: "24m", icon: Clock, accent: "text-accent" },
    { label: "Total Guests Today", value: "142", icon: Users, accent: "text-primary" },
    { label: "Peak Hour", value: "7:30 PM", icon: TrendingUp, accent: "text-success" },
    { label: "Busiest Day", value: "Saturday", icon: Calendar, accent: "text-warning" },
  ];

  return (
    <div className="py-8 md:py-12">
      <div className="container">
        <div className="mb-6 md:mb-8 animate-slide-up">
          <p className="text-xs sm:text-sm font-semibold tracking-[0.2em] text-accent uppercase mb-2 sm:mb-3">Analytics</p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-primary">Performance Insights</h2>
          <p className="text-muted-foreground text-sm sm:text-lg mt-2 sm:mt-3">Visualizing wait times, traffic patterns, and efficiency.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8 md:mb-10">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="bg-card rounded-2xl p-4 sm:p-6 shadow-soft border border-border/50 hover-lift animate-scale-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-accent/15 grid place-items-center">
                  <s.icon className={`w-4 h-4 sm:w-6 sm:h-6 ${s.accent}`} />
                </div>
              </div>
              <div className="font-display text-2xl sm:text-4xl font-bold text-primary">{s.value}</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
          {/* Wait Time Trend */}
          <div className="bg-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-elegant border border-border/50 animate-fade-in">
            <h3 className="font-display text-lg sm:text-2xl font-bold text-primary mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
              <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-accent" /> Wait Time Trend (Evening)
            </h3>
            <div className="h-60 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={waitTimeData}>
                  <defs>
                    <linearGradient id="colorWait" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '0.5rem', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }} />
                  <Area type="monotone" dataKey="wait" stroke="var(--accent)" strokeWidth={2} fillOpacity={1} fill="url(#colorWait)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Guest Traffic Pattern */}
          <div className="bg-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-elegant border border-border/50 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <h3 className="font-display text-lg sm:text-2xl font-bold text-primary mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
              <Calendar className="w-4 h-4 sm:w-6 sm:h-6 text-accent" /> Guest Traffic Pattern
            </h3>
            <div className="h-60 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trafficData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '0.5rem', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }} />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {trafficData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill="var(--accent)" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
