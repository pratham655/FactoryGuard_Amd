import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api-auth", () => ({
  requireFactoryGuardRole: vi.fn(async () => ({
    authorized: true,
    identity: { userId: "test-user", operator: "Test Operator", role: "owner" },
  })),
}));

import {
  getSimulationState,
  resetSimulation,
  startSimulation,
  tickSimulation,
} from "@/lib/simulation-store";

import { GET } from "./route";

describe("GET /api/simulation/state", () => {
  beforeEach(() => {
    resetSimulation();
  });

  it("returns the current shared simulation state", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toContain("no-store");
    expect(body).toEqual(getSimulationState());
  });

  it("returns the updated simulation state after a tick", async () => {
    startSimulation();
    tickSimulation();

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.simulation.tick).toBe(1);
    expect(body.running).toBe(true);
  });

  it("returns all 10 machines", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(Object.keys(body.simulation.machines)).toHaveLength(10);
  });

  it("returns the same shared state used by the simulation store", async () => {
    startSimulation();

    tickSimulation();
    tickSimulation();

    const response = await GET();
    const body = await response.json();

    const currentState = getSimulationState();

    expect(body).toEqual(currentState);
    expect(body.simulation.tick).toBe(2);
    expect(body.running).toBe(true);
  });
});