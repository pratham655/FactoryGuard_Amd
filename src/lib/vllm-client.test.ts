import { describe, expect, it, vi } from "vitest";
import { createVLLMClient } from "./vllm-client";

describe("createVLLMClient", () => {
  it("sends a chat completion request to the configured vLLM endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: "Inspect the spindle bearing.",
              },
            },
          ],
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );

    const client = createVLLMClient({
      baseUrl: "http://amd-vllm:8000",
      model: "factoryguard-model",
      fetchFn: fetchMock,
    });

    const result = await client.chat("Investigate CNC-07.");

    expect(result).toBe("Inspect the spindle bearing.");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://amd-vllm:8000/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
      }),
    );
  });

  it("throws a clear error when vLLM is unavailable", async () => {
    const fetchMock = vi.fn().mockRejectedValue(
      new Error("Network error"),
    );

    const client = createVLLMClient({
      baseUrl: "http://amd-vllm:8000",
      model: "factoryguard-model",
      fetchFn: fetchMock,
    });

    await expect(client.chat("Investigate CNC-07.")).rejects.toThrow(
      "Unable to reach the vLLM endpoint",
    );
  });
});