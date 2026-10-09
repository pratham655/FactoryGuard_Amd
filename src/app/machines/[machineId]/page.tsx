import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  AlertOctagon,
} from "lucide-react";
import { getFactoryMachines } from "@/lib/factory-data";
import { getMaintenanceHistory } from "@/lib/maintenance-history";
import { FactorySidebar } from "@/components/layout/FactorySidebar";
import { MachineWorkspace } from "@/components/machine/MachineWorkspace";

interface MachinePageProps {
  params: Promise<{
    machineId: string;
  }>;
}

export default async function MachinePage({ params }: MachinePageProps) {
  const { machineId } = await params;

  const machines = getFactoryMachines();
  const machine = machines.find(
    (m) => m.id.toLowerCase() === machineId.toLowerCase()
  );

  if (!machine) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex">
        <FactorySidebar />

        <div className="flex-1 lg:pl-72 flex flex-col items-center justify-center p-8 text-center">
          <div className="rounded-2xl border border-red-500/40 bg-slate-900/90 p-8 max-w-md w-full space-y-4 shadow-xl">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
              <AlertOctagon className="w-6 h-6" />
            </div>

            <div>
              <h1 className="text-xl font-bold font-mono tracking-tight text-white">
                Machine Not Found
              </h1>
              <p className="text-xs font-mono text-slate-400 mt-1">
                The identifier <strong className="text-red-400 font-mono">{machineId}</strong> does not exist in the factory floor telemetry registry.
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-md shadow-cyan-950/40"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Factory Control Room</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const maintenanceHistory = getMaintenanceHistory(machine.id);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Fixed Left Navigation Sidebar */}
      <FactorySidebar />

      {/* Main Diagnostic Workspace Area */}
      <main className="flex-1 lg:pl-72 flex flex-col min-w-0 industrial-grid">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <MachineWorkspace
            machine={machine}
            maintenanceHistory={maintenanceHistory}
          />
        </div>
      </main>
    </div>
  );
}
