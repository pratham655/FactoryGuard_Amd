import { describe, expect, it } from "vitest";
import { searchTechnicalKnowledge } from "./technical-knowledge";

describe("searchTechnicalKnowledge", () => {
  it("finds technical guidance for spindle vibration", () => {
    const results = searchTechnicalKnowledge("spindle vibration");

    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toHaveProperty("title");
    expect(results[0]).toHaveProperty("content");
    expect(results[0]).toHaveProperty("source");
  });

  it("finds guidance for error code E-204", () => {
    const results = searchTechnicalKnowledge("E-204");

    expect(results.length).toBeGreaterThan(0);
    expect(
      results.some((result) => result.content.includes("E-204")),
    ).toBe(true);
  });

  it("returns no results for unrelated knowledge", () => {
    const results = searchTechnicalKnowledge("coffee machine");

    expect(results).toEqual([]);
  });
});