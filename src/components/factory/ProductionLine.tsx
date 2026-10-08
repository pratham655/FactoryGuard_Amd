import React from "react";
import { Layers, ShieldCheck, AlertTriangle, AlertOctagon } from "lucide-react";
import { MachineCard } from "@/components/factory/MachineCard";
import type { Machine } from "@/lib/factory-data";

interface ProductionLineProps {
  lineName: string;
  description: string;
  machines: Machine[];
}

export function ProductionLine({
  lineName,
  description,
  machines,
}: ProductionLineProps) {
  const hasCritical = machines.some((m) => m.status === "critical");
  const hasWarning = machines.some((m) => m.status === "warning");

  const lineStatusBadge = hasCritical ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase bg-red-500/15 border border-red-500/40 text-red-400">
      <AlertOctagon className="w-3 h-3 text-red-400" />
      CRITICAL IN LINE
    </span>
  ) : hasWarning ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase bg-amber-500/15 border border-amber-500/40 text-amber-400">
      <AlertTriangle className="w-3 h-3 text-amber-400" />
      ATTENTION REQ
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
      <ShieldCheck className="w-3 h-3 text-emerald-400" />
      LINE NOMINAL
    </span>
  );

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5 shadow-sm">
      {/* Line Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 text-cyan-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                {lineName}
              </h3>
              <span className="text-[11px] font-mono text-slate-500">
                ({machines.length} {machines.length === 1 ? "Machine" : "Machines"})
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {description}
            </p>
          </div>
        </div>

        <div>{lineStatusBadge}</div>
      </div>

      {/* Grid of machines in this line */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {machines.map((machine) => (
          <MachineCard key={machine.id} machine={machine} />
        ))}
      </div>
    </div>
  );
}
