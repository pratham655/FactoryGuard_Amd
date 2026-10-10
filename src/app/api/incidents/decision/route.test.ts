import { describe, expect, it } from "vitest";
import { POST } from "./route";
import { addIncident } from "@/lib/incident-store";

function makeIncident() {
  return addIncident({
    machineId: "CNC-07",
    severity: "critical",
    probableCause: "Spindle bearing degradation",
    recommendedAction: "Stop the machine and inspect the spindle bearing.",
    requiresHumanApproval: true,
  });
}

describe("POST /api/incidents/decision", () => {
  it("records an approval with operator identity", async () => {
    const incident = makeIncident();
    const response = await POST(new Request("http://localhost/api/incidents/decision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ incidentId: incident.id, decision: "approve", operator: "OP-104" }),
    }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.incident.status).toBe("approved");
    expect(body.incident.approvedBy).toBe("OP-104");
    expect(body.incident.history).toEqual(["detected", "investigating", "recommended", "awaiting_approval", "approved"]);
  });

  it("requires an operator identity", async () => {
    const incident = makeIncident();
    const response = await POST(new Request("http://localhost/api/incidents/decision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ incidentId: incident.id, decision: "approve", operator: " " }),
    }));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Operator identity is required" });
  });

  it("requires a rejection reason", async () => {
    const incident = makeIncident();
    const response = await POST(new Request("http://localhost/api/incidents/decision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ incidentId: incident.id, decision: "reject", operator: "OP-104", reason: " " }),
    }));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Rejection reason is required" });
  });

  it("rejects a second decision for an already decided incident", async () => {
    const incident = makeIncident();
    const first = await POST(new Request("http://localhost/api/incidents/decision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ incidentId: incident.id, decision: "approve", operator: "OP-104" }),
    }));
    expect(first.status).toBe(200);

    const second = await POST(new Request("http://localhost/api/incidents/decision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ incidentId: incident.id, decision: "reject", operator: "OP-105", reason: "Need more evidence" }),
    }));

    expect(second.status).toBe(409);
  });

  it("returns 404 for an unknown incident", async () => {
    const response = await POST(new Request("http://localhost/api/incidents/decision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ incidentId: "missing-incident", decision: "approve", operator: "OP-104" }),
    }));

    expect(response.status).toBe(404);
  });
});
