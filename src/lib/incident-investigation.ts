
import { getFactoryMachines } from "./factory-data";
import { detectIncident, type IncidentSeverity, type MachineTelemetry } from "./incident-detector";
import { getMaintenanceHistory } from "./maintenance-history";
import { retrieveEvidence } from "./evidence-retriever";

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
  telemetryOverride?: MachineTelemetry,
): IncidentInvestigation {
  const machine = getFactoryMachines().find(
    (item) => item.id === machineId,
  );

  if (!machine) {
    throw new Error(`Machine ${machineId} not found`);
  }

  const telemetry = telemetryOverride ?? machine.telemetry;
  const status = detectIncident(telemetry).severity;

  const maintenanceHistory = getMaintenanceHistory(machineId);

  const maintenanceEvidence = maintenanceHistory.map(
    (record) =>
      `Maintenance on ${record.date}: ${record.issue}. ` +
      `Action: ${record.action}.`,
  );

  const probableCause =
    status === "critical"
      ? "Possible spindle bearing degradation"
      : status === "warning"
        ? "Abnormal machine operating conditions detected"
        : null;

  // Retrieve supporting documents for active incidents only.
  const query =
    status === "critical"
      ? `spindle bearing degradation vibration ${telemetry.errorCode ?? ""} temperature`
      : status === "warning"
        ? `temperature vibration maintenance ${telemetry.errorCode ?? ""}`
        : "";

  const retrievedEvidence =
    query.length > 0
      ? retrieveEvidence(query, machineId, 5)
      : [];

  const retrievedEvidenceLines = retrievedEvidence.map(
    (item) =>
      `Retrieved source [${item.sourceId}] (${item.source}): ` +
      `${item.title}. ${item.content}`,
  );

  const baseEvidence = [
    `Temperature: ${telemetry.temperature}°C`,
    `Vibration: ${telemetry.vibration} mm/s`,
  ];

  if (status === "critical") {
    return {
      machineId,
      severity: status,
      probableCause,
      confidence: 0.92,
      evidence: [
        `Temperature reached ${telemetry.temperature}°C`,
        `Vibration reached ${telemetry.vibration} mm/s`,
        `Machine reported error code ${telemetry.errorCode ?? "none"}`,
        `Motor current reached ${telemetry.motorCurrent} A`,
        ...maintenanceEvidence,
        ...retrievedEvidenceLines,
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
      probableCause,
      confidence: 0.75,
      evidence: [
        ...baseEvidence,
        ...maintenanceEvidence,
        ...retrievedEvidenceLines,
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
      ...baseEvidence,
      "No active machine error reported",
      ...maintenanceEvidence,
    ],
    recommendedAction: "No intervention required.",
    requiresHumanApproval: false,
  };
}
