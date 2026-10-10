import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { InvestigationPanel } from "./InvestigationPanel";
import type { AgentInvestigationResult } from "@/lib/ai-agent";

describe("InvestigationPanel Component", () => {
  it("renders the idle investigation state with trigger button", () => {
    const html = renderToStaticMarkup(
      <InvestigationPanel machineId="CNC-07" />
    );

    expect(html).toContain("AI INCIDENT INVESTIGATION");
    expect(html).toContain("Run AI Investigation");
  });

  it("renders completed investigation report and requires a persisted incident before decisions", () => {
    const mockInvestigation: AgentInvestigationResult = {
      machineId: "CNC-07",
      severity: "critical",
      probableCause: "Possible spindle bearing degradation",
      confidence: 0.92,
      evidence: [
        "Temperature reached 91.4°C",
        "Vibration reached 8.7 mm/s",
        "Machine reported error code E-204",
      ],
      recommendedAction: "Stop the machine and inspect the spindle bearing before returning it to production.",
      requiresHumanApproval: true,
      agentSource: "factoryguard-rule-engine",
    };

    const html = renderToStaticMarkup(
      <InvestigationPanel
        machineId="CNC-07"
        initialInvestigation={mockInvestigation}
      />
    );

    expect(html).toContain("Possible spindle bearing degradation");
    expect(html).toContain("92%");
    expect(html).toContain("Temperature reached 91.4°C");
    expect(html).toMatch(/HUMAN APPROVAL REQUIRED/i);
    expect(html).toContain("Run the investigation to create an incident record before making an approval decision.");
    expect(html).not.toContain("APPROVE ACTION");
  });
});
