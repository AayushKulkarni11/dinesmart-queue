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
  const stats = useMemo(() => [
    { label: "Avg Wait Time", value: "24m", icon: Clock, accent: "text-accent" },
    { label: "Total Guests Today", value: "142", icon: Users, accent: "text-primary" },
    { label: "Peak Hour", value: "7:30 PM", icon: TrendingUp, accent: "text-success" },
    { label: "Busiest Day", value: "Saturday", icon: Calendar, accent: "text-warning" },
  ], []);

  return (
    <div className="py-24 bg-gradient-warm min-h-screen">
      <div className="container">
        <div className="mb-10 animate-slide-up">
          <p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase mb-3">Analytics</p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-primary">Performance Insights</h2>
          <p className="text-muted-foreground text-lg mt-3">Visualizing wait times, traffic patterns, and efficiency.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 hover-lift animate-scale-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-accent/15 grid place-items-center">
                  <s.icon className={`w-6 h-6 ${s.accent}`} />
                </div>
              </div>
              <div className="font-display text-4xl font-bold text-primary">{s.value}</div>
              <div className="text-sm text-muted-foreground mt-1 font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Wait Time Trend */}
          <div className="bg-card rounded-3xl p-8 shadow-elegant border border-border/50 animate-fade-in">
            <h3 className="font-display text-2xl font-bold text-primary mb-8 flex items-center gap-3">
              <Clock className="w-6 h-6 text-accent" /> Wait Time Trend (Evening)
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={waitTimeData}>
                  <defs>
                    <linearGradient id="colorWait" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF7F50" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#FF7F50" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748B" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748B" }} />
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                  />
                  <Area type="monotone" dataKey="wait" stroke="#FF7F50" strokeWidth={3} fillOpacity={1} fill="url(#colorWait)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weekly Traffic */}
          <div className="bg-card rounded-3xl p-8 shadow-elegant border border-border/50 animate-fade-in" style={{ animationDelay: "200ms" }}>
            <h3 className="font-display text-2xl font-bold text-primary mb-8 flex items-center gap-3">
              <Calendar className="w-6 h-6 text-primary" /> Weekly Traffic
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trafficData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748B" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748B" }} />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                    {trafficData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 5 ? "#FF7F50" : "#4169E1"} fillOpacity={0.8} />
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
