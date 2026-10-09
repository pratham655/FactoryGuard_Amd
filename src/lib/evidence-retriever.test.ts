
import { describe, expect, it } from "vitest";
import { retrieveEvidence } from "./evidence-retriever";

describe("retrieveEvidence", () => {
  it("retrieves relevant technical guidance for spindle vibration", () => {
    const results = retrieveEvidence("spindle vibration");

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].sourceType).toBe("technical");
    expect(results[0].title).toContain("Spindle Vibration");
  });

  it("ranks documents matching more query terms higher", () => {
    const results = retrieveEvidence("spindle vibration bearing");

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].relevanceScore).toBeGreaterThan(0);

    for (let index = 1; index < results.length; index++) {
      expect(results[index - 1].relevanceScore).toBeGreaterThanOrEqual(
        results[index].relevanceScore,
      );
    }
  });

  it("includes maintenance history for the requested machine", () => {
    const results = retrieveEvidence("spindle vibration", "CNC-07");

    const maintenanceResult = results.find(
      (result) => result.sourceType === "maintenance",
    );

    expect(maintenanceResult).toBeDefined();
    expect(maintenanceResult?.source).toContain("CNC-07");
    expect(maintenanceResult?.content).toContain(
      "Elevated spindle vibration",
    );
  });

  it("does not include another machine's maintenance records", () => {
    const results = retrieveEvidence("spindle vibration", "CNC-06");

    expect(
      results.some((result) => result.sourceType === "maintenance"),
    ).toBe(false);
  });

  it("returns source references for retrieved evidence", () => {
    const results = retrieveEvidence("E-204");

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].source).toBeTruthy();
    expect(results[0].sourceId).toBeTruthy();
  });

  it("returns an empty list for unrelated queries", () => {
    expect(
      retrieveEvidence("coffee machine spaceship"),
    ).toEqual([]);
  });

  it("returns an empty list for blank queries", () => {
    expect(retrieveEvidence("   ")).toEqual([]);
  });

  it("respects the requested result limit", () => {
    const results = retrieveEvidence("spindle vibration temperature", undefined, 1);

    expect(results).toHaveLength(1);
  });
});
