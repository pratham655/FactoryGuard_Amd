const EVOLUS_CHAT_COMPLETIONS_URL = "https://api.evolus.ai/v1/chat/completions";
const DEFAULT_TIMEOUT_MS = 15_000;
const MAX_RESPONSE_CHARS = 131_072;

export type EvolusClientOptions = {
  apiKey: string;
  model: string;
  fetchFn?: typeof fetch;
  timeoutMs?: number;
};

type EvolusChatResponse = {
  choices?: Array<{
    message?: {
      content?: unknown;
    };
  }>;
};

/**
 * Minimal OpenAI-compatible Evolus agent client.
 *
 * The endpoint is intentionally fixed to the official Evolus API host.
 * Keys must remain server-side. This client does not claim AMD execution;
 * that depends on the model endpoint configured inside the Evolus workspace.
 */
export function createEvolusClient(options: EvolusClientOptions) {
  const fetchFn = options.fetchFn ?? fetch;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  if (!options.apiKey.trim()) {
    throw new Error("Evolus API key is not configured");
  }
  if (!options.model.trim()) {
    throw new Error("Evolus model is not configured");
  }
  if (!Number.isInteger(timeoutMs) || timeoutMs < 10 || timeoutMs > 60_000) {
    throw new Error("Evolus timeout must be between 10 and 60000 milliseconds");
  }

  return {
    async chat(prompt: string): Promise<string> {
      if (typeof prompt !== "string" || !prompt.trim() || prompt.length > 100_000) {
        throw new Error("Evolus prompt is empty or exceeds the supported limit");
      }

      const controller = new AbortController();
      let timedOut = false;
      const timeout = setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, timeoutMs);

      try {
        const response = await fetchFn(EVOLUS_CHAT_COMPLETIONS_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${options.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: options.model,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.2,
          }),
          signal: controller.signal,
          redirect: "error",
        });

        if (!response.ok) {
          throw new Error(`Evolus request failed with status ${response.status}`);
        }

        const contentLength = response.headers.get("content-length");
        if (contentLength && /^\d+$/.test(contentLength) && Number(contentLength) > MAX_RESPONSE_CHARS) {
          throw new Error("Evolus response exceeded the supported size limit");
        }

        const raw = await response.text();
        if (raw.length > MAX_RESPONSE_CHARS) {
          throw new Error("Evolus response exceeded the supported size limit");
        }

        let data: EvolusChatResponse;
        try {
          data = JSON.parse(raw) as EvolusChatResponse;
        } catch {
          throw new Error("Evolus returned invalid JSON");
        }

        const content = data.choices?.[0]?.message?.content;
        if (typeof content !== "string" || !content.trim()) {
          throw new Error("Evolus returned an empty or unsupported response");
        }

        return content;
      } catch (error) {
        if (timedOut) {
          throw new Error(`Evolus request timed out after ${timeoutMs}ms`);
        }
        if (error instanceof Error && /^(Evolus |Evolus$)/.test(error.message)) {
          throw error;
        }
        // Avoid surfacing arbitrary upstream/network text that might contain
        // request metadata. In particular, never log or return the API key.
        throw new Error("Unable to reach the Evolus agent endpoint");
      } finally {
        clearTimeout(timeout);
      }
    },
  };
}
