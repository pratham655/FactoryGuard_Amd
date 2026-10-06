export type AIConfig = {
  baseUrl: string | null;
  model: string | null;
};

export function getAIConfig(): AIConfig {
  return {
    baseUrl: process.env.VLLM_BASE_URL ?? null,
    model: process.env.VLLM_MODEL ?? null,
  };
}