import { NextResponse } from "next/server";
import { decideIncident } from "@/lib/incident-store";

type RouteContext = { params: Promise<{ incidentId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { incidentId } = await context.params;
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Request body must be an object" }, { status: 400 });
  }

  const payload = body as Record<string, unknown>;
  const decision = payload.decision;
  const operator = typeof payload.operator === "string" ? payload.operator.trim() : "";
  const reason = typeof payload.reason === "string" ? payload.reason.trim() : "";

  if (decision !== "approve" && decision !== "reject") {
    return NextResponse.json({ error: "Decision must be approve or reject" }, { status: 400 });
  }
  if (!operator) {
    return NextResponse.json({ error: "Operator identity is required" }, { status: 400 });
  }
  if (decision === "reject" && !reason) {
    return NextResponse.json({ error: "Rejection reason is required" }, { status: 400 });
  }

  try {
    const incident = decideIncident(
      incidentId,
      decision,
      operator,
      decision === "reject" ? reason : undefined,
    );
    return NextResponse.json({ incident }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to record decision";
    const status = message === "Incident not found" ? 404 : 409;
    return NextResponse.json({ error: message }, { status });
  }
}
