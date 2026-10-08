import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Cpu,
  MapPin,
  Layers,
  Sparkles,
  Download,
  AlertOctagon,
  RefreshCw,
} from "lucide-react";
import { StatusIndicator } from "@/components/factory/StatusIndicator";
import type { Machine } from "@/lib/factory-data";

interface MachineHeaderProps {
  machine: Machine;
  onInvestigateClick?: () => void;
}

export function MachineHeader({
  machine,
  onInvestigateClick,
}: MachineHeaderProps) {
  return (
    <div className="border-b border-slate-800 bg-slate-950/90 pb-6 mb-6">
      {/* Top Breadcrumbs and Back Link */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono font-medium text-slate-400 hover:text-cyan-400 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Factory Floor</span>
        </Link>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
          <span>CONTROL ROOM</span>
          <span>/</span>
          <span>MACHINES</span>
          <span>/</span>
          <span className="text-cyan-400 font-bold">{machine.id}</span>
        </div>
      </div>

      {/* Main Machine Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold font-mono tracking-tight text-white flex items-center gap-3">
              <span>{machine.name}</span>
            </h1>
            <StatusIndicator status={machine.status} size="md" />
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
              {machine.model}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 pt-1">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              {machine.line}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              {machine.location}
            </span>
            <span>•</span>
            <span className="text-slate-500">
              SERIAL: FG-{machine.id}-2026-X
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onInvestigateClick}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 shadow-md shadow-cyan-950/40 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-cyan-200" />
            <span>AI Investigation</span>
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono text-slate-300 bg-slate-900 border border-slate-700 hover:bg-slate-800 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export Diagnostic Report</span>
          </button>
        </div>
      </div>
    </div>
  );
}
