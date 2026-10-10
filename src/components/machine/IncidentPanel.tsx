"use client";

import React, { useEffect, useState } from "react";
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Flame,
} from "lucide-react";
import type { Machine } from "@/lib/factory-data";

interface IncidentPanelProps {
  machine: Machine;
  onInvestigateClick?: () => void;
}

interface SavedIncidentSummary {
  id: string;
  machineId: string;
  severity: string;
  probableCause: string;
  recommendedAction: string;
  status: string;
  approvedBy?: string | null;
  rejectedBy?: string | null;
  rejectionReason?: string | null;
  updatedAt?: string;
}

interface IncidentApiResponse {
  incident?: SavedIncidentSummary | null;
  error?: string;
}

export function IncidentPanel({ machine, onInvestigateClick }: IncidentPanelProps) {
  const isCritical = machine.status === "critical";
  const isWarning = machine.status === "warning";
  const [savedIncident, setSavedIncident] = useState<SavedIncidentSummary | null>(null);
  const [incidentLoadError, setIncidentLoadError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function loadLatestIncident() {
      try {
        const response = await fetch("/api/incidents/by-machine/" + encodeURIComponent(machine.id), {
          cache: "no-store",
          signal: controller.signal,
        });
        const data = (await response.json().catch(() => ({}))) as IncidentApiResponse;
        if (!response.ok) throw new Error(data.error ?? "Unable to load saved incident.");
        setSavedIncident(data.incident ?? null);
        setIncidentLoadError(null);
      } catch (error) {
        if (controller.signal.aborted) return;
        setIncidentLoadError(error instanceof Error ? error.message : "Unable to load saved incident.");
      }
    }
    void loadLatestIncident();
    return () => controller.abort();
  }, [machine.id]);

  return (
    <div
      id="incidents"
      className={`rounded-xl border p-6 shadow-sm space-y-6 ${
        isCritical
          ? "border-red-500/50 bg-slate-900/90"
          : isWarning
            ? "border-amber-500/40 bg-slate-900/90"
            : "border-slate-800 bg-slate-900/80"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-lg ${
              isCritical
                ? "bg-red-500/20 text-red-400"
                : isWarning
                  ? "bg-amber-500/20 text-amber-400"
                  : "bg-slate-800 text-emerald-400"
            }`}
          >
            {isCritical ? (
              <AlertOctagon className="w-4 h-4" />
            ) : isWarning ? (
              <AlertTriangle className="w-4 h-4" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
          </div>
          <div>
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
              Active Incident State & Alarm Diagnostics
            </h3>
            <p className="text-xs text-slate-400">
              Real-time alarm trip points and error code analysis for {machine.id}.
            </p>
          </div>
        </div>

        <span
          className={`text-xs font-mono font-bold px-2.5 py-1 rounded uppercase ${
            isCritical
              ? "bg-red-500/20 text-red-400 border border-red-500/40"
              : isWarning
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
          }`}
        >
          {machine.status.toUpperCase()} INCIDENT STATUS
        </span>
      </div>

      {incidentLoadError && (
        <p role="status" className="rounded-lg border border-amber-500/30 bg-amber-950/20 p-3 font-mono text-xs text-amber-200">
          Saved incident history could not be loaded: {incidentLoadError}
        </p>
      )}

      {savedIncident && (
        <div className="space-y-2 rounded-lg border border-slate-700 bg-slate-950/70 p-4 font-mono text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-bold text-slate-200">LATEST SAVED INCIDENT</span>
            <span className={"rounded border px-2 py-1 " + (savedIncident.status === "closed" || savedIncident.status === "recovered" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : savedIncident.status === "rejected" ? "border-red-500/30 bg-red-500/10 text-red-300" : "border-amber-500/30 bg-amber-500/10 text-amber-300")}>
              {savedIncident.status.replace(/_/g, " ").toUpperCase()}
            </span>
          </div>
          <p className="break-all text-slate-500">Incident ID: {savedIncident.id}</p>
          <p className="text-white">{savedIncident.probableCause}</p>
          <p className="text-slate-300">Recommended action: {savedIncident.recommendedAction}</p>
          {savedIncident.approvedBy && <p className="text-emerald-300">Approved by: {savedIncident.approvedBy}</p>}
          {savedIncident.rejectedBy && <p className="text-red-300">Rejected by: {savedIncident.rejectedBy}</p>}
          {savedIncident.rejectionReason && <p className="text-slate-300">Rejection reason: {savedIncident.rejectionReason}</p>}
          {savedIncident.updatedAt && <p className="text-slate-500">Updated: {new Date(savedIncident.updatedAt).toLocaleString()}</p>}
        </div>
      )}

      {isCritical || isWarning ? (
        <div className="space-y-4 font-mono text-xs">
          <div className="rounded-lg border border-red-500/30 bg-red-950/20 p-4 space-y-2 text-red-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-red-400 text-sm flex items-center gap-2">
                <Flame className="w-4 h-4" />
                {machine.id === "CNC-07"
                  ? "INCIDENT #INC-2026-07: Possible Spindle Bearing Degradation"
                  : `INCIDENT #INC-2026-${machine.id.replace("CNC-", "")}: Operating Envelope Violation`}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/30 text-white font-bold">
                HIGH PRIORITY
              </span>
            </div>

            <p className="text-slate-300 leading-relaxed">
              Anomaly triggered due to multi-signal threshold exceedance. Temperature reached {machine.telemetry.temperature}°C (limit 80°C), Vibration reached {machine.telemetry.vibration} mm/s (limit 5.0 mm/s).
              {machine.telemetry.errorCode && ` Machine controller triggered hard fault code ${machine.telemetry.errorCode}.`}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-400 border-t border-red-500/20">
              <span>TRIP TIME: LIVE STREAM</span>
              <span>•</span>
              <span>ALARM CLASS: SAFETY-INTERLOCK</span>
              <span>•</span>
              <button
                onClick={onInvestigateClick}
                className="text-cyan-400 hover:text-cyan-300 font-bold underline cursor-pointer"
              >
                Run AI Multi-Signal Synthesis →
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-6 text-center font-mono text-xs">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <p className="font-bold text-slate-200">All Alarms Clear</p>
          <p className="text-slate-400 mt-1">
            Machine operates within safety parameters. No active alarms or threshold trips.
          </p>
        </div>
      )}
    </div>
  );
}
