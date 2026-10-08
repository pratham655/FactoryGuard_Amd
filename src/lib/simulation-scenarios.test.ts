import { describe, expect, it } from "vitest";
import {
  createSimulationState,
  injectScenario,
  type SimulationScenario,
} from "./simulation-engine";

describe("simulation scenarios", () => {
  it("injects spindle degradation into a machine", () => {
    const initialState = createSimulationState();

    const nextState = injectScenario(
      initialState,
      "CNC-01",
      "spindle-degradation",
    );

    const machine = nextState.machines["CNC-01"];

    expect(machine.scenario).toBe("spindle-degradation");
    expect(machine.failureRisk).toBeGreaterThan(
      initialState.machines["CNC-01"].failureRisk,
    );
    expect(machine.operatingState).toBe("degraded");
  });

  it("injects a thermal overload scenario", () => {
    const initialState = createSimulationState();

    const nextState = injectScenario(
      initialState,
      "CNC-02",
      "thermal-overload",
    );

    const machine = nextState.machines["CNC-02"];

    expect(machine.scenario).toBe("thermal-overload");
    expect(machine.temperature).toBeGreaterThan(
      initialState.machines["CNC-02"].temperature,
    );
  });

  it("injects a vibration anomaly", () => {
    const initialState = createSimulationState();

    const nextState = injectScenario(
      initialState,
      "CNC-03",
      "vibration-anomaly",
    );

    const machine = nextState.machines["CNC-03"];

    expect(machine.scenario).toBe("vibration-anomaly");
    expect(machine.vibration).toBeGreaterThan(
      initialState.machines["CNC-03"].vibration,
    );
  });

  it("rejects an unknown machine", () => {
    const initialState = createSimulationState();

    expect(() =>
      injectScenario(
        initialState,
        "CNC-99",
        "spindle-degradation",
      ),
    ).toThrow("Machine CNC-99 not found");
  });

  it("supports the defined scenario types", () => {
    const scenarios: SimulationScenario[] = [
      "spindle-degradation",
      "thermal-overload",
      "vibration-anomaly",
      "motor-overload",
      "cooling-failure",
      "lubrication-issue",
    ];

    expect(scenarios).toHaveLength(6);
  });
});