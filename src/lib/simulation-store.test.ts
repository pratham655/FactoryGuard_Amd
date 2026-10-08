import { describe, expect, it } from "vitest";

import {
  getSimulationState,
  startSimulation,
  pauseSimulation,
  resetSimulation,
  applySimulationScenario,
  tickSimulation,
} from "./simulation-store";

describe("simulation-store", () => {
  it("starts paused", () => {
    const state = resetSimulation();

    expect(state.running).toBe(false);
  });

  it("starts the simulation", () => {
    resetSimulation();

    const state = startSimulation();

    expect(state.running).toBe(true);
  });

  it("pauses the simulation", () => {
    resetSimulation();
    startSimulation();

    const state = pauseSimulation();

    expect(state.running).toBe(false);
  });

  it("resets the simulation to tick zero", () => {
    const state = resetSimulation();

    expect(state.simulation.tick).toBe(0);
    expect(state.running).toBe(false);
  });

  it("applies a controlled scenario", () => {
    resetSimulation();

    const state = applySimulationScenario(
      "CNC-07",
      "spindle-degradation",
    );

    expect(
      state.simulation.machines["CNC-07"].scenario,
    ).toBe("spindle-degradation");
  });

  it("returns the current shared state", () => {
    resetSimulation();

    const state = getSimulationState();

    expect(state.simulation).toBeDefined();
    expect(state.running).toBe(false);
  });

  it("advances the simulation when automatic ticking is requested", () => {
    resetSimulation();
    startSimulation();

    const before = getSimulationState().simulation.tick;

    const after = tickSimulation();

    expect(after.running).toBe(true);
    expect(after.simulation.tick).toBe(before + 1);
  });

  it("does not advance automatic ticks while paused", () => {
    resetSimulation();

    const before = getSimulationState().simulation.tick;

    const after = tickSimulation();

    expect(after.running).toBe(false);
    expect(after.simulation.tick).toBe(before);
  });
});