import React from "react";
import {
  Gauge,
} from "lucide-react";
import type { Machine } from "@/lib/factory-data";

interface ProductionPanelProps {
  machine: Machine;
}

export function ProductionPanel({ machine }: ProductionPanelProps) {
  const isCritical = machine.status === "critical";
  const isWarning = machine.status === "warning";
  const { temperature, vibration, motorCurrent } = machine.telemetry;
  const workload = Math.min(95, Math.max(20, 45 + (motorCurrent - 10) * 4 + (temperature - 65) * 0.35));
  const health = Math.min(100, Math.max(20, 100 - Math.max(0, temperature - 70) * 1.2 - Math.max(0, vibration - 3) * 4));
  const availability = isCritical ? 0 : isWarning ? 65 : 97.8;
  const performance = Math.min(100, Math.max(0, Math.round(workload * 1.08)));
  const quality = Math.min(100, Math.max(70, 100 - Math.max(0, temperature - 75) * 0.12 - Math.max(0, vibration - 4) * 0.25));
  const batchTarget = 50;
  const batchCompleted = isCritical ? 24 : Math.min(batchTarget, Math.max(1, Math.round((health / 100) * batchTarget)));

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
          TELEMETRY-BASED ESTIMATE
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-4 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase">ACTIVE WORK ORDER</span>
          <p className="text-sm font-bold text-white">DEMO-WO-{machine.id}</p>
          <p className="text-[11px] text-slate-400">Illustrative work order for {machine.model}</p>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-4 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase">CURRENT CYCLE TIME</span>
          <p className="text-sm font-bold text-white">{isCritical ? "HALTED" : isWarning ? "DEGRADED" : "RUNNING"}</p>
          <p className="text-[11px] text-slate-400">Estimated workload: {workload.toFixed(0)}%</p>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-4 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase">BATCH PROGRESS</span>
          <p className="text-sm font-bold text-cyan-400">{batchCompleted} / {batchTarget} {isCritical ? "(PAUSED)" : "PCS (EST.)"}</p>
          <div className="mt-1 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full ${isCritical ? "bg-amber-400" : "bg-cyan-400"}`}
              style={{ width: `${(batchCompleted / batchTarget) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-800/80 bg-slate-950/50 p-3 flex items-center justify-between text-xs font-mono text-slate-400">
        <span>Availability estimate: <strong className="text-white">{availability.toFixed(1)}%</strong></span>
        <span>Performance estimate: <strong className="text-white">{performance.toFixed(1)}%</strong></span>
        <span>Quality estimate: <strong className="text-white">{quality.toFixed(1)}%</strong></span>
      </div>
    </div>
  );
}
