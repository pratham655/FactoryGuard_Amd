import { getFactoryMachines } from "./factory-data";

export type MachineOperatingState =
  | "running"
  | "degraded"
  | "maintenance"
  | "stopped";

export type SimulationScenario =
  | "spindle-degradation"
  | "thermal-overload"
  | "vibration-anomaly"
  | "motor-overload"
  | "cooling-failure"
  | "lubrication-issue";

export type MachineSimulationState = {
  workload: number;
  health: number;
  wear: number;
  productionRate: number;
  failureRisk: number;
  temperature: number;
  vibration: number;
  motorCurrent: number;
  operatingState: MachineOperatingState;
  scenario: SimulationScenario | null;
};

export type SimulationState = {
  tick: number;
  machines: Record<string, MachineSimulationState>;
};

function clamp(
  value: number,
  min: number,
  max: number,
): number {
  return Math.min(Math.max(value, min), max);
}

function round(value: number): number {
  return Number(value.toFixed(2));
}

/**
 * Creates the initial deterministic simulation state.
 */
export function createSimulationState(): SimulationState {
  const machines = getFactoryMachines();

  const machineStates: Record<
    string,
    MachineSimulationState
  > = {};

  for (const machine of machines) {
    const {
      temperature,
      vibration,
      motorCurrent,
    } = machine.telemetry;

    const workload = clamp(
      45 +
        (motorCurrent - 10) * 4 +
        (temperature - 65) * 0.35,
      20,
      95,
    );

    const health = clamp(
      100 -
        Math.max(0, temperature - 70) * 1.2 -
        Math.max(0, vibration - 3) * 4,
      20,
      100,
    );

    const wear = clamp(100 - health, 0, 100);

    const failureRisk = clamp(
      Math.max(0, temperature - 75) * 1.4 +
        Math.max(0, vibration - 4) * 6 +
        Math.max(0, motorCurrent - 14) * 4,
      0,
      100,
    );

    const productionRate = clamp(
      160 * (workload / 100) * (health / 100),
      0,
      160,
    );

    const operatingState: MachineOperatingState =
      machine.status === "critical" ||
      machine.status === "warning"
        ? "degraded"
        : "running";

    machineStates[machine.id] = {
      workload: round(workload),
      health: round(health),
      wear: round(wear),
      productionRate: round(productionRate),
      failureRisk: round(failureRisk),
      temperature: round(temperature),
      vibration: round(vibration),
      motorCurrent: round(motorCurrent),
      operatingState,
      scenario: null,
    };
  }

  return {
    tick: 0,
    machines: machineStates,
  };
}

/**
 * Advances the factory simulation by one tick.
 */
export function advanceSimulation(
  state: SimulationState,
): SimulationState {
  const nextMachines: Record<
    string,
    MachineSimulationState
  > = {};

  for (const [machineId, machine] of Object.entries(
    state.machines,
  )) {
    const workloadDirection =
      machine.workload < 55
        ? 1
        : machine.workload > 85
          ? -1
          : 0;

    const workload = clamp(
      machine.workload + workloadDirection * 2,
      0,
      100,
    );

    let wearIncrease =
      machine.operatingState === "running"
        ? workload > 75
          ? 0.35
          : 0.18
        : 0.08;

    let temperatureChange =
      workload > 75 ? 0.18 : 0.05;

    let vibrationChange =
      workload > 80 ? 0.08 : 0.02;

    let currentChange =
      workload > 80 ? 0.12 : 0.04;

    if (machine.scenario === "spindle-degradation") {
      wearIncrease += 0.65;
      temperatureChange += 0.55;
      vibrationChange += 0.42;
      currentChange += 0.3;
    }

    if (machine.scenario === "thermal-overload") {
      wearIncrease += 0.35;
      temperatureChange += 1.2;
      currentChange += 0.35;
    }

    if (machine.scenario === "vibration-anomaly") {
      wearIncrease += 0.3;
      vibrationChange += 0.9;
      temperatureChange += 0.25;
    }

    if (machine.scenario === "motor-overload") {
      wearIncrease += 0.45;
      currentChange += 1.1;
      temperatureChange += 0.45;
    }

    if (machine.scenario === "cooling-failure") {
      wearIncrease += 0.4;
      temperatureChange += 1.5;
    }

    if (machine.scenario === "lubrication-issue") {
      wearIncrease += 0.5;
      vibrationChange += 0.5;
      temperatureChange += 0.45;
    }

    const wear = clamp(
      machine.wear + wearIncrease,
      0,
      100,
    );

    const health = clamp(
      100 - wear,
      0,
      100,
    );

    const temperature = clamp(
      machine.temperature + temperatureChange,
      20,
      120,
    );

    const vibration = clamp(
      machine.vibration + vibrationChange,
      0,
      15,
    );

    const motorCurrent = clamp(
      machine.motorCurrent + currentChange,
      0,
      30,
    );

    const scenarioRisk =
      machine.scenario !== null
        ? 8
        : 0;

    const failureRisk = clamp(
      machine.failureRisk +
        (workload > 80 ? 1.2 : -0.3) +
        (health < 70 ? 1.5 : 0) +
        scenarioRisk,
      0,
      100,
    );

    const productionRate = clamp(
      160 *
        (workload / 100) *
        (health / 100),
      0,
      160,
    );

    let operatingState: MachineOperatingState =
      machine.operatingState;

    if (
      failureRisk >= 80 ||
      health <= 30 ||
      machine.scenario !== null
    ) {
      operatingState = "degraded";
    } else if (
      failureRisk < 50 &&
      health > 60
    ) {
      operatingState = "running";
    }

    nextMachines[machineId] = {
      workload: round(workload),
      health: round(health),
      wear: round(wear),
      productionRate: round(productionRate),
      failureRisk: round(failureRisk),
      temperature: round(temperature),
      vibration: round(vibration),
      motorCurrent: round(motorCurrent),
      operatingState,
      scenario: machine.scenario,
    };
  }

  return {
    tick: state.tick + 1,
    machines: nextMachines,
  };
}

/**
 * Injects a controlled fault scenario into a machine.
 *
 * Scenarios are deterministic and reproducible for demonstrations.
 */
export function injectScenario(
  state: SimulationState,
  machineId: string,
  scenario: SimulationScenario,
): SimulationState {
  const machine = state.machines[machineId];

  if (!machine) {
    throw new Error(
      `Machine ${machineId} not found`,
    );
  }

  const nextMachine: MachineSimulationState = {
    ...machine,
    scenario,
    operatingState: "degraded",
    failureRisk: round(
      clamp(
        machine.failureRisk + 15,
        0,
        100,
      ),
    ),
  };

  if (
    scenario === "thermal-overload" ||
    scenario === "cooling-failure"
  ) {
    nextMachine.temperature = round(
      machine.temperature + 8,
    );
  }

  if (
    scenario === "vibration-anomaly" ||
    scenario === "spindle-degradation" ||
    scenario === "lubrication-issue"
  ) {
    nextMachine.vibration = round(
      machine.vibration + 2,
    );
  }

  if (scenario === "motor-overload") {
    nextMachine.motorCurrent = round(
      machine.motorCurrent + 3,
    );
  }

  return {
    ...state,
    machines: {
      ...state.machines,
      [machineId]: nextMachine,
    },
  };
}