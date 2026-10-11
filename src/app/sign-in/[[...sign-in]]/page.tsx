"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, ArrowRight, Cpu, ShieldCheck, Zap } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function continueAsDemo() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/demo-session", { method: "POST" });
      if (!response.ok) throw new Error("Unable to start demo session. Please try again.");
      router.push("/");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to start demo session.");
      setLoading(false);
    }
  }

  return (
    <main className="industrial-grid relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-12 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(8,145,178,0.16),_transparent_55%)]" />
      <section className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/95 p-7 shadow-2xl shadow-cyan-950/20 sm:p-9">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-300">
            <Cpu className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xl font-bold tracking-tight">FactoryGuard</p>
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Intelligent Industry</p>
          </div>
        </div>

        <div className="mb-6">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">
            <Activity className="h-3.5 w-3.5" /> Demo environment
          </p>
          <h1 className="text-2xl font-bold tracking-tight">Enter the control room</h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Explore factory simulation, AI-assisted incident investigation, and operator-approved maintenance workflows.
          </p>
        </div>

        <div className="mb-6 space-y-3 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
            <div>
              <p className="text-sm font-medium text-slate-200">Demo Operator</p>
              <p className="text-xs text-slate-500">No account or Clerk credentials required</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Zap className="h-4 w-4 shrink-0 text-amber-300" />
            <p className="text-xs leading-5 text-slate-400">Uses simulated machines and demo operator actions.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={continueAsDemo}
          disabled={loading}
          className="group flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-950/40 transition hover:from-cyan-500 hover:to-blue-500 disabled:cursor-wait disabled:opacity-70"
        >
          {loading ? "Opening control room…" : "Continue as Demo Operator"}
          {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
        </button>

        {error && <p role="alert" className="mt-3 text-sm text-red-400">{error}</p>}

        <p className="mt-5 text-center text-[11px] leading-5 text-slate-500">
          Public demonstration only. This demo entry is not real authentication and must not protect production systems.
        </p>
      </section>
    </main>
  );
}
