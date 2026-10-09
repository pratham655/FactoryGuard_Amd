
export type VLLMClientOptions = {
  baseUrl: string;
  model: string;
  fetchFn?: typeof fetch;
  timeoutMs?: number;
};

type VLLMChatResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

export function createVLLMClient(options: VLLMClientOptions) {
  const fetchFn = options.fetchFn ?? fetch;
  const timeoutMs = options.timeoutMs ?? 15_000;

  return {
    async chat(prompt: string): Promise<string> {
      const controller = new AbortController();
      let timedOut = false;

      const timeout = setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, timeoutMs);

      let response: Response;

      try {
        response = await fetchFn(
          `${options.baseUrl}/v1/chat/completions`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: options.model,
              messages: [{ role: "user", content: prompt }],
              temperature: 0.2,
            }),
            signal: controller.signal,
          },
        );
      } catch {
        if (timedOut) {
          throw new Error(`vLLM request timed out after ${timeoutMs}ms`);
        }

        throw new Error("Unable to reach the vLLM endpoint");
      } finally {
        clearTimeout(timeout);
      }

      if (!response.ok) {
        throw new Error(`vLLM request failed with status ${response.status}`);
      }

      let data: VLLMChatResponse;

      try {
        data = (await response.json()) as VLLMChatResponse;
      } catch {
        throw new Error("vLLM returned invalid JSON");
      }

      const content = data.choices?.[0]?.message?.content;

      if (typeof content !== "string" || content.trim().length === 0) {
        throw new Error("vLLM returned an empty response");
      }

      return content;
    },
  };
}
