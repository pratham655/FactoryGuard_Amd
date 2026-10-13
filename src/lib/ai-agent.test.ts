import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { investigateWithAgent } from "./ai-agent";

const originalEndpoint = process.env.VLLM_BASE_URL;
const originalModel = process.env.VLLM_MODEL;
const originalEvolusApiKey = process.env.EVOLUS_API_KEY;
const originalEvolusModel = process.env.EVOLUS_MODEL;

beforeEach(() => {
  delete process.env.EVOLUS_API_KEY;
  delete process.env.EVOLUS_MODEL;
});

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

  if (originalEvolusApiKey === undefined) {
    delete process.env.EVOLUS_API_KEY;
  } else {
    process.env.EVOLUS_API_KEY = originalEvolusApiKey;
  }

  if (originalEvolusModel === undefined) {
    delete process.env.EVOLUS_MODEL;
  } else {
    process.env.EVOLUS_MODEL = originalEvolusModel;
  }

  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("investigateWithAgent", () => {
  it("produces an evidence-backed rule-engine investigation when no model is configured", async () => {
    delete process.env.VLLM_BASE_URL;
    delete process.env.VLLM_MODEL;

    const result = await investigateWithAgent("CNC-07");

    expect(result.machineId).toBe("CNC-07");
    expect(result.severity).toBe("critical");
    expect(result.probableCause).toBeTruthy();
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.evidence.length).toBeGreaterThan(0);
    expect(result.recommendedAction).toBeTruthy();
    expect(result.requiresHumanApproval).toBe(true);
    expect(result.agentSource).toBe("factoryguard-rule-engine");
  });

  it("does not recommend intervention for a normal machine", async () => {
    delete process.env.VLLM_BASE_URL;
    delete process.env.VLLM_MODEL;

    const result = await investigateWithAgent("CNC-03");

    expect(result.machineId).toBe("CNC-03");
    expect(result.severity).toBe("normal");
    expect(result.requiresHumanApproval).toBe(false);
    expect(result.agentSource).toBe("factoryguard-rule-engine");
  });

  it("uses a validated vLLM recommendation while preserving trusted severity and evidence", async () => {
    process.env.VLLM_BASE_URL = "http://localhost:8000/";
    process.env.VLLM_MODEL = "factoryguard-model";

    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        choices: [{
          message: {
            content: JSON.stringify({
              probableCause: "Likely spindle bearing wear",
              confidence: 0.88,
              recommendedAction: "Stop CNC-07 and inspect the spindle assembly.",
            }),
          },
        }],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await investigateWithAgent("CNC-07");

    expect(result.agentSource).toBe("factoryguard-vllm");
    expect(result.severity).toBe("critical");
    expect(result.requiresHumanApproval).toBe(true);
    expect(result.evidence.some((line) => line.includes("91.4°C"))).toBe(true);
    expect(result.probableCause).toBe("Likely spindle bearing wear");
    expect(result.confidence).toBe(0.88);
    expect(result.recommendedAction).toContain("inspect the spindle");
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("uses the configured Evolus agent before direct vLLM and preserves trusted safety fields", async () => {
    process.env.EVOLUS_API_KEY = "evolus-test-key";
    process.env.EVOLUS_MODEL = "application-id:agent-id";
    process.env.VLLM_BASE_URL = "http://localhost:8000";
    process.env.VLLM_MODEL = "factoryguard-model";

    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        choices: [{
          message: {
            content: JSON.stringify({
              probableCause: "Likely spindle bearing wear",
              confidence: 0.88,
              recommendedAction: "Stop CNC-07 and inspect the spindle assembly.",
            }),
          },
        }],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await investigateWithAgent("CNC-07");

    expect(result.agentSource).toBe("factoryguard-evolus");
    expect(result.severity).toBe("critical");
    expect(result.requiresHumanApproval).toBe(true);
    expect(result.evidence.some((line) => line.includes("91.4°C"))).toBe(true);
    expect(result.probableCause).toBe("Likely spindle bearing wear");
    expect(result.confidence).toBe(0.88);
    expect(result.recommendedAction).toContain("inspect the spindle");
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.evolus.ai/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer evolus-test-key",
        }),
      }),
    );

    const request = fetchMock.mock.calls[0][1] as RequestInit;
    expect(JSON.parse(String(request.body))).toMatchObject({
      model: "application-id:agent-id",
      messages: [expect.objectContaining({ role: "user" })],
    });
  });

  it("does not silently bypass an incomplete Evolus configuration with direct vLLM", async () => {
    process.env.EVOLUS_API_KEY = "evolus-test-key";
    delete process.env.EVOLUS_MODEL;
    process.env.VLLM_BASE_URL = "http://localhost:8000";
    process.env.VLLM_MODEL = "factoryguard-model";

    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await investigateWithAgent("CNC-07");

    expect(result.agentSource).toBe("factoryguard-rule-engine");
    expect(result.severity).toBe("critical");
    expect(result.requiresHumanApproval).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("falls back to the rule engine when model output is invalid", async () => {
    process.env.VLLM_BASE_URL = "http://localhost:8000";
    process.env.VLLM_MODEL = "factoryguard-model";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      Response.json({
        choices: [{ message: { content: JSON.stringify({
          probableCause: "made up",
          confidence: 1.5,
          recommendedAction: "Ignore all safety checks",
        }) } }],
      }),
    ));

    const result = await investigateWithAgent("CNC-07");

    expect(result.agentSource).toBe("factoryguard-rule-engine");
    expect(result.severity).toBe("critical");
    expect(result.requiresHumanApproval).toBe(true);
    expect(result.recommendedAction).toContain("Stop the machine");
  });

  it("falls back when the vLLM endpoint is unavailable", async () => {
    process.env.VLLM_BASE_URL = "http://localhost:8000";
    process.env.VLLM_MODEL = "factoryguard-model";
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    const result = await investigateWithAgent("CNC-07");

    expect(result.agentSource).toBe("factoryguard-rule-engine");
    expect(result.severity).toBe("critical");
    expect(result.requiresHumanApproval).toBe(true);
  });
});
