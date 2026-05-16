import { type ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: ReactNode;
  unit?: string;
  hint?: string;
  icon?: ReactNode;
  trend?: number;
  accent?: "primary" | "teal" | "success" | "warning" | "destructive";
}

const accentMap = {
  primary: "from-primary/15 to-primary/0 text-primary",
  teal: "from-teal/20 to-teal/0 text-teal",
  success: "from-success/20 to-success/0 text-success",
  warning: "from-warning/25 to-warning/0 text-warning",
  destructive: "from-destructive/20 to-destructive/0 text-destructive",
};

export function KpiCard({ label, value, unit, hint, icon, trend, accent = "primary" }: Props) {
  return (
    <Card className="group relative overflow-hidden border-border/60 bg-card p-5 shadow-elegant transition-all hover:-translate-y-0.5 hover:shadow-glow">
      <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br opacity-60", accentMap[accent])} />
      <div className="relative flex items-start justify-between">
        <div className="space-y-1">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="flex items-baseline gap-1">
            <div className="text-3xl font-semibold tracking-tight tabular-nums">{value}</div>
            {unit && <div className="text-sm text-muted-foreground">{unit}</div>}
          </div>
          {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
        </div>
        {icon && (
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-background/60 backdrop-blur", accentMap[accent].split(" ").pop())}>
            {icon}
          </div>
        )}
      </div>
      {typeof trend === "number" && (
        <div className="relative mt-3 text-xs">
          <span className={cn("font-medium", trend >= 0 ? "text-success" : "text-destructive")}>
            {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}%
          </span>{" "}
          <span className="text-muted-foreground">vs last hour</span>
        </div>
      )}
    </Card>
  );
}
