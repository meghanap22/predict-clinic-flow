"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  getDoctorById,
  SLOT_TYPE_LABELS,
  type DoctorScheduleEntry,
  type ScheduleSlotType,
} from "@/lib/doctor-schedule";
import { cn } from "@/lib/utils";
import { CalendarClock, ChevronRight } from "lucide-react";

const slotStyles: Record<ScheduleSlotType, string> = {
  appointment: "border-primary/30 bg-primary/10 text-primary",
  break: "border-muted-foreground/25 bg-muted/50 text-muted-foreground",
  admin: "border-teal/30 bg-teal/10 text-teal",
  block: "border-warning/30 bg-warning/10 text-warning",
};

export function DoctorDaySheet({
  doctorId,
  open,
  onOpenChange,
}: {
  doctorId: string | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const doctor = doctorId ? getDoctorById(doctorId) : undefined;
  if (!doctor) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="sm:max-w-md" />
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="shrink-0 border-b px-6 py-4 pr-12 text-left">
          <SheetTitle>{doctor.name}</SheetTitle>
          <SheetDescription className="mt-1.5">
            {doctor.department} · {doctor.shift}
          </SheetDescription>
          <div className="mt-2 flex items-center gap-2">
            <Badge
              variant={
                doctor.sessionLoad > 85 ? "destructive" : doctor.sessionLoad > 70 ? "outline" : "secondary"
              }
            >
              {doctor.sessionLoad}% session load
            </Badge>
            <span className="text-xs text-muted-foreground">
              {doctor.todaySchedule.length} blocks today
            </span>
          </div>
        </SheetHeader>

        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-2 px-6 py-4">
            {doctor.todaySchedule.map((slot, i) => (
              <div
                key={`${slot.start}-${i}`}
                className="flex gap-3 rounded-xl border bg-card/50 p-3"
              >
                <div className="w-14 shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
                  {slot.start}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                        slotStyles[slot.type],
                      )}
                    >
                      {SLOT_TYPE_LABELS[slot.type]}
                    </span>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {slot.start}–{slot.end}
                    </span>
                  </div>
                  <p className="text-sm font-medium leading-snug">{slot.title}</p>
                  {slot.room && <p className="text-xs text-muted-foreground">{slot.room}</p>}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="shrink-0 border-t px-6 py-4">
          <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function DoctorScheduleCard({
  doctor,
  highlighted,
  onSelect,
}: {
  doctor: DoctorScheduleEntry;
  highlighted?: boolean;
  onSelect: () => void;
}) {
  const nextSlot = doctor.todaySchedule.find((s) => s.type === "appointment");

  return (
    <button
      type="button"
      id={doctor.id}
      onClick={onSelect}
      className={cn(
        "group w-full scroll-mt-24 rounded-xl border bg-card p-3 text-left transition-all",
        "hover:border-primary/40 hover:bg-accent/30",
        highlighted && "ring-2 ring-primary shadow-glow",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <div className="text-sm font-medium">{doctor.name}</div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
          </div>
          <div className="text-xs text-muted-foreground">{doctor.department}</div>
        </div>
        <Badge
          variant={
            doctor.sessionLoad > 85 ? "destructive" : doctor.sessionLoad > 70 ? "outline" : "secondary"
          }
        >
          {doctor.sessionLoad}%
        </Badge>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-primary"
          style={{ width: `${doctor.sessionLoad}%` }}
        />
      </div>
      {nextSlot && (
        <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
          <CalendarClock className="h-3 w-3 shrink-0" />
          <span className="truncate">
            Next: {nextSlot.start} {nextSlot.title}
          </span>
        </p>
      )}
      <p className="mt-1 text-[10px] text-primary/80">Tap to view today&apos;s schedule</p>
    </button>
  );
}
