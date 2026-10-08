import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getSimulationState,
  resetSimulation,
  startSimulation,
} from "./simulation-store";

import {
  startSimulationRunner,
  stopSimulationRunner,
} from "./simulation-runner";

describe("simulation-runner", () => {
  afterEach(() => {
    stopSimulationRunner();
    vi.useRealTimers();
  });

  it("advances the simulation automatically while running", () => {
    vi.useFakeTimers();

    resetSimulation();
    startSimulation();

    startSimulationRunner();

    const before = getSimulationState().simulation.tick;

    vi.advanceTimersByTime(1000);

    const after = getSimulationState().simulation.tick;

    expect(after).toBe(before + 1);
  });

  it("does not advance while the simulation is paused", () => {
    vi.useFakeTimers();

    resetSimulation();

    startSimulationRunner();

    const before = getSimulationState().simulation.tick;

    vi.advanceTimersByTime(1000);

    const after = getSimulationState().simulation.tick;

    expect(after).toBe(before);
  });

  it("can be stopped", () => {
    vi.useFakeTimers();

    resetSimulation();
    startSimulation();

    startSimulationRunner();

    const before = getSimulationState().simulation.tick;

    stopSimulationRunner();

    vi.advanceTimersByTime(3000);

    const after = getSimulationState().simulation.tick;

    expect(after).toBe(before);
  });
});