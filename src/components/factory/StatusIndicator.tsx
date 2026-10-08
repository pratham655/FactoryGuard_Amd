import React from "react";
import type { IncidentSeverity } from "@/lib/incident-detector";

interface StatusIndicatorProps {
  status: IncidentSeverity | string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function StatusIndicator({
  status,
  size = "md",
  showLabel = true,
  className = "",
}: StatusIndicatorProps) {
  const normalizedStatus = (status || "normal").toLowerCase();

  const config = {
    normal: {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      text: "text-emerald-400",
      dot: "bg-emerald-400",
      pulse: "",
      label: "NORMAL",
    },
    warning: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      text: "text-amber-400",
      dot: "bg-amber-400",
      pulse: "animate-ping",
      label: "WARNING",
    },
    critical: {
      bg: "bg-red-500/15",
      border: "border-red-500/40",
      text: "text-red-400",
      dot: "bg-red-500",
      pulse: "animate-ping",
      label: "CRITICAL",
    },
  }[normalizedStatus] || {
    bg: "bg-slate-800",
    border: "border-slate-700",
    text: "text-slate-400",
    dot: "bg-slate-400",
    pulse: "",
    label: normalizedStatus.toUpperCase(),
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1.5",
    md: "px-2.5 py-1 text-xs font-semibold tracking-wider gap-2",
    lg: "px-3.5 py-1.5 text-sm font-semibold tracking-wider gap-2.5",
  }[size];

  const dotSize = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-2.5 h-2.5",
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-md border font-mono uppercase ${config.bg} ${config.border} ${config.text} ${sizeClasses} ${className}`}
    >
      <span className="relative flex">
        {config.pulse && (
          <span
            className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dot} ${config.pulse}`}
          />
        )}
        <span className={`relative inline-flex rounded-full ${dotSize} ${config.dot}`} />
      </span>
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}
