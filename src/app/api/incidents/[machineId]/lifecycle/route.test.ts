import { beforeEach, describe, expect, it, vi } from "vitest";

const authMocks = vi.hoisted(() => ({
  requireFactoryGuardRole: vi.fn(),
  advanceIncidentLifecycle: vi.fn(),
}));

vi.mock("@/lib/api-auth", () => ({
  requireFactoryGuardRole: authMocks.requireFactoryGuardRole,
}));
vi.mock("@/lib/incident-store", () => ({
  advanceIncidentLifecycle: authMocks.advanceIncidentLifecycle,
}));

import { PATCH } from "./route";

describe("PATCH /api/incidents/[machineId]/lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.requireFactoryGuardRole.mockResolvedValue({
      authorized: true,
      identity: { userId: "operator-1", operator: "Test Operator", role: "employee" },
    });
  });

  it("requires authorization", async () => {
    authMocks.requireFactoryGuardRole.mockResolvedValueOnce({
      authorized: false,
      response: Response.json({ error: "Authentication required" }, { status: 401 }),
    });

    const response = await PATCH(
      new Request("http://localhost/api/incidents/i-1/lifecycle", {
        method: "PATCH", body: JSON.stringify({ status: "maintenance" }),
      }),
      { params: Promise.resolve({ machineId: "i-1" }) },
    );

    expect(response.status).toBe(401);
    expect(authMocks.advanceIncidentLifecycle).not.toHaveBeenCalled();
  });

  it("advances to maintenance", async () => {
    authMocks.advanceIncidentLifecycle.mockResolvedValue({
      id: "i-1", status: "maintenance", history: ["awaiting_approval", "approved", "maintenance"],
    });

    const response = await PATCH(
      new Request("http://localhost/api/incidents/i-1/lifecycle", {
        method: "PATCH", body: JSON.stringify({ status: "maintenance" }),
      }),
      { params: Promise.resolve({ machineId: "i-1" }) },
    );

    expect(response.status).toBe(200);
    expect(authMocks.advanceIncidentLifecycle).toHaveBeenCalledWith("i-1", "maintenance");
  });

  it("rejects unsupported lifecycle targets", async () => {
    const response = await PATCH(
      new Request("http://localhost/api/incidents/i-1/lifecycle", {
        method: "PATCH", body: JSON.stringify({ status: "approved" }),
      }),
      { params: Promise.resolve({ machineId: "i-1" }) },
    );

    expect(response.status).toBe(400);
    expect(authMocks.advanceIncidentLifecycle).not.toHaveBeenCalled();
  });

  it("returns conflict when the lifecycle transition is invalid", async () => {
    authMocks.advanceIncidentLifecycle.mockRejectedValue(
      new Error("Human approval is required before maintenance"),
    );

    const response = await PATCH(
      new Request("http://localhost/api/incidents/i-1/lifecycle", {
        method: "PATCH", body: JSON.stringify({ status: "maintenance" }),
      }),
      { params: Promise.resolve({ machineId: "i-1" }) },
    );

    expect(response.status).toBe(409);
  });
});
