import { NextResponse } from "next/server";
import { requireFactoryGuardRole } from "@/lib/api-auth";
import { advanceIncidentLifecycle } from "@/lib/incident-store";
import type { IncidentStatus } from "@/lib/incident-lifecycle";

type RouteContext = {
  params: Promise<{ incidentId: string }>;
};

const allowedTargets = new Set<IncidentStatus>([
  "maintenance",
  "recovered",
  "closed",
]);

export async function PATCH(request: Request, context: RouteContext) {
  const authorization = await requireFactoryGuardRole();
  if (!authorization.authorized) {
    return authorization.response;
  }

  const { incidentId: rawIncidentId } = await context.params;
  const incidentId = rawIncidentId.trim();
  if (!incidentId) {
    return NextResponse.json({ error: "Incident ID is required" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Request body must be a JSON object" }, { status: 400 });
  }

  const targetStatus = (body as Record<string, unknown>).status;
  if (typeof targetStatus !== "string" || !allowedTargets.has(targetStatus as IncidentStatus)) {
    return NextResponse.json(
      { error: "Status must be maintenance, recovered, or closed" },
      { status: 400 },
    );
  }

  try {
    const incident = await advanceIncidentLifecycle(
      incidentId,
      targetStatus as Extract<IncidentStatus, "maintenance" | "recovered" | "closed">,
    );
    return NextResponse.json({ incident }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update incident lifecycle";
    const status = message === "Incident not found" ? 404 : 409;
    return NextResponse.json({ error: message }, { status });
  }
}
