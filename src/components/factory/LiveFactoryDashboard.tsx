"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FactoryFloor } from "@/components/factory/FactoryFloor";
import { FactoryKPIs } from "@/components/factory/FactoryKPIs";
import { HeroIncidentBanner } from "@/components/factory/HeroIncidentBanner";
import { detectIncident } from "@/lib/incident-detector";
import type { Machine } from "@/lib/factory-data";
import type { FactorySummary } from "@/lib/factory-summary";
import type { SimulationState } from "@/lib/simulation-engine";

type SimulationResponse = {
  simulation: SimulationState;
  running: boolean;
};

export function LiveFactoryDashboard({
  initialMachines,
}: {
  initialMachines: Machine[];
}) {
  const [simulation, setSimulation] = useState<SimulationState | null>(null);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/simulation/state", { cache: "no-store" });
      if (!response.ok) return;
      const payload = (await response.json()) as SimulationResponse;
      setSimulation(payload.simulation);
    } catch {
      // Keep the last known snapshot if a transient refresh fails.
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 1500);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const machines = useMemo(
    () =>
      initialMachines.map((machine) => {
        const live = simulation?.machines[machine.id];
        if (!live) return machine;

        const telemetry = {
          ...machine.telemetry,
          temperature: live.temperature,
          vibration: live.vibration,
          motorCurrent: live.motorCurrent,
          errorCode:
            live.scenario === null
              ? machine.telemetry.errorCode
              : live.scenario === "spindle-degradation"
                ? "E-204"
                : live.scenario === "thermal-overload"
                  ? "E-301"
                  : live.scenario === "vibration-anomaly"
                    ? "E-411"
                    : live.scenario === "motor-overload"
                      ? "E-502"
                      : live.scenario === "cooling-failure"
                        ? "E-601"
                        : "E-702",
        };
        return {
          ...machine,
          telemetry,
          status: detectIncident(telemetry).severity,
        };
      }),
    [initialMachines, simulation],
  );

  const summary = useMemo<FactorySummary>(() => {
    const normalMachines = machines.filter((machine) => machine.status === "normal").length;
    const warningMachines = machines.filter((machine) => machine.status === "warning").length;
    const criticalMachines = machines.filter((machine) => machine.status === "critical").length;
    return {
      totalMachines: machines.length,
      normalMachines,
      warningMachines,
      criticalMachines,
      activeIncidents: warningMachines + criticalMachines,
      factoryStatus: warningMachines + criticalMachines > 0 ? "attention-required" : "healthy",
    };
  }, [machines]);

  const criticalMachine =
    machines.find((machine) => machine.status === "critical") ??
    machines.find((machine) => machine.status === "warning");

  return (
    <>
      <FactoryKPIs summary={summary} />
      <HeroIncidentBanner criticalMachine={criticalMachine} />
      <FactoryFloor machines={machines} />
    </>
  );
}
