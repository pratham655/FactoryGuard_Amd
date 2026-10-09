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

    await expect(
      client.chat("Investigate CNC-07."),
    ).rejects.toThrow("Unable to reach the vLLM endpoint");
  });

  it("throws a clear error when the endpoint returns invalid JSON", async () => {
    const client = createVLLMClient({
      baseUrl: "http://localhost:8000",
      model: "test-model",
      fetchFn: async () =>
        new Response("not valid json", {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }),
    });

    await expect(
      client.chat("Investigate CNC-07"),
    ).rejects.toThrow("vLLM returned invalid JSON");
  });

  it("throws a clear error when the response has no choices", async () => {
    const client = createVLLMClient({
      baseUrl: "http://localhost:8000",
      model: "test-model",
      fetchFn: async () =>
        Response.json({
          choices: [],
        }),
    });

    await expect(
      client.chat("Investigate CNC-07"),
    ).rejects.toThrow("vLLM returned an empty response");
  });

  it("rejects whitespace-only model content", async () => {
    const client = createVLLMClient({
      baseUrl: "http://localhost:8000",
      model: "test-model",
      fetchFn: async () =>
        Response.json({
          choices: [
            {
              message: {
                content: "   ",
              },
            },
          ],
        }),
    });

    await expect(
      client.chat("Investigate CNC-07"),
    ).rejects.toThrow("vLLM returned an empty response");
  });

  it("throws a clear timeout error when the endpoint takes too long", async () => {
    const client = createVLLMClient({
      baseUrl: "http://localhost:8000",
      model: "test-model",
      timeoutMs: 5,
      fetchFn: async (_input, init) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener(
            "abort",
            () => reject(new Error("Request aborted")),
            { once: true },
          );
        }),
    });

    await expect(
      client.chat("Investigate CNC-07"),
    ).rejects.toThrow(
      "vLLM request timed out after 5ms",
    );
  });
});