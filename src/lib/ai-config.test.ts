import { afterEach, describe, expect, it } from "vitest";
import { getAIConfig, validateAIConfig } from "./ai-config";

describe("validateAIConfig", () => {
  it("accepts a valid HTTP endpoint and model", () => {
    expect(
      validateAIConfig({
        baseUrl: "http://localhost:8000",
        model: "factoryguard-model",
      }),
    ).toEqual({
      valid: true,
      baseUrl: "http://localhost:8000",
      model: "factoryguard-model",
    });
  });

  it("rejects missing endpoint configuration", () => {
    expect(
      validateAIConfig({
        baseUrl: null,
        model: "factoryguard-model",
      }),
    ).toEqual({
      valid: false,
      reason: "VLLM_BASE_URL is not configured",
    });
  });

  it("rejects missing model configuration", () => {
    expect(
      validateAIConfig({
        baseUrl: "http://localhost:8000",
        model: null,
      }),
    ).toEqual({
      valid: false,
      reason: "VLLM_MODEL is not configured",
    });
  });

  it("rejects invalid endpoint URLs", () => {
    expect(
      validateAIConfig({
        baseUrl: "not-a-url",
        model: "factoryguard-model",
      }),
    ).toEqual({
      valid: false,
      reason: "VLLM_BASE_URL must be a valid HTTP or HTTPS URL",
    });
  });

  it("rejects unsupported endpoint protocols", () => {
    expect(
      validateAIConfig({
        baseUrl: "ftp://localhost:8000",
        model: "factoryguard-model",
      }),
    ).toEqual({
      valid: false,
      reason: "VLLM_BASE_URL must be a valid HTTP or HTTPS URL",
    });
  });

  it("rejects blank model names", () => {
    expect(
      validateAIConfig({
        baseUrl: "http://localhost:8000",
        model: "   ",
      }),
    ).toEqual({
      valid: false,
      reason: "VLLM_MODEL is not configured",
    });
  });
});

describe("getAIConfig", () => {
  const originalEndpoint = process.env.VLLM_BASE_URL;
  const originalModel = process.env.VLLM_MODEL;

  afterEach(() => {
    if (originalEndpoint === undefined) {
      delete process.env.VLLM_BASE_URL;
    } else {
      process.env.VLLM_BASE_URL = originalEndpoint;
    }

    if (originalModel === undefined) {
      delete process.env.VLLM_MODEL;
    } else {
      process.env.VLLM_MODEL = originalModel;
    }
  });

  it("returns the configured vLLM endpoint and model", () => {
    process.env.VLLM_BASE_URL = "http://amd-vllm:8000";
    process.env.VLLM_MODEL = "factoryguard-model";

    const config = getAIConfig();

    expect(config.baseUrl).toBe("http://amd-vllm:8000");
    expect(config.model).toBe("factoryguard-model");
  });

  it("uses safe defaults when the vLLM configuration is unavailable", () => {
    delete process.env.VLLM_BASE_URL;
    delete process.env.VLLM_MODEL;

    const config = getAIConfig();

    expect(config.baseUrl).toBeNull();
    expect(config.model).toBeNull();
  });
});