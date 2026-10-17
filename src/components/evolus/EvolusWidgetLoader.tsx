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
 * Loads the Evolus website chat only when a widget token is configured.
 * The token is public by design for this browser widget; never put server API
 * credentials here. The rule-engine investigation API remains independent.
 */
export function EvolusWidgetLoader() {
  const widgetToken = process.env.NEXT_PUBLIC_EVOLUS_WIDGET_TOKEN;
  const latestContext = useRef<Record<string, string>>({
    application: "FactoryGuard Operations Control Center",
    purpose: "Investigate simulated CNC machine incidents using the dashboard context.",
    safety:
      "Telemetry shown here is simulated. Never claim real machine control. Critical interventions require human approval.",
  });

  useEffect(() => {
    if (!widgetToken) return;

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
      // A failed optional chat widget must not affect factory monitoring.
      console.warn("FactoryGuard Evolus widget failed to load.");
    });
    document.body.appendChild(script);

    return () => {
      script.removeEventListener("load", applyContext);
    };
  }, [widgetToken]);

  return null;
}
