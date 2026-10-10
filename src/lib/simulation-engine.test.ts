import { describe, expect, it } from "vitest";
import {
  createSimulationState,
  advanceSimulation,
  injectScenario,
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
  it("injects a scenario into the selected machine without changing other machines", () => {
    const initialState = createSimulationState();
    const otherMachineBefore = initialState.machines["CNC-01"];
    const nextState = injectScenario(initialState, "CNC-07", "spindle-degradation");

    expect(nextState.machines["CNC-07"].scenario).toBe("spindle-degradation");
    expect(nextState.machines["CNC-07"].operatingState).toBe("degraded");
    expect(nextState.machines["CNC-07"].vibration).toBeGreaterThan(initialState.machines["CNC-07"].vibration);
    expect(nextState.machines["CNC-01"]).toEqual(otherMachineBefore);
    expect(initialState.machines["CNC-07"].scenario).toBeNull();
  });

  it("rejects scenario injection for an unknown machine", () => {
    expect(() => injectScenario(createSimulationState(), "CNC-99", "thermal-overload")).toThrow("Machine CNC-99 not found");
  });

  it("increases fault telemetry on each tick while a scenario is active", () => {
    const initialState = injectScenario(createSimulationState(), "CNC-02", "thermal-overload");
    const nextState = advanceSimulation(initialState);

    expect(nextState.tick).toBe(initialState.tick + 1);
    expect(nextState.machines["CNC-02"].temperature).toBeGreaterThan(initialState.machines["CNC-02"].temperature);
    expect(nextState.machines["CNC-02"].scenario).toBe("thermal-overload");
  });

});