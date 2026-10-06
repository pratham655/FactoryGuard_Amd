import { describe, expect, it } from "vitest";
import { getFactorySummary } from "./factory-summary";

describe("getFactorySummary", () => {
  it("summarizes the current factory machine status", () => {
    const summary = getFactorySummary();

    expect(summary.totalMachines).toBe(7);
    expect(summary.normalMachines).toBe(5);
    expect(summary.warningMachines).toBe(1);
    expect(summary.criticalMachines).toBe(1);
    expect(summary.activeIncidents).toBe(2);
  });

  it("marks the factory as requiring attention when a critical machine exists", () => {
    const summary = getFactorySummary();

    expect(summary.factoryStatus).toBe("attention-required");
  });
});