import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("GET /api/factory/status", () => {
  it("returns the current factory summary and machine status", async () => {
    const response = await GET();

    expect(response.status).toBe(200);

    const data = await response.json();

    expect(data.summary.totalMachines).toBe(7);
    expect(data.summary.normalMachines).toBe(5);
    expect(data.summary.warningMachines).toBe(1);
    expect(data.summary.criticalMachines).toBe(1);
    expect(data.summary.activeIncidents).toBe(2);

    expect(data.machines).toHaveLength(7);
  });

  it("includes CNC-07 as a critical machine", async () => {
    const response = await GET();
    const data = await response.json();

    const cnc07 = data.machines.find(
      (machine: { id: string }) => machine.id === "CNC-07",
    );

    expect(cnc07).toBeDefined();
    expect(cnc07.status).toBe("critical");
  });
});