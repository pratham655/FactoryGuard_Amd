import { beforeEach, describe, expect, it } from "vitest";
import { POST } from "./route";
import { addIncident } from "@/lib/incident-store";

async function makeIncident() {
  return await addIncident({
    machineId: "CNC-07",
    severity: "critical",
    probableCause: "Spindle bearing degradation",
    recommendedAction: "Stop the machine and inspect the spindle bearing.",
    requiresHumanApproval: true,
  });
}

describe("POST /api/incidents/decision in demo mode", () => {
  beforeEach(() => {
    // Each test creates its own incident; no identity-provider mock is needed.
  });

  it("allows demo operator access without external authentication", async () => {
    const response = await POST(new Request("http://localhost/api/incidents/decision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ incidentId: "missing-incident", decision: "approve" }),
    }));
    expect(response.status).toBe(404);
  });

  it("records approval under the fixed demo operator identity", async () => {
    const incident = await makeIncident();
    const response = await POST(new Request("http://localhost/api/incidents/decision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ incidentId: incident.id, decision: "approve", operator: "FORGED-OPERATOR" }),
    }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.incident.status).toBe("approved");
    expect(body.incident.approvedBy).toBe("Demo Operator");
    expect(body.incident.history).toEqual(["detected", "investigating", "recommended", "awaiting_approval", "approved"]);
  });

  it("requires a rejection reason", async () => {
    const incident = await makeIncident();
    const response = await POST(new Request("http://localhost/api/incidents/decision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ incidentId: incident.id, decision: "reject", reason: " " }),
    }));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Rejection reason is required" });
  });

  it("rejects a second decision for an already decided incident", async () => {
    const incident = await makeIncident();
    const first = await POST(new Request("http://localhost/api/incidents/decision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ incidentId: incident.id, decision: "approve" }),
    }));
    expect(first.status).toBe(200);

    const second = await POST(new Request("http://localhost/api/incidents/decision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ incidentId: incident.id, decision: "reject", reason: "Need more evidence" }),
    }));

    expect(second.status).toBe(409);
  });

  it("allows only one of two concurrent decisions to win", async () => {
    const incident = await makeIncident();
    const makeRequest = (decision: "approve" | "reject") =>
      POST(new Request("http://localhost/api/incidents/decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          incidentId: incident.id,
          decision,
          reason: decision === "reject" ? "Second inspection required" : undefined,
        }),
      }));

    const responses = await Promise.all([
      makeRequest("approve"),
      makeRequest("reject"),
    ]);

    expect(responses.map((response) => response.status).sort()).toEqual([200, 409]);
    const winningResponse = responses.find((response) => response.status === 200);
    expect(winningResponse).toBeDefined();
    const body = await winningResponse!.json();
    expect(["approved", "rejected"]).toContain(body.incident.status);
  });

  it("returns 404 for an unknown incident", async () => {
    const response = await POST(new Request("http://localhost/api/incidents/decision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ incidentId: "missing-incident", decision: "approve" }),
    }));

    expect(response.status).toBe(404);
  });
});
