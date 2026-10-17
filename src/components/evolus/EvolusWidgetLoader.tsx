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

/**
 * Accept either a raw widget token or the full Evolus installation snippet.
 * Extract the LAST data-token attribute so an outer pasted script cannot
 * confuse quote parsing. Never log token contents.
 */
function normalizeWidgetToken(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const lastAttribute = trimmed.toLowerCase().lastIndexOf("data-token");
  if (lastAttribute >= 0) {
    const attribute = trimmed.slice(lastAttribute);
    const match = attribute.match(/^data-token\s*=\s*["']([^"']+)["']/i);
    if (match?.[1]) return match[1].trim();

    // Handle malformed nested quotes in a pasted script snippet.
    const looseMatch = attribute.match(/^data-token\s*=\s*["']?([^"'\s>]+)/i);
    if (looseMatch?.[1]) return looseMatch[1].trim();
    return "";
  }

  // Never pass an HTML/script snippet as if it were a token.
  if (/<script\b/i.test(trimmed) || /<\/script\s*>/i.test(trimmed)) return "";
  return trimmed;
}

/**
 * Loads the Evolus website chat only when a widget token is configured.
 * The token is public by design for this browser widget; never put server API
 * credentials here. The rule-engine investigation API remains independent.
 */
export function EvolusWidgetLoader() {
  const configuredValue = process.env.NEXT_PUBLIC_EVOLUS_WIDGET_TOKEN;
  const widgetToken = configuredValue ? normalizeWidgetToken(configuredValue) : "";

  const latestContext = useRef<Record<string, string>>({
    application: "FactoryGuard Operations Control Center",
    purpose: "Investigate simulated CNC machine incidents using the dashboard context.",
    safety:
      "Telemetry shown here is simulated. Never claim real machine control. Critical interventions require human approval.",
  });

  useEffect(() => {
    if (!widgetToken) {
      console.warn("FactoryGuard Evolus widget token is empty or malformed.");
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-factoryguard-evolus-widget="true"]',
    );

    const applyContext = () => {
      window.EvolusWidget?.setContext?.(latestContext.current);
    };

    if (existingScript) {
      if (window.EvolusWidget) applyContext();
      existingScript.addEventListener("load", applyContext);
      return () => existingScript.removeEventListener("load", applyContext);
    }

    const script = document.createElement("script");
    script.src = "https://api.evolus.ai/widget/v1/evolus-widget.min.js";
    script.dataset.token = widgetToken;
    script.dataset.factoryguardEvolusWidget = "true";
    script.defer = true;
    script.addEventListener("load", applyContext);
    script.addEventListener("error", () => {
      console.warn("FactoryGuard Evolus widget failed to load.");
    });
    document.body.appendChild(script);

    return () => {
      script.removeEventListener("load", applyContext);
    };
  }, [widgetToken]);

  return null;
}
