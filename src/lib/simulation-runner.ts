import {
  getSimulationState,
  tickSimulation,
} from "./simulation-store";

const DEFAULT_INTERVAL_MS = 1000;

let intervalId: ReturnType<typeof setInterval> | null = null;

export function startSimulationRunner(
  intervalMs: number = DEFAULT_INTERVAL_MS,
): void {
  if (intervalId !== null) {
    return;
  }

  intervalId = setInterval(() => {
    const state = getSimulationState();

    if (!state.running) {
      return;
    }

    tickSimulation();
  }, intervalMs);
}

export function stopSimulationRunner(): void {
  if (intervalId === null) {
    return;
  }

  clearInterval(intervalId);
  intervalId = null;
}