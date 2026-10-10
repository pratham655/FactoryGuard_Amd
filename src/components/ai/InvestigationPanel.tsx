"use client";

import { useCallback, useEffect, useState } from "react";
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

type IncidentStatus = "detected" | "investigating" | "recommended" | "awaiting_approval" | "approved" | "rejected" | "maintenance" | "recovered" | "closed";

interface SavedIncident extends Pick<AgentInvestigationResult, "severity" | "probableCause" | "recommendedAction" | "requiresHumanApproval"> {
  id: string;
  status: IncidentStatus;
  approvedBy: string | null;
  rejectedBy: string | null;
  rejectionReason: string | null;
  updatedAt: string;
}

interface InvestigationResponse extends AgentInvestigationResult {
  incident: SavedIncident;
}

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

  const [incidentId, setIncidentId] = useState<string | null>(null);
  const [savedIncident, setSavedIncident] =
    useState<SavedIncident | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Restore the most recent incident for this machine.
  useEffect(() => {
    let cancelled = false;

    async function loadIncident() {
      try {
        const response = await fetch(
          `/api/incidents/by-machine/${encodeURIComponent(machineId)}`,
          { cache: "no-store" },
        );

        if (!response.ok) {
          return;
        }

        const data: { incident?: SavedIncident | null } =
          await response.json();

        if (cancelled || !data.incident) {
          return;
        }

        setSavedIncident(data.incident);
        setIncidentId(data.incident.id);
      } catch (err) {
        if (!cancelled) {
          console.error("Unable to restore incident:", err);
        }
      }
    }

    void loadIncident();

    return () => {
      cancelled = true;
    };
  }, [machineId]);

  // Run the AI investigation.
  const runInvestigation = useCallback(async () => {
    if (isLoading) {
      return;
    }

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
        },
      );

      const data = (await response.json().catch(() => ({}))) as
        | InvestigationResponse
        | { error?: string; message?: string };

      if (!response.ok) {
        const message =
          "error" in data && data.error
            ? data.error
            : "message" in data && data.message
              ? data.message
              : "Unable to complete the investigation.";

        throw new Error(message);
      }

      if (!("incident" in data) || !data.incident?.id) {
        throw new Error(
          "The investigation response did not contain a valid incident record.",
        );
      }

      const result = data as InvestigationResponse;
      const {
        incident: returnedIncident,
        ...investigationResult
      } = result;

      setInvestigation(
        investigationResult as AgentInvestigationResult,
      );
      setIncidentId(returnedIncident.id);
      setSavedIncident(returnedIncident);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to complete the investigation.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [machineId, isLoading]);

  const severity = investigation?.severity;

  const severityClass =
    severity === "critical"
      ? "bg-red-950/30 border-red-500/40 text-red-300"
      : severity === "warning"
        ? "bg-amber-950/30 border-amber-500/40 text-amber-300"
        : "bg-emerald-950/30 border-emerald-500/40 text-emerald-300";

  const severityIconClass =
    severity === "critical"
      ? "text-red-400"
      : severity === "warning"
        ? "text-amber-400"
        : "text-emerald-400";

  const incidentStatusClass =
    savedIncident?.status === "approved" || savedIncident?.status === "maintenance" || savedIncident?.status === "recovered" || savedIncident?.status === "closed"
      ? "border-emerald-500/40 bg-emerald-950/30 text-emerald-300"
      : savedIncident?.status === "rejected"
        ? "border-red-500/40 bg-red-950/30 text-red-300"
        : "border-amber-500/40 bg-amber-950/30 text-amber-300";

  // The current incident workflow places every newly created incident in
  // awaiting_approval. Reflect that persisted state in the report so the
  // summary and the decision panel cannot disagree.
  const approvalRequired =
    investigation?.requiresHumanApproval === true ||
    savedIncident?.severity === "critical" ||
    savedIncident?.status === "awaiting_approval";

  return (
    <section
      id="ai-investigation"
      className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/90 shadow-xl"
    >
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 border-b border-slate-800 bg-slate-950/60 p-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-500/40 bg-cyan-500/15 text-cyan-400">
            <Sparkles className="h-5 w-5" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-mono text-base font-bold tracking-tight text-white">
                AI INCIDENT INVESTIGATION
              </h3>

              <span className="rounded border border-cyan-500/40 bg-cyan-500/20 px-2 py-0.5 font-mono text-[10px] font-semibold text-cyan-300">
                DIAGNOSTIC REASONER
              </span>
            </div>

            <p className="mt-1 text-xs text-slate-400">
              Multi-signal telemetry correlation and automated failure
              mode synthesis.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={runInvestigation}
          disabled={isLoading}
          className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition-all ${
            isLoading
              ? "cursor-not-allowed border border-slate-700 bg-slate-800 text-slate-400"
              : "cursor-pointer bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-950/50 hover:from-cyan-500 hover:to-blue-500"
          }`}
        >
          {isLoading ? (
            <>
              <RotateCw className="h-4 w-4 animate-spin" />
              <span>Investigating machine...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 text-cyan-200" />
              <span>
                {investigation
                  ? "Re-run AI Investigation"
                  : "Run AI Investigation"}
              </span>
            </>
          )}
        </button>
      </div>

      {/* Main content */}
      <div className="space-y-6 p-5 sm:p-6">
        {/* Previously saved incident */}
        {savedIncident && (
          <div className="space-y-2 rounded-lg border border-slate-700 bg-slate-950/70 p-4 font-mono text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-slate-400">SAVED INCIDENT</span>

              <span
                className={`rounded border px-2 py-1 ${incidentStatusClass}`}
              >
                {savedIncident.status.replace(/_/g, " ").toUpperCase()}
              </span>
            </div>

            <p className="break-all text-slate-300">
              Incident ID: {savedIncident.id}
            </p>

            {savedIncident.approvedBy && (
              <p className="text-emerald-300">
                Approved by: {savedIncident.approvedBy}
              </p>
            )}

            {savedIncident.rejectedBy && (
              <p className="text-red-300">
                Rejected by: {savedIncident.rejectedBy}
              </p>
            )}

            {savedIncident.rejectionReason && (
              <p className="text-slate-300">
                Rejection reason: {savedIncident.rejectionReason}
              </p>
            )}

            {savedIncident.updatedAt && (
              <p className="text-slate-500">
                Last updated:{" "}
                {new Date(savedIncident.updatedAt).toLocaleString()}
              </p>
            )}
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div
            role="status"
            aria-live="polite"
            className="space-y-4 rounded-xl border border-cyan-500/30 bg-slate-950/80 p-8 text-center font-mono"
          >
            <div className="inline-flex h-12 w-12 animate-pulse items-center justify-center rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
              <RotateCw className="h-6 w-6 animate-spin" />
            </div>

            <div>
              <p className="text-sm font-bold text-cyan-300">
                Investigating machine...
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Synthesizing spindle telemetry, thermal signatures,
                vibration spectra, and maintenance history for{" "}
                {machineId}.
              </p>
            </div>

            <div className="mx-auto h-1.5 max-w-md overflow-hidden rounded-full bg-slate-800">
              <div className="h-full w-3/4 animate-pulse rounded-full bg-cyan-400" />
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div
            role="alert"
            className="space-y-3 rounded-xl border border-red-500/40 bg-red-950/20 p-5 font-mono text-xs text-red-300"
          >
            <div className="flex items-center gap-2 text-sm font-bold text-red-400">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>

            <p className="text-slate-300">
              The investigation request failed. Check the incident API
              and AI service configuration, then try again.
            </p>

            <button
              type="button"
              onClick={runInvestigation}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded border border-red-500/50 bg-red-900/60 px-3 py-1.5 text-red-200 transition-colors hover:bg-red-800"
            >
              <RotateCw className="h-3.5 w-3.5" />
              <span>Retry Investigation</span>
            </button>
          </div>
        )}

        {/* Initial state */}
        {!investigation && !isLoading && !error && (
          <div className="space-y-3 rounded-xl border border-slate-800/80 bg-slate-950/60 p-8 text-center font-mono">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400">
              <Terminal className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-200">
                Diagnostic Investigation Ready
              </p>

              <p className="mx-auto mt-1 max-w-lg text-xs text-slate-400">
                Trigger the reasoning agent to correlate current sensor
                thresholds against baseline tolerances, maintenance
                history, and machine error codes.
              </p>
            </div>

            <button
              type="button"
              onClick={runInvestigation}
              className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-cyan-500"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Run AI Investigation</span>
            </button>
          </div>
        )}

        {!investigation && savedIncident && incidentId && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-5 space-y-2">
              <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400">Restored incident recommendation</h4>
              <p className="font-mono text-sm font-bold text-white">{savedIncident.probableCause || "Probable cause not recorded"}</p>
              <p className="font-mono text-sm text-slate-300">{savedIncident.recommendedAction}</p>
              <p className="font-mono text-xs text-slate-400">Severity: {savedIncident.severity.toUpperCase()} · Lifecycle: {savedIncident.status.replace(/_/g, " ").toUpperCase()}</p>
            </div>
            <ApprovalPanel
              key={incidentId}
              requiresHumanApproval={approvalRequired}
              recommendedAction={savedIncident.recommendedAction}
              machineId={machineId}
              incidentId={incidentId}
              initialStatus={savedIncident.status}
              initialApprovedBy={savedIncident.approvedBy}
              initialRejectedBy={savedIncident.rejectedBy}
              initialRejectionReason={savedIncident.rejectionReason}
              initialUpdatedAt={savedIncident.updatedAt}
              onIncidentUpdated={(incident) => setSavedIncident((current) => current ? { ...current, ...incident } : current)}
            />
          </div>
        )}

        {/* Investigation report */}
        {investigation && !isLoading && (
          <div className="space-y-6">
            {/* Report metadata */}
            <div className="grid grid-cols-1 gap-3 font-mono text-xs sm:grid-cols-2 xl:grid-cols-4">
              <div
                className={`rounded-lg border p-3.5 ${severityClass}`}
              >
                <span className="block text-[10px] font-semibold uppercase text-slate-400">
                  Incident Severity
                </span>

                <span className="mt-1 block text-base font-bold uppercase">
                  {investigation.severity}
                </span>
              </div>

              <div className="rounded-lg border border-cyan-500/30 bg-cyan-950/20 p-3.5 text-cyan-200">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold uppercase text-slate-400">
                    Confidence Score
                  </span>

                  <span className="text-xs font-bold text-cyan-400">
                    {Math.round(
                      Math.min(
                        1,
                        Math.max(0, investigation.confidence),
                      ) * 100,
                    )}
                    %
                  </span>
                </div>

                <div
                  className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800"
                  role="progressbar"
                  aria-label="Investigation confidence"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(
                    Math.min(
                      1,
                      Math.max(0, investigation.confidence),
                    ) * 100,
                  )}
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                    style={{
                      width: `${
                        Math.min(
                          1,
                          Math.max(0, investigation.confidence),
                        ) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-3.5 text-slate-300">
                <span className="block text-[10px] font-semibold uppercase text-slate-400">
                  Human Approval Required
                </span>

                <span
                  className={`mt-1 block text-base font-bold uppercase ${
                    approvalRequired
                      ? "text-amber-400"
                      : "text-emerald-400"
                  }`}
                >
                  {approvalRequired
                    ? "Yes (Mandatory)"
                    : "No"}
                </span>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-3.5 text-slate-300">
                <span className="block text-[10px] font-semibold uppercase text-slate-400">
                  Agent Source
                </span>

                <span className="mt-1 block truncate font-mono text-xs font-bold text-cyan-300">
                  {investigation.agentSource}
                </span>
              </div>
            </div>

            {/* Probable cause */}
            <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/80 p-5">
              <div className="flex items-center gap-2">
                <AlertTriangle
                  className={`h-4 w-4 ${severityIconClass}`}
                />

                <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400">
                  Synthesized Probable Cause
                </h4>
              </div>

              <p className="font-mono text-lg font-bold text-white">
                {investigation.probableCause ||
                  "No abnormal degradation detected."}
              </p>
            </div>

            {/* Evidence */}
            <InvestigationEvidence
              evidence={investigation.evidence}
            />

            {/* Recommended remediation */}
            <div className="space-y-2 rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/30 to-slate-950/80 p-5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-cyan-400" />

                <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-300">
                  Recommended Remediation Action
                </h4>
              </div>

              <p className="font-mono text-sm font-semibold leading-relaxed text-white">
                {investigation.recommendedAction}
              </p>
            </div>

            {/* Human approval workflow */}
            {incidentId ? (
              <ApprovalPanel
                key={incidentId}
                requiresHumanApproval={approvalRequired}
                recommendedAction={investigation.recommendedAction}
                machineId={machineId}
                incidentId={incidentId}
                initialStatus={
                  savedIncident?.status ?? "awaiting_approval"
                }
                initialApprovedBy={savedIncident?.approvedBy}
                initialRejectedBy={savedIncident?.rejectedBy}
                initialRejectionReason={
                  savedIncident?.rejectionReason
                }
                initialUpdatedAt={savedIncident?.updatedAt}
                onIncidentUpdated={(incident) => setSavedIncident((current) => current ? { ...current, ...incident } : current)}
              />
            ) : (
              <p className="rounded-lg border border-amber-500/30 bg-amber-950/20 p-3 font-mono text-xs text-amber-200">
                Run the investigation to create an incident record
                before making an approval decision.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}