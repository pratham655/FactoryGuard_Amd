import { NextResponse } from "next/server";
import { getSimulationState } from "@/lib/simulation-store";

export async function GET() {
  const state = getSimulationState();

  return NextResponse.json(state);
}