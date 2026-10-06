import { getFactoryMachines } from "@/lib/factory-data";
import { getFactorySummary } from "@/lib/factory-summary";

export async function GET() {
  const summary = getFactorySummary();
  const machines = getFactoryMachines();

  return Response.json({
    summary,
    machines,
  });
}