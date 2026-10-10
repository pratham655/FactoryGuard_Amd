"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  AlertTriangle,
  Clock,
  Layers,
} from "lucide-react";
import { StatusIndicator } from "@/components/factory/StatusIndicator";
import type { FactorySummary } from "@/lib/factory-summary";
import { detectIncident } from "@/lib/incident-detector";
import type { SimulationState } from "@/lib/simulation-engine";
import { getFactoryMachines } from "@/lib/factory-data";

interface FactoryHeaderProps {
  summary: FactorySummary;
}

type SimulationResponse = { simulation: SimulationState; running: boolean };

export function FactoryHeader({ summary }: FactoryHeaderProps) {
  const [timeStr, setTimeStr] = useState<string>("");
  const [liveSummary, setLiveSummary] = useState<FactorySummary>(summary);
  const { isLoaded, user } = useUser();

  useEffect(() => {
    let active = true;
    const refreshSummary = async () => {
      try {
        const response = await fetch("/api/simulation/state", { cache: "no-store" });
        if (!response.ok) return;
        const payload = (await response.json()) as SimulationResponse;
        const machines = Object.entries(payload.simulation.machines);
        const baselineMachines = getFactoryMachines();
        let normalMachines = 0;
        let warningMachines = 0;
        let criticalMachines = 0;
        for (const [machineId, live] of machines) {
          const baseline = baselineMachines.find((machine) => machine.id === machineId);
          if (!baseline) continue;
          const severity = detectIncident({
            ...baseline.telemetry,
            temperature: live.temperature,
            vibration: live.vibration,
            motorCurrent: live.motorCurrent,
            errorCode: live.scenario === null ? baseline.telemetry.errorCode : "SIM-FAULT",
          }).severity;
          if (severity === "critical") criticalMachines += 1;
          else if (severity === "warning") warningMachines += 1;
          else normalMachines += 1;
        }
        if (active && machines.length > 0) {
          setLiveSummary({
            totalMachines: machines.length,
            normalMachines,
            warningMachines,
            criticalMachines,
            activeIncidents: warningMachines + criticalMachines,
            factoryStatus: warningMachines + criticalMachines > 0 ? "attention-required" : "healthy",
          });
        }
      } catch {
        // Retain the last known summary on transient errors.
      }
    };
    void refreshSummary();
    const summaryTimer = window.setInterval(() => void refreshSummary(), 1500);
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
    return () => { active = false; window.clearInterval(summaryTimer); clearInterval(interval); };
  }, []);

  const isAttentionRequired = liveSummary.factoryStatus === "attention-required";
  const displayName = user?.fullName || user?.primaryEmailAddress?.emailAddress || "Signed-in operator";

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold tracking-tight text-white font-mono">FactoryGuard</span>
              <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[11px] font-mono text-cyan-400">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span>LIVE TELEMETRY BUS</span>
              </div>
            </div>
            <h1 className="text-sm font-medium tracking-wide text-slate-400 mt-0.5">Industrial Operations Center</h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/90 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{timeStr || "12:00:00 UTC"}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/90">
            <span className="text-slate-400">STATUS:</span>
            <StatusIndicator status={isAttentionRequired ? "warning" : "normal"} size="sm" showLabel={true} />
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/90 text-slate-300">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span><strong className="text-white">{liveSummary.totalMachines}</strong> MACHINES MONITORED</span>
          </div>
          <Link
            href="#active-incidents"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
              liveSummary.activeIncidents > 0
                ? "border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                : "border-slate-800 bg-slate-900/90 text-slate-400"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 animate-pulse text-red-400" />
            <span><strong className="text-white">{liveSummary.activeIncidents}</strong> ACTIVE {liveSummary.activeIncidents === 1 ? "INCIDENT" : "INCIDENTS"}</span>
          </Link>
          <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-1.5">
            <div className="min-w-0 max-w-40">
              <p className="truncate text-[11px] text-white">{isLoaded ? displayName : "Loading account…"}</p>
              <p className="text-[10px] uppercase tracking-wider text-cyan-400">Authenticated</p>
            </div>
            <UserButton />
          </div>
        </div>
      </div>
    </header>
  );
}