import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api-auth", () => ({
  requireFactoryGuardRole: vi.fn().mockResolvedValue({
    authorized: true,
    identity: { userId: "test-user", operator: "Test Operator", role: "employee" },
  }),
}));

import { POST } from "./route";
import { resetSimulation } from "@/lib/simulation-store";

import {
  startSimulationRunner,
  stopSimulationRunner,
} from "@/lib/simulation-runner";

vi.mock("@/lib/simulation-runner", () => ({
  startSimulationRunner: vi.fn(),
  stopSimulationRunner: vi.fn(),
}));

describe("POST /api/simulation/control", () => {
  it("starts the simulation", async () => {
    resetSimulation();

    const request = new Request(
      "http://localhost/api/simulation/control",
      {
        method: "POST",
        body: JSON.stringify({
          action: "start",
        }),
      },
    );

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.running).toBe(true);
  });

  it("pauses the simulation", async () => {
    resetSimulation();

    const startRequest = new Request(
      "http://localhost/api/simulation/control",
      {
        method: "POST",
        body: JSON.stringify({
          action: "start",
        }),
      },
    );

    await POST(startRequest);

    const pauseRequest = new Request(
      "http://localhost/api/simulation/control",
      {
        method: "POST",
        body: JSON.stringify({
          action: "pause",
        }),
      },
    );

    const response = await POST(pauseRequest);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.running).toBe(false);
  });

  it("starts the automatic simulation runner when starting", async () => {
    resetSimulation();

    vi.clearAllMocks();

    const response = await POST(
      new Request(
        "http://localhost/api/simulation/control",
        {
          method: "POST",
          body: JSON.stringify({
            action: "start",
          }),
        },
      ),
    );

    expect(response.status).toBe(200);
    expect(startSimulationRunner).toHaveBeenCalledTimes(1);
  });

  it("stops the automatic simulation runner when pausing", async () => {
    resetSimulation();

    vi.clearAllMocks();

    const response = await POST(
      new Request(
        "http://localhost/api/simulation/control",
        {
          method: "POST",
          body: JSON.stringify({
            action: "pause",
          }),
        },
      ),
    );

    expect(response.status).toBe(200);
    expect(stopSimulationRunner).toHaveBeenCalledTimes(1);
  });

  it("advances the simulation by one tick", async () => {
    resetSimulation();

    const request = new Request(
      "http://localhost/api/simulation/control",
      {
        method: "POST",
        body: JSON.stringify({
          action: "advance",
        }),
      },
    );

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.simulation.tick).toBe(1);
  });

  it("resets the simulation", async () => {
    resetSimulation();

    const startRequest = new Request(
      "http://localhost/api/simulation/control",
      {
        method: "POST",
        body: JSON.stringify({
          action: "start",
        }),
      },
    );

    await POST(startRequest);

    const resetRequest = new Request(
      "http://localhost/api/simulation/control",
      {
        method: "POST",
        body: JSON.stringify({
          action: "reset",
        }),
      },
    );

    const response = await POST(resetRequest);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.running).toBe(false);
    expect(body.simulation.tick).toBe(0);
  });

  it("injects a controlled scenario", async () => {
    resetSimulation();

    const request = new Request(
      "http://localhost/api/simulation/control",
      {
        method: "POST",
        body: JSON.stringify({
          action: "scenario",
          machineId: "CNC-01",
          scenario: "spindle-degradation",
        }),
      },
    );

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);

    expect(
      body.simulation.machines["CNC-01"].scenario,
    ).toBe("spindle-degradation");
  });

  it("rejects an invalid action", async () => {
    resetSimulation();

    const request = new Request(
      "http://localhost/api/simulation/control",
      {
        method: "POST",
        body: JSON.stringify({
          action: "explode-factory",
        }),
      },
    );

    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it.each([
    ["thermal-overload", "temperature"],
    ["cooling-failure", "temperature"],
    ["vibration-anomaly", "vibration"],
    ["spindle-degradation", "vibration"],
    ["lubrication-issue", "vibration"],
    ["motor-overload", "motorCurrent"],
  ] as const)("exposes %s telemetry through the control API", async (scenario, channel) => {
    resetSimulation();

    const beforeResponse = await POST(new Request("http://localhost/api/simulation/control", {
      method: "POST",
      body: JSON.stringify({ action: "reset" }),
    }));
    const beforeBody = await beforeResponse.json();
    const targetBefore = beforeBody.simulation.machines["CNC-03"][channel];
    const otherBefore = beforeBody.simulation.machines["CNC-01"];

    const response = await POST(new Request("http://localhost/api/simulation/control", {
      method: "POST",
      body: JSON.stringify({ action: "scenario", machineId: "CNC-03", scenario }),
    }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.simulation.machines["CNC-03"].scenario).toBe(scenario);
    expect(body.simulation.machines["CNC-03"][channel]).toBeGreaterThan(targetBefore);
    expect(body.simulation.machines["CNC-03"].operatingState).toBe("degraded");
    expect(body.simulation.machines["CNC-01"]).toEqual(otherBefore);
  });

});