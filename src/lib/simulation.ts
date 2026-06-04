import { useEffect, useState } from "react";

export type Department = "Pediatrics" | "Cardiology" | "Urgent Care" | "General" | "Radiology";

export interface SimState {
  avgWaitTime: number;
  checkedIn: number;
  activeAppointments: number;
  doctorsAvailable: number;
  doctorsTotal: number;
  roomUtilization: number;
  congestionRisk: number; // 0-100
  queueLength: number;
  estimatedDelay: number;
  // controls
  arrivalRate: number; // patients/hr
  doctors: number;
  rooms: number;
  apptDuration: number; // minutes
  nurses: number;
}

export const DEFAULT_CONTROLS = {
  arrivalRate: 18,
  doctors: 6,
  rooms: 10,
  apptDuration: 20,
  nurses: 8,
};

const HISTORY_MINUTES = 30;
const LIVE_TICK_MS = 4_000;
const HISTORY_TICK_MS = 60_000;

export type HistoryPoint = { t: string; wait: number; congestion: number; queue: number };

function formatHistoryTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function computeMetrics(c: typeof DEFAULT_CONTROLS, jitter = 0): SimState {
  const load = (c.arrivalRate * c.apptDuration) / (c.doctors * 60);
  // Map capacity load to 0–100: ~0.6 stable, ~1.0 elevated, >1.1 critical (matches dashboard tiers)
  const congestion = Math.min(100, Math.max(5, Math.round((load - 0.4) * 65 + 25 + jitter * 6)));
  const wait = Math.max(2, load * 55 + jitter * 4);
  const queue = Math.max(0, Math.round(c.arrivalRate * 0.4 * load + jitter));
  const util = Math.min(100, Math.max(30, (c.arrivalRate * c.apptDuration) / (c.rooms * 60) * 100 + jitter * 3));
  return {
    avgWaitTime: Math.round(wait),
    checkedIn: Math.round(c.arrivalRate * 1.6 + jitter * 2),
    activeAppointments: Math.min(c.doctors, Math.round(c.doctors * Math.min(1, load + 0.2))),
    doctorsAvailable: Math.max(0, c.doctors - Math.round(c.doctors * Math.min(1, load))),
    doctorsTotal: c.doctors,
    roomUtilization: Math.round(util),
    congestionRisk: Math.round(congestion),
    queueLength: queue,
    estimatedDelay: Math.round(wait * 0.6),
    ...c,
  };
}

function seedHistory(controls: typeof DEFAULT_CONTROLS, now = Date.now()): HistoryPoint[] {
  const arr: HistoryPoint[] = [];
  for (let i = HISTORY_MINUTES - 1; i >= 0; i--) {
    const d = new Date(now - i * 60_000);
    const j = Math.sin(i / 2) * 0.6 + Math.random() * 0.4;
    const s = computeMetrics(controls, j);
    arr.push({
      t: formatHistoryTime(d),
      wait: s.avgWaitTime,
      congestion: s.congestionRisk,
      queue: s.queueLength,
    });
  }
  return arr;
}

export function useLiveSim(controls = DEFAULT_CONTROLS) {
  const [state, setState] = useState<SimState>(() => computeMetrics(controls));
  const [history, setHistory] = useState<HistoryPoint[]>(() => seedHistory(controls));

  useEffect(() => {
    setState(computeMetrics(controls));
    setHistory(seedHistory(controls));

    const liveId = setInterval(() => {
      const j = (Math.random() - 0.4) * 2;
      setState(computeMetrics(controls, j));
    }, LIVE_TICK_MS);

    const historyId = setInterval(() => {
      const j = (Math.random() - 0.4) * 2;
      const next = computeMetrics(controls, j);
      setHistory((h) => [
        ...h.slice(-(HISTORY_MINUTES - 1)),
        {
          t: formatHistoryTime(new Date()),
          wait: next.avgWaitTime,
          congestion: next.congestionRisk,
          queue: next.queueLength,
        },
      ]);
    }, HISTORY_TICK_MS);

    return () => {
      clearInterval(liveId);
      clearInterval(historyId);
    };
  }, [controls.arrivalRate, controls.doctors, controls.rooms, controls.apptDuration, controls.nurses]);

  return { state, history };
}

export const DEPARTMENTS: { name: Department; load: number; color: string }[] = [
  { name: "Pediatrics", load: 82, color: "var(--color-chart-1)" },
  { name: "Cardiology", load: 64, color: "var(--color-chart-2)" },
  { name: "Urgent Care", load: 91, color: "var(--color-chart-5)" },
  { name: "General", load: 47, color: "var(--color-chart-3)" },
  { name: "Radiology", load: 38, color: "var(--color-chart-4)" },
];
