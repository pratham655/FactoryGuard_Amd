import { NextResponse } from "next/server";
import { decideIncident } from "@/lib/incident-store";
import { requireFactoryGuardRole } from "@/lib/api-auth";

export async function POST(request: Request) {
  const authorization = await requireFactoryGuardRole();
  if (!authorization.authorized) {
    return authorization.response;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Request body is required" }, { status: 400 });
  }

  const payload = body as Record<string, unknown>;
  const incidentId = typeof payload.incidentId === "string" ? payload.incidentId.trim() : "";
  const decision = payload.decision;
  const reason = typeof payload.reason === "string" ? payload.reason.trim() : "";
  const { operator } = authorization.identity;

  if (!incidentId) {
    return NextResponse.json({ error: "Incident ID is required" }, { status: 400 });
  }
  if (decision !== "approve" && decision !== "reject") {
    return NextResponse.json({ error: "Decision must be approve or reject" }, { status: 400 });
  }
  if (decision === "reject" && !reason) {
    return NextResponse.json({ error: "Rejection reason is required" }, { status: 400 });
  }

  try {
    const incident = await decideIncident(incidentId, decision, operator, reason);
    return NextResponse.json({ incident }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to record decision";
    const status = message === "Incident not found" ? 404 : 409;
    return NextResponse.json({ error: message }, { status });
  }
}
