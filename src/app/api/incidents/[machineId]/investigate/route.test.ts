
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api-auth", () => ({
  requireFactoryGuardRole: vi.fn().mockResolvedValue({
    authorized: true,
    identity: { userId: "test-user", operator: "Test Operator", role: "employee" },
  }),
}));
import { POST } from "./route";

describe("POST /api/incidents/[machineId]/investigate", () => {
  it("returns critical investigation with traceable evidence for CNC-07", async () => {
    const response = await POST(
      new Request(
        "http://localhost/api/incidents/CNC-07/investigate",
        { method: "POST" },
      ),
      {
        params: Promise.resolve({ machineId: "CNC-07" }),
      },
    );

    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.machineId).toBe("CNC-07");
    expect(body.severity).toBe("critical");
    expect(body.probableCause).toContain("spindle bearing");
    expect(body.confidence).toBeGreaterThan(0);
    expect(body.recommendedAction).toContain("Stop the machine");
    expect(body.requiresHumanApproval).toBe(true);

    expect(body.evidence).toEqual(
      expect.arrayContaining([
        expect.stringContaining("91.4"),
        expect.stringContaining("8.7"),
        expect.stringContaining("E-204"),
        expect.stringContaining("Spindle Vibration Maintenance Guidance"),
        expect.stringContaining("maintenance:CNC-07:2026-09-18"),
      ]),
    );

    // Verify the actual parsed API response preserves Unicode correctly.
    expect(body.evidence).toContain("Temperature reached 91.4°C");

    expect(
      body.evidence.some((line: string) =>
        line.includes("Maintenance history — CNC-07"),
      ),
    ).toBe(true);

    // Guard against common UTF-8/Windows-1252 mojibake.
    expect(
      body.evidence.some((line: string) => line.includes("Â°C")),
    ).toBe(false);

    expect(
      body.evidence.some((line: string) =>
        line.includes("Maintenance history â CNC-07"),
      ),
    ).toBe(false);
  });

  it("returns 404 for an unknown machine", async () => {
    const response = await POST(
      new Request(
        "http://localhost/api/incidents/UNKNOWN-99/investigate",
        { method: "POST" },
      ),
      {
        params: Promise.resolve({ machineId: "UNKNOWN-99" }),
      },
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      error: "Machine not found",
    });
  });
});
