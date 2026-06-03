import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/kpi-card";
import { Clock, Users, DoorOpen, TrendingUp, Activity, Stethoscope } from "lucide-react";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics & Outcomes — ClinicFlow Intelligence" },
      { name: "description", content: "Compare current clinic performance to AI-optimized workflow across throughput, wait time, and utilization." },
    ],
  }),
  component: AnalyticsPage,
});

const COMPARE = [
  { metric: "Mon", current: 38, optimized: 22 },
  { metric: "Tue", current: 42, optimized: 24 },
  { metric: "Wed", current: 36, optimized: 21 },
  { metric: "Thu", current: 44, optimized: 25 },
  { metric: "Fri", current: 49, optimized: 28 },
  { metric: "Sat", current: 33, optimized: 19 },
];

const THROUGHPUT = [
  { hour: "9", current: 11, optimized: 14 },
  { hour: "10", current: 13, optimized: 17 },
  { hour: "11", current: 14, optimized: 19 },
  { hour: "12", current: 12, optimized: 18 },
  { hour: "13", current: 15, optimized: 21 },
  { hour: "14", current: 16, optimized: 22 },
  { hour: "15", current: 14, optimized: 20 },
  { hour: "16", current: 12, optimized: 17 },
];

const RADAR = [
  { axis: "Wait Time", current: 55, optimized: 82 },
  { axis: "Throughput", current: 60, optimized: 88 },
  { axis: "Room Util.", current: 72, optimized: 84 },
  { axis: "Staff Eff.", current: 58, optimized: 81 },
  { axis: "Congestion", current: 50, optimized: 78 },
  { axis: "Patient Sat.", current: 64, optimized: 87 },
];

function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics & Outcomes</h1>
        <p className="text-sm text-muted-foreground">Before vs. After AI-driven Optimization</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Wait Time" value="−42%" icon={<Clock className="h-5 w-5" />} accent="success" hint="32m → 19m" />
        <KpiCard label="Patients / hr" value="+38%" icon={<Users className="h-5 w-5" />} accent="primary" hint="13 → 18" />
        <KpiCard label="Room Util." value="+16%" icon={<DoorOpen className="h-5 w-5" />} accent="teal" hint="72% → 84%" />
        <KpiCard label="Staff Eff." value="+23%" icon={<Stethoscope className="h-5 w-5" />} accent="teal" />
        <KpiCard label="Congestion" value="−51%" icon={<TrendingUp className="h-5 w-5" />} accent="success" />
        <KpiCard label="Throughput" value="+34%" icon={<Activity className="h-5 w-5" />} accent="primary" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Average Wait Time</CardTitle>
            <CardDescription>Current Operations vs AI-Optimized (minutes)</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={COMPARE} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="metric" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="current" name="Current" fill="var(--color-muted-foreground)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="optimized" name="AI Optimized" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Patients Seen per Hour</CardTitle>
            <CardDescription>Hourly throughput Comparison</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={THROUGHPUT} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="hour" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="current" name="Current" stroke="var(--color-muted-foreground)" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="optimized" name="AI Optimized" stroke="var(--color-teal)" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="shadow-elegant lg:col-span-2">
          <CardHeader>
            <CardTitle>Operational Profile</CardTitle>
            <CardDescription>Multi-Dimensional Outcome Comparison</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={RADAR} outerRadius="78%">
                <PolarGrid stroke="var(--color-border)" />
                <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Current" dataKey="current" stroke="var(--color-muted-foreground)" fill="var(--color-muted-foreground)" fillOpacity={0.2} />
                <Radar name="AI Optimized" dataKey="optimized" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.35} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Outcome Summary</CardTitle>
            <CardDescription>7-Day Rolling Comparison</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { k: "Avg Wait Reduction", v: "−13.2 min", d: "Across all Departments" },
              { k: "Extra Patients Served", v: "+96 / day", d: "Throughput Gain" },
              { k: "Staff Overtime", v: "−28%", d: "Via Smarter Scheduling" },
              { k: "Peak Congestion Events", v: "−61%", d: "Predicted & Pre-empted" },
              { k: "Patient Satisfaction", v: "+0.7 NPS", d: "Weekly Survey" },
            ].map((o, i) => (
              <div key={o.k} className="flex items-center justify-between rounded-xl border bg-card p-3 animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
                <div>
                  <div className="text-sm font-medium">{o.k}</div>
                  <div className="text-xs text-muted-foreground">{o.d}</div>
                </div>
                <div className="text-sm font-semibold tabular-nums text-primary">{o.v}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
