import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Activity,
  Clock,
  Users,
  UserCog,
  DoorOpen,
  AlertTriangle,
  ListChecks,
  TimerReset,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  RadialBar,
  RadialBarChart,
  PolarAngleAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { KpiCard } from "@/components/kpi-card";
import { DEFAULT_CONTROLS, DEPARTMENTS, useLiveSim } from "@/lib/simulation";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Operations Dashboard — ClinicFlow Intelligence" },
      { name: "description", content: "Real-time clinic operations: wait times, congestion, doctor availability, and AI alerts." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { state, history } = useLiveSim(DEFAULT_CONTROLS);

  const congestionData = useMemo(
    () => [{ name: "Risk", value: state.congestionRisk, fill: "var(--color-primary)" }],
    [state.congestionRisk],
  );

  const alerts = useMemo(
    () => [
      {
        level: "high" as const,
        title: "High congestion predicted in Pediatrics within 25 minutes",
        detail: "Arrival rate +32% vs baseline. Recommend opening overflow intake.",
      },
      {
        level: state.avgWaitTime > 30 ? ("high" as const) : ("medium" as const),
        title: `Wait times expected to exceed ${state.avgWaitTime + 15} min between 2–3 PM`,
        detail: "Cardiology bookings cluster at 14:30. Stagger by 10 minutes.",
      },
      {
        level: "medium" as const,
        title: "Room capacity approaching critical threshold",
        detail: `Utilization at ${state.roomUtilization}%. Consider reassigning Room 4.`,
      },
    ],
    [state.avgWaitTime, state.roomUtilization],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Operations Overview</h1>
          <p className="text-sm text-muted-foreground">
            Real-time signals across departments • Updated every 4s
          </p>
        </div>
        <Badge className="bg-gradient-primary text-primary-foreground shadow-glow">
          <Activity className="mr-1 h-3 w-3" /> Simulation active
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Avg Wait Time" value={state.avgWaitTime} unit="min" icon={<Clock className="h-5 w-5" />} accent="primary" trend={-8} />
        <KpiCard label="Patients Checked In" value={state.checkedIn} icon={<Users className="h-5 w-5" />} accent="teal" trend={4} hint="Today" />
        <KpiCard label="Active Appointments" value={state.activeAppointments} icon={<ListChecks className="h-5 w-5" />} accent="success" />
        <KpiCard label="Doctors Available" value={`${state.doctorsAvailable}/${state.doctorsTotal}`} icon={<UserCog className="h-5 w-5" />} accent="warning" />
        <KpiCard label="Room Utilization" value={state.roomUtilization} unit="%" icon={<DoorOpen className="h-5 w-5" />} accent="primary" />
        <KpiCard label="Congestion Risk" value={state.congestionRisk} unit="%" icon={<TrendingUp className="h-5 w-5" />} accent={state.congestionRisk > 70 ? "destructive" : "teal"} />
        <KpiCard label="Queue Length" value={state.queueLength} icon={<Users className="h-5 w-5" />} accent="teal" />
        <KpiCard label="Estimated Delay" value={state.estimatedDelay} unit="min" icon={<TimerReset className="h-5 w-5" />} accent={state.estimatedDelay > 20 ? "warning" : "success"} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-elegant">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Wait Time & Congestion (live)</CardTitle>
                <CardDescription>Streaming operational signal — last 30 minutes</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gWait" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gCong" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-teal)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--color-teal)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="t" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="wait" stroke="var(--color-primary)" strokeWidth={2} fill="url(#gWait)" name="Wait (min)" />
                <Area type="monotone" dataKey="congestion" stroke="var(--color-teal)" strokeWidth={2} fill="url(#gCong)" name="Congestion (%)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Predicted Congestion</CardTitle>
            <CardDescription>Next 30 minutes • clinic-wide</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart innerRadius="65%" outerRadius="100%" data={congestionData} startAngle={220} endAngle={-40}>
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar background dataKey="value" cornerRadius={20} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="-mt-44 flex flex-col items-center text-center">
              <div className="text-4xl font-semibold tabular-nums">{state.congestionRisk}%</div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Risk score</div>
            </div>
            <div className="mt-36 text-center text-sm text-muted-foreground">
              {state.congestionRisk > 70 ? "Critical — act now" : state.congestionRisk > 45 ? "Elevated — monitor" : "Stable"}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-elegant">
          <CardHeader>
            <CardTitle>Department Load</CardTitle>
            <CardDescription>Capacity pressure by department</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {DEPARTMENTS.map((d) => (
              <div key={d.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{d.name}</span>
                  <span className="tabular-nums text-muted-foreground">{d.load}%</span>
                </div>
                <Progress value={d.load} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" /> AI Alerts
            </CardTitle>
            <CardDescription>Bottleneck signals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((a, i) => (
              <div
                key={i}
                className="animate-fade-in-up rounded-xl border bg-card/50 p-3"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={
                      "h-2 w-2 rounded-full " +
                      (a.level === "high" ? "bg-destructive animate-pulse-ring" : "bg-warning")
                    }
                  />
                  <Badge variant="outline" className="text-[10px] uppercase">
                    {a.level}
                  </Badge>
                </div>
                <div className="mt-2 text-sm font-medium leading-snug">{a.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">{a.detail}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
