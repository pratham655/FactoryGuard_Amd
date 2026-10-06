import { investigateIncident } from "./incident-investigation";

export type AgentInvestigationResult = {
  machineId: string;
  severity: "normal" | "warning" | "critical";
  probableCause: string | null;
  confidence: number;
  evidence: string[];
  recommendedAction: string;
  requiresHumanApproval: boolean;
  agentSource: "factoryguard-rule-engine";
};

export async function investigateWithAgent(
  machineId: string,
): Promise<AgentInvestigationResult> {
  const investigation = investigateIncident(machineId);

  return {
    ...investigation,
    agentSource: "factoryguard-rule-engine",
  };
}