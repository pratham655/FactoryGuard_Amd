import { getAIConfig, validateAIConfig } from "./ai-config";
import { getEvolusConfig, validateEvolusConfig } from "./evolus-config";
import { investigateIncident } from "./incident-investigation";
import type { MachineTelemetry } from "./incident-detector";
import { createEvolusClient } from "./evolus-client";
import { createVLLMClient } from "./vllm-client";

export type AgentInvestigationResult = {
  machineId: string;
  severity: "normal" | "warning" | "critical";
  probableCause: string | null;
  confidence: number;
  evidence: string[];
  recommendedAction: string;
  requiresHumanApproval: boolean;
  agentSource: "factoryguard-rule-engine" | "factoryguard-vllm" | "factoryguard-evolus";
};

type ModelRecommendation = {
  probableCause: string | null;
  confidence: number;
  recommendedAction: string;
};

function parseModelRecommendation(content: string): ModelRecommendation {
  const trimmed = content.trim();
  const unfenced = trimmed
    .replace(/^\x60{3}(?:json)?\s*/i, "")
    .replace(/\s*\x60{3}$/, "");

  let parsed: unknown;

  try {
    parsed = JSON.parse(unfenced);
  } catch {
    throw new Error("AI provider returned an invalid investigation JSON object");
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("AI investigation must be a JSON object");
  }

  const candidate = parsed as Record<string, unknown>;
  const probableCause = candidate.probableCause;
  const confidence = candidate.confidence;
  const recommendedAction = candidate.recommendedAction;

  if (
    !(probableCause === null ||
      (typeof probableCause === "string" && probableCause.trim().length > 0))
  ) {
    throw new Error("AI probableCause must be a non-empty string or null");
  }

  if (
    typeof confidence !== "number" ||
    !Number.isFinite(confidence) ||
    confidence < 0 ||
    confidence > 1
  ) {
    throw new Error("AI confidence must be a number between 0 and 1");
  }

  if (
    typeof recommendedAction !== "string" ||
    recommendedAction.trim().length === 0
  ) {
    throw new Error("AI recommendedAction must be a non-empty string");
  }

  return {
    probableCause: probableCause === null ? null : probableCause.trim(),
    confidence,
    recommendedAction: recommendedAction.trim(),
  };
}

function buildInvestigationPrompt(baseline: ReturnType<typeof investigateIncident>) {
  return [
    "You are FactoryGuard, an industrial maintenance investigation assistant.",
    "Analyze the supplied machine facts and recommend a safe next action.",
    "Treat the supplied telemetry and evidence as the only verified facts.",
    "Do not invent measurements, maintenance events, source references, or machine state.",
    "Return only a JSON object with exactly these fields:",
    '{"probableCause": string or null, "confidence": number from 0 to 1, "recommendedAction": string}.',
    "Do not return markdown fences or any additional fields.",
    "The application, not the model, determines severity and mandatory human approval.",
    `Verified investigation facts: ${JSON.stringify({
      machineId: baseline.machineId,
      severity: baseline.severity,
      probableCause: baseline.probableCause,
      evidence: baseline.evidence,
      recommendedAction: baseline.recommendedAction,
      requiresHumanApproval: baseline.requiresHumanApproval,
    })}`,
  ].join("\n");
}

export async function investigateWithAgent(
  machineId: string,
  telemetry?: MachineTelemetry,
): Promise<AgentInvestigationResult> {
  // The rule engine is the safety baseline: it supplies severity, trusted
  // telemetry/evidence, and whether a human must approve an intervention.
  const baseline = investigateIncident(machineId, telemetry);
  const fallback: AgentInvestigationResult = {
    ...baseline,
    agentSource: "factoryguard-rule-engine",
  };

  // If either Evolus variable is present, the operator is opting into Evolus.
  // Do not silently bypass a partial/invalid Evolus setup via direct vLLM.
  const evolusRequested = Boolean(
    process.env.EVOLUS_API_KEY || process.env.EVOLUS_MODEL,
  );

  if (evolusRequested) {
    const evolusValidation = validateEvolusConfig(getEvolusConfig());
    if (!evolusValidation.valid) return fallback;

    try {
      const client = createEvolusClient({
        apiKey: evolusValidation.apiKey,
        model: evolusValidation.model,
      });
      const recommendation = parseModelRecommendation(
        await client.chat(buildInvestigationPrompt(baseline)),
      );

      return {
        ...baseline,
        probableCause: recommendation.probableCause,
        confidence: recommendation.confidence,
        recommendedAction: recommendation.recommendedAction,
        // Evolus may use configured tools internally, but it never decides
        // severity, changes evidence, or removes the mandatory approval gate.
        agentSource: "factoryguard-evolus",
      };
    } catch {
      return fallback;
    }
  }

  const validation = validateAIConfig(getAIConfig());
  if (!validation.valid) return fallback;

  try {
    const client = createVLLMClient({
      baseUrl: validation.baseUrl,
      model: validation.model,
    });
    const recommendation = parseModelRecommendation(
      await client.chat(buildInvestigationPrompt(baseline)),
    );

    return {
      ...baseline,
      probableCause: recommendation.probableCause,
      confidence: recommendation.confidence,
      recommendedAction: recommendation.recommendedAction,
      // Keep severity, evidence, and approval requirements from the trusted
      // rule engine. The model cannot downgrade a critical incident.
      agentSource: "factoryguard-vllm",
    };
  } catch {
    // Endpoint errors and malformed model output must not make investigation
    // unavailable. Fall back to the deterministic, evidence-backed result.
    return fallback;
  }
}
