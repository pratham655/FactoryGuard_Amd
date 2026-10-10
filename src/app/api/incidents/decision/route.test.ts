import { beforeEach, describe, expect, it, vi } from "vitest";

const clerkMocks = vi.hoisted(() => ({
  auth: vi.fn(),
  currentUser: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: clerkMocks.auth,
  currentUser: clerkMocks.currentUser,
}));
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

describe("POST /api/incidents/decision", () => {
  beforeEach(() => {
    clerkMocks.auth.mockResolvedValue({ userId: "user_test_123" });
    clerkMocks.currentUser.mockResolvedValue({
      id: "user_test_123",
      fullName: "Factory Operator",
      primaryEmailAddress: { emailAddress: "operator@example.com" },
      publicMetadata: { role: "employee" },
    });
  });

  it("rejects unauthenticated requests", async () => {
    clerkMocks.auth.mockResolvedValueOnce({ userId: null });
    const response = await POST(new Request("http://localhost/api/incidents/decision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ incidentId: "anything", decision: "approve" }),
    }));
    expect(response.status).toBe(401);
  });

  it("rejects authenticated users without a FactoryGuard role", async () => {
    clerkMocks.currentUser.mockResolvedValueOnce({
      id: "user_test_123",
      fullName: "Unknown User",
      primaryEmailAddress: { emailAddress: "unknown@example.com" },
      publicMetadata: {},
    });
    const response = await POST(new Request("http://localhost/api/incidents/decision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ incidentId: "anything", decision: "approve" }),
    }));
    expect(response.status).toBe(403);
  });
  it("records an approval with operator identity", async () => {
    const incident = await makeIncident();
    const response = await POST(new Request("http://localhost/api/incidents/decision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ incidentId: incident.id, decision: "approve", operator: "FORGED-OPERATOR" }),
    }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.incident.status).toBe("approved");
    expect(body.incident.approvedBy).toBe("Factory Operator");
    expect(body.incident.history).toEqual(["detected", "investigating", "recommended", "awaiting_approval", "approved"]);
  });

  it("requires a rejection reason", async () => {
    const incident = await makeIncident();
    const response = await POST(new Request("http://localhost/api/incidents/decision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ incidentId: incident.id, decision: "reject", operator: "OP-104", reason: " " }),
    }));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Rejection reason is required" });
  });

  it("rejects a second decision for an already decided incident", async () => {
    const incident = await makeIncident();
    const first = await POST(new Request("http://localhost/api/incidents/decision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ incidentId: incident.id, decision: "approve", operator: "OP-104" }),
    }));
    expect(first.status).toBe(200);

    const second = await POST(new Request("http://localhost/api/incidents/decision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ incidentId: incident.id, decision: "reject", operator: "FORGED-OPERATOR", reason: "Need more evidence" }),
    }));

    expect(second.status).toBe(409);
  });

  it("returns 404 for an unknown incident", async () => {
    const response = await POST(new Request("http://localhost/api/incidents/decision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ incidentId: "missing-incident", decision: "approve", operator: "FORGED-OPERATOR" }),
    }));

    expect(response.status).toBe(404);
  });
});
