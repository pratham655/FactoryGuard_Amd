
"use client";

import React, { useState } from "react";
import type { IncidentStatus } from "@/lib/incident-lifecycle";
import {
  CheckCircle2,
  XCircle,
  UserCheck,
  AlertTriangle,
  Lock,
  LoaderCircle,
} from "lucide-react";

interface ApprovalPanelProps {
  requiresHumanApproval: boolean;
  recommendedAction: string;
  machineId: string;
  incidentId: string;
  initialStatus?: IncidentStatus;
  onIncidentUpdated?: (incident: { id: string; status: IncidentStatus; approvedBy: string | null; rejectedBy: string | null; rejectionReason: string | null; updatedAt: string }) => void;
  initialApprovedBy?: string | null;
  initialRejectedBy?: string | null;
  initialRejectionReason?: string | null;
  initialUpdatedAt?: string | null;
}

export function ApprovalPanel({
  requiresHumanApproval,
  recommendedAction,
  machineId,
  incidentId,
  initialStatus = "awaiting_approval",
  onIncidentUpdated,
  initialApprovedBy = null,
  initialRejectedBy = null,
  initialRejectionReason = null,
  initialUpdatedAt = null,
}: ApprovalPanelProps) {
  const [status, setStatus] = useState(initialStatus);

  const [operator, setOperator] = useState(
    initialApprovedBy ?? initialRejectedBy ?? "",
  );

  const [reason, setReason] = useState(
    initialRejectionReason ?? "",
  );

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [timestamp, setTimestamp] = useState<string | null>(
    initialUpdatedAt
      ? new Date(initialUpdatedAt).toUTCString()
      : null,
  );

  const submitDecision = async (
    decision: "approve" | "reject",
  ) => {
    setError(null);

    if (decision === "reject" && !reason.trim()) {
      setError("A rejection reason is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/incidents/decision", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          incidentId,
          decision,
          reason: reason.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Unable to record decision.",
        );
      }

      const incident = data.incident;

      setStatus(incident.status);
      onIncidentUpdated?.(incident);

      setOperator(
        decision === "approve"
          ? incident.approvedBy
          : incident.rejectedBy,
      );

      setReason(incident.rejectionReason ?? "");

      setTimestamp(
        new Date(incident.updatedAt).toUTCString(),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to record decision.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const advanceLifecycle = async (nextStatus: "maintenance" | "recovered" | "closed") => {
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/incidents/${encodeURIComponent(incidentId)}/lifecycle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "Unable to update incident lifecycle.");
      }
      const incident = data.incident;
      setStatus(incident.status);
      setOperator(incident.approvedBy ?? incident.rejectedBy ?? "");
      setReason(incident.rejectionReason ?? "");
      setTimestamp(new Date(incident.updatedAt).toUTCString());
      onIncidentUpdated?.(incident);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update incident lifecycle.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <UserCheck className="w-4 h-4 text-cyan-400" />

          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
            Human-in-the-Loop Governance & Authorization
          </h4>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400">
            APPROVAL MANDATE:
          </span>

          {requiresHumanApproval ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <Lock className="w-3 h-3" />
              MANDATORY (YES)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
              OPTIONAL (NO)
            </span>
          )}
        </div>
      </div>

      {status === "awaiting_approval" ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-950/20 p-3 text-xs font-mono text-amber-200">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />

              <div>
                <p className="font-bold">
                  OPERATOR DECISION REQUIRED
                </p>

                <p className="text-slate-300 mt-0.5">
                  Decision is sent to the incident API. Clerk verifies the signed-in identity and server-side role before the decision is recorded.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-cyan-500/20 bg-cyan-950/20 p-3 text-xs font-mono text-cyan-200">
            Approver identity is verified by Clerk and recorded from your signed-in account.
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor={`reason-${incidentId}`}
              className="block text-xs font-mono text-slate-300"
            >
              REJECTION REASON (REQUIRED TO REJECT)
            </label>

            <textarea
              id={`reason-${incidentId}`}
              value={reason}
              onChange={(event) =>
                setReason(event.target.value)
              }
              maxLength={1000}
              rows={2}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500"
              placeholder="Explain why the recommendation should be rejected"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="text-xs font-mono text-red-300"
            >
              {error}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => void submitDecision("approve")}
              disabled={isSubmitting}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-xs font-mono font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <LoaderCircle className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}

              <span>[ APPROVE ACTION ]</span>
            </button>

            <button
              onClick={() => void submitDecision("reject")}
              disabled={isSubmitting}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-xs font-mono font-bold uppercase tracking-wider bg-slate-900 border border-red-500/40 text-red-400 hover:bg-red-950/40 disabled:opacity-60 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <LoaderCircle className="w-4 h-4 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}

              <span>[ REJECT / ESCALATE ]</span>
            </button>
          </div>
        </div>
      ) : status === "approved" || status === "maintenance" || status === "recovered" || status === "closed" ? (
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-950/20 p-4 space-y-3 font-mono text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>{status === "maintenance" ? "MAINTENANCE IN PROGRESS" : status === "recovered" ? "MACHINE RECOVERED" : status === "closed" && (initialRejectedBy || reason.trim() || initialRejectionReason) ? "INCIDENT CLOSED AFTER REJECTION" : status === "closed" ? "INCIDENT CLOSED" : "RECOMMENDATION APPROVED"}</span>
          </div>

          <p className="text-slate-300">
            Recorded for <strong>{machineId}</strong>: &quot;
            {recommendedAction}&quot;
          </p>

          <p className="text-slate-300">
            Operator: {operator || initialApprovedBy || "Unknown"}
          </p>

          <p className="text-cyan-200">
            Lifecycle: <strong className="uppercase">{status.replace(/_/g, " ")}</strong>
          </p>
          {status === "approved" && (
            <button type="button" onClick={() => void advanceLifecycle("maintenance")} disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-600 px-4 py-2.5 font-bold uppercase tracking-wider text-white hover:bg-cyan-500 disabled:opacity-60">
              {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              Start maintenance
            </button>
          )}
          {status === "maintenance" && (
            <button type="button" onClick={() => void advanceLifecycle("recovered")} disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 font-bold uppercase tracking-wider text-white hover:bg-emerald-500 disabled:opacity-60">
              {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              Mark machine recovered
            </button>
          )}
          {status === "recovered" && (
            <button type="button" onClick={() => void advanceLifecycle("closed")} disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-700 px-4 py-2.5 font-bold uppercase tracking-wider text-white hover:bg-slate-600 disabled:opacity-60">
              {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              Close incident
            </button>
          )}
          {status === "closed" && <p className="font-bold text-emerald-300">INCIDENT CLOSED — lifecycle complete.</p>}
          {error && <p role="alert" className="text-xs text-red-300">{error}</p>}
          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-800 flex flex-wrap justify-between gap-2">
            <span>INCIDENT: {incidentId}</span>
            <span>{timestamp ?? "Decision recorded"}</span>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-red-500/40 bg-red-950/20 p-4 space-y-2 font-mono text-xs">
          <div className="flex items-center gap-2 text-red-400 font-bold">
            <XCircle className="w-4 h-4" />
            <span>RECOMMENDATION REJECTED</span>
          </div>

          <p className="text-slate-300">
            Automated workflow remains halted. Rejection reason:{" "}
            {reason || initialRejectionReason || "Not provided"}
          </p>

          <p className="text-slate-300">
            Recorded by: {operator || initialRejectedBy || "Unknown"}
          </p>

          {status === "rejected" && (
            <button type="button" onClick={() => void advanceLifecycle("closed")} disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-700 px-4 py-2.5 font-bold uppercase tracking-wider text-white hover:bg-slate-600 disabled:opacity-60">
              {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              Close after escalation
            </button>
          )}
          {error && <p role="alert" className="text-xs text-red-300">{error}</p>}
          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-800 flex flex-wrap justify-between gap-2">
            <span>INCIDENT: {incidentId}</span>
            <span>{timestamp ?? "Decision recorded"}</span>
          </div>
        </div>
      )}
    </div>
  );
}
