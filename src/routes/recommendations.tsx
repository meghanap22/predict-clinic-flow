import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Brain, ArrowRight, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
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
import type { AiRecommendation, AiRecommendationsResponse } from "@/lib/clinic-types";
import { useClinic } from "@/lib/clinic-context";
import { fetchRecommendations } from "@/lib/ai/functions";

export const Route = createFileRoute("/recommendations")({
  head: () => ({
    meta: [
      { title: "AI Recommendations — ClinicFlow Intelligence" },
      {
        name: "description",
        content: "AI-generated operational recommendations based on live clinic metrics.",
      },
    ],
  }),
  component: RecsPage,
});

function RecsPage() {
  const { snapshot } = useClinic();
  const [open, setOpen] = useState<AiRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiRecommendationsResponse | null>(null);

  const generate = async () => {
    setLoading(true);
    try {
      const response = await fetchRecommendations({ data: snapshot });
      setResult(response);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not generate recommendations.");
    } finally {
      setLoading(false);
    }
  };

  const generatedLabel = result
    ? new Date(result.generatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AI Recommendations</h1>
          <p className="text-sm text-muted-foreground">
            {result
              ? `Generated at ${generatedLabel} from current clinic metrics`
              : "Generate Tailored Actions from your Live Clinic Snapshot"}
          </p>
        </div>
        <Button
          className="bg-gradient-primary text-primary-foreground hover:opacity-90"
          onClick={generate}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : result ? (
            <RefreshCw className="mr-2 h-4 w-4" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          {loading ? "Generating…" : result ? "Regenerate" : "Generate Recommendations"}
        </Button>
      </div>

      {!result && !loading && (
        <Card className="border-dashed shadow-elegant">
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Brain className="h-7 w-7" />
            </div>
            <div className="max-w-md space-y-2">
              <h2 className="text-lg font-semibold">No Recommendations Yet</h2>
              <p className="text-sm text-muted-foreground">
                Use the button above to analyze wait time ({snapshot.metrics.avgWaitTime} min), congestion (
                {snapshot.metrics.congestionRisk}%), and department loads — then get 3 ranked actions.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Card key={i} className="animate-pulse shadow-elegant">
              <CardHeader>
                <div className="h-4 w-24 rounded bg-muted" />
                <div className="mt-3 h-5 w-full rounded bg-muted" />
                <div className="h-4 w-3/4 rounded bg-muted" />
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {result && !loading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {result.recommendations.map((r, i) => (
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
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {r.category}
                    </Badge>
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
              <CardContent>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-between text-primary hover:text-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen(r);
                  }}
                >
                  View reasoning
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {open && (
            <>
              <SheetHeader>
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <Badge variant="outline">{open.category}</Badge>
                  <Badge variant="outline">{open.impact} impact</Badge>
                </div>
                <SheetTitle className="text-lg">{open.title}</SheetTitle>
                <SheetDescription>{open.description}</SheetDescription>
              </SheetHeader>

              <div className="mt-6 rounded-2xl border bg-gradient-surface p-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <Brain className="h-3.5 w-3.5" /> AI reasoning
                </div>
                <p className="text-sm leading-relaxed text-foreground/90">{open.reasoning}</p>
              </div>

              <div className="mt-4 rounded-2xl border bg-card p-4">
                <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Based on current signals
                </div>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li>• Avg wait: {snapshot.metrics.avgWaitTime} min ({snapshot.trend.wait})</li>
                  <li>• Congestion risk: {snapshot.metrics.congestionRisk}% ({snapshot.trend.congestion})</li>
                  <li>• Queue length: {snapshot.metrics.queueLength}</li>
                  <li>• Room utilization: {snapshot.metrics.roomUtilization}%</li>
                </ul>
              </div>

              <div className="mt-6">
                <Button variant="outline" className="w-full" onClick={() => setOpen(null)}>
                  Close
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
