import React from "react";
import { Gauge, Clock, PackageCheck, AlertTriangle, Layers } from "lucide-react";
import type { Machine } from "@/lib/factory-data";

interface ProductionPanelProps {
  machine: Machine;
}

export function ProductionPanel({ machine }: ProductionPanelProps) {
  const isCritical = machine.status === "critical";

  return (
    <div
      id="production"
      className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 shadow-sm space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 text-cyan-400">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
              Production Execution & OEE Telemetry
            </h3>
            <p className="text-xs text-slate-400">
              Active part run, cycle time variance, and throughput metrics for {machine.id}.
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
          SIMULATION EXTENSION READY
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-4 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase">ACTIVE WORK ORDER</span>
          <p className="text-sm font-bold text-white">WO-8842-AERO-TURBINE</p>
          <p className="text-[11px] text-slate-400">Part: Ti-6Al-4V Impeller Housing</p>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-4 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase">CURRENT CYCLE TIME</span>
          <p className="text-sm font-bold text-white">{isCritical ? "HALTED (0.0s)" : "148.4s / target 145s"}</p>
          <p className="text-[11px] text-slate-400">Deviation: {isCritical ? "N/A" : "+2.3%"}</p>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-4 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase">BATCH PROGRESS</span>
          <p className="text-sm font-bold text-cyan-400">{isCritical ? "24 / 50 (PAUSED)" : "42 / 50 Pcs"}</p>
          <div className="mt-1 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full ${isCritical ? "bg-amber-400" : "bg-cyan-400"}`}
              style={{ width: isCritical ? "48%" : "84%" }}
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-800/80 bg-slate-950/50 p-3 flex items-center justify-between text-xs font-mono text-slate-400">
        <span>OEE Availability: <strong className="text-white">{isCritical ? "45.2%" : "97.8%"}</strong></span>
        <span>Performance: <strong className="text-white">{isCritical ? "0.0%" : "96.4%"}</strong></span>
        <span>Quality Yield: <strong className="text-white">99.2%</strong></span>
      </div>
    </div>
  );
}
