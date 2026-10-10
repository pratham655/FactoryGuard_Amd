import { NextResponse } from "next/server";
import {
  advanceStoredSimulation,
  applySimulationScenario,
  pauseSimulation,
  resetSimulation,
  startSimulation,
} from "@/lib/simulation-store";
import {
  startSimulationRunner,
  stopSimulationRunner,
} from "@/lib/simulation-runner";
import type { SimulationScenario } from "@/lib/simulation-engine";
import { requireFactoryGuardRole } from "@/lib/api-auth";

type SimulationAction = "start" | "pause" | "reset" | "scenario" | "advance";

type ControlRequest = {
  action?: SimulationAction;
  machineId?: string;
  scenario?: SimulationScenario;
};

const validScenarios: SimulationScenario[] = [
  "spindle-degradation",
  "thermal-overload",
  "vibration-anomaly",
  "motor-overload",
  "cooling-failure",
  "lubrication-issue",
];

export async function POST(request: Request) {
  const authorization = await requireFactoryGuardRole();
  if (!authorization.authorized) {
    return authorization.response;
  }

  let body: ControlRequest;
  try {
    body = (await request.json()) as ControlRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON request body" }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Request body must be a JSON object" }, { status: 400 });
  }

  if (!body.action) {
    return NextResponse.json({ error: "Missing simulation action" }, { status: 400 });
  }

  try {
    switch (body.action) {
      case "start": {
        const state = startSimulation();
        startSimulationRunner();
        return NextResponse.json(state);
      }
      case "pause": {
        const state = pauseSimulation();
        stopSimulationRunner();
        return NextResponse.json(state);
      }
      case "reset": {
        const state = resetSimulation();
        stopSimulationRunner();
        return NextResponse.json(state);
      }
      case "advance": {
        return NextResponse.json(advanceStoredSimulation());
      }
      case "scenario": {
        if (!body.machineId?.trim()) {
          return NextResponse.json({ error: "machineId is required for scenario action" }, { status: 400 });
        }
        if (!body.scenario) {
          return NextResponse.json({ error: "scenario is required" }, { status: 400 });
        }
        if (!validScenarios.includes(body.scenario)) {
          return NextResponse.json({ error: `Unsupported scenario: ${body.scenario}` }, { status: 400 });
        }
        return NextResponse.json(applySimulationScenario(body.machineId.trim(), body.scenario));
      }
      default:
        return NextResponse.json({ error: `Unsupported action: ${String(body.action)}` }, { status: 400 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Simulation control failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
