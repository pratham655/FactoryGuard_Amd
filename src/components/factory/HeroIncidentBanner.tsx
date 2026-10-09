import React from "react";
import Link from "next/link";
import {
  AlertOctagon,
  Sparkles,
  Thermometer,
  Activity,
  Zap,
  Gauge,
  ArrowRight,
} from "lucide-react";
import type { Machine } from "@/lib/factory-data";

interface HeroIncidentBannerProps {
  criticalMachine?: Machine;
}

export function HeroIncidentBanner({ criticalMachine }: HeroIncidentBannerProps) {
  if (!criticalMachine) return null;

  return (
    <section
      id="active-incidents"
      className="mb-8 rounded-xl border border-red-500/50 bg-gradient-to-r from-red-950/40 via-slate-900/90 to-slate-900/90 p-5 shadow-lg shadow-red-950/20 pulse-critical"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        {/* Left info */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-red-500/20 border border-red-500/50 px-2.5 py-1 text-xs font-mono font-bold uppercase tracking-wider text-red-300">
              <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
              CRITICAL INCIDENT DETECTED
            </span>
            <span className="font-mono text-xs font-semibold text-slate-400">
              {criticalMachine.name} • {criticalMachine.model} • {criticalMachine.location} ({criticalMachine.line})
            </span>
          </div>

          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2 font-mono">
              Possible Spindle Bearing Degradation
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl">
              Thermal overload and excessive vibration anomaly detected on Spindle Axis Z. Operating thresholds violated. Immediate AI diagnostic investigation and operator action recommended.
            </p>
          </div>

          {/* Telemetry quick metrics */}
          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-mono">
            <div className="flex items-center gap-1.5 rounded bg-slate-950/70 px-2.5 py-1 border border-slate-800">
              <Thermometer className="w-3.5 h-3.5 text-red-400" />
              <span className="text-slate-400">TEMP:</span>
              <strong className="text-red-400">{criticalMachine.telemetry.temperature}°C</strong>
              <span className="text-[10px] text-slate-500">(Limit 80°C)</span>
            </div>

            <div className="flex items-center gap-1.5 rounded bg-slate-950/70 px-2.5 py-1 border border-slate-800">
              <Activity className="w-3.5 h-3.5 text-red-400" />
              <span className="text-slate-400">VIBRATION:</span>
              <strong className="text-red-400">{criticalMachine.telemetry.vibration} mm/s</strong>
              <span className="text-[10px] text-slate-500">(Limit 5.0)</span>
            </div>

            <div className="flex items-center gap-1.5 rounded bg-slate-950/70 px-2.5 py-1 border border-slate-800">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">CURRENT:</span>
              <strong className="text-amber-400">{criticalMachine.telemetry.motorCurrent} A</strong>
            </div>

            <div className="flex items-center gap-1.5 rounded bg-slate-950/70 px-2.5 py-1 border border-slate-800">
              <Gauge className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">PRESSURE:</span>
              <strong className="text-slate-200">{criticalMachine.telemetry.pressure} bar</strong>
            </div>

            {criticalMachine.telemetry.errorCode && (
              <div className="flex items-center gap-1.5 rounded bg-red-950/80 px-2.5 py-1 border border-red-500/40 text-red-300">
                <span className="text-red-400 font-bold">FAULT CODE:</span>
                <strong className="text-white bg-red-600/30 px-1 rounded">{criticalMachine.telemetry.errorCode}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Right CTA Button */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href={`/machines/${criticalMachine.id}`}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-5 py-3 text-xs font-mono font-bold uppercase tracking-wider text-white shadow-lg shadow-red-950/50 hover:from-red-500 hover:to-red-600 transition-all group"
          >
            <Sparkles className="w-4 h-4 text-cyan-200" />
            <span>Open Diagnostic Workspace</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
