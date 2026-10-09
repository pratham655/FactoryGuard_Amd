"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Clock,
  Layers,
} from "lucide-react";
import { StatusIndicator } from "@/components/factory/StatusIndicator";
import type { FactorySummary } from "@/lib/factory-summary";

interface FactoryHeaderProps {
  summary: FactorySummary;
}

export function FactoryHeader({ summary }: FactoryHeaderProps) {
  const [timeStr, setTimeStr] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) + " UTC"
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const isAttentionRequired = summary.factoryStatus === "attention-required";

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Title & Brand Context */}
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold tracking-tight text-white font-mono">
                FactoryGuard
              </span>
              <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[11px] font-mono text-cyan-400">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span>LIVE TELEMETRY BUS</span>
              </div>
            </div>
            <h1 className="text-sm font-medium tracking-wide text-slate-400 mt-0.5">
              Industrial Operations Center
            </h1>
          </div>
        </div>

        {/* Status Indicators & Live Badges */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          {/* Live Clock */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/90 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{timeStr || "12:00:00 UTC"}</span>
          </div>

          {/* Factory Status Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/90">
            <span className="text-slate-400">STATUS:</span>
            <StatusIndicator
              status={isAttentionRequired ? "warning" : "normal"}
              size="sm"
              showLabel={true}
            />
          </div>

          {/* Machine Online Count */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/90 text-slate-300">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              <strong className="text-white">{summary.totalMachines}</strong>{" "}
              MACHINES MONITORED
            </span>
          </div>

          {/* Active Incidents Badge */}
          <Link
            href="#active-incidents"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
              summary.activeIncidents > 0
                ? "border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                : "border-slate-800 bg-slate-900/90 text-slate-400"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 animate-pulse text-red-400" />
            <span>
              <strong className="text-white">{summary.activeIncidents}</strong>{" "}
              ACTIVE {summary.activeIncidents === 1 ? "INCIDENT" : "INCIDENTS"}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
