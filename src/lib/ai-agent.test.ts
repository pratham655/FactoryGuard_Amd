import { afterEach, describe, expect, it, vi } from "vitest";
import { investigateWithAgent } from "./ai-agent";

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
