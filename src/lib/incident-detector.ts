export type MachineTelemetry = {
  temperature: number;
  vibration: number;
  pressure: number;
  motorCurrent: number;
  errorCode: string | null;
};

export type IncidentSeverity = "normal" | "warning" | "critical";

export type IncidentDetectionResult = {
  isIncident: boolean;
  severity: IncidentSeverity;
  machineIssue: string | null;
};

export function detectIncident(
  telemetry: MachineTelemetry,
): IncidentDetectionResult {
  const { temperature, vibration, errorCode } = telemetry;

  const criticalTemperature = temperature >= 90;
  const criticalVibration = vibration >= 8;

  if (criticalTemperature && criticalVibration) {
    return {
      isIncident: true,
      severity: "critical",
      machineIssue: "Possible spindle bearing degradation",
    };
  }

  const warningTemperature = temperature >= 80;
  const warningVibration = vibration >= 5;
  const hasError = errorCode !== null;

  if (warningTemperature || warningVibration || hasError) {
    return {
      isIncident: true,
      severity: "warning",
      machineIssue: "Abnormal machine operating conditions detected",
    };
  }

  return {
    isIncident: false,
    severity: "normal",
    machineIssue: null,
  };
}