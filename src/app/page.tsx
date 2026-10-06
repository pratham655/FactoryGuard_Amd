import { getFactoryMachines } from "@/lib/factory-data";
import { getFactorySummary } from "@/lib/factory-summary";

export default function Home() {
  const summary = getFactorySummary();
  const machines = getFactoryMachines();

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">
            Intelligent Industry
          </p>

          <h1 className="text-4xl font-bold tracking-tight">
            FactoryGuard
          </h1>

          <p className="mt-2 max-w-2xl text-slate-400">
            AI-powered industrial incident detection and maintenance
            intelligence.
          </p>
        </header>

        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-semibold">Factory Status</h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">Total Machines</p>
              <p className="mt-2 text-3xl font-bold">
                {summary.totalMachines}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">Normal</p>
              <p className="mt-2 text-3xl font-bold text-emerald-400">
                {summary.normalMachines}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">Warnings</p>
              <p className="mt-2 text-3xl font-bold text-amber-400">
                {summary.warningMachines}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">Critical</p>
              <p className="mt-2 text-3xl font-bold text-red-400">
                {summary.criticalMachines}
              </p>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Machine Monitoring</h2>

            <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-sm text-red-400">
              {summary.activeIncidents} active incidents
            </span>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
            <div className="grid grid-cols-6 gap-4 border-b border-slate-800 px-5 py-4 text-sm font-medium text-slate-400">
              <span>Machine</span>
              <span>Model</span>
              <span>Temperature</span>
              <span>Vibration</span>
              <span>Error</span>
              <span>Status</span>
            </div>

            {machines.map((machine) => (
              <div
                key={machine.id}
                className="grid grid-cols-6 gap-4 border-b border-slate-800 px-5 py-4 last:border-b-0"
              >
                <div>
                  <p className="font-semibold">{machine.name}</p>
                  <p className="text-xs text-slate-500">
                    {machine.location}
                  </p>
                </div>

                <span className="text-slate-300">{machine.model}</span>

                <span>{machine.telemetry.temperature}°C</span>

                <span>{machine.telemetry.vibration} mm/s</span>

                <span className="text-slate-300">
                  {machine.telemetry.errorCode ?? "—"}
                </span>

                <span
                  className={
                    machine.status === "critical"
                      ? "font-semibold text-red-400"
                      : machine.status === "warning"
                        ? "font-semibold text-amber-400"
                        : "font-semibold text-emerald-400"
                  }
                >
                  {machine.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}