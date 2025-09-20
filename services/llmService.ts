import { LLAMA_CONFIG, LLAMA_ERROR_MESSAGES } from "../config/llama";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface LLMResponse {
  content: string;
  error?: string;
}

interface ModelConfig {
  provider: "llama" | "deepseek";
  endpoint: string;
  apiKey?: string;
  model: string;
}

// Model configurations
const MODEL_CONFIGS: Record<string, ModelConfig> = {
  "llama3.1:8b": {
    provider: "llama",
    endpoint: "http://localhost:11434",
    model: "llama3.1:8b",
  },
  "gpt-4": {
    provider: "llama",
    endpoint: "http://localhost:11434",
    model: "gpt-4",
  },
  mistral: {
    provider: "llama",
    endpoint: "http://localhost:11434",
    model: "mistral",
  },
  gemini: {
    provider: "llama",
    endpoint: "http://localhost:11434",
    model: "gemini",
  },
  "deepseek-r1": {
    provider: "deepseek",
    endpoint: "https://openrouter.ai/api/v1/chat/completions",
    apiKey:
      "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",
    model: "deepseek/deepseek-r1-0528:free",
  },
};

export class LLMService {
  private static async makeRequest(
    endpoint: string,
    body: any,
    headers: Record<string, string> = {},
    timeout: number = LLAMA_CONFIG.TIMEOUT_MS
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private static async retryRequest<T>(
    requestFn: () => Promise<T>,
    maxRetries: number = LLAMA_CONFIG.MAX_RETRIES
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxRetries) {
          break;
        }

        // Exponential backoff: wait 2^attempt seconds
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  private static async callLlamaAPI(
    config: ModelConfig,
    messages: ChatMessage[]
  ): Promise<LLMResponse> {
    const response = await this.makeRequest(`${config.endpoint}/api/generate`, {
      model: config.model,
      prompt: this.formatMessagesForLlama(messages),
      stream: false,
      options: {
        temperature: LLAMA_CONFIG.TEMPERATURE,
        num_predict: LLAMA_CONFIG.MAX_TOKENS,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(
          `Model "${config.model}" not found. Please check if the model is available.`
        );
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    return {
      content: data.response || "No response generated.",
    };
  }

  private static async callDeepSeekAPI(
    config: ModelConfig,
    messages: ChatMessage[]
  ): Promise<LLMResponse> {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${config.apiKey}`,
      "HTTP-Referer":
        typeof window !== "undefined"
          ? window.location.origin
          : "https://octopus-finance.ai",
      "X-Title": "Octopus Finance AI Advisor",
    };

    const response = await this.makeRequest(
      config.endpoint,
      {
        model: config.model,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: LLAMA_CONFIG.TEMPERATURE,
        max_tokens: LLAMA_CONFIG.MAX_TOKENS,
      },
      headers
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "OpenRouter/DeepSeek API Error:",
        response.status,
        errorText
      );

      if (response.status === 401) {
        throw new Error(
          "OpenRouter API authentication failed. Please check your API key."
        );
      }
      if (response.status === 429) {
        throw new Error(
          "OpenRouter API rate limit exceeded. Please try again later."
        );
      }
      if (response.status === 402) {
        throw new Error(
          "OpenRouter API credits exhausted. Please check your account balance."
        );
      }
      throw new Error(
        `OpenRouter API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || "OpenRouter API error");
    }

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("Invalid OpenRouter response format:", data);
      throw new Error("Invalid response format from OpenRouter API.");
    }

    return {
      content: data.choices[0].message.content || "No response generated.",
    };
  }

  static async generateResponse(
    messages: ChatMessage[],
    modelKey: string = "llama3.1:8b"
  ): Promise<LLMResponse> {
    const config = MODEL_CONFIGS[modelKey];

    if (!config) {
      return {
        content: "",
        error: `Unknown model: ${modelKey}. Please select a valid model.`,
      };
    }

    try {
      return await this.retryRequest(async () => {
        switch (config.provider) {
          case "llama":
            return await this.callLlamaAPI(config, messages);
          case "deepseek":
            return await this.callDeepSeekAPI(config, messages);
          default:
            throw new Error(`Unsupported provider: ${config.provider}`);
        }
      });
    } catch (error) {
      console.error(`LLM Service error (${config.provider}):`, error);

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          return { content: "", error: LLAMA_ERROR_MESSAGES.TIMEOUT_ERROR };
        }
        if (
          error.message.includes("fetch") ||
          error.message.includes("network")
        ) {
          return { content: "", error: LLAMA_ERROR_MESSAGES.CONNECTION_ERROR };
        }
        return { content: "", error: error.message };
      }

      return { content: "", error: LLAMA_ERROR_MESSAGES.UNKNOWN_ERROR };
    }
  }

  private static formatMessagesForLlama(messages: ChatMessage[]): string {
    return (
      messages
        .map(
          (msg) =>
            `${msg.role === "user" ? "Human" : "Assistant"}: ${msg.content}`
        )
        .join("\n\n") + "\n\nAssistant:"
    );
  }

  static getAvailableModels(): Array<{
    label: string;
    value: string;
    provider: string;
  }> {
    return [
      { label: "Octopus (Custom)", value: "octopus", provider: "octopus" },
      { label: "LLaMA 3.1 (8B)", value: "llama3.1:8b", provider: "llama" },
      { label: "GPT-4", value: "gpt-4", provider: "llama" },
      { label: "Mistral", value: "mistral", provider: "llama" },
      { label: "Gemini", value: "gemini", provider: "llama" },
      { label: "DeepSeek R1 0528", value: "deepseek-r1", provider: "deepseek" },
    ];
  }
}
