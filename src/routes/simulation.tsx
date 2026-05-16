import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Clock, Users, DoorOpen, TrendingUp, RotateCcw, Sparkles } from "lucide-react";
import { computeMetrics, DEFAULT_CONTROLS } from "@/lib/simulation";
import { KpiCard } from "@/components/kpi-card";

export const Route = createFileRoute("/simulation")({
  head: () => ({
    meta: [
      { title: "What-If Simulation — ClinicFlow Intelligence" },
      { name: "description", content: "Interactively test staffing, room, and scheduling changes and see instant AI predictions." },
    ],
  }),
  component: SimPage,
});

function SimPage() {
  const [arrivals, setArrivals] = useState(DEFAULT_CONTROLS.arrivalRate);
  const [doctors, setDoctors] = useState(DEFAULT_CONTROLS.doctors);
  const [rooms, setRooms] = useState(DEFAULT_CONTROLS.rooms);
  const [apptDuration, setApptDuration] = useState(DEFAULT_CONTROLS.apptDuration);
  const [nurses, setNurses] = useState(DEFAULT_CONTROLS.nurses);
  const [overflow, setOverflow] = useState(false);

  const controls = {
    arrivalRate: arrivals,
    doctors: doctors + (overflow ? 1 : 0),
    rooms: rooms + (overflow ? 2 : 0),
    apptDuration,
    nurses,
  };

  const baseline = useMemo(() => computeMetrics(DEFAULT_CONTROLS), []);
  const current = useMemo(() => computeMetrics(controls), [controls]);

  const projection = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const j = Math.sin(i * 0.5) * 0.6;
      const b = computeMetrics(DEFAULT_CONTROLS, j);
      const c = computeMetrics(controls, j);
      return { t: `+${i * 5}m`, baseline: b.avgWaitTime, optimized: c.avgWaitTime };
    });
  }, [controls]);

  const reset = () => {
    setArrivals(DEFAULT_CONTROLS.arrivalRate);
    setDoctors(DEFAULT_CONTROLS.doctors);
    setRooms(DEFAULT_CONTROLS.rooms);
    setApptDuration(DEFAULT_CONTROLS.apptDuration);
    setNurses(DEFAULT_CONTROLS.nurses);
    setOverflow(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">What-If Simulation</h1>
          <p className="text-sm text-muted-foreground">
            Adjust operations and watch the AI re-forecast in real time
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-gradient-primary text-primary-foreground shadow-glow">
            <Sparkles className="mr-1 h-3 w-3" /> Live forecast
          </Badge>
          <Button variant="outline" size="sm" onClick={reset}>
            <RotateCcw className="mr-1 h-3.5 w-3.5" /> Reset
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[420px_1fr]">
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Operational Controls</CardTitle>
            <CardDescription>Drag sliders to test scenarios</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ControlSlider label="Patient arrivals" unit="/ hour" value={arrivals} min={5} max={45} onChange={setArrivals} />
            <ControlSlider label="Doctors on shift" value={doctors} min={2} max={14} onChange={setDoctors} />
            <ControlSlider label="Open exam rooms" value={rooms} min={4} max={18} onChange={setRooms} />
            <ControlSlider label="Avg appointment" unit="min" value={apptDuration} min={10} max={45} onChange={setApptDuration} />
            <ControlSlider label="Nurses on shift" value={nurses} min={3} max={16} onChange={setNurses} />

            <div className="flex items-center justify-between rounded-xl border bg-card p-3">
              <div className="space-y-0.5">
                <Label className="text-sm">Open overflow station</Label>
                <p className="text-xs text-muted-foreground">+1 doctor, +2 rooms</p>
              </div>
              <Switch checked={overflow} onCheckedChange={setOverflow} />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <KpiCard label="Wait Time" value={current.avgWaitTime} unit="min" icon={<Clock className="h-5 w-5" />} accent={current.avgWaitTime < baseline.avgWaitTime ? "success" : "warning"} hint={`baseline ${baseline.avgWaitTime}m`} />
            <KpiCard label="Congestion" value={current.congestionRisk} unit="%" icon={<TrendingUp className="h-5 w-5" />} accent={current.congestionRisk > 70 ? "destructive" : "teal"} hint={`baseline ${baseline.congestionRisk}%`} />
            <KpiCard label="Queue" value={current.queueLength} icon={<Users className="h-5 w-5" />} accent="primary" hint={`baseline ${baseline.queueLength}`} />
            <KpiCard label="Room Util." value={current.roomUtilization} unit="%" icon={<DoorOpen className="h-5 w-5" />} accent="teal" />
          </div>

          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>Forecast: Baseline vs Your Scenario</CardTitle>
              <CardDescription>Predicted average wait time over next 60 minutes</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projection} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gBaseline" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-muted-foreground)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--color-muted-foreground)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gOpt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="t" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
                  <Area type="monotone" dataKey="baseline" stroke="var(--color-muted-foreground)" strokeWidth={2} fill="url(#gBaseline)" />
                  <Area type="monotone" dataKey="optimized" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#gOpt)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> AI commentary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-foreground/90">
                With <b>{controls.doctors}</b> doctors covering <b>{controls.rooms}</b> rooms at <b>{controls.arrivalRate}</b> arrivals/hour
                and <b>{controls.apptDuration}</b>-minute appointments, predicted average wait time is{" "}
                <b className={current.avgWaitTime < baseline.avgWaitTime ? "text-success" : "text-warning"}>
                  {current.avgWaitTime} min
                </b>{" "}
                ({current.avgWaitTime < baseline.avgWaitTime ? "↓" : "↑"} {Math.abs(current.avgWaitTime - baseline.avgWaitTime)} vs baseline)
                and congestion risk is <b>{current.congestionRisk}%</b>.
                {overflow && " Overflow capacity adds resilience for the next 60 minutes."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ControlSlider({
  label, value, min, max, onChange, unit,
}: { label: string; value: number; min: number; max: number; onChange: (v: number) => void; unit?: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm">{label}</Label>
        <span className="text-sm font-medium tabular-nums">{value}{unit ? ` ${unit}` : ""}</span>
      </div>
      <Slider value={[value]} min={min} max={max} step={1} onValueChange={(v) => onChange(v[0])} />
    </div>
  );
}
