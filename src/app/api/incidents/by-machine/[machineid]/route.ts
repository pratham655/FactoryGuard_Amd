import { NextResponse } from "next/server";
import { getLatestIncidentForMachine } from "@/lib/incident-store";

interface RouteContext {
  params: Promise<{
    machineid: string;
  }>;
}

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  try {
    const { machineid } = await context.params;

    const machineId = decodeURIComponent(machineid).trim();

    if (!machineId) {
      return NextResponse.json(
        { error: "Machine ID is required." },
        { status: 400 },
      );
    }

    const incident = await getLatestIncidentForMachine(machineId);

    return NextResponse.json(
      { incident },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("Failed to retrieve machine incident:", error);

    return NextResponse.json(
      { error: "Unable to retrieve the machine incident." },
      { status: 500 },
    );
  }
}