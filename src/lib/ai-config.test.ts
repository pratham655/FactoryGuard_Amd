import { describe, expect, it } from "vitest";
import { getAIConfig } from "./ai-config";

describe("getAIConfig", () => {
  it("returns the configured vLLM endpoint and model", () => {
    const originalEndpoint = process.env.VLLM_BASE_URL;
    const originalModel = process.env.VLLM_MODEL;

    process.env.VLLM_BASE_URL = "http://amd-vllm:8000";
    process.env.VLLM_MODEL = "factoryguard-model";

    const config = getAIConfig();

    expect(config.baseUrl).toBe("http://amd-vllm:8000");
    expect(config.model).toBe("factoryguard-model");

    process.env.VLLM_BASE_URL = originalEndpoint;
    process.env.VLLM_MODEL = originalModel;
  });

  it("uses safe defaults when the vLLM configuration is unavailable", () => {
    const originalEndpoint = process.env.VLLM_BASE_URL;
    const originalModel = process.env.VLLM_MODEL;

    delete process.env.VLLM_BASE_URL;
    delete process.env.VLLM_MODEL;

    const config = getAIConfig();

    expect(config.baseUrl).toBeNull();
    expect(config.model).toBeNull();

    process.env.VLLM_BASE_URL = originalEndpoint;
    process.env.VLLM_MODEL = originalModel;
  });
});