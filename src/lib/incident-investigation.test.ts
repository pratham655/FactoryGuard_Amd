import { describe, expect, it } from "vitest";
import { investigateIncident } from "./incident-investigation";

describe("investigateIncident", () => {
  it("investigates the CNC-07 critical incident", () => {
    const investigation = investigateIncident("CNC-07");

    expect(investigation.machineId).toBe("CNC-07");
    expect(investigation.severity).toBe("critical");

    expect(investigation.probableCause).toBe(
      "Possible spindle bearing degradation",
    );

    expect(investigation.confidence).toBeGreaterThan(0);

    expect(investigation.evidence.length).toBeGreaterThan(0);

    expect(investigation.recommendedAction).toBeTruthy();

    expect(investigation.requiresHumanApproval).toBe(true);
  });

  it("uses current simulation telemetry when supplied", () => {
    const investigation = investigateIncident("CNC-03", {
      temperature: 101,
      vibration: 9.2,
      pressure: 4.1,
      motorCurrent: 19.5,
      errorCode: "E-204",
    });

    expect(investigation.severity).toBe("critical");
    expect(investigation.evidence).toContain("Temperature reached 101°C");
    expect(investigation.evidence).toContain("Vibration reached 9.2 mm/s");
    expect(investigation.requiresHumanApproval).toBe(true);
  });

  it("does not recommend intervention for a normal machine", () => {
    const investigation = investigateIncident("CNC-03");

    expect(investigation.machineId).toBe("CNC-03");
    expect(investigation.severity).toBe("normal");
    expect(investigation.requiresHumanApproval).toBe(false);
  });

  it("includes maintenance history as investigation evidence", () => {
    const investigation = investigateIncident("CNC-07");

    expect(
      investigation.evidence.some((item) =>
        item.toLowerCase().includes("maintenance"),
      ),
    ).toBe(true);
  });
});