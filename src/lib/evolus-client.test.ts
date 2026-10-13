import { describe, expect, it, vi } from "vitest";
import { createEvolusClient } from "./evolus-client";

describe("createEvolusClient", () => {
  it("posts to the official OpenAI-compatible endpoint using a server-side bearer key", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        choices: [{ message: { content: '{"probableCause":"Spindle wear","confidence":0.8,"recommendedAction":"Inspect the spindle."}' } }],
      }),
    );
    const client = createEvolusClient({
      apiKey: "server-only-test-key",
      model: "app-id:agent-id",
      fetchFn: fetchMock,
    });

    const result = await client.chat("Investigate CNC-07.");

    expect(result).toContain("Spindle wear");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.evolus.ai/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        redirect: "error",
        headers: {
          Authorization: "Bearer server-only-test-key",
          "Content-Type": "application/json",
        },
      }),
    );
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(JSON.parse(String(init.body))).toMatchObject({
      model: "app-id:agent-id",
      messages: [{ role: "user", content: "Investigate CNC-07." }],
    });
  });

  it("rejects an oversized response", async () => {
    const client = createEvolusClient({
      apiKey: "test-key",
      model: "app:agent",
      fetchFn: async () => new Response("x".repeat(131_073)),
    });

    await expect(client.chat("test")).rejects.toThrow("Evolus response exceeded the supported size limit");
  });

  it("rejects non-JSON responses", async () => {
    const client = createEvolusClient({
      apiKey: "test-key",
      model: "app:agent",
      fetchFn: async () => new Response("not-json"),
    });

    await expect(client.chat("test")).rejects.toThrow("Evolus returned invalid JSON");
  });

  it("rejects empty choices", async () => {
    const client = createEvolusClient({
      apiKey: "test-key",
      model: "app:agent",
      fetchFn: async () => Response.json({ choices: [] }),
    });

    await expect(client.chat("test")).rejects.toThrow("Evolus returned an empty or unsupported response");
  });

  it("uses a bounded timeout", async () => {
    const client = createEvolusClient({
      apiKey: "test-key",
      model: "app:agent",
      timeoutMs: 10,
      fetchFn: async (_input, init) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => reject(new Error("aborted")), { once: true });
        }),
    });

    await expect(client.chat("test")).rejects.toThrow("Evolus request timed out after 10ms");
  });
});
