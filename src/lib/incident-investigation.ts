import { getFactoryMachines } from "./factory-data";
import type { IncidentSeverity } from "./incident-detector";
import { getMaintenanceHistory } from "./maintenance-history";

export type IncidentInvestigation = {
  machineId: string;
  severity: IncidentSeverity;
  probableCause: string | null;
  confidence: number;
  evidence: string[];
  recommendedAction: string;
  requiresHumanApproval: boolean;
};

export function investigateIncident(
  machineId: string,
): IncidentInvestigation {
  const machine = getFactoryMachines().find(
    (machine) => machine.id === machineId,
  );

  if (!machine) {
    throw new Error(`Machine ${machineId} not found`);
  }

  const { telemetry, status } = machine;
  const maintenanceHistory = getMaintenanceHistory(machineId);

  const maintenanceEvidence = maintenanceHistory.map(
    (record) =>
      `Maintenance on ${record.date}: ${record.issue}. Action: ${record.action}.`,
  );

  if (status === "critical") {
    return {
      machineId,
      severity: status,
      probableCause: "Possible spindle bearing degradation",
      confidence: 0.92,
      evidence: [
        `Temperature reached ${telemetry.temperature}°C`,
        `Vibration reached ${telemetry.vibration} mm/s`,
        `Machine reported error code ${telemetry.errorCode ?? "none"}`,
        `Motor current reached ${telemetry.motorCurrent} A`,
        ...maintenanceEvidence,
      ],
      recommendedAction:
        "Stop the machine and inspect the spindle bearing before returning it to production.",
      requiresHumanApproval: true,
    };
  }

  if (status === "warning") {
    return {
      machineId,
      severity: status,
      probableCause: "Abnormal machine operating conditions detected",
      confidence: 0.75,
      evidence: [
        `Temperature: ${telemetry.temperature}°C`,
        `Vibration: ${telemetry.vibration} mm/s`,
        ...maintenanceEvidence,
      ],
      recommendedAction:
        "Schedule a maintenance inspection and continue monitoring the machine.",
      requiresHumanApproval: false,
    };
  }

  return {
    machineId,
    severity: "normal",
    probableCause: null,
    confidence: 0.99,
    evidence: [
      `Temperature: ${telemetry.temperature}°C`,
      `Vibration: ${telemetry.vibration} mm/s`,
      "No active machine error reported",
      ...maintenanceEvidence,
    ],
    recommendedAction: "No intervention required.",
    requiresHumanApproval: false,
  };
}