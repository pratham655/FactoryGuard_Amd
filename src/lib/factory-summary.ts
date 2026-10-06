import { getFactoryMachines } from "./factory-data";

export type FactoryStatus = "healthy" | "attention-required";

export type FactorySummary = {
  totalMachines: number;
  normalMachines: number;
  warningMachines: number;
  criticalMachines: number;
  activeIncidents: number;
  factoryStatus: FactoryStatus;
};

export function getFactorySummary(): FactorySummary {
  const machines = getFactoryMachines();

  const normalMachines = machines.filter(
    (machine) => machine.status === "normal",
  ).length;

  const warningMachines = machines.filter(
    (machine) => machine.status === "warning",
  ).length;

  const criticalMachines = machines.filter(
    (machine) => machine.status === "critical",
  ).length;

  const activeIncidents = warningMachines + criticalMachines;

  const factoryStatus =
    criticalMachines > 0 || warningMachines > 0
      ? "attention-required"
      : "healthy";

  return {
    totalMachines: machines.length,
    normalMachines,
    warningMachines,
    criticalMachines,
    activeIncidents,
    factoryStatus,
  };
}