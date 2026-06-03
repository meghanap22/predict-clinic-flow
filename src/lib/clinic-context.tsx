import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { ClinicControls, ClinicSnapshot } from "@/lib/clinic-types";
import { buildClinicSnapshot, effectiveControls } from "@/lib/clinic-snapshot";
import { DEFAULT_CONTROLS, useLiveSim } from "@/lib/simulation";

interface ClinicContextValue {
  controls: ClinicControls;
  setControls: (patch: Partial<ClinicControls>) => void;
  resetControls: () => void;
  snapshot: ClinicSnapshot;
  state: ReturnType<typeof useLiveSim>["state"];
  history: ReturnType<typeof useLiveSim>["history"];
}

const defaultClinicControls: ClinicControls = {
  arrivalRate: DEFAULT_CONTROLS.arrivalRate,
  doctors: DEFAULT_CONTROLS.doctors,
  rooms: DEFAULT_CONTROLS.rooms,
  apptDuration: DEFAULT_CONTROLS.apptDuration,
  nurses: DEFAULT_CONTROLS.nurses,
  overflow: false,
};

const ClinicContext = createContext<ClinicContextValue | null>(null);

export function ClinicProvider({ children }: { children: ReactNode }) {
  const [controls, setControlsState] = useState<ClinicControls>(defaultClinicControls);
  const effective = useMemo(() => effectiveControls(controls), [controls]);
  const { state, history } = useLiveSim(effective);

  const snapshot = useMemo(
    () => buildClinicSnapshot(state, controls, history),
    [state, controls, history],
  );

  const value = useMemo<ClinicContextValue>(
    () => ({
      controls,
      setControls: (patch) => setControlsState((prev) => ({ ...prev, ...patch })),
      resetControls: () => setControlsState(defaultClinicControls),
      snapshot,
      state,
      history,
    }),
    [controls, snapshot, state, history],
  );

  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>;
}

export function useClinic() {
  const ctx = useContext(ClinicContext);
  if (!ctx) throw new Error("useClinic must be used within ClinicProvider");
  return ctx;
}
