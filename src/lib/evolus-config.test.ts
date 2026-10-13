import { afterEach, describe, expect, it } from "vitest";
import { getEvolusConfig, validateEvolusConfig } from "./evolus-config";

const originalApiKey = process.env.EVOLUS_API_KEY;
const originalModel = process.env.EVOLUS_MODEL;

afterEach(() => {
  if (originalApiKey === undefined) delete process.env.EVOLUS_API_KEY;
  else process.env.EVOLUS_API_KEY = originalApiKey;

  if (originalModel === undefined) delete process.env.EVOLUS_MODEL;
  else process.env.EVOLUS_MODEL = originalModel;
});

describe("validateEvolusConfig", () => {
  it("accepts the official applicationId:agentId model form", () => {
    expect(validateEvolusConfig({
      apiKey: "test-api-key",
      model: "app_123:agent-456",
    })).toEqual({
      valid: true,
      apiKey: "test-api-key",
      model: "app_123:agent-456",
    });
  });

  it("rejects a missing API key", () => {
    expect(validateEvolusConfig({
      apiKey: null,
      model: "app:agent",
    })).toEqual({
      valid: false,
      reason: "EVOLUS_API_KEY is not configured",
    });
  });

  it("rejects a missing or malformed agent model reference", () => {
    for (const model of [null, "", "agent-only", "app:agent:extra", "app agent"]) {
      expect(validateEvolusConfig({ apiKey: "test-key", model })).toMatchObject({
        valid: false,
        reason: "EVOLUS_MODEL must use the applicationId:agentId format",
      });
    }
  });

  it("does not place the API key in an invalid configuration result", () => {
    const result = validateEvolusConfig({
      apiKey: "test-key",
      model: "missing-agent",
    });

    expect(JSON.stringify(result)).not.toContain("test-key");
  });

  it("reads server-side environment configuration", () => {
    process.env.EVOLUS_API_KEY = "env-test-key";
    process.env.EVOLUS_MODEL = "app:agent";

    expect(getEvolusConfig()).toEqual({
      apiKey: "env-test-key",
      model: "app:agent",
    });
  });
});
