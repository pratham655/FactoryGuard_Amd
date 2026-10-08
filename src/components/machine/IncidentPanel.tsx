import React from "react";
import { AlertOctagon, AlertTriangle, CheckCircle2, Flame, ShieldAlert, Cpu } from "lucide-react";
import type { Machine } from "@/lib/factory-data";

interface IncidentPanelProps {
  machine: Machine;
  onInvestigateClick?: () => void;
}

export function IncidentPanel({ machine, onInvestigateClick }: IncidentPanelProps) {
  const isCritical = machine.status === "critical";
  const isWarning = machine.status === "warning";

  return (
    <div
      id="incidents"
      className={`rounded-xl border p-6 shadow-sm space-y-6 ${
        isCritical
          ? "border-red-500/50 bg-slate-900/90"
          : isWarning
            ? "border-amber-500/40 bg-slate-900/90"
            : "border-slate-800 bg-slate-900/80"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-lg ${
              isCritical
                ? "bg-red-500/20 text-red-400"
                : isWarning
                  ? "bg-amber-500/20 text-amber-400"
                  : "bg-slate-800 text-emerald-400"
            }`}
          >
            {isCritical ? (
              <AlertOctagon className="w-4 h-4" />
            ) : isWarning ? (
              <AlertTriangle className="w-4 h-4" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
          </div>
          <div>
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
              Active Incident State & Alarm Diagnostics
            </h3>
            <p className="text-xs text-slate-400">
              Real-time alarm trip points and error code analysis for {machine.id}.
            </p>
          </div>
        </div>

        <span
          className={`text-xs font-mono font-bold px-2.5 py-1 rounded uppercase ${
            isCritical
              ? "bg-red-500/20 text-red-400 border border-red-500/40"
              : isWarning
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
          }`}
        >
          {machine.status.toUpperCase()} INCIDENT STATUS
        </span>
      </div>

      {isCritical || isWarning ? (
        <div className="space-y-4 font-mono text-xs">
          <div className="rounded-lg border border-red-500/30 bg-red-950/20 p-4 space-y-2 text-red-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-red-400 text-sm flex items-center gap-2">
                <Flame className="w-4 h-4" />
                {machine.id === "CNC-07"
                  ? "INCIDENT #INC-2026-07: Possible Spindle Bearing Degradation"
                  : `INCIDENT #INC-2026-${machine.id.replace("CNC-", "")}: Operating Envelope Violation`}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/30 text-white font-bold">
                HIGH PRIORITY
              </span>
            </div>

            <p className="text-slate-300 leading-relaxed">
              Anomaly triggered due to multi-signal threshold exceedance. Temperature reached {machine.telemetry.temperature}°C (limit 80°C), Vibration reached {machine.telemetry.vibration} mm/s (limit 5.0 mm/s).
              {machine.telemetry.errorCode && ` Machine controller triggered hard fault code ${machine.telemetry.errorCode}.`}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-400 border-t border-red-500/20">
              <span>TRIP TIME: LIVE STREAM</span>
              <span>•</span>
              <span>ALARM CLASS: SAFETY-INTERLOCK</span>
              <span>•</span>
              <button
                onClick={onInvestigateClick}
                className="text-cyan-400 hover:text-cyan-300 font-bold underline cursor-pointer"
              >
                Run AI Multi-Signal Synthesis →
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-6 text-center font-mono text-xs">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <p className="font-bold text-slate-200">All Alarms Clear</p>
          <p className="text-slate-400 mt-1">
            Machine operates within safety parameters. No active alarms or threshold trips.
          </p>
        </div>
      )}
    </div>
  );
}
