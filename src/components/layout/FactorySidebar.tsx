"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Factory,
  Cpu,
  AlertTriangle,
  Wrench,
  Sparkles,
  BookOpen,
  ShieldCheck,
  Activity,
  Menu,
  X,
  Server,
  Radio,
  ChevronRight,
} from "lucide-react";

export function FactorySidebar() {
  const rawPathname = usePathname();
  const pathname = rawPathname || "/";
  const [isOpen, setIsOpen] = useState(false);

  const isMachinePage = pathname ? pathname.startsWith("/machines/") : false;

  const navItems = [
    {
      label: "Overview",
      href: "/",
      icon: Activity,
      active: pathname === "/",
      badge: null,
    },
    {
      label: "Machines",
      href: "/#machines-floor",
      icon: Factory,
      active: isMachinePage || pathname === "/#machines-floor",
      badge: "10",
    },
    {
      label: "Incidents",
      href: "/#active-incidents",
      icon: AlertTriangle,
      active: false,
      badge: "2",
      badgeColor: "bg-red-500/20 text-red-400 border border-red-500/40",
    },
    {
      label: "Maintenance",
      href: "/machines/CNC-07#maintenance",
      icon: Wrench,
      active: false,
      badge: null,
    },
    {
      label: "AI Investigation",
      href: "/machines/CNC-07#ai-investigation",
      icon: Sparkles,
      active: false,
      badge: "ACTIVE",
      badgeColor: "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40",
    },
    {
      label: "Technical Knowledge",
      href: "/machines/CNC-07#technical-knowledge",
      icon: BookOpen,
      active: false,
      badge: null,
    },
    {
      label: "System / Governance",
      href: "/machines/CNC-07#governance",
      icon: ShieldCheck,
      active: false,
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800 transition-colors shadow-lg cursor-pointer"
          aria-label="Toggle navigation"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-slate-950/95 border-r border-slate-800/80 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 text-cyan-400 shadow-sm shadow-cyan-950">
              <Cpu className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white font-mono">
                  FactoryGuard
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-semibold">
                  AI-CORE
                </span>
              </div>
              <p className="text-[11px] font-medium tracking-wider uppercase text-slate-400">
                Intelligent Industry
              </p>
            </div>
          </div>
        </div>

        {/* Live Operational Status Bar */}
        <div className="px-5 py-3 bg-slate-900/60 border-b border-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-medium text-slate-300">
              TELEMETRY BUS
            </span>
          </div>
          <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            ONLINE
          </span>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500">
            Control Room Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                  item.active
                    ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-semibold shadow-inner"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      item.active
                        ? "text-cyan-400"
                        : "text-slate-400 group-hover:text-slate-200"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        item.badgeColor || "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight
                    className={`w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all ${
                      item.active ? "opacity-100 translate-x-0 text-cyan-400" : "text-slate-500"
                    }`}
                  />
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Sidebar Area */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/80 space-y-3">
          {/* AMD AI Inference Engine Status Placeholder */}
          <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/80">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold flex items-center gap-1.5">
                <Server className="w-3 h-3 text-cyan-400" />
                AMD AI Engine
              </span>
              <span className="text-[10px] font-mono text-cyan-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                READY
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-300 truncate">
              Instinct™ MI300X • ROCm 6.2
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Rule Engine & Reasoning Active
            </p>
          </div>

          {/* System Status & Version */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>SYSTEM NOMINAL</span>
            </div>
            <span className="text-slate-500">v0.4.2-preview</span>
          </div>
        </div>
      </aside>
    </>
  );
}
