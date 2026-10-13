export type EvolusConfig = {
  apiKey: string | null;
  model: string | null;
};

export type EvolusConfigValidation =
  | {
      valid: true;
      apiKey: string;
      model: string;
    }
  | {
      valid: false;
      reason: string;
    };

const MODEL_PART = "[A-Za-z0-9][A-Za-z0-9._-]{0,127}";

/**
 * Reads only server-side environment variables. Never expose apiKey to a client.
 * Evolus documents the OpenAI-compatible model as "<applicationId>:<agentId>".
 */
export function getEvolusConfig(): EvolusConfig {
  return {
    apiKey: process.env.EVOLUS_API_KEY ?? null,
    model: process.env.EVOLUS_MODEL ?? null,
  };
}

export function validateEvolusConfig(
  config: EvolusConfig,
): EvolusConfigValidation {
  const apiKey = config.apiKey?.trim();
  const model = config.model?.trim();

  if (!apiKey) {
    return { valid: false, reason: "EVOLUS_API_KEY is not configured" };
  }

  if (!model || !new RegExp(`^${MODEL_PART}:${MODEL_PART}$`).test(model)) {
    return {
      valid: false,
      reason: "EVOLUS_MODEL must use the applicationId:agentId format",
    };
  }

  if (
    apiKey.length > 4096 ||
    !/^[\x21-\x7e]+$/.test(apiKey)
  ) {
    return {
      valid: false,
      reason: "EVOLUS_API_KEY has an invalid format",
    };
  }

  // Return a validated key only to server-side callers. Status and UI code
  // should consume only a boolean configured state, never this object.
  return { valid: true, apiKey, model };
}
