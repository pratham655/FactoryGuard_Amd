"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity, AlertCircle, Pause, Play, RotateCcw } from "lucide-react";
import type { SimulationScenario, SimulationState } from "@/lib/simulation-engine";
import type { Machine } from "@/lib/factory-data";

type SimulationResponse = { simulation: SimulationState; running: boolean };
type InvestigationResponse = {
  machineId: string;
  severity: "normal" | "warning" | "critical";
  probableCause: string | null;
  confidence: number;
  evidence: string[];
  recommendedAction: string;
  requiresHumanApproval: boolean;
  agentSource: string;
  incident?: { id: string; status: string };
};
const scenarios: { value: SimulationScenario; label: string }[] = [
  { value: "spindle-degradation", label: "Spindle degradation" },
  { value: "thermal-overload", label: "Thermal overload" },
  { value: "vibration-anomaly", label: "Vibration anomaly" },
  { value: "motor-overload", label: "Motor overload" },
  { value: "cooling-failure", label: "Cooling failure" },
  { value: "lubrication-issue", label: "Lubrication issue" },
];

export function SimulationControlPanel({ machines }: { machines: Machine[] }) {
  const [state, setState] = useState<SimulationResponse | null>(null);
  const [machineId, setMachineId] = useState("CNC-07");
  const [scenario, setScenario] = useState<SimulationScenario>("spindle-degradation");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [investigation, setInvestigation] = useState<InvestigationResponse | null>(null);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/simulation/state", { cache: "no-store" });
      if (!response.ok) throw new Error(response.status === 401 || response.status === 403 ? "Your account is not authorized to view simulation state." : "Unable to load simulation state.");
      setState((await response.json()) as SimulationResponse);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load simulation state.");
    }
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => void refresh(), 1500);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const command = async (action: "start" | "pause" | "reset" | "scenario") => {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/simulation/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...(action === "scenario" ? { machineId, scenario } : {}) }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(typeof payload.error === "string" ? payload.error : "Simulation command failed.");
      setState(payload as SimulationResponse);
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Simulation command failed.");
    } finally {
      setBusy(false);
    }
  };

  const investigateSelectedMachine = async () => {
    setBusy(true);
    setError(null);
    setInvestigation(null);
    try {
      const response = await fetch("/api/incidents/" + encodeURIComponent(machineId) + "/investigate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "simulation-control-panel" }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(typeof payload.error === "string" ? payload.error : "Investigation failed.");
      }
      setInvestigation(payload as InvestigationResponse);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Investigation failed.");
    } finally {
      setBusy(false);
    }
  };

  const machineCount = state ? Object.keys(state.simulation.machines).length : 0;
  return (
    <section aria-label="Simulation controls" className="rounded-xl border border-cyan-500/20 bg-slate-950/80 p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-cyan-400" />
          <div><h3 className="text-sm font-mono font-bold text-white">Simulation Control</h3><p className="text-[11px] text-slate-400">Demo telemetry · polling every 1.5 seconds</p></div>
        </div>
        <span className={"rounded-md border px-2.5 py-1 text-[11px] font-mono uppercase " + (state?.running ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : "border-slate-700 bg-slate-900 text-slate-400")}>
          {state?.running ? "Running" : "Paused"}{state ? " · Tick " + state.simulation.tick : ""}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={busy || state?.running} onClick={() => void command("start")} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-mono font-bold text-white hover:bg-emerald-500 disabled:opacity-50"><Play className="h-3.5 w-3.5" />Start</button>
        <button type="button" disabled={busy || !state?.running} onClick={() => void command("pause")} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-mono font-bold text-slate-200 hover:bg-slate-800 disabled:opacity-50"><Pause className="h-3.5 w-3.5" />Pause</button>
        <button type="button" disabled={busy} onClick={() => void command("reset")} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-mono font-bold text-slate-200 hover:bg-slate-800 disabled:opacity-50"><RotateCcw className="h-3.5 w-3.5" />Reset</button>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(140px,0.7fr)_minmax(180px,1fr)_auto]">
        <label className="space-y-1 text-[11px] font-mono text-slate-400">TARGET MACHINE<select value={machineId} onChange={(event) => setMachineId(event.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white">{machines.map((machine) => <option key={machine.id} value={machine.id}>{machine.id}</option>)}</select></label>
        <label className="space-y-1 text-[11px] font-mono text-slate-400">FAULT SCENARIO<select value={scenario} onChange={(event) => setScenario(event.target.value as SimulationScenario)} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white">{scenarios.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
        <div className="flex flex-wrap items-center gap-2 self-end">
          <button type="button" disabled={busy} onClick={() => void command("scenario")} className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-xs font-mono font-bold text-amber-200 hover:bg-amber-500/20 disabled:opacity-50">Inject scenario</button>
          <button type="button" disabled={busy || !state} onClick={() => void investigateSelectedMachine()} className="rounded-lg bg-cyan-600 px-4 py-2 text-xs font-mono font-bold text-white hover:bg-cyan-500 disabled:opacity-50">{busy ? "Working…" : "Investigate machine"}</button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3"><p className="text-[10px] font-mono text-slate-500">FLEET</p><p className="mt-1 text-lg font-mono font-bold text-white">{machineCount || "—"} <span className="text-xs text-slate-400">machines</span></p></div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3"><p className="text-[10px] font-mono text-slate-500">CNC-07 TEMP</p><p className="mt-1 text-lg font-mono font-bold text-amber-300">{state?.simulation.machines["CNC-07"]?.temperature ?? "—"}<span className="text-xs">°C</span></p></div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3"><p className="text-[10px] font-mono text-slate-500">CNC-07 VIBRATION</p><p className="mt-1 text-lg font-mono font-bold text-amber-300">{state?.simulation.machines["CNC-07"]?.vibration ?? "—"}<span className="text-xs"> mm/s</span></p></div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3"><p className="text-[10px] font-mono text-slate-500">CNC-07 RISK ESTIMATE</p><p className="mt-1 text-lg font-mono font-bold text-red-300">{state?.simulation.machines["CNC-07"]?.failureRisk ?? "—"}<span className="text-xs">/100</span></p></div>
      </div>
      {error && <p role="alert" className="flex items-start gap-2 text-xs text-red-300"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</p>}
      {investigation && (
        <div aria-live="polite" className="space-y-3 rounded-lg border border-cyan-500/30 bg-slate-900/80 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-sm font-mono font-bold text-white">Investigation result · {investigation.machineId}</h4>
            <span className={"rounded border px-2 py-1 text-[10px] font-mono uppercase " + (investigation.severity === "critical" ? "border-red-500/40 bg-red-500/10 text-red-300" : investigation.severity === "warning" ? "border-amber-500/40 bg-amber-500/10 text-amber-300" : "border-emerald-500/40 bg-emerald-500/10 text-emerald-300")}>{investigation.severity}</span>
          </div>
          <p className="text-xs text-slate-300"><strong className="text-white">Probable cause:</strong> {investigation.probableCause ?? "No active anomaly detected"}</p>
          <p className="text-xs text-slate-300"><strong className="text-white">Recommended action:</strong> {investigation.recommendedAction}</p>
          <p className="text-[11px] text-slate-400">Confidence estimate: {(investigation.confidence * 100).toFixed(0)}% · Source: {investigation.agentSource} · {investigation.requiresHumanApproval ? "Human approval required" : "No mandatory approval flagged"}</p>
          {investigation.incident && <p className="text-[11px] text-cyan-300">Incident saved · {investigation.incident.status} · ID {investigation.incident.id}</p>}
          <div>
            <p className="mb-1 text-[10px] font-mono uppercase tracking-wide text-slate-500">Evidence</p>
            <ul className="list-disc space-y-1 pl-5 text-xs text-slate-300">{investigation.evidence.slice(0, 4).map((item, index) => <li key={index}>{item}</li>)}</ul>
          </div>
        </div>
      )}
      <p className="text-[10px] leading-relaxed text-slate-500">Simulation values are deterministic demonstration estimates, not readings from physical equipment. Control state is held in server process memory.</p>
    </section>
  );
}
