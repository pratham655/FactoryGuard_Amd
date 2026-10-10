import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api-auth", () => ({
  requireFactoryGuardRole: vi.fn().mockResolvedValue({
    authorized: true,
    identity: { userId: "test-user", operator: "Test Operator", role: "employee" },
  }),
}));

const storeMocks = vi.hoisted(() => ({
  getLatestIncidentForMachine: vi.fn(),
}));

vi.mock("@/lib/incident-store", () => ({
  getLatestIncidentForMachine: storeMocks.getLatestIncidentForMachine,
}));

import { GET } from "./route";

describe("GET /api/incidents/by-machine/[machineid]", () => {
  it("returns the latest incident without caching", async () => {
    const incident = { id: "incident-1", machineId: "CNC-07", status: "awaiting_approval" };
    storeMocks.getLatestIncidentForMachine.mockResolvedValue(incident);

    const response = await GET(
      new Request("http://localhost/api/incidents/by-machine/CNC-07"),
      { params: Promise.resolve({ machineid: "CNC-07" }) },
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.json()).toEqual({ incident });
    expect(storeMocks.getLatestIncidentForMachine).toHaveBeenCalledWith("CNC-07");
  });

  it("returns 500 when the store fails", async () => {
    storeMocks.getLatestIncidentForMachine.mockRejectedValue(new Error("database unavailable"));

    const response = await GET(
      new Request("http://localhost/api/incidents/by-machine/CNC-07"),
      { params: Promise.resolve({ machineid: "CNC-07" }) },
    );

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Unable to retrieve the machine incident." });
  });
});
