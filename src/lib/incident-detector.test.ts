import { describe, expect, it } from "vitest";
import { detectIncident } from "./incident-detector";

describe("detectIncident", () => {
  it("detects a critical machine incident when temperature and vibration are both high", () => {
    const result = detectIncident({
      temperature: 91.4,
      vibration: 8.7,
      pressure: 4.2,
      motorCurrent: 17.8,
      errorCode: "E-204",
    });

    expect(result.isIncident).toBe(true);
    expect(result.severity).toBe("critical");
    expect(result.machineIssue).toBe(
      "Possible spindle bearing degradation",
    );
  });

  it("does not create an incident for normal machine telemetry", () => {
    const result = detectIncident({
      temperature: 67,
      vibration: 2.1,
      pressure: 4.0,
      motorCurrent: 11.2,
      errorCode: null,
    });

    expect(result.isIncident).toBe(false);
    expect(result.severity).toBe("normal");
  });
});