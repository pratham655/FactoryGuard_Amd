import { NextResponse } from "next/server";
import { getSimulationState } from "@/lib/simulation-store";
import { requireFactoryGuardRole } from "@/lib/api-auth";

export async function GET() {
  const authorization = await requireFactoryGuardRole();
  if (!authorization.authorized) {
    return authorization.response;
  }

  return NextResponse.json(getSimulationState(), {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
