import { investigateWithAgent } from "@/lib/ai-agent";
import { addIncident } from "@/lib/incident-store";
import { requireFactoryGuardRole } from "@/lib/api-auth";

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
    const investigation = await investigateWithAgent(normalizedMachineId);
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
