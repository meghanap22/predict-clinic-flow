import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  ClipboardList,
  DoorClosed,
  DoorOpen,
  Stethoscope,
  Users,
} from "lucide-react";
import { DoctorDaySheet, DoctorScheduleCard } from "@/components/doctor-day-sheet";
import { DOCTOR_SCHEDULE } from "@/lib/doctor-schedule";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const patientFlowSearchSchema = z.object({
  doctor: z.string().optional(),
});

export const Route = createFileRoute("/patient-flow")({
  validateSearch: patientFlowSearchSchema,
  head: () => ({
    meta: [
      { title: "Patient Flow — ClinicFlow Intelligence" },
      { name: "description", content: "Visualize patient movement, queues, room occupancy, and intake bottlenecks across the clinic." },
    ],
  }),
  component: FlowPage,
});

const STAGES = [
  { key: "Arrival", count: 28, icon: Users },
  { key: "Check-in", count: 14, icon: ClipboardList },
  { key: "Waiting", count: 22, icon: Users },
  { key: "Triage", count: 6, icon: Stethoscope },
  { key: "In Exam", count: 9, icon: Stethoscope },
  { key: "Checkout", count: 4, icon: ArrowRight },
];

const ROOMS = Array.from({ length: 12 }, (_, i) => {
  const seed = (i * 13) % 5;
  const status = seed < 2 ? "occupied" : seed === 2 ? "cleaning" : "available";
  return { id: i + 1, status, mins: 12 + ((i * 7) % 28) };
});

const HEAT = ["09", "10", "11", "12", "13", "14", "15", "16", "17"].map((h, i) => ({
  hour: h,
  values: ["Peds", "Cardio", "Urgent", "Gen", "Rad"].map((_, j) => ({
    dept: ["Peds", "Cardio", "Urgent", "Gen", "Rad"][j],
    v: Math.round(30 + 60 * Math.abs(Math.sin((i + 1) * (j + 1) * 0.6))),
  })),
}));

const QUEUE_BUILD = Array.from({ length: 18 }, (_, i) => ({
  t: `${9 + Math.floor(i / 2)}:${i % 2 === 0 ? "00" : "30"}`,
  queue: Math.round(4 + 14 * Math.abs(Math.sin(i * 0.45)) + (i > 8 ? i * 0.6 : 0)),
}));

export const stageColors = ["#5aa9ff", "#4dc6c0", "#5cd6a9", "#f5c46b", "#7da8ff", "#84d4cc"];

