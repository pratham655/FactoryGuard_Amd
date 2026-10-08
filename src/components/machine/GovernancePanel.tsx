import React from "react";
import { ShieldCheck, Lock, FileCheck, CheckCircle2, AlertCircle } from "lucide-react";
import type { Machine } from "@/lib/factory-data";

interface GovernancePanelProps {
  machine: Machine;
}

export function GovernancePanel({ machine }: GovernancePanelProps) {
  const complianceItems = [
    {
      standard: "ISO 13849-1: Machine Safety Interlocks",
      status: "COMPLIANT",
      verified: "2026-09-01",
      auditor: "TÜV SÜD Industrial Safety",
    },
    {
      standard: "OSHA 1910.212: Machine Guarding & Emergency Stop Circuit",
      status: "COMPLIANT",
      verified: "2026-08-15",
      auditor: "Plant Safety Officer #402",
    },
    {
      standard: "AI-Act Level 2: Human-in-the-Loop Override Enforcement",
      status: "ENFORCED",
      verified: "ACTIVE RUNTIME",
      auditor: "FactoryGuard Autonomous Governance Engine",
    },
    {
      standard: "Spindle Precision Runout Calibration",
      status: machine.status === "critical" ? "ACTION REQ" : "VERIFIED",
      verified: "2026-09-18",
      auditor: "DMG MORI Certified Field Tech",
    },
  ];

  return (
    <div
      id="governance"
      className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 shadow-sm space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 text-cyan-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
              System Governance, Safety & Compliance Audit
            </h3>
            <p className="text-xs text-slate-400">
              Regulatory compliance, safety interlocks, and AI decision traceability for {machine.id}.
            </p>
          </div>
        </div>

        <span className="text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold">
          AUDIT TRAIL IMMUTABLE
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
        {complianceItems.map((item, idx) => (
          <div
            key={idx}
            className="rounded-lg border border-slate-800 bg-slate-950/80 p-4 space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="font-bold text-slate-200 text-sm">
                {item.standard}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  item.status === "ACTION REQ"
                    ? "bg-red-500/20 text-red-400 border border-red-500/40"
                    : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                }`}
              >
                {item.status}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Auditor: {item.auditor}</span>
              <span className="text-slate-500">{item.verified}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
