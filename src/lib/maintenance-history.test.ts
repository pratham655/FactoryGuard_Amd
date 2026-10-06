import { describe, expect, it } from "vitest";
import { getMaintenanceHistory } from "./maintenance-history";

describe("getMaintenanceHistory", () => {
  it("returns maintenance records for CNC-07", () => {
    const history = getMaintenanceHistory("CNC-07");

    expect(history.length).toBeGreaterThan(0);
    expect(history[0]).toHaveProperty("date");
    expect(history[0]).toHaveProperty("issue");
    expect(history[0]).toHaveProperty("action");
    expect(history[0]).toHaveProperty("downtimeMinutes");
  });

  it("returns an empty history for a machine with no recorded maintenance", () => {
    const history = getMaintenanceHistory("CNC-03");

    expect(history).toEqual([]);
  });
});