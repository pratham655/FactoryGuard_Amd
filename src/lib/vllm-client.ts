export type VLLMClientOptions = {
  baseUrl: string;
  model: string;
  fetchFn?: typeof fetch;
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

  return {
    async chat(prompt: string): Promise<string> {
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
              messages: [
                {
                  role: "user",
                  content: prompt,
                },
              ],
              temperature: 0.2,
            }),
          },
        );
      } catch {
        throw new Error("Unable to reach the vLLM endpoint");
      }

      if (!response.ok) {
        throw new Error(
          `vLLM request failed with status ${response.status}`,
        );
      }

      const data = (await response.json()) as VLLMChatResponse;

      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error("vLLM returned an empty response");
      }

      return content;
    },
  };
}