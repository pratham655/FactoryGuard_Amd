import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { decideIncident } from "@/lib/incident-store";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const user = await currentUser();
  if (!user || user.id !== userId) {
    return NextResponse.json({ error: "Unable to verify signed-in user" }, { status: 401 });
  }

  const role = user.publicMetadata?.role;
  if (role !== "owner" && role !== "employee") {
    return NextResponse.json(
      { error: "Your account has no FactoryGuard role. Ask the owner to assign owner or employee access." },
      { status: 403 },
    );
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
  const operator = user.fullName?.trim() || user.primaryEmailAddress?.emailAddress || userId;

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
