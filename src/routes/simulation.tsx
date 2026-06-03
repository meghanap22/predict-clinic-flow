import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
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
import { Clock, Users, DoorOpen, TrendingUp, RotateCcw, Sparkles, Loader2 } from "lucide-react";
import { computeMetrics, DEFAULT_CONTROLS } from "@/lib/simulation";
import { KpiCard } from "@/components/kpi-card";
import { useClinic } from "@/lib/clinic-context";
import { fetchScenarioExplanation } from "@/lib/ai/functions";
import type { AiExplainResponse } from "@/lib/clinic-types";

export const Route = createFileRoute("/simulation")({
  head: () => ({
    meta: [
      { title: "What-If Simulation — ClinicFlow Intelligence" },
      {
        name: "description",
        content: "Test staffing and capacity changes, then get an AI explanation of the forecast.",
      },
    ],
  }),
  component: SimPage,
});

function SimPage() {
  const { controls, setControls, resetControls, snapshot } = useClinic();
  const [explaining, setExplaining] = useState(false);
  const [explanation, setExplanation] = useState<AiExplainResponse | null>(null);

  const effective = {
    arrivalRate: controls.arrivalRate,
    doctors: controls.doctors + (controls.overflow ? 1 : 0),
    rooms: controls.rooms + (controls.overflow ? 2 : 0),
    apptDuration: controls.apptDuration,
    nurses: controls.nurses,
  };

  const baseline = useMemo(() => computeMetrics(DEFAULT_CONTROLS), []);
  const current = useMemo(() => computeMetrics(effective), [effective]);

  const projection = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const j = Math.sin(i * 0.5) * 0.6;
      const b = computeMetrics(DEFAULT_CONTROLS, j);
      const c = computeMetrics(effective, j);
      return { t: `+${i * 5}m`, baseline: b.avgWaitTime, scenario: c.avgWaitTime };
    });
  }, [effective]);

  const reset = () => {
    resetControls();
    setExplanation(null);
  };

  const explain = async () => {
    setExplaining(true);
    try {
      const response = await fetchScenarioExplanation({
        data: {
          snapshot,
          baseline: {
            avgWaitTime: baseline.avgWaitTime,
            checkedIn: baseline.checkedIn,
            activeAppointments: baseline.activeAppointments,
            doctorsAvailable: baseline.doctorsAvailable,
            doctorsTotal: baseline.doctorsTotal,
            roomUtilization: baseline.roomUtilization,
            congestionRisk: baseline.congestionRisk,
            queueLength: baseline.queueLength,
            estimatedDelay: baseline.estimatedDelay,
          },
          scenario: {
            avgWaitTime: current.avgWaitTime,
            checkedIn: current.checkedIn,
            activeAppointments: current.activeAppointments,
            doctorsAvailable: current.doctorsAvailable,
            doctorsTotal: current.doctorsTotal,
            roomUtilization: current.roomUtilization,
            congestionRisk: current.congestionRisk,
            queueLength: current.queueLength,
            estimatedDelay: current.estimatedDelay,
          },
        },
      });
      setExplanation(response);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not explain forecast.");
    } finally {
      setExplaining(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">What-If Simulation</h1>
          <p className="text-sm text-muted-foreground">
            Adjust Controls and See the Forecast Update — then Ask AI to Explain your Scenario
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="h-8 px-3 text-xs font-medium shadow-sm">
            Scenario Forecast
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
            <CardDescription>Drag Sliders to Test Scenarios</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ControlSlider
              label="Patient Arrivals"
              unit="/ hour"
              value={controls.arrivalRate}
              min={5}
              max={45}
              onChange={(v) => {
                setControls({ arrivalRate: v });
                setExplanation(null);
              }}
            />
            <ControlSlider
              label="Doctors on Shift"
              value={controls.doctors}
              min={2}
              max={14}
              onChange={(v) => {
                setControls({ doctors: v });
                setExplanation(null);
              }}
            />
            <ControlSlider
              label="Open Exam Rooms"
              value={controls.rooms}
              min={4}
              max={18}
              onChange={(v) => {
                setControls({ rooms: v });
                setExplanation(null);
              }}
            />
            <ControlSlider
              label="Avg Appointment"
              unit="min"
              value={controls.apptDuration}
              min={10}
              max={45}
              onChange={(v) => {
                setControls({ apptDuration: v });
                setExplanation(null);
              }}
            />
            <ControlSlider
              label="Nurses on Shift"
              value={controls.nurses}
              min={3}
              max={16}
              onChange={(v) => {
                setControls({ nurses: v });
                setExplanation(null);
              }}
            />

            <div className="flex items-center justify-between rounded-xl border bg-card p-3">
              <div className="space-y-0.5">
                <Label className="text-sm">Open Overflow Station</Label>
                <p className="text-xs text-muted-foreground">+1 Doctor, +2 Rooms</p>
              </div>
              <Switch
                checked={controls.overflow}
                onCheckedChange={(overflow) => {
                  setControls({ overflow });
                  setExplanation(null);
                }}
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <KpiCard
              label="Wait Time"
              value={current.avgWaitTime}
              unit="min"
              icon={<Clock className="h-5 w-5" />}
              accent={current.avgWaitTime < baseline.avgWaitTime ? "success" : "warning"}
              hint={`baseline ${baseline.avgWaitTime}m`}
            />
            <KpiCard
              label="Congestion"
              value={current.congestionRisk}
              unit="%"
              icon={<TrendingUp className="h-5 w-5" />}
              accent={current.congestionRisk > 70 ? "destructive" : "teal"}
              hint={`baseline ${baseline.congestionRisk}%`}
            />
            <KpiCard
              label="Queue"
              value={current.queueLength}
              icon={<Users className="h-5 w-5" />}
              accent="primary"
              hint={`baseline ${baseline.queueLength}`}
            />
            <KpiCard
              label="Room Util."
              value={current.roomUtilization}
              unit="%"
              icon={<DoorOpen className="h-5 w-5" />}
              accent="teal"
            />
          </div>

          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>Forecast: Baseline vs. Your Scenario</CardTitle>
              <CardDescription>Predicted Average Wait Time over Next 60 Minutes</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projection} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gBaseline" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-muted-foreground)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--color-muted-foreground)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gScenario" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
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
                  <Area type="monotone" dataKey="baseline" stroke="var(--color-muted-foreground)" strokeWidth={2} fill="url(#gBaseline)" />
                  <Area type="monotone" dataKey="scenario" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#gScenario)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-elegant">
            <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" /> AI Explanation
                </CardTitle>
                <CardDescription className="mt-1.5">
                  Plain-Language Summary of your Scenario vs. Baseline
                </CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={explain} disabled={explaining}>
                {explaining ? (
                  <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="mr-1 h-3.5 w-3.5" />
                )}
                {explaining ? "Explaining…" : explanation ? "Regenerate" : "Explain forecast"}
              </Button>
            </CardHeader>
            <CardContent>
              {explanation ? (
                <p className="text-sm leading-relaxed text-foreground/90">{explanation.explanation}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Adjust the Controls Above, then Click <b>Explain forecast</b> to get an AI-written Comparison
                  of Baseline ({baseline.avgWaitTime} min wait) vs. your Scenario ({current.avgWaitTime} Min Wait).
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ControlSlider({
  label,
  value,
  min,
  max,
  onChange,
  unit,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  unit?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm">{label}</Label>
        <span className="text-sm font-medium tabular-nums">
          {value}
          {unit ? ` ${unit}` : ""}
        </span>
      </div>
      <Slider value={[value]} min={min} max={max} step={1} onValueChange={(v) => onChange(v[0])} />
    </div>
  );
}
