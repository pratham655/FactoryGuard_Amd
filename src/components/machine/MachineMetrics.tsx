import React from "react";
import {
  HeartPulse,
  ShieldAlert,
  Thermometer,
  Activity,
  Zap,
  Gauge,
} from "lucide-react";
import type { Machine } from "@/lib/factory-data";

interface MachineMetricsProps {
  machine: Machine;
}

export function MachineMetrics({ machine }: MachineMetricsProps) {
  const isCritical = machine.status === "critical";
  const isWarning = machine.status === "warning";

  const healthScore = isCritical ? 42 : isWarning ? 78 : 99;
  const riskLevel = isCritical ? "CRITICAL RISK" : isWarning ? "MODERATE RISK" : "LOW RISK";
  const productionRate = isCritical ? "0% (HALTED)" : isWarning ? "65% (DEGRADED)" : "98.4% (NOMINAL)";

  const metrics = [
    {
      label: "Health Index",
      value: `${healthScore}%`,
      status: isCritical ? "critical" : isWarning ? "warning" : "normal",
      icon: HeartPulse,
      detail: isCritical ? "Severe Degradation" : isWarning ? "Elevated Wear" : "Optimal Condition",
      valueColor: isCritical ? "text-red-400" : isWarning ? "text-amber-400" : "text-emerald-400",
      iconColor: isCritical ? "text-red-400" : isWarning ? "text-amber-400" : "text-emerald-400",
      bgClass: isCritical ? "border-red-500/40 bg-red-950/20" : isWarning ? "border-amber-500/30 bg-amber-950/15" : "border-slate-800 bg-slate-900/80",
    },
    {
      label: "Risk Assessment",
      value: riskLevel,
      status: isCritical ? "critical" : isWarning ? "warning" : "normal",
      icon: ShieldAlert,
      detail: isCritical ? "Catastrophic Failure Risk" : isWarning ? "Precautionary State" : "All Envelopes Safe",
      valueColor: isCritical ? "text-red-400 text-lg sm:text-xl" : isWarning ? "text-amber-400 text-lg sm:text-xl" : "text-emerald-400 text-lg sm:text-xl",
      iconColor: isCritical ? "text-red-400" : isWarning ? "text-amber-400" : "text-emerald-400",
      bgClass: isCritical ? "border-red-500/40 bg-red-950/20" : isWarning ? "border-amber-500/30 bg-amber-950/15" : "border-slate-800 bg-slate-900/80",
    },
    {
      label: "Spindle Temp",
      value: `${machine.telemetry.temperature} °C`,
      status: machine.telemetry.temperature >= 90 ? "critical" : machine.telemetry.temperature >= 80 ? "warning" : "normal",
      icon: Thermometer,
      detail: "Threshold: 80.0 °C",
      valueColor: machine.telemetry.temperature >= 90 ? "text-red-400" : machine.telemetry.temperature >= 80 ? "text-amber-400" : "text-slate-100",
      iconColor: machine.telemetry.temperature >= 90 ? "text-red-400" : machine.telemetry.temperature >= 80 ? "text-amber-400" : "text-cyan-400",
      bgClass: "border-slate-800 bg-slate-900/80",
    },
    {
      label: "Vibration Index",
      value: `${machine.telemetry.vibration} mm/s`,
      status: machine.telemetry.vibration >= 8 ? "critical" : machine.telemetry.vibration >= 5 ? "warning" : "normal",
      icon: Activity,
      detail: "Threshold: 5.0 mm/s",
      valueColor: machine.telemetry.vibration >= 8 ? "text-red-400" : machine.telemetry.vibration >= 5 ? "text-amber-400" : "text-slate-100",
      iconColor: machine.telemetry.vibration >= 8 ? "text-red-400" : machine.telemetry.vibration >= 5 ? "text-amber-400" : "text-cyan-400",
      bgClass: "border-slate-800 bg-slate-900/80",
    },
    {
      label: "Motor Current",
      value: `${machine.telemetry.motorCurrent} A`,
      status: "normal",
      icon: Zap,
      detail: "Baseline: 11.5 A",
      valueColor: machine.telemetry.motorCurrent > 15 ? "text-amber-400" : "text-slate-100",
      iconColor: "text-amber-400",
      bgClass: "border-slate-800 bg-slate-900/80",
    },
    {
      label: "Production Rate",
      value: productionRate,
      status: isCritical ? "critical" : "normal",
      icon: Gauge,
      detail: "Target: 48 pcs/shift",
      valueColor: isCritical ? "text-red-400 text-sm sm:text-base" : "text-cyan-400 text-sm sm:text-base",
      iconColor: "text-cyan-400",
      bgClass: "border-slate-800 bg-slate-900/80",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {metrics.map((m) => {
        const Icon = m.icon;
        return (
          <div
            key={m.label}
            className={`rounded-xl border p-3.5 transition-all ${m.bgClass}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-medium uppercase text-slate-400">
                {m.label}
              </span>
              <Icon className={`w-4 h-4 ${m.iconColor}`} />
            </div>

            <div className="mt-2">
              <p className={`font-mono font-bold tracking-tight ${m.valueColor} text-xl truncate`}>
                {m.value}
              </p>
            </div>

            <p className="mt-1.5 text-[10px] font-mono text-slate-500 truncate">
              {m.detail}
            </p>
          </div>
        );
      })}
    </div>
  );
}
