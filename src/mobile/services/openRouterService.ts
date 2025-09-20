import { API_KEYS, OPENROUTER_CONFIG } from "../../../config/api-keys";
import { ChatMessage, ChatMessageContent } from "../types/chat";

interface OpenRouterResponse {
  id: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenRouterService {
  private static instance: OpenRouterService;
  private apiKey: string;
  private baseUrl: string;
  private headers: Record<string, string>;

  private constructor() {
    this.apiKey = API_KEYS.OPENROUTER_API_KEY_GROK; // Default to Grok API key
    this.baseUrl = OPENROUTER_CONFIG.BASE_URL;
    this.headers = {
      ...OPENROUTER_CONFIG.HEADERS,
      "Content-Type": "application/json",
    };
  }

  /**
   * Test the API connection with a simple request
   * This can be called to verify the API key and connection
   */
  public async testConnection(apiKey?: string): Promise<boolean> {
    try {
      const authKey = apiKey || this.apiKey;
      const response = await fetch(`${this.baseUrl}/models`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authKey}`,
        },
      });

      if (!response.ok) {
        console.error(
          "API connection test failed:",
          response.status,
          response.statusText
        );
        return false;
      }

      const data = await response.json();
      console.log(
        "Available models from OpenRouter:",
        JSON.stringify(data.data, null, 2)
      );

      // Log available model IDs for easier reference
      if (data.data && Array.isArray(data.data)) {
        const modelIds = data.data.map((model: any) => model.id);
        console.log("Available model IDs:", modelIds);
      }

      return true;
    } catch (error) {
      console.error("API connection test error:", error);
      return false;
    }
  }

  public static getInstance(): OpenRouterService {
    if (!OpenRouterService.instance) {
      OpenRouterService.instance = new OpenRouterService();
    }
    return OpenRouterService.instance;
  }
  
  /**
   * Set the API key for specific model requests
   */
  public setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  /**
   * Get a list of fallback models to try if the primary model fails
   */
  private getFallbackModels(primaryModelId: string): string[] {
    // We're only using gpt-3.5-turbo which is reliable on the free tier
    // No need for fallbacks as we've removed the higher-tier models
    return [];
  }

  /**
   * Prepare messages for OpenRouter API
   * Handles both string content and structured content with images
   */
  private prepareMessages(messages: ChatMessage[]): any[] {
    return messages.map((msg) => {
      // For Claude models, we need to format differently
      if (typeof msg.content === "string") {
        // Simple text format - just use the string directly
        return {
          role: msg.role,
          content: msg.content,
        };
      } else {
        // For structured content with images
        return {
          role: msg.role,
          content: msg.content,
        };
      }
    });
  }

  /**
   * Call the OpenRouter API with the provided messages and model
   */
  public async generateResponse(
    messages: ChatMessage[],
    modelId: string,
    apiKey?: string
  ): Promise<string> {
    // Use the provided API key or fall back to the default one
    const authKey = apiKey || this.apiKey;
    try {
      const preparedMessages = this.prepareMessages(messages);

      // Get fallback models to try if primary model fails
      const modelsToTry = [modelId, ...this.getFallbackModels(modelId)];
      let lastError: Error | null = null;

      // Try each model in sequence until one works
      for (const currentModel of modelsToTry) {
        try {
          // Log request details for debugging
          console.log("OpenRouter API Request:", {
            url: `${this.baseUrl}/chat/completions`,
            model: currentModel,
            messagesCount: preparedMessages.length,
            firstMessageRole: preparedMessages[0]?.role,
          });

          const requestBody = {
            model: currentModel,
            messages: preparedMessages,
            max_tokens: 500, // Limit tokens to stay within free tier limits
          };

          console.log("Request body:", JSON.stringify(requestBody, null, 2));

          const response = await fetch(`${this.baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
              ...this.headers,
              Authorization: `Bearer ${authKey}`,
            },
            body: JSON.stringify(requestBody),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(
              `OpenRouter API Error with model ${currentModel}:`,
              response.status,
              errorText
            );

            if (response.status === 401) {
              // Authentication errors are fatal, no need to try other models
              throw new Error(
                "Authentication failed. Please check your API key."
              );
            } else if (response.status === 429) {
              // Rate limiting might apply to all models, but we can try others
              lastError = new Error(
                "Rate limit exceeded. Please try again later."
              );
              continue;
            } else {
              // For other errors (like 404 model not found), try next model
              lastError = new Error(
                `API error: ${response.status} ${response.statusText}`
              );
              continue;
            }
          }

          const responseText = await response.text();
          console.log(
            `OpenRouter API raw response from ${currentModel}:`,
            responseText
          );

          try {
            const data = JSON.parse(responseText) as OpenRouterResponse;
            console.log("OpenRouter API parsed response:", {
              id: data.id,
              model: data.model,
              choicesCount: data?.choices?.length,
              firstChoice: data?.choices?.[0],
            });

            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
              lastError = new Error(
                "Invalid response format from API: Missing choices or message"
              );
              continue;
            }

            // Success! Return the content
            console.log(
              `Successfully got response from model: ${currentModel}`
            );
            return data.choices[0].message.content;
          } catch (parseError) {
            console.error("Failed to parse JSON response:", parseError);
            lastError = new Error("Invalid JSON response from API");
            continue;
          }
        } catch (modelError) {
          // Catch errors for individual model attempts
          console.error(`Error with model ${currentModel}:`, modelError);
          lastError =
            modelError instanceof Error
              ? modelError
              : new Error(String(modelError));
          continue;
        }
      }

      // If we get here, all models failed
      throw lastError || new Error("All models failed to generate a response");
    } catch (error) {
      console.error("Error calling OpenRouter API:", error);
      throw error;
    }
  }

  /**
   * Stream response from the OpenRouter API
   * Note: This is a simulated implementation as streaming requires more complex setup
   */
  public async streamResponse(
    messages: ChatMessage[],
    modelId: string,
    onChunk: (chunk: string) => void,
    onError: (error: Error) => void,
    onComplete: () => void,
    apiKey?: string
  ): Promise<void> {
    try {
      // For now, we'll just get the full response and simulate streaming
      // This will automatically try fallback models if the primary one fails
      const fullResponse = await this.generateResponse(messages, modelId, apiKey);

      // Split by spaces to simulate word-by-word streaming
      const chunks = fullResponse.split(" ");
      let index = 0;

      // Add a small delay before starting to simulate network latency
      setTimeout(() => {
        const interval = setInterval(() => {
          if (index < chunks.length) {
            onChunk(chunks[index] + " ");
            index++;
          } else {
            clearInterval(interval);
            onComplete();
          }
        }, 50);
      }, 300);
    } catch (error) {
      console.error("Error in streamResponse:", error);
      onError(error instanceof Error ? error : new Error("Unknown error"));
    }
  }
}