function FlowPage() {
  const totalInClinic = useMemo(() => STAGES.reduce((a, s) => a + s.count, 0), []);
  const { doctor: selectedDoctorId } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  useEffect(() => {
    if (!selectedDoctorId) return;
    const el = document.getElementById(selectedDoctorId);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [selectedDoctorId]);

  const openDoctor = (id: string) => {
    navigate({ search: { doctor: id } });
  };

  const closeDoctor = () => {
    navigate({ search: { doctor: undefined } });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Patient Flow Visualization</h1>
        <p className="text-sm text-muted-foreground">
          {totalInClinic} Patients Currently in Clinic • Live Operational State
        </p>
      </div>

      <Card className="shadow-elegant overflow-hidden">
        <CardHeader>
          <CardTitle>Flow Pipeline</CardTitle>
          <CardDescription>Patients Moving through Stages — Width Reflects Volume</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 md:flex-row md:items-stretch">
            {STAGES.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.key} className="flex flex-1 items-center gap-2">
                  <div className="group flex flex-1 flex-col rounded-2xl border bg-gradient-surface p-4 transition-all hover:-translate-y-0.5 hover:shadow-elegant">
                    <div className="flex items-center justify-between">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-primary-foreground"
                        style={{ background: stageColors[i] }}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <Badge variant="outline" className="tabular-nums">{s.count}</Badge>
                    </div>
                    <div className="mt-3 text-sm font-medium">{s.key}</div>
                    <div className="mt-2 flex gap-0.5">
                      {Array.from({ length: Math.min(s.count, 16) }).map((_, j) => (
                        <span
                          key={j}
                          className="h-2 flex-1 rounded-full animate-float-dot"
                          style={{ background: stageColors[i], opacity: 0.35 + (j % 4) * 0.15, animationDelay: `${j * 80}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                  {i < STAGES.length - 1 && (
                    <ArrowRight className="hidden h-5 w-5 shrink-0 text-muted-foreground md:block" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:items-stretch">
        <Card className="flex h-full flex-col shadow-elegant lg:col-span-2">
          <CardHeader>
            <CardTitle>Exam Room Map</CardTitle>
            <CardDescription>Occupied / Cleaning / Available</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-3">
            <div className="grid min-h-0 flex-1 auto-rows-fr grid-cols-3 gap-3 sm:grid-cols-4 sm:grid-rows-3">
              {ROOMS.map((r) => {
                const isOcc = r.status === "occupied";
                const isClean = r.status === "cleaning";
                const color = isOcc
                  ? "border-primary/40 bg-primary/10"
                  : isClean
                  ? "border-warning/40 bg-warning/10"
                  : "border-success/40 bg-success/10";
                const Icon = isOcc ? DoorClosed : DoorOpen;
                return (
                  <div
                    key={r.id}
                    className={`flex h-full min-h-0 flex-col justify-between rounded-2xl border p-4 transition hover:scale-[1.02] ${color}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Room</span>
                      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-semibold tabular-nums">{r.id.toString().padStart(2, "0")}</div>
                    <div className="text-[11px] uppercase tracking-wider leading-tight">
                      {r.status}
                      {isOcc ? ` • ${r.mins}m` : ""}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex shrink-0 flex-wrap gap-3 text-xs text-muted-foreground">
              <Legend color="bg-primary" label="Occupied" />
              <Legend color="bg-warning" label="Cleaning" />
              <Legend color="bg-success" label="Available" />
            </div>
          </CardContent>
        </Card>

        <Card id="doctor-schedule" className="flex h-full scroll-mt-24 flex-col shadow-elegant">
          <CardHeader>
            <CardTitle>Doctor Schedule</CardTitle>
            <CardDescription className="mt-1.5">Tap a doctor to view today&apos;s full schedule</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {DOCTOR_SCHEDULE.map((d) => (
              <DoctorScheduleCard
                key={d.id}
                doctor={d}
                highlighted={selectedDoctorId === d.id}
                onSelect={() => openDoctor(d.id)}
              />
            ))}
          </CardContent>
        </Card>

        <DoctorDaySheet
          doctorId={selectedDoctorId}
          open={!!selectedDoctorId}
          onOpenChange={(open) => !open && closeDoctor()}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-stretch">
        <Card className="flex h-full flex-col shadow-elegant">
          <CardHeader>
            <CardTitle>Queue Build-Up</CardTitle>
            <CardDescription>Delays Compounding through the Day</CardDescription>
          </CardHeader>
          <CardContent className="flex min-h-64 flex-1 flex-col">
            <div className="min-h-0 flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={QUEUE_BUILD} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="t" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
                  <Line type="monotone" dataKey="queue" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="flex h-full flex-col shadow-elegant">
          <CardHeader>
            <CardTitle>Congestion Heatmap</CardTitle>
            <CardDescription>Department × Hour Intensity</CardDescription>
          </CardHeader>
          <CardContent className="flex min-h-64 flex-1 flex-col">
            <div className="flex min-h-0 flex-1 flex-col gap-1.5">
              <div className="grid shrink-0 grid-cols-[64px_repeat(9,minmax(0,1fr))] gap-1.5 text-[10px] text-muted-foreground">
                <div />
                {HEAT.map((h) => (
                  <div key={h.hour} className="text-center">
                    {h.hour}
                  </div>
                ))}
              </div>
              <div className="grid min-h-0 flex-1 auto-rows-fr grid-rows-5 gap-1.5">
                {["Peds", "Cardio", "Urgent", "Gen", "Rad"].map((dept, di) => (
                  <div
                    key={dept}
                    className="grid h-full min-h-0 grid-cols-[64px_repeat(9,minmax(0,1fr))] items-stretch gap-1.5"
                  >
                    <div className="flex items-center text-xs text-muted-foreground">{dept}</div>
                    {HEAT.map((h) => {
                      const v = h.values[di].v;
                      const intensity = v / 100;
                      return (
                        <div
                          key={h.hour}
                          className="h-full min-h-0 rounded-md transition hover:scale-[1.02]"
                          style={{
                            background: `color-mix(in oklab, var(--color-primary) ${Math.round(intensity * 95)}%, transparent)`,
                          }}
                          title={`${dept} ${h.hour}:00 • ${v}%`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle>Intake Bottlenecks</CardTitle>
          <CardDescription>Stages Exceeding Target Dwell Time</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={STAGES.map((s, i) => ({ name: s.key, value: s.count, color: stageColors[i] }))} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {STAGES.map((_, i) => <Cell key={i} fill={stageColors[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      <span>{label}</span>
    </div>
  );
}
