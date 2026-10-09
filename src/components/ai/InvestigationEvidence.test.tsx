
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { InvestigationEvidence } from "./InvestigationEvidence";

describe("InvestigationEvidence", () => {
  it("renders evidence text and its source references", () => {
    const evidence = [
      "Temperature reached 91.4°C",
      "Retrieved source [technical:CNC Spindle Maintenance Manual:Spindle Vibration Maintenance Guidance] (CNC Spindle Maintenance Manual): Spindle Vibration Maintenance Guidance.",
      "Retrieved source [maintenance:CNC-07:2026-09-18] (Maintenance history — CNC-07): Elevated spindle vibration.",
    ];

    const html = renderToStaticMarkup(
      <InvestigationEvidence evidence={evidence} />,
    );

    expect(html).toContain("Diagnostic Evidence");
    expect(html).toContain("Temperature reached 91.4°C");
    expect(html).toContain("CNC Spindle Maintenance Manual");
    expect(html).toContain("maintenance:CNC-07:2026-09-18");
    expect(html).toContain("Maintenance history — CNC-07");
    expect(html).toContain("EVID-1");
    expect(html).toContain("EVID-2");
    expect(html).toContain("EVID-3");
  });

  it("shows an empty state when no evidence is available", () => {
    const html = renderToStaticMarkup(
      <InvestigationEvidence evidence={[]} />,
    );

    expect(html).toContain("No telemetry anomalies recorded");
  });
});
