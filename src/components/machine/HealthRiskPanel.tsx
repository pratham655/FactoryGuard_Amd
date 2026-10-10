import React from "react";
import { HeartPulse } from "lucide-react";
import type { Machine } from "@/lib/factory-data";

interface HealthRiskPanelProps {
  machine: Machine;
}

type RiskSeverity = "critical" | "warning" | "normal";

function clampRisk(value: number, maximum = 99): number {
  return Math.max(2, Math.min(maximum, Math.round(value)));
}

function getSeverity(risk: number): RiskSeverity {
  if (risk >= 65) return "critical";
  if (risk >= 30) return "warning";
  return "normal";
}

function formatRisk(risk: number): string {
  const label = risk >= 65 ? "High heuristic risk" : risk >= 30 ? "Elevated estimate" : "Low estimate";
  return `${risk}% (${label})`;
}

export function HealthRiskPanel({ machine }: HealthRiskPanelProps) {
  const { temperature, vibration, motorCurrent, pressure } = machine.telemetry;

  // Transparent demonstration heuristics, not calibrated failure probabilities.
  const spindleRisk = clampRisk(
    Math.max(0, temperature - 70) * 1.5 +
      Math.max(0, vibration - 3) * 5 +
      Math.max(0, motorCurrent - 12) * 2,
  );
  const motorRisk = clampRisk(
    Math.max(0, temperature - 75) * 1.1 +
      Math.max(0, motorCurrent - 13) * 4,
    95,
  );
  const clampRiskEstimate = clampRisk(Math.abs(pressure - 4.1) * 18, 95);
  const guidewayRisk = clampRisk(vibration * 2 + Math.max(0, temperature - 75), 90);

  const failureModes = [
    {
      component: "Spindle Angular Contact Bearing (Front)",
      risk: spindleRisk,
      severity: getSeverity(spindleRisk),
      mechanism: `Temperature ${temperature}°C and vibration ${vibration} mm/s contribute to this rule-based estimate.`,
    },
    {
      component: "Drive Motor Stator Winding Insulation",
      risk: motorRisk,
      severity: getSeverity(motorRisk),
      mechanism: `Motor current ${motorCurrent} A and temperature ${temperature}°C contribute to this rule-based estimate.`,
    },
    {
      component: "Hydraulic Drawbar / Tool Clamp Assembly",
      risk: clampRiskEstimate,
      severity: getSeverity(clampRiskEstimate),
      mechanism: `Pressure reading ${pressure} bar is compared with a demonstration reference of 4.1 bar.`,
    },
    {
      component: "X/Y/Z Linear Guideway Trucks",
      risk: guidewayRisk,
      severity: getSeverity(guidewayRisk),
      mechanism: `Vibration ${vibration} mm/s and temperature ${temperature}°C contribute to this rule-based estimate.`,
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
              Telemetry-based heuristic indicators for {machine.id}; estimates only, not validated failure probabilities or remaining-useful-life predictions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400">ESTIMATE TYPE:</span>
          <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold">
            RULE-BASED
          </span>
        </div>
      </div>

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
                Heuristic inputs: {item.mechanism}
              </p>
            </div>

            <div className="shrink-0 flex md:flex-col items-end justify-between md:justify-center">
              <span className="text-[10px] uppercase text-slate-400 font-semibold">
                HEURISTIC RISK ESTIMATE
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
                {formatRisk(item.risk)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
