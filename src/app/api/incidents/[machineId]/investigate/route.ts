import { investigateWithAgent } from "@/lib/ai-agent";
import { addIncident } from "@/lib/incident-store";
import { requireFactoryGuardRole } from "@/lib/api-auth";
import { getSimulationState } from "@/lib/simulation-store";
import { getFactoryMachines } from "@/lib/factory-data";
import type { MachineTelemetry } from "@/lib/incident-detector";

type RouteContext = {
  params: Promise<{
    machineId: string;
  }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const authorization = await requireFactoryGuardRole();
  if (!authorization.authorized) {
    return authorization.response;
  }

  const { machineId } = await context.params;
  const normalizedMachineId = machineId.trim();

  if (!normalizedMachineId) {
    return Response.json({ error: "Machine ID is required" }, { status: 400 });
  }

  try {
    const baselineMachine = getFactoryMachines().find((machine) => machine.id === normalizedMachineId);
    if (!baselineMachine) {
      return Response.json({ error: "Machine not found" }, { status: 404 });
    }

    const live = getSimulationState().simulation.machines[normalizedMachineId];
    const scenarioErrorCodes: Record<string, string> = {
      "spindle-degradation": "E-204",
      "thermal-overload": "E-301",
      "vibration-anomaly": "E-411",
      "motor-overload": "E-502",
      "cooling-failure": "E-601",
      "lubrication-issue": "E-702",
    };
    const telemetry: MachineTelemetry = live
      ? {
          ...baselineMachine.telemetry,
          temperature: live.temperature,
          vibration: live.vibration,
          motorCurrent: live.motorCurrent,
          errorCode: live.scenario
            ? scenarioErrorCodes[live.scenario] ?? "SIM-FAULT"
            : baselineMachine.telemetry.errorCode,
        }
      : baselineMachine.telemetry;

    const investigation = await investigateWithAgent(normalizedMachineId, telemetry);
    const incident = await addIncident({
      machineId: investigation.machineId,
      severity: investigation.severity,
      probableCause: investigation.probableCause,
      recommendedAction: investigation.recommendedAction,
      requiresHumanApproval: investigation.requiresHumanApproval,
    });

    return Response.json({ ...investigation, incident }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === `Machine ${normalizedMachineId} not found`) {
      return Response.json({ error: "Machine not found" }, { status: 404 });
    }

    console.error("Unable to investigate incident:", error);
    return Response.json({ error: "Unable to investigate incident" }, { status: 500 });
  }
}
