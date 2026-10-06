import { describe, expect, it } from "vitest";
import { investigateWithAgent } from "./ai-agent";

describe("investigateWithAgent", () => {
  it("produces an evidence-backed investigation for a critical machine", async () => {
    const result = await investigateWithAgent("CNC-07");

    expect(result.machineId).toBe("CNC-07");
    expect(result.severity).toBe("critical");
    expect(result.probableCause).toBeTruthy();
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.evidence.length).toBeGreaterThan(0);
    expect(result.recommendedAction).toBeTruthy();
    expect(result.requiresHumanApproval).toBe(true);
  });

  it("does not recommend intervention for a normal machine", async () => {
    const result = await investigateWithAgent("CNC-03");

    expect(result.machineId).toBe("CNC-03");
    expect(result.severity).toBe("normal");
    expect(result.requiresHumanApproval).toBe(false);
  });
});