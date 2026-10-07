import { describe, expect, it } from "vitest";
import { POST } from "./route";

describe("POST /api/incidents/[machineId]/investigate", () => {
  it("returns an investigation for a valid machine", async () => {
    const response = await POST(
      new Request("http://localhost/api/incidents/CNC-07/investigate"),
      {
        params: Promise.resolve({
          machineId: "CNC-07",
        }),
      },
    );

    expect(response.status).toBe(200);

    const body = await response.json();

    expect(body.machineId).toBe("CNC-07");
    expect(body.severity).toBe("critical");
    expect(body.probableCause).toBe(
      "Possible spindle bearing degradation",
    );
    expect(body.requiresHumanApproval).toBe(true);
    expect(body.evidence.length).toBeGreaterThan(0);
  });

  it("returns 404 for an unknown machine", async () => {
    const response = await POST(
      new Request("http://localhost/api/incidents/UNKNOWN/investigate"),
      {
        params: Promise.resolve({
          machineId: "UNKNOWN",
        }),
      },
    );

    expect(response.status).toBe(404);
  });
});