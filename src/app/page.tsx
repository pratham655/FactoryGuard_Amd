import React from "react";
import { getFactoryMachines } from "@/lib/factory-data";
import { getFactorySummary } from "@/lib/factory-summary";
import { FactorySidebar } from "@/components/layout/FactorySidebar";
import { FactoryHeader } from "@/components/layout/FactoryHeader";
import { FactoryKPIs } from "@/components/factory/FactoryKPIs";
import { HeroIncidentBanner } from "@/components/factory/HeroIncidentBanner";
import { FactoryFloor } from "@/components/factory/FactoryFloor";

export default function Home() {
  const summary = getFactorySummary();
  const machines = getFactoryMachines();

  const criticalMachine = machines.find((m) => m.status === "critical") ?? machines.find((m) => m.id === "CNC-07");

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Left Sidebar */}
      <FactorySidebar />

      {/* Main Control Room Container */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0 industrial-grid">
        {/* Top Control Room Header */}
        <FactoryHeader summary={summary} />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Subheader / Context Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
            <div>
              <p className="text-[11px] font-mono font-medium uppercase tracking-[0.2em] text-cyan-400">
                Intelligent Industry • Autonomous Incident Intelligence
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white mt-0.5">
                FactoryGuard Operations Control Center
              </h1>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>SHOP FLOOR BUS ACTIVE</span>
            </div>
          </div>

          {/* Top KPI Strip (contains "Factory Status") */}
          <FactoryKPIs summary={summary} />

          {/* Critical Incident Hero Callout */}
          <HeroIncidentBanner criticalMachine={criticalMachine} />

          {/* Factory Floor (contains "Machine Monitoring") */}
          <FactoryFloor machines={machines} />
        </main>
      </div>
    </div>
  );
}