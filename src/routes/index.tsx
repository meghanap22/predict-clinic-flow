import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
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
  Sparkles,
  Loader2,
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { KpiCard } from "@/components/kpi-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DEPARTMENTS } from "@/lib/simulation";
import { useClinic } from "@/lib/clinic-context";
import { fetchDashboardSummary } from "@/lib/ai/functions";
import type { AiSummaryResponse } from "@/lib/clinic-types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Operations Dashboard — ClinicFlow Intelligence" },
      { name: "description", content: "Real-time clinic operations: wait times, congestion, doctor availability, and AI alerts." },
    ],
  }),
  component: DashboardPage,
});

const CONGESTION_TIERS = [
  {
    id: "critical",
    range: "> 70%",
    label: "Critical — act now",
    meaning: "Review staffing and intake capacity immediately.",
    color: "text-destructive",
    fill: "var(--color-destructive)",
    isActive: (risk: number) => risk > 70,
  },
  {
    id: "elevated",
    range: "46–70%",
    label: "Elevated — monitor",
    meaning: "Watch department loads and wait times closely.",
    color: "text-warning",
    fill: "var(--color-warning)",
    isActive: (risk: number) => risk > 45 && risk <= 70,
  },
  {
    id: "stable",
    range: "≤ 45%",
    label: "Stable",
    meaning: "Clinic-wide flow is within normal thresholds.",
    color: "text-success",
    fill: "var(--color-success)",
    isActive: (risk: number) => risk <= 45,
  },
] as const;

