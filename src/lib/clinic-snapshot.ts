import type { ClinicControls, ClinicSnapshot } from "./clinic-types";
import type { SimState } from "./simulation";
import { DOCTOR_SCHEDULE } from "./doctor-schedule";
import { DEPARTMENTS } from "./simulation";

type HistoryPoint = ClinicSnapshot["recentHistory"][number];

function trend(values: number[]): "rising" | "falling" | "stable" {
  if (values.length < 2) return "stable";
  const slice = values.slice(-5);
  const delta = slice[slice.length - 1] - slice[0];
  if (delta > 3) return "rising";
  if (delta < -3) return "falling";
  return "stable";
}

export function buildClinicSnapshot(
  metrics: SimState,
  controls: ClinicControls,
  history: HistoryPoint[],
): ClinicSnapshot {
  return {
    timestamp: new Date().toISOString(),
    metrics: {
      avgWaitTime: metrics.avgWaitTime,
      checkedIn: metrics.checkedIn,
      activeAppointments: metrics.activeAppointments,
      doctorsAvailable: metrics.doctorsAvailable,
      doctorsTotal: metrics.doctorsTotal,
      roomUtilization: metrics.roomUtilization,
      congestionRisk: metrics.congestionRisk,
      queueLength: metrics.queueLength,
      estimatedDelay: metrics.estimatedDelay,
    },
    controls,
    departments: DEPARTMENTS.map((d) => ({ name: d.name, load: d.load })),
    doctorSchedule: DOCTOR_SCHEDULE.map((d) => ({
      id: d.id,
      name: d.name,
      department: d.department,
      sessionLoad: d.sessionLoad,
      shift: d.shift,
      todaySchedule: d.todaySchedule,
    })),
    trend: {
      wait: trend(history.map((h) => h.wait)),
      congestion: trend(history.map((h) => h.congestion)),
    },
    recentHistory: history.slice(-8),
  };
}

export function effectiveControls(controls: ClinicControls) {
  return {
    arrivalRate: controls.arrivalRate,
    doctors: controls.doctors + (controls.overflow ? 1 : 0),
    rooms: controls.rooms + (controls.overflow ? 2 : 0),
    apptDuration: controls.apptDuration,
    nurses: controls.nurses,
  };
}
