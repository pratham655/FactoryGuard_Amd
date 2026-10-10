"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  Cpu,
  Gauge,
  HeartPulse,
  Radio,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import { MachineHeader } from "@/components/machine/MachineHeader";
import { MachineMetrics } from "@/components/machine/MachineMetrics";
import { TelemetryPanel } from "@/components/machine/TelemetryPanel";
import { HealthRiskPanel } from "@/components/machine/HealthRiskPanel";
import { ProductionPanel } from "@/components/machine/ProductionPanel";
import { MaintenanceTimeline } from "@/components/machine/MaintenanceTimeline";
import { IncidentPanel } from "@/components/machine/IncidentPanel";
import { TechnicalKnowledgePanel } from "@/components/machine/TechnicalKnowledgePanel";
import { GovernancePanel } from "@/components/machine/GovernancePanel";
import { InvestigationPanel } from "@/components/ai/InvestigationPanel";
import type { Machine } from "@/lib/factory-data";
import { detectIncident } from "@/lib/incident-detector";
import type { SimulationState } from "@/lib/simulation-engine";
import type { MaintenanceRecord } from "@/lib/maintenance-history";

interface MachineWorkspaceProps {
  machine: Machine;
  maintenanceHistory: MaintenanceRecord[];
}

export function MachineWorkspace({
  machine,
  maintenanceHistory,
}: MachineWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [simulation, setSimulation] = useState<SimulationState | null>(null);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const response = await fetch("/api/simulation/state", { cache: "no-store" });
        if (!response.ok) return;
        const payload = (await response.json()) as { simulation: SimulationState; running: boolean };
        if (active) setSimulation(payload.simulation);
      } catch {
        // Keep the last known telemetry during transient network failures.
      }
    };
    const timer = window.setInterval(() => void refresh(), 1500);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  const liveMachine = useMemo(() => {
    const live = simulation?.machines[machine.id];
    if (!live) return machine;
    const telemetry = {
      ...machine.telemetry,
      temperature: live.temperature,
      vibration: live.vibration,
      motorCurrent: live.motorCurrent,
      errorCode: live.scenario === null ? machine.telemetry.errorCode : "SIM-FAULT",
    };
    return { ...machine, telemetry, status: detectIncident(telemetry).severity };
  }, [machine, simulation]);

  const tabs = [
    { id: "overview", label: "1. OVERVIEW", icon: Cpu },
    { id: "telemetry", label: "2. LIVE TELEMETRY", icon: Radio },
    { id: "production", label: "3. PRODUCTION", icon: Gauge },
    { id: "health-risk", label: "4. HEALTH & RISK", icon: HeartPulse },
    { id: "maintenance", label: "5. MAINTENANCE", icon: Wrench },
    { id: "incidents", label: "6. INCIDENTS", icon: AlertTriangle },
    {
      id: "ai-investigation",
      label: "7. AI INVESTIGATION",
      icon: Sparkles,
      highlight: true,
    },
    { id: "technical-knowledge", label: "8. TECHNICAL KNOWLEDGE", icon: BookOpen },
    { id: "governance", label: "9. GOVERNANCE", icon: ShieldCheck },
  ];

  const handleInvestigateJump = () => {
    setActiveTab("ai-investigation");
    const el = document.getElementById("ai-investigation");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <MachineHeader
        machine={liveMachine}
        onInvestigateClick={handleInvestigateJump}
      />

      {/* Top 6 KPI Metric Cards */}
      <MachineMetrics machine={liveMachine} />

      {/* Diagnostic Tab Navigation Bar */}
      <div className="border-b border-slate-800 bg-slate-950/70 rounded-xl p-1.5 overflow-x-auto flex items-center gap-1.5 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? tab.highlight
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-950"
                    : "bg-slate-800 text-cyan-300 border border-slate-700 shadow-sm"
                  : tab.highlight
                    ? "text-cyan-400 hover:bg-cyan-500/10 border border-cyan-500/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent"
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 ${
                  isActive
                    ? "text-white"
                    : tab.highlight
                      ? "text-cyan-400"
                      : "text-slate-400"
                }`}
              />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Panes */}
      <div className="space-y-6">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* AI Investigation Panel (Hero Diagnostic Experience) */}
            <InvestigationPanel machineId={machine.id} />

            {/* Telemetry & Incidents side-by-side or stacked */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TelemetryPanel
                telemetry={liveMachine.telemetry}
                machineId={machine.id}
              />
              <IncidentPanel
                machine={liveMachine}
                onInvestigateClick={handleInvestigateJump}
              />
            </div>

            {/* Maintenance History Timeline */}
            <MaintenanceTimeline
              records={maintenanceHistory}
              machineId={machine.id}
            />

            {/* Component Health & Risk */}
            <HealthRiskPanel machine={liveMachine} />

            {/* Technical Knowledge Base */}
            <TechnicalKnowledgePanel machineId={machine.id} />
          </div>
        )}

        {activeTab === "telemetry" && (
          <TelemetryPanel
            telemetry={liveMachine.telemetry}
            machineId={machine.id}
          />
        )}

        {activeTab === "production" && <ProductionPanel machine={liveMachine} />}

        {activeTab === "health-risk" && <HealthRiskPanel machine={liveMachine} />}

        {activeTab === "maintenance" && (
          <MaintenanceTimeline
            records={maintenanceHistory}
            machineId={machine.id}
          />
        )}

        {activeTab === "incidents" && (
          <IncidentPanel
            machine={liveMachine}
            onInvestigateClick={handleInvestigateJump}
          />
        )}

        {activeTab === "ai-investigation" && (
          <InvestigationPanel machineId={machine.id} />
        )}

        {activeTab === "technical-knowledge" && (
          <TechnicalKnowledgePanel machineId={machine.id} />
        )}

        {activeTab === "governance" && <GovernancePanel machine={liveMachine} />}
      </div>
    </div>
  );
}
