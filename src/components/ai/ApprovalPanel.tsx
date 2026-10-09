"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  UserCheck,
  AlertTriangle,
  Lock,
} from "lucide-react";

interface ApprovalPanelProps {
  requiresHumanApproval: boolean;
  recommendedAction: string;
  machineId: string;
}

export function ApprovalPanel({
  requiresHumanApproval,
  recommendedAction,
  machineId,
}: ApprovalPanelProps) {
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const [timestamp, setTimestamp] = useState<string | null>(null);

  const handleApprove = () => {
    setStatus("approved");
    setTimestamp(new Date().toUTCString());
  };

  const handleReject = () => {
    setStatus("rejected");
    setTimestamp(new Date().toUTCString());
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

      {status === "pending" ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-950/20 p-3 text-xs font-mono text-amber-200">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">OPERATOR AUTHORIZATION REQUIRED</p>
                <p className="text-slate-300 mt-0.5">
                  Confirm the proposed maintenance action before automatic execution in shop floor scheduling.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleApprove}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-xs font-mono font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/50 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>[ APPROVE ACTION ]</span>
            </button>

            <button
              onClick={handleReject}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-xs font-mono font-bold uppercase tracking-wider bg-slate-900 border border-red-500/40 text-red-400 hover:bg-red-950/40 transition-all cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
              <span>[ REJECT / ESCALATE ]</span>
            </button>
          </div>
        </div>
      ) : status === "approved" ? (
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-950/20 p-4 space-y-2 font-mono text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>ACTION APPROVED BY CERTIFIED OPERATOR</span>
          </div>
          <p className="text-slate-300">
            Work order queued for <strong>{machineId}</strong>: &quot;{recommendedAction}&quot;
          </p>
          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-800 flex justify-between">
            <span>AUDIT REF: GOV-{machineId}-AUTH</span>
            <span>{timestamp}</span>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-red-500/40 bg-red-950/20 p-4 space-y-2 font-mono text-xs">
          <div className="flex items-center gap-2 text-red-400 font-bold">
            <XCircle className="w-4 h-4" />
            <span>RECOMMENDED ACTION REJECTED / ESCALATED TO LEAD ENGINEER</span>
          </div>
          <p className="text-slate-300">
            Automated execution halted. Maintenance team notified for manual inspection protocol.
          </p>
          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-800 flex justify-between">
            <span>STATUS: ESCALATED</span>
            <span>{timestamp}</span>
          </div>
        </div>
      )}
    </div>
  );
}