function DashboardPage() {
  const { state, history, snapshot } = useClinic();
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summary, setSummary] = useState<AiSummaryResponse | null>(null);

  const congestionTier = useMemo(
    () => CONGESTION_TIERS.find((t) => t.isActive(state.congestionRisk)) ?? CONGESTION_TIERS[2],
    [state.congestionRisk],
  );

  const congestionData = useMemo(
    () => [{ name: "Risk", value: state.congestionRisk, fill: congestionTier.fill }],
    [state.congestionRisk, congestionTier.fill],
  );

  const thresholdAlerts = useMemo(() => {
    const alerts: Array<{ level: "high" | "medium"; title: string; detail: string }> = [];
    if (state.congestionRisk > 70) {
      alerts.push({
        level: "high",
        title: "Congestion Risk Elevated",
        detail: `Risk score at ${state.congestionRisk}% — review staffing and intake capacity.`,
      });
    } else if (state.congestionRisk > 45) {
      alerts.push({
        level: "medium",
        title: "Congestion Risk Rising",
        detail: `Risk score at ${state.congestionRisk}% — monitor department loads closely.`,
      });
    }
    if (state.avgWaitTime > 30) {
      alerts.push({
        level: state.avgWaitTime > 40 ? "high" : "medium",
        title: "Wait Times Above Target",
        detail: `Average wait is ${state.avgWaitTime} min (target: ≤25 min).`,
      });
    }
    if (state.roomUtilization > 85) {
      alerts.push({
        level: "high",
        title: "Room Utilization Critical",
        detail: `Exam rooms at ${state.roomUtilization}% capacity — consider overflow or reallocation.`,
      });
    }
    return alerts.slice(0, 2);
  }, [state.congestionRisk, state.avgWaitTime, state.roomUtilization]);

  const generateSummary = async () => {
    setSummaryLoading(true);
    try {
      const response = await fetchDashboardSummary({ data: snapshot });
      setSummary(response);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not generate briefing.");
    } finally {
      setSummaryLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Operations Overview</h1>
          <p className="text-sm text-muted-foreground">
            Real-Time Signals across Departments • Updated every 4s
          </p>
        </div>
        <Badge className="bg-gradient-primary text-primary-foreground shadow-glow">
          <Activity className="mr-1 h-3 w-3" /> Simulation Active
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="shadow-elegant">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Wait Time & Congestion (Live)</CardTitle>
                <CardDescription className="mt-1.5">
                  Streaming Operational Signal — Last 30 minutes
                </CardDescription>
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
                <XAxis
                  dataKey="t"
                  stroke="var(--color-muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                  minTickGap={28}
                />
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
            <CardDescription className="mt-1.5">Next 30 minutes • Clinic-Wide</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <div className="flex h-full gap-3">
              <div className="relative min-h-0 min-w-0 flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart innerRadius="65%" outerRadius="100%" data={congestionData} startAngle={220} endAngle={-40}>
                    <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                    <RadialBar background dataKey="value" cornerRadius={20} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-2 pb-6 text-center">
                  <div className="text-3xl font-semibold tabular-nums">{state.congestionRisk}%</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Risk score</div>
                </div>
                <p
                  className={cn(
                    "pointer-events-none absolute inset-x-0 bottom-[14%] text-center text-sm font-semibold",
                    congestionTier.color,
                  )}
                >
                  {congestionTier.label}
                </p>
              </div>
              <div className="flex w-[48%] shrink-0 flex-col justify-center border-l pl-3">
                <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Risk cutoffs
                </p>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="h-7 px-1 text-[10px]">Range</TableHead>
                      <TableHead className="h-7 px-1 text-[10px]">Status</TableHead>
                      <TableHead className="h-7 px-1 text-[10px]">Meaning</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {CONGESTION_TIERS.map((tier) => {
                      const active = tier.isActive(state.congestionRisk);
                      return (
                        <TableRow
                          key={tier.id}
                          className={cn(
                            "hover:bg-transparent",
                            active && "bg-muted/60",
                          )}
                        >
                          <TableCell className="px-1 py-1.5 text-[10px] tabular-nums">{tier.range}</TableCell>
                          <TableCell className={cn("px-1 py-1.5 text-[10px] font-semibold", tier.color)}>
                            {tier.label}
                          </TableCell>
                          <TableCell className="px-1 py-1.5 text-[10px] leading-snug text-muted-foreground">
                            {tier.meaning}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:items-stretch">
        <Card className="flex h-full flex-col shadow-elegant lg:col-span-2">
          <CardHeader>
            <CardTitle>Department Load</CardTitle>
            <CardDescription>Capacity Pressure by Department</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            <div className="grid min-h-0 flex-1 auto-rows-fr grid-rows-5 gap-3">
              {DEPARTMENTS.map((d) => (
                <div key={d.name} className="flex min-h-0 flex-col justify-center gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{d.name}</span>
                    <span className="tabular-nums text-muted-foreground">{d.load}%</span>
                  </div>
                  <Progress value={d.load} className="h-3" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex h-full flex-col gap-4">
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" /> Threshold Alerts
              </CardTitle>
              <CardDescription>Rule-Based Signals from Live Metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {thresholdAlerts.length === 0 ? (
                <p className="text-sm text-muted-foreground">All metrics within normal thresholds.</p>
              ) : (
                thresholdAlerts.map((a, i) => (
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
                ))
              )}
            </CardContent>
          </Card>

          <Card className="shadow-elegant">
            <CardHeader
              className={`flex flex-row items-start justify-between gap-3 space-y-0 ${summary ? "pb-3" : ""}`}
            >
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" /> AI Briefing
                </CardTitle>
                <CardDescription className="mt-1.5">
                  {summary
                    ? `Updated ${new Date(summary.generatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                    : "One-Paragraph Summary of What Matters Right Now"}
                </CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={generateSummary} disabled={summaryLoading}>
                {summaryLoading ? (
                  <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="mr-1 h-3.5 w-3.5" />
                )}
                {summaryLoading ? "Generating…" : summary ? "Refresh" : "Generate"}
              </Button>
            </CardHeader>
            <CardContent className={summary ? "space-y-2" : undefined}>
              {summary ? (
                <>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Main Focus: </span>
                    <span className="font-medium text-foreground">{summary.focusArea}</span>
                  </p>
                  <p className="text-sm leading-relaxed text-foreground/90">{summary.summary}</p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Click generate for an AI-written ops brief based on current wait ({state.avgWaitTime} min),
                  congestion ({state.congestionRisk}%), and department loads.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
