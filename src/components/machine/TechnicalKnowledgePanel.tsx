"use client";

import React, { useState } from "react";
import { BookOpen, Search, FileText, ArrowRight, ExternalLink } from "lucide-react";
import { searchTechnicalKnowledge, type TechnicalKnowledge } from "@/lib/technical-knowledge";

interface TechnicalKnowledgePanelProps {
  machineId: string;
  initialQuery?: string;
}

export function TechnicalKnowledgePanel({
  machineId,
  initialQuery = "",
}: TechnicalKnowledgePanelProps) {
  const [query, setQuery] = useState(initialQuery);

  // Search through domain knowledge
  const results = query.trim()
    ? searchTechnicalKnowledge(query)
    : [
        ...searchTechnicalKnowledge("spindle"),
        ...searchTechnicalKnowledge("E-204"),
      ].filter(
        (v, i, a) => a.findIndex((t) => t.title === v.title) === i
      );

  return (
    <div
      id="technical-knowledge"
      className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 shadow-sm space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 text-cyan-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
              Technical Knowledge & Maintenance Manuals
            </h3>
            <p className="text-xs text-slate-400">
              OEM service bulletins, torque specifications, and diagnostic procedures for {machineId}.
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search manuals, codes, guides..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-lg text-xs font-mono bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 w-56"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.map((item, idx) => (
          <div
            key={idx}
            className="rounded-lg border border-slate-800 bg-slate-950/80 p-4 space-y-2.5 font-mono text-xs transition-colors hover:border-slate-700"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <h4 className="font-bold text-white text-sm">
                  {item.title}
                </h4>
              </div>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shrink-0">
                OEM REF
              </span>
            </div>

            <p className="text-slate-300 leading-relaxed text-xs">
              {item.content}
            </p>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
              <span>SOURCE: {item.source}</span>
              <span className="text-cyan-400 flex items-center gap-1 hover:underline cursor-pointer">
                View Manual
                <ExternalLink className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
