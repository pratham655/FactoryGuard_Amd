import React from "react";
import {
  Activity,
  Thermometer,
  Zap,
  Gauge,
  AlertOctagon,
  CheckCircle2,
  Radio,
} from "lucide-react";
import type { MachineTelemetry } from "@/lib/incident-detector";

interface TelemetryPanelProps {
  telemetry: MachineTelemetry;
  machineId: string;
}

export function TelemetryPanel({ telemetry, machineId }: TelemetryPanelProps) {
  const telemetryItems = [
    {
      sensor: "Spindle Core Temperature",
      key: "TEMP-S1",
      value: `${telemetry.temperature} °C`,
      baseline: "65.0 - 75.0 °C",
      warningThreshold: "80.0 °C",
      criticalThreshold: "90.0 °C",
      status: telemetry.temperature >= 90 ? "critical" : telemetry.temperature >= 80 ? "warning" : "normal",
      icon: Thermometer,
      percentage: Math.min(100, Math.max(10, ((telemetry.temperature - 50) / 50) * 100)),
    },
    {
      sensor: "Spindle Triaxial Vibration (RMS)",
      key: "VIB-RMS-Z",
      value: `${telemetry.vibration} mm/s`,
      baseline: "1.5 - 3.5 mm/s",
      warningThreshold: "5.0 mm/s",
      criticalThreshold: "8.0 mm/s",
      status: telemetry.vibration >= 8 ? "critical" : telemetry.vibration >= 5 ? "warning" : "normal",
      icon: Activity,
      percentage: Math.min(100, Math.max(10, (telemetry.vibration / 10) * 100)),
    },
    {
      sensor: "Spindle Motor Current Load",
      key: "CURR-DRV",
      value: `${telemetry.motorCurrent} A`,
      baseline: "10.0 - 13.0 A",
      warningThreshold: "15.0 A",
      criticalThreshold: "18.0 A",
      status: telemetry.motorCurrent >= 18 ? "critical" : telemetry.motorCurrent >= 15 ? "warning" : "normal",
      icon: Zap,
      percentage: Math.min(100, Math.max(10, (telemetry.motorCurrent / 20) * 100)),
    },
    {
      sensor: "Hydraulic Clamping / Coolant Pressure",
      key: "PRES-HYD",
      value: `${telemetry.pressure} bar`,
      baseline: "3.8 - 4.5 bar",
      warningThreshold: "< 3.5 or > 4.8 bar",
      criticalThreshold: "< 3.0 or > 5.2 bar",
      status: "normal",
      icon: Gauge,
      percentage: Math.min(100, Math.max(10, (telemetry.pressure / 6) * 100)),
    },
  ];

  return (
    <div
      id="telemetry"
      className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 shadow-sm space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 text-cyan-400">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
              High-Frequency Sensor Telemetry Envelopes
            </h3>
            <p className="text-xs text-slate-400">
              Live sensor telemetry channels sampled from machine bus on {machineId}.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          {telemetry.errorCode ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-red-500/20 border border-red-500/40 text-red-300 font-bold">
              <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
              ACTIVE FAULT: {telemetry.errorCode}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              NO FAULT CODES ACTIVE
            </span>
          )}
        </div>
      </div>

      {/* Telemetry Sensor Channel Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {telemetryItems.map((item) => {
          const isCritical = item.status === "critical";
          const isWarning = item.status === "warning";

          return (
            <div
              key={item.key}
              className={`rounded-xl border p-4 space-y-3 font-mono text-xs transition-all ${
                isCritical
                  ? "border-red-500/50 bg-red-950/20"
                  : isWarning
                    ? "border-amber-500/40 bg-amber-950/15"
                    : "border-slate-800 bg-slate-950/70"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {item.key}
                    </span>
                    <span className="font-bold text-slate-200">{item.sensor}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Normal Baseline: {item.baseline}
                  </p>
                </div>

                <span
                  className={`text-base font-bold tracking-tight ${
                    isCritical
                      ? "text-red-400"
                      : isWarning
                        ? "text-amber-400"
                        : "text-slate-100"
                  }`}
                >
                  {item.value}
                </span>
              </div>

              {/* Threshold Visualizer Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Nominal</span>
                  <span>Warn: {item.warningThreshold}</span>
                  <span>Crit: {item.criticalThreshold}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCritical
                        ? "bg-red-500"
                        : isWarning
                          ? "bg-amber-400"
                          : "bg-emerald-400"
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
