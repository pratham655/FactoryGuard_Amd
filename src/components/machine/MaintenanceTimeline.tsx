import React from "react";
import {
  Wrench,
  Clock,
  Calendar,
  CheckCircle2,
  FileCheck,
} from "lucide-react";
import type { MaintenanceRecord } from "@/lib/maintenance-history";

interface MaintenanceTimelineProps {
  records: MaintenanceRecord[];
  machineId: string;
}

export function MaintenanceTimeline({
  records,
  machineId,
}: MaintenanceTimelineProps) {
  return (
    <div
      id="maintenance"
      className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 shadow-sm space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 text-cyan-400">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
              Maintenance History & Service Log
            </h3>
            <p className="text-xs text-slate-400">
              Logged service interventions, part replacements, and historical downtime for {machineId}.
            </p>
          </div>
        </div>

        <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 text-slate-300">
          {records.length} {records.length === 1 ? "Record" : "Records"} on File
        </span>
      </div>

      {records.length === 0 ? (
        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-8 text-center">
          <FileCheck className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-xs font-mono text-slate-400">
            No historical maintenance interventions recorded for {machineId}.
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Machine operates within factory commissioning baseline.
          </p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
          {records.map((record, index) => (
            <div key={index} className="relative group">
              {/* Timeline node */}
              <div className="absolute -left-[27px] top-1 flex items-center justify-center w-4 h-4 rounded-full bg-slate-950 border-2 border-cyan-400 shadow-sm shadow-cyan-950" />

              <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-4 space-y-3 font-mono text-xs transition-colors hover:border-slate-700">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="font-bold text-white">{record.date}</span>
                  </div>

                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[11px]">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>
                      DOWNTIME: <strong className="text-amber-400">{record.downtimeMinutes} MIN</strong>
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                      REPORTED ISSUE
                    </span>
                    <p className="text-sm font-semibold text-slate-200">
                      {record.issue}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                      ACTION TAKEN
                    </span>
                    <p className="text-xs text-slate-300">
                      {record.action}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                  <span>LOG REF: WO-{machineId}-{record.date.replace(/-/g, "")}</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    RESOLVED & VERIFIED
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
