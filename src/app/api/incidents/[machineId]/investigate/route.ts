import { investigateWithAgent } from "@/lib/ai-agent";
import { addIncident } from "@/lib/incident-store";

type RouteContext = {
  params: Promise<{
    machineId: string;
  }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const { machineId } = await context.params;

  try {
    const investigation = await investigateWithAgent(machineId);
    const incident = addIncident({
      machineId: investigation.machineId,
      severity: investigation.severity,
      probableCause: investigation.probableCause,
      recommendedAction: investigation.recommendedAction,
      requiresHumanApproval: investigation.requiresHumanApproval,
    });

    return Response.json({ ...investigation, incident }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === `Machine ${machineId} not found`) {
      return Response.json({ error: "Machine not found" }, { status: 404 });
    }

    return Response.json({ error: "Unable to investigate incident" }, { status: 500 });
  }
}