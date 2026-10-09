import React from "react";
import {
  CheckCircle,
  AlertCircle,
  FileText,
} from "lucide-react";

interface InvestigationEvidenceProps {
  evidence: string[];
}

export function InvestigationEvidence({ evidence }: InvestigationEvidenceProps) {
  if (!evidence || evidence.length === 0) {
    return (
      <p className="text-xs font-mono text-slate-500 italic">
        No telemetry anomalies recorded for this operating envelope.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
        <FileText className="w-3.5 h-3.5 text-cyan-400" />
        Diagnostic Evidence & Telemetry Findings ({evidence.length})
      </h4>

      <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-3.5 divide-y divide-slate-800/60 font-mono text-xs">
        {evidence.map((item, index) => {
          const isAnomaly =
            item.toLowerCase().includes("reached") ||
            item.toLowerCase().includes("error") ||
            item.toLowerCase().includes("maintenance") ||
            item.toLowerCase().includes("abnormal");

          return (
            <div
              key={index}
              className="py-2.5 first:pt-0 last:pb-0 flex items-start gap-2.5"
            >
              <div className="mt-0.5 shrink-0">
                {isAnomaly ? (
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                )}
              </div>
              <div className="flex-1 text-slate-300 leading-relaxed">
                {item}
              </div>
              <span className="text-[10px] text-slate-500 uppercase shrink-0 font-semibold">
                EVID-{index + 1}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
