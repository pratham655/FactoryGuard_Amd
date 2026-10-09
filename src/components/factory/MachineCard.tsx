import React from "react";
import Link from "next/link";
import {
  Activity,
  Thermometer,
  Zap,
  Gauge,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import { StatusIndicator } from "@/components/factory/StatusIndicator";
import type { Machine } from "@/lib/factory-data";

interface MachineCardProps {
  machine: Machine;
}

export function MachineCard({ machine }: MachineCardProps) {
  const isCritical = machine.status === "critical";
  const isWarning = machine.status === "warning";

  // Dynamic styling based on machine.status
  const cardBorderClass = isCritical
    ? "border-red-500/50 bg-gradient-to-b from-red-950/20 via-slate-900 to-slate-900 pulse-critical shadow-lg shadow-red-950/30"
    : isWarning
      ? "border-amber-500/40 bg-gradient-to-b from-amber-950/10 via-slate-900 to-slate-900 pulse-warning shadow-md shadow-amber-950/20"
      : "border-slate-800/90 bg-slate-900/90 hover:border-slate-700";

  // Temperature threshold calculation for mini telemetry bar
  // Normal is <80, Warning is >=80, Critical is >=90. Let's map 50°C-100°C to 0%-100%
  const tempPercent = Math.min(
    100,
    Math.max(10, ((machine.telemetry.temperature - 50) / 50) * 100)
  );

  // Vibration threshold calculation: 0 to 10 mm/s
  const vibPercent = Math.min(100, Math.max(10, (machine.telemetry.vibration / 10) * 100));

  return (
    <Link
      href={`/machines/${machine.id}`}
      className={`group relative flex flex-col rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-cyan-950/20 ${cardBorderClass}`}
    >
      {/* Top bar: Machine ID, Location & Status */}
      <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-base font-bold tracking-tight text-white group-hover:text-cyan-400 transition-colors">
              {machine.name}
            </span>
            <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
              {machine.location}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 truncate font-medium">
            {machine.model}
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-1.5">
          <StatusIndicator status={machine.status} size="sm" />
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
        </div>
      </div>

      {/* Main Telemetry Grid */}
      <div className="grid grid-cols-2 gap-2.5 py-3 text-xs font-mono">
        {/* Temperature */}
        <div className="rounded-lg bg-slate-950/70 p-2 border border-slate-800/80">
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <Thermometer className="w-3 h-3 text-slate-400" />
              TEMP
            </span>
            <span className="text-[9px] text-slate-500">MAX 80°</span>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span
              className={`text-sm font-bold ${
                machine.telemetry.temperature >= 90
                  ? "text-red-400"
                  : machine.telemetry.temperature >= 80
                    ? "text-amber-400"
                    : "text-slate-200"
              }`}
            >
              {machine.telemetry.temperature}°C
            </span>
          </div>
          {/* Mini progress bar */}
          <div className="mt-1.5 h-1 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                machine.telemetry.temperature >= 90
                  ? "bg-red-500"
                  : machine.telemetry.temperature >= 80
                    ? "bg-amber-400"
                    : "bg-emerald-400"
              }`}
              style={{ width: `${tempPercent}%` }}
            />
          </div>
        </div>

        {/* Vibration */}
        <div className="rounded-lg bg-slate-950/70 p-2 border border-slate-800/80">
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-slate-400" />
              VIB
            </span>
            <span className="text-[9px] text-slate-500">MAX 5.0</span>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span
              className={`text-sm font-bold ${
                machine.telemetry.vibration >= 8
                  ? "text-red-400"
                  : machine.telemetry.vibration >= 5
                    ? "text-amber-400"
                    : "text-slate-200"
              }`}
            >
              {machine.telemetry.vibration}{" "}
              <span className="text-[10px] font-normal text-slate-400">mm/s</span>
            </span>
          </div>
          {/* Mini progress bar */}
          <div className="mt-1.5 h-1 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                machine.telemetry.vibration >= 8
                  ? "bg-red-500"
                  : machine.telemetry.vibration >= 5
                    ? "bg-amber-400"
                    : "bg-emerald-400"
              }`}
              style={{ width: `${vibPercent}%` }}
            />
          </div>
        </div>

        {/* Motor Current */}
        <div className="rounded-lg bg-slate-950/70 p-2 border border-slate-800/80">
          <span className="flex items-center gap-1 text-[10px] text-slate-400">
            <Zap className="w-3 h-3 text-slate-400" />
            CURRENT
          </span>
          <p className="mt-1 text-sm font-bold text-slate-200">
            {machine.telemetry.motorCurrent}{" "}
            <span className="text-[10px] font-normal text-slate-400">A</span>
          </p>
        </div>

        {/* Pressure & Error Code */}
        <div className="rounded-lg bg-slate-950/70 p-2 border border-slate-800/80">
          <span className="flex items-center gap-1 text-[10px] text-slate-400">
            <Gauge className="w-3 h-3 text-slate-400" />
            PRESSURE
          </span>
          <div className="mt-1 flex items-center justify-between">
            <p className="text-sm font-bold text-slate-200">
              {machine.telemetry.pressure}{" "}
              <span className="text-[10px] font-normal text-slate-400">bar</span>
            </p>
            {machine.telemetry.errorCode && (
              <span className="font-mono text-[10px] font-bold px-1 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40">
                {machine.telemetry.errorCode}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer link / hover action */}
      <div className="mt-auto pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span className="text-slate-500 group-hover:text-slate-300 transition-colors">
          Line: {machine.line.replace("Production Line ", "Line ")}
        </span>
        <span className="flex items-center gap-1 text-cyan-400 font-semibold group-hover:translate-x-0.5 transition-transform">
          Open Workstation
          <ChevronRight className="w-3 h-3" />
        </span>
      </div>
    </Link>
  );
}
