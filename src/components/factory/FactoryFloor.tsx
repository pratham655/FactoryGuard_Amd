"use client";

import React, { useState } from "react";
import {
  Factory,
  Filter,
  Layers,
  LayoutGrid,
  List,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { ProductionLine } from "@/components/factory/ProductionLine";
import { MachineCard } from "@/components/factory/MachineCard";
import type { Machine } from "@/lib/factory-data";

interface FactoryFloorProps {
  machines: Machine[];
}

export function FactoryFloor({ machines }: FactoryFloorProps) {
  const [filter, setFilter] = useState<"all" | "incidents" | "normal">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"lines" | "grid">("lines");

  // Filtering
  const filteredMachines = machines.filter((machine) => {
    const matchesFilter =
      filter === "all"
        ? true
        : filter === "incidents"
          ? machine.status === "critical" || machine.status === "warning"
          : machine.status === "normal";

    const matchesSearch =
      machine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      machine.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      machine.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      machine.line.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Group by line:
  // LINE A: CNC-01, CNC-02, CNC-03
  // LINE B: CNC-04, CNC-05, CNC-06
  // LINE C: CNC-07, CNC-08, CNC-09
  // LINE D: CNC-10
  const lineAMachines = filteredMachines.filter((m) =>
    ["CNC-01", "CNC-02", "CNC-03"].includes(m.id)
  );
  const lineBMachines = filteredMachines.filter((m) =>
    ["CNC-04", "CNC-05", "CNC-06"].includes(m.id)
  );
  const lineCMachines = filteredMachines.filter((m) =>
    ["CNC-07", "CNC-08", "CNC-09"].includes(m.id)
  );
  const lineDMachines = filteredMachines.filter((m) => ["CNC-10"].includes(m.id));

  return (
    <section id="machines-floor" className="space-y-6">
      {/* Floor Controls & Section Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-mono tracking-tight text-white flex items-center gap-2">
              <Factory className="w-5 h-5 text-cyan-400" />
              Machine Monitoring
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {filteredMachines.length} of {machines.length} Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time shop floor machine state, telemetry envelopes, and anomaly detection.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search machine, model, bay..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg text-xs font-mono bg-slate-900 border border-slate-800 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 w-48 sm:w-60"
            />
          </div>

          {/* Status Filter Pills */}
          <div className="flex rounded-lg border border-slate-800 bg-slate-900 p-0.5 text-xs font-mono">
            <button
              onClick={() => setFilter("all")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filter === "all"
                  ? "bg-cyan-500/20 text-cyan-300 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              ALL ({machines.length})
            </button>
            <button
              onClick={() => setFilter("incidents")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filter === "incidents"
                  ? "bg-red-500/20 text-red-400 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              ANOMALIES (2)
            </button>
            <button
              onClick={() => setFilter("normal")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filter === "normal"
                  ? "bg-emerald-500/20 text-emerald-400 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              NOMINAL (8)
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="hidden sm:flex rounded-lg border border-slate-800 bg-slate-900 p-0.5 text-xs">
            <button
              onClick={() => setViewMode("lines")}
              title="Organized by Production Line"
              className={`p-1.5 rounded-md ${
                viewMode === "lines"
                  ? "bg-slate-800 text-cyan-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              title="All Machines Grid"
              className={`p-1.5 rounded-md ${
                viewMode === "grid"
                  ? "bg-slate-800 text-cyan-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Floor Layout */}
      {viewMode === "lines" ? (
        <div className="space-y-6">
          {lineAMachines.length > 0 && (
            <ProductionLine
              lineName="Production Line A"
              description="Primary Milling Cell • High-Speed Precision Haas & Mazak Vertical Machining"
              machines={lineAMachines}
            />
          )}

          {lineBMachines.length > 0 && (
            <ProductionLine
              lineName="Production Line B"
              description="Secondary Machining Cell • 5-Axis Turning & Okuma Heavy Duty Milling"
              machines={lineBMachines}
            />
          )}

          {lineCMachines.length > 0 && (
            <ProductionLine
              lineName="Production Line C"
              description="Heavy Precision Turning & DMG MORI Horizontal Machining Center"
              machines={lineCMachines}
            />
          )}

          {lineDMachines.length > 0 && (
            <ProductionLine
              lineName="Production Line D"
              description="Specialized Tooling Cell • Okuma 5-Axis Flexible Manufacturing System"
              machines={lineDMachines}
            />
          )}

          {filteredMachines.length === 0 && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-12 text-center">
              <p className="text-sm font-mono text-slate-400">
                No machines match the selected filter or search query.
              </p>
              <button
                onClick={() => {
                  setFilter("all");
                  setSearchQuery("");
                }}
                className="mt-3 px-3 py-1.5 text-xs font-mono rounded bg-slate-800 text-cyan-400 hover:bg-slate-700"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Uniform Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMachines.map((machine) => (
            <MachineCard key={machine.id} machine={machine} />
          ))}
        </div>
      )}
    </section>
  );
}
