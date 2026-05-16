import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Sparkles,
  Sheet as SheetIcon,
  Brain,
  ArrowRight,
  TrendingDown,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";

interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  impact: "High" | "Medium" | "Low";
  confidence: number;
  waitReduction: number;
  efficiencyGain: number;
  reasoning: string;
}

const RECS: Recommendation[] = [
  {
    id: "r1",
    title: "Reassign Room 4 to Urgent Care",
    description: "Shift Room 4 to absorb the Urgent Care surge between 13:00–15:00.",
    category: "Room Allocation",
    impact: "High",
    confidence: 92,
    waitReduction: 18,
    efficiencyGain: 14,
    reasoning:
      "Patient intake demand in Urgent Care increased by 32% over the last 45 minutes while Room 4 in General has been idle 38% of the past hour. Reassigning Room 4 redistributes capacity to the bottleneck and is predicted to reduce average wait times by 18 minutes for incoming urgent patients.",
  },
  {
    id: "r2",
    title: "Shift one nurse to intake station",
    description: "Move 1 nurse from Cardiology to front-desk intake to accelerate check-in throughput.",
    category: "Staffing",
    impact: "High",
    confidence: 88,
    waitReduction: 12,
    efficiencyGain: 9,
    reasoning:
      "Average check-in time has climbed from 3.2 to 6.4 minutes per patient. Cardiology is currently operating at 64% nurse utilization, leaving slack to reallocate one staff member without impacting service quality.",
  },
  {
    id: "r3",
    title: "Delay 4 low-priority appointments by 20 min",
    description: "Stagger low-acuity Pediatrics follow-ups to flatten the 14:30 arrival peak.",
    category: "Scheduling",
    impact: "Medium",
    confidence: 81,
    waitReduction: 9,
    efficiencyGain: 7,
    reasoning:
      "Pediatrics is forecast to enter critical congestion (88%) at 14:30 due to clustered appointment bookings. Pushing 4 low-priority slots reduces predicted peak load to 71% while keeping all patients within their day-of-service window.",
  },
  {
    id: "r4",
    title: "Open overflow check-in station",
    description: "Activate the secondary kiosk row and reroute walk-ins via the east entrance.",
    category: "Capacity",
    impact: "High",
    confidence: 76,
    waitReduction: 15,
    efficiencyGain: 11,
    reasoning:
      "Front-desk queue length exceeded 22 for 3 consecutive samples. Historical patterns show overflow activation reduces intake dwell time by ~38% within 12 minutes of going live.",
  },
  {
    id: "r5",
    title: "Reallocate Dr. Chen's afternoon block",
    description: "Move two Cardiology slots from 15:00 to a free 11:30 window.",
    category: "Scheduling",
    impact: "Medium",
    confidence: 72,
    waitReduction: 7,
    efficiencyGain: 6,
    reasoning:
      "Dr. Chen has 2 unbooked slots at 11:30 while the 15:00 window overlaps the predicted clinic-wide peak. Rebalancing improves doctor utilization and lowers downstream queue pressure.",
  },
  {
    id: "r6",
    title: "Pre-stage Radiology for Cardiology referrals",
    description: "Notify Radiology to reserve 3 imaging slots for predicted referral burst.",
    category: "Coordination",
    impact: "Low",
    confidence: 68,
    waitReduction: 4,
    efficiencyGain: 5,
    reasoning:
      "Past 30-day patterns show a 0.42 correlation between high Cardiology load and Radiology referrals within 90 minutes. Pre-staging reduces hand-off latency by an average of 6 minutes.",
  },
];

export const Route = createFileRoute("/recommendations")({
  head: () => ({
    meta: [
      { title: "AI Recommendations — ClinicFlow Intelligence" },
      { name: "description", content: "Ranked AI-generated operational recommendations with impact, confidence, and reasoning." },
    ],
  }),
  component: RecsPage,
});

function RecsPage() {
  const [open, setOpen] = useState<Recommendation | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AI Recommendations</h1>
          <p className="text-sm text-muted-foreground">
            Ranked by predicted impact • Generated from live operational signals
          </p>
        </div>
        <Badge className="bg-gradient-primary text-primary-foreground shadow-glow">
          <Sparkles className="mr-1 h-3 w-3" /> Engine v2.4
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {RECS.map((r, i) => (
          <Card
            key={r.id}
            className="group relative cursor-pointer overflow-hidden shadow-elegant transition-all hover:-translate-y-0.5 hover:shadow-glow animate-fade-in-up"
            style={{ animationDelay: `${i * 60}ms` }}
            onClick={() => setOpen(r)}
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-primary opacity-80" />
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] uppercase">{r.category}</Badge>
                  <Badge
                    className={
                      r.impact === "High"
                        ? "bg-destructive/15 text-destructive border-destructive/30"
                        : r.impact === "Medium"
                        ? "bg-warning/15 text-warning border-warning/30"
                        : "bg-success/15 text-success border-success/30"
                    }
                    variant="outline"
                  >
                    {r.impact} impact
                  </Badge>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Brain className="h-4 w-4" />
                </div>
              </div>
              <CardTitle className="mt-2 text-base">{r.title}</CardTitle>
              <CardDescription>{r.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Metric label="Wait −" value={`${r.waitReduction} min`} />
                <Metric label="Efficiency +" value={`${r.efficiencyGain}%`} />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Confidence</span>
                  <span className="tabular-nums">{r.confidence}%</span>
                </div>
                <Progress value={r.confidence} className="h-1.5" />
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between text-primary hover:text-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(r);
                }}
              >
                Explain reasoning
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Sheet open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {open && (
            <>
              <SheetHeader>
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <Badge variant="outline">{open.category}</Badge>
                </div>
                <SheetTitle className="text-lg">{open.title}</SheetTitle>
                <SheetDescription>{open.description}</SheetDescription>
              </SheetHeader>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <ExplainStat icon={<TrendingDown className="h-4 w-4" />} label="Wait reduction" value={`${open.waitReduction} min`} />
                <ExplainStat icon={<SheetIcon className="h-4 w-4" />} label="Efficiency" value={`+${open.efficiencyGain}%`} />
                <ExplainStat icon={<ShieldCheck className="h-4 w-4" />} label="Confidence" value={`${open.confidence}%`} />
              </div>

              <div className="mt-6 rounded-2xl border bg-gradient-surface p-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <Brain className="h-3.5 w-3.5" /> AI reasoning
                </div>
                <p className="text-sm leading-relaxed text-foreground/90">{open.reasoning}</p>
              </div>

              <div className="mt-4 rounded-2xl border bg-card p-4">
                <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Signals used</div>
                <ul className="space-y-1.5 text-sm">
                  <li>• Real-time queue length & dwell time</li>
                  <li>• Room utilization & turnover rate</li>
                  <li>• Forecasted arrival rates (next 30 min)</li>
                  <li>• Historical congestion patterns (90 days)</li>
                </ul>
              </div>

              <div className="mt-6 flex gap-2">
                <Button className="flex-1 bg-gradient-primary text-primary-foreground hover:opacity-90">Apply recommendation</Button>
                <Button variant="outline" className="flex-1" onClick={() => setOpen(null)}>Dismiss</Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-card/50 p-2.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function ExplainStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-card p-3 text-center">
      <div className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold tabular-nums">{value}</div>
    </div>
  );
}
