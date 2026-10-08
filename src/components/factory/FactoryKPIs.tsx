import React from "react";
import {
  Cpu,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Activity,
  Gauge,
  TrendingUp,
} from "lucide-react";
import type { FactorySummary } from "@/lib/factory-summary";

interface FactoryKPIsProps {
  summary: FactorySummary;
}

export function FactoryKPIs({ summary }: FactoryKPIsProps) {
  const kpis = [
    {
      label: "Total Machines",
      value: summary.totalMachines,
      unit: "UNITS",
      status: "neutral",
      icon: Cpu,
      subtext: "100% telemetry online",
      accent: "from-slate-800 to-slate-900 border-slate-700/60 text-slate-100",
      valueColor: "text-white",
      iconColor: "text-cyan-400",
    },
    {
      label: "Operational",
      value: summary.normalMachines,
      unit: "NOMINAL",
      status: "normal",
      icon: CheckCircle2,
      subtext: "Operating within thresholds",
      accent: "from-emerald-950/30 to-slate-900 border-emerald-500/30 text-emerald-300",
      valueColor: "text-emerald-400",
      iconColor: "text-emerald-400",
    },
    {
      label: "Warnings",
      value: summary.warningMachines,
      unit: "ELEVATED",
      status: "warning",
      icon: AlertTriangle,
      subtext: "Inspection recommended",
      accent: "from-amber-950/30 to-slate-900 border-amber-500/30 text-amber-300",
      valueColor: "text-amber-400",
      iconColor: "text-amber-400",
    },
    {
      label: "Critical",
      value: summary.criticalMachines,
      unit: "ACTION REQ",
      status: "critical",
      icon: AlertOctagon,
      subtext: "Immediate stoppage / triage",
      accent: "from-red-950/40 to-slate-900 border-red-500/40 text-red-300",
      valueColor: "text-red-400",
      iconColor: "text-red-400",
      pulsing: summary.criticalMachines > 0,
    },
    {
      label: "Active Incidents",
      value: summary.activeIncidents,
      unit: "OPEN",
      status: summary.activeIncidents > 0 ? "critical" : "normal",
      icon: Activity,
      subtext: "Anomaly detection active",
      accent:
        summary.activeIncidents > 0
          ? "from-red-950/30 to-slate-900 border-red-500/40 text-red-300"
          : "from-slate-900 to-slate-950 border-slate-800 text-slate-300",
      valueColor: summary.activeIncidents > 0 ? "text-red-400" : "text-emerald-400",
      iconColor: summary.activeIncidents > 0 ? "text-red-400" : "text-emerald-400",
    },
    {
      label: "Plant Throughput (OEE)",
      value: "94.2%",
      unit: "142 UPH",
      status: "neutral",
      icon: Gauge,
      subtext: "Target: 150 Units / Hour",
      accent: "from-cyan-950/30 to-slate-900 border-cyan-500/30 text-cyan-300",
      valueColor: "text-cyan-400",
      iconColor: "text-cyan-400",
      isPlaceholder: true,
    },
  ];

  return (
    <section className="mb-8" aria-label="Factory KPIs">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-mono font-bold tracking-wider uppercase text-slate-400 flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
          Factory Status & Performance Metrics
        </h2>
        <span className="text-[11px] font-mono text-slate-500">
          AUTO-REFRESH: REALTIME
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className={`relative rounded-xl border bg-gradient-to-b p-4 transition-all duration-200 hover:border-slate-600 ${
                kpi.accent
              } ${kpi.pulsing ? "pulse-critical" : ""}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-slate-400 truncate">
                  {kpi.label}
                </span>
                <Icon className={`w-4 h-4 ${kpi.iconColor}`} />
              </div>

              <div className="mt-2 flex items-baseline gap-2">
                <span className={`text-2xl lg:text-3xl font-bold font-mono tracking-tight ${kpi.valueColor}`}>
                  {kpi.value}
                </span>
                <span className="text-[10px] font-mono font-semibold text-slate-500 uppercase">
                  {kpi.unit}
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <p className="text-[10px] font-mono text-slate-400 truncate">
                  {kpi.subtext}
                </p>
                {kpi.isPlaceholder && (
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    EST
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
