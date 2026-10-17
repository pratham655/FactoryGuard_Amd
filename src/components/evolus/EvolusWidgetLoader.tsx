"use client";

import { useEffect, useRef } from "react";

type EvolusWidgetApi = {
  setContext?: (context: Record<string, string> | null) => void;
  on?: (event: string, callback: (payload?: unknown) => void) => void;
};

declare global {
  interface Window {
    EvolusWidget?: EvolusWidgetApi;
  }
}

function normalizeWidgetToken(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const lastAttribute = trimmed.toLowerCase().lastIndexOf("data-token");
  if (lastAttribute >= 0) {
    const attribute = trimmed.slice(lastAttribute);
    const match = attribute.match(/^data-token\s*=\s*["']([^"']+)["']/i);
    if (match?.[1]) return match[1].trim();

    const looseMatch = attribute.match(/^data-token\s*=\s*["']?([^"'\s>]+)/i);
    if (looseMatch?.[1]) return looseMatch[1].trim();
    return "";
  }

  if (/<script\b/i.test(trimmed) || /<\/script\s*>/i.test(trimmed)) return "";
  return trimmed;
}

export function EvolusWidgetLoader() {
  const configuredValue = process.env.NEXT_PUBLIC_EVOLUS_WIDGET_TOKEN;
  const widgetToken = configuredValue ? normalizeWidgetToken(configuredValue) : "";

  const context = useRef<Record<string, string>>({
    application: "FactoryGuard Operations Control Center",
    purpose:
      "Assist with simulated CNC machine incidents, evidence, telemetry and safe next steps. Rispondi sempre in italiano, salvo richiesta esplicita di un'altra lingua.",
    language: "Italiano (it-IT). Rispondi sempre in italiano, con tono professionale e chiaro.",
    safety:
      "Telemetry is simulated. Never claim real machine control. Critical interventions require human approval. Spiega le evidenze e mantieni sempre la supervisione umana.",
  });

  useEffect(() => {
    if (!widgetToken) {
      console.warn("FactoryGuard Evolus widget token is empty or malformed.");
      return;
    }

    const script = document.createElement("script");
    script.src = "https://api.evolus.ai/widget/v1/evolus-widget.min.js";
    script.dataset.token = widgetToken;
    script.dataset.lang = "it";
    script.dataset.factoryguardEvolusWidget = "true";
    script.defer = true;
    script.addEventListener("load", () => {
      window.EvolusWidget?.setContext?.(context.current);
    });
    script.addEventListener("error", () => {
      console.warn("FactoryGuard Evolus widget failed to load.");
    });
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, [widgetToken]);

  return null;
}
