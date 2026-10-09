"use client";

import React, { useState } from "react";
import {
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  RotateCw,
  Terminal,
} from "lucide-react";
import { InvestigationEvidence } from "@/components/ai/InvestigationEvidence";
import { ApprovalPanel } from "@/components/ai/ApprovalPanel";
import type { AgentInvestigationResult } from "@/lib/ai-agent";

interface InvestigationPanelProps {
  machineId: string;
  initialInvestigation?: AgentInvestigationResult | null;
}

export function InvestigationPanel({
  machineId,
  initialInvestigation = null,
}: InvestigationPanelProps) {
  const [investigation, setInvestigation] =
    useState<AgentInvestigationResult | null>(initialInvestigation);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const runInvestigation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/incidents/${encodeURIComponent(machineId)}/investigate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Unable to complete investigation.");
      }

      const data: AgentInvestigationResult = await response.json();
      setInvestigation(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to complete investigation."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="ai-investigation"
      className="rounded-xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden"
    >
      {/* Investigation Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-cyan-500/15 border border-cyan-500/40 text-cyan-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-base font-bold text-white tracking-tight">
                AI INCIDENT INVESTIGATION
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold">
                DIAGNOSTIC REASONER
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Multi-signal telemetry correlation and automated failure mode synthesis.
            </p>
          </div>
        </div>

        {/* Action button */}
        <div>
          <button
            onClick={runInvestigation}
            disabled={isLoading}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              isLoading
                ? "bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed"
                : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-950/50"
            }`}
          >
            {isLoading ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin text-cyan-400" />
                <span>Investigating machine...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-200" />
                <span>
                  {investigation ? "Re-run AI Investigation" : "Run AI Investigation"}
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Panel Content */}
      <div className="p-6 space-y-6">
        {/* Loading State */}
        {isLoading && (
          <div className="rounded-xl border border-cyan-500/30 bg-slate-950/80 p-8 text-center space-y-4 font-mono">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 animate-pulse">
              <RotateCw className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <p className="text-sm font-bold text-cyan-300">
                Investigating machine...
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Synthesizing spindle telemetry, thermal signatures, vibration spectra, and maintenance history on {machineId}.
              </p>
            </div>
            <div className="max-w-md mx-auto h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-cyan-400 rounded-full animate-pulse w-3/4" />
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="rounded-xl border border-red-500/40 bg-red-950/20 p-5 space-y-3 font-mono text-xs text-red-300">
            <div className="flex items-center gap-2 font-bold text-red-400 text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>{error}</span>
            </div>
            <p className="text-slate-300">
              The AI reasoning engine could not reach the incident endpoint or process the machine telemetry stream.
            </p>
            <button
              onClick={runInvestigation}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-red-900/60 border border-red-500/50 text-red-200 hover:bg-red-800 transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Retry Investigation</span>
            </button>
          </div>
        )}

        {/* Idle / Uninvestigated State */}
        {!investigation && !isLoading && !error && (
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-8 text-center space-y-3 font-mono">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 text-slate-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">
                Diagnostic Investigation Ready
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-lg mx-auto">
                Trigger the reasoning agent to cross-correlate current sensor thresholds against baseline tolerances, historical work orders, and error codes.
              </p>
            </div>
            <button
              onClick={runInvestigation}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider bg-cyan-600 hover:bg-cyan-500 text-white transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Run AI Investigation</span>
            </button>
          </div>
        )}

        {/* Success State: Engineering Investigation Report */}
        {investigation && !isLoading && (
          <div className="space-y-6">
            {/* Top Report Metadata Banner */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 font-mono text-xs">
              {/* Severity Card */}
              <div
                className={`p-3.5 rounded-lg border ${
                  investigation.severity === "critical"
                    ? "bg-red-950/30 border-red-500/40 text-red-300"
                    : investigation.severity === "warning"
                      ? "bg-amber-950/30 border-amber-500/40 text-amber-300"
                      : "bg-emerald-950/30 border-emerald-500/40 text-emerald-300"
                }`}
              >
                <span className="text-[10px] uppercase text-slate-400 font-semibold block">
                  INCIDENT SEVERITY
                </span>
                <span className="text-base font-bold uppercase mt-1 block">
                  {investigation.severity}
                </span>
              </div>

              {/* Confidence Card */}
              <div className="p-3.5 rounded-lg border border-cyan-500/30 bg-cyan-950/20 text-cyan-200">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase text-slate-400 font-semibold">
                    CONFIDENCE SCORE
                  </span>
                  <span className="text-xs font-bold text-cyan-400">
                    {Math.round(investigation.confidence * 100)}%
                  </span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                    style={{ width: `${investigation.confidence * 100}%` }}
                  />
                </div>
              </div>

              {/* Approval Required Card */}
              <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/80 text-slate-300">
                <span className="text-[10px] uppercase text-slate-400 font-semibold block">
                  HUMAN APPROVAL REQUIRED
                </span>
                <span
                  className={`text-base font-bold uppercase mt-1 block ${
                    investigation.requiresHumanApproval
                      ? "text-amber-400"
                      : "text-emerald-400"
                  }`}
                >
                  {investigation.requiresHumanApproval ? "YES (MANDATORY)" : "NO"}
                </span>
              </div>

              {/* Agent Source Card */}
              <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/80 text-slate-300">
                <span className="text-[10px] uppercase text-slate-400 font-semibold block">
                  AGENT SOURCE
                </span>
                <span className="text-xs font-mono font-bold text-cyan-300 mt-1 block truncate">
                  {investigation.agentSource}
                </span>
              </div>
            </div>

            {/* Probable Cause Section */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-5 space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle
                  className={`w-4 h-4 ${
                    investigation.severity === "critical"
                      ? "text-red-400"
                      : investigation.severity === "warning"
                        ? "text-amber-400"
                        : "text-emerald-400"
                  }`}
                />
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  Synthesized Probable Cause
                </h4>
              </div>
              <p className="text-lg font-bold font-mono text-white">
                {investigation.probableCause || "No abnormal degradation detected."}
              </p>
            </div>

            {/* Evidence Section */}
            <InvestigationEvidence evidence={investigation.evidence} />

            {/* Recommended Action Section */}
            <div className="rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/30 to-slate-950/80 p-5 space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
                  Recommended Remediation Action
                </h4>
              </div>
              <p className="text-sm font-semibold font-mono text-white leading-relaxed">
                {investigation.recommendedAction}
              </p>
            </div>

            {/* Human Approval Workflow Panel */}
            <ApprovalPanel
              requiresHumanApproval={investigation.requiresHumanApproval}
              recommendedAction={investigation.recommendedAction}
              machineId={machineId}
            />
          </div>
        )}
      </div>
    </div>
  );
}
