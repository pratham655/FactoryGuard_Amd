import React from "react";
import {
  HeartPulse,
} from "lucide-react";
import type { Machine } from "@/lib/factory-data";

interface HealthRiskPanelProps {
  machine: Machine;
}

export function HealthRiskPanel({ machine }: HealthRiskPanelProps) {
  const isCritical = machine.status === "critical";
  const isWarning = machine.status === "warning";

  const failureModes = [
    {
      component: "Spindle Angular Contact Bearing (Front)",
      risk: isCritical ? "92% (High Risk)" : isWarning ? "45% (Moderate)" : "4% (Low)",
      severity: isCritical ? "critical" : isWarning ? "warning" : "normal",
      mechanism: "Micro-pitting / Raceway Spalling induced by thermal expansion",
    },
    {
      component: "Drive Motor Stator Winding Insulation",
      risk: isCritical ? "38% (Elevated)" : "8% (Nominal)",
      severity: isCritical ? "warning" : "normal",
      mechanism: "Thermal fatigue from continuous 17.8A overcurrent draw",
    },
    {
      component: "Hydraulic Drawbar / Tool Clamp Assembly",
      risk: "2% (Nominal)",
      severity: "normal",
      mechanism: "Normal clamping cycle wear within design limits",
    },
    {
      component: "X/Y/Z Linear Guideway Trucks",
      risk: "5% (Nominal)",
      severity: "normal",
      mechanism: "Standard lubrication film thickness verified",
    },
  ];

  return (
    <div
      id="health-risk"
      className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 shadow-sm space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 text-cyan-400">
            <HeartPulse className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
              Component Health & Failure Risk Projections
            </h3>
            <p className="text-xs text-slate-400">
              Telemetry-based heuristic risk indicators for {machine.id}; these are estimates, not validated failure probabilities or RUL predictions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400">PREDICTIVE MODEL:</span>
          <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold">
            RULE-BASED ESTIMATE
          </span>
        </div>
      </div>

      {/* Failure Modes Grid */}
      <div className="space-y-3">
        {failureModes.map((item) => (
          <div
            key={item.component}
            className={`rounded-lg border p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono text-xs ${
              item.severity === "critical"
                ? "border-red-500/40 bg-red-950/20 text-red-200"
                : item.severity === "warning"
                  ? "border-amber-500/40 bg-amber-950/15 text-amber-200"
                  : "border-slate-800 bg-slate-950/70 text-slate-300"
            }`}
          >
            <div className="space-y-1">
              <span className="font-bold text-white text-sm block">
                {item.component}
              </span>
              <p className="text-slate-400 text-xs">
                Failure Mechanism: {item.mechanism}
              </p>
            </div>

            <div className="shrink-0 flex md:flex-col items-end justify-between md:justify-center">
              <span className="text-[10px] uppercase text-slate-400 font-semibold">
                PROBABILITY OF FAILURE
              </span>
              <span
                className={`font-bold text-sm ${
                  item.severity === "critical"
                    ? "text-red-400"
                    : item.severity === "warning"
                      ? "text-amber-400"
                      : "text-emerald-400"
                }`}
              >
                {item.risk}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
