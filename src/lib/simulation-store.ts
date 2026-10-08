import {
  advanceSimulation,
  createSimulationState,
  injectScenario,
  type SimulationScenario,
  type SimulationState,
} from "./simulation-engine";

export type SimulationStoreState = {
  simulation: SimulationState;
  running: boolean;
};

let storeState: SimulationStoreState = {
  simulation: createSimulationState(),
  running: false,
};

export function getSimulationState(): SimulationStoreState {
  return storeState;
}

export function startSimulation(): SimulationStoreState {
  storeState = {
    ...storeState,
    running: true,
  };

  return storeState;
}

export function pauseSimulation(): SimulationStoreState {
  storeState = {
    ...storeState,
    running: false,
  };

  return storeState;
}

export function resetSimulation(): SimulationStoreState {
  storeState = {
    simulation: createSimulationState(),
    running: false,
  };

  return storeState;
}

export function applySimulationScenario(
  machineId: string,
  scenario: SimulationScenario,
): SimulationStoreState {
  storeState = {
    ...storeState,
    simulation: injectScenario(
      storeState.simulation,
      machineId,
      scenario,
    ),
  };

  return storeState;
}

export function advanceStoredSimulation(): SimulationStoreState {
  storeState = {
    ...storeState,
    simulation: advanceSimulation(
      storeState.simulation,
    ),
  };

  return storeState;
}

export function tickSimulation(): SimulationStoreState {
  if (!storeState.running) {
    return storeState;
  }

  storeState = {
    ...storeState,
    simulation: advanceSimulation(
      storeState.simulation,
    ),
  };

  return storeState;
}