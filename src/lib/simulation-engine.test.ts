import { describe, expect, it } from "vitest";
import {
  createSimulationState,
  advanceSimulation,
  type SimulationState,
} from "./simulation-engine";

describe("simulation-engine", () => {
  it("creates simulation state for all 10 factory machines", () => {
    const state = createSimulationState();

    expect(Object.keys(state.machines)).toHaveLength(10);
    expect(state.machines["CNC-01"]).toBeDefined();
    expect(state.machines["CNC-07"]).toBeDefined();
    expect(state.machines["CNC-10"]).toBeDefined();
  });

  it("advances machine state by one simulation tick", () => {
    const initialState = createSimulationState();

    const nextState = advanceSimulation(initialState);

    expect(nextState.tick).toBe(initialState.tick + 1);
  });

  it("keeps machine health within valid bounds", () => {
    const initialState = createSimulationState();

    const nextState = advanceSimulation(initialState);

    for (const machine of Object.values(nextState.machines)) {
      expect(machine.health).toBeGreaterThanOrEqual(0);
      expect(machine.health).toBeLessThanOrEqual(100);
    }
  });

  it("keeps machine workload within valid bounds", () => {
    const initialState = createSimulationState();

    const nextState = advanceSimulation(initialState);

    for (const machine of Object.values(nextState.machines)) {
      expect(machine.workload).toBeGreaterThanOrEqual(0);
      expect(machine.workload).toBeLessThanOrEqual(100);
    }
  });
});