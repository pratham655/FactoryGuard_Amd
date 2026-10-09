
export type AIConfig = {
  baseUrl: string | null;
  model: string | null;
};

export type AIConfigValidation =
  | {
      valid: true;
      baseUrl: string;
      model: string;
    }
  | {
      valid: false;
      reason: string;
    };

export function getAIConfig(): AIConfig {
  return {
    baseUrl: process.env.VLLM_BASE_URL ?? null,
    model: process.env.VLLM_MODEL ?? null,
  };
}

export function validateAIConfig(
  config: AIConfig,
): AIConfigValidation {
  const baseUrl = config.baseUrl?.trim();
  const model = config.model?.trim();

  if (!baseUrl) {
    return {
      valid: false,
      reason: "VLLM_BASE_URL is not configured",
    };
  }

  if (!model) {
    return {
      valid: false,
      reason: "VLLM_MODEL is not configured",
    };
  }

  try {
    const url = new URL(baseUrl);

    if (
      (url.protocol !== "http:" && url.protocol !== "https:") ||
      !url.hostname
    ) {
      throw new Error("Invalid endpoint URL");
    }
  } catch {
    return {
      valid: false,
      reason: "VLLM_BASE_URL must be a valid HTTP or HTTPS URL",
    };
  }

  return {
    valid: true,
    baseUrl: baseUrl.replace(/\/+$/, ""),
    model,
  };
}
