import { LLMService } from "../../../services/llmService";
import { ChatMessage, ChatModel, ChatMessageContent } from "../types/chat";
import OpenAIService from "../../../services/openaiService";
import { OpenRouterService } from "./openRouterService";
import { Platform } from "react-native";
import { MODEL_CONFIGS } from "../../../config/api-keys";

// Default models configuration
export const CHAT_MODELS: ChatModel[] = [
  {
    id: MODEL_CONFIGS.GROK4.id,
    name: MODEL_CONFIGS.GROK4.name,
    provider: MODEL_CONFIGS.GROK4.provider,
    model: MODEL_CONFIGS.GROK4.model,
    description: MODEL_CONFIGS.GROK4.description,
    logoPath: MODEL_CONFIGS.GROK4.logoPath,
    apiKey: MODEL_CONFIGS.GROK4.apiKey,
    supportsImages: MODEL_CONFIGS.GROK4.supportsImages,
  },
  {
    id: MODEL_CONFIGS.DEEPSEEK.id,
    name: MODEL_CONFIGS.DEEPSEEK.name,
    provider: MODEL_CONFIGS.DEEPSEEK.provider,
    model: MODEL_CONFIGS.DEEPSEEK.model,
    description: MODEL_CONFIGS.DEEPSEEK.description,
    logoPath: MODEL_CONFIGS.DEEPSEEK.logoPath,
    apiKey: MODEL_CONFIGS.DEEPSEEK.apiKey,
    supportsImages: MODEL_CONFIGS.DEEPSEEK.supportsImages,
  },
  // Note: The following models are commented out as they require external services
  // Uncomment and configure when you have the proper API connections set up
  /*
  {
    id: "llama3.1:8b",
    name: "LLaMA 3.1",
    provider: "llama",
    description: "General purpose assistant (requires local LLaMA server)",
    avatarUrl: "🦙",
    disabled: true,
  },
  {
    id: "gpt-4",
    name: "GPT-4",
    provider: "openai",
    description: "Advanced language model (requires OpenAI API key)",
    avatarUrl: "🤖",
    disabled: true,
  },
  {
    id: "deepseek-r1",
    name: "DeepSeek",
    provider: "deepseek",
    description: "Specialized financial assistant (requires OpenRouter API key)",
    avatarUrl: "🔍",
    disabled: true,
  },
  */
];

export class AIService {
  // Get the default model
  static getDefaultModel(): ChatModel {
    return CHAT_MODELS[0]; // Default to Octopus Finance model
  }

  // Get the list of available models
  static getAvailableModels(): ChatModel[] {
    return CHAT_MODELS;
  }

  // Convert chat messages format for the LLM service
  private static prepareChatMessages(
    messages: ChatMessage[]
  ): { role: "user" | "assistant"; content: string }[] {
    return messages
      .filter((msg) => msg.role !== "system") // Remove system messages for the API
      .map((msg) => {
        // Ensure we only pass string content to LLM service
        const content =
          typeof msg.content === "string"
            ? msg.content
            : JSON.stringify(msg.content);

        return {
          role: msg.role as "user" | "assistant",
          content: content,
        };
      });
  }

  // Add system prompt for financial context
  private static addSystemPrompt(messages: ChatMessage[]): ChatMessage[] {
    const systemPrompt: ChatMessage = {
      id: "system-prompt",
      role: "system",
      content:
        "You are an AI financial advisor assistant for Octopus Finance. " +
        "Provide helpful, accurate, and concise financial advice. " +
        "Focus on personal finance topics like budgeting, investing, saving, debt management, and financial planning. " +
        "Always maintain a professional, friendly tone. " +
        "Avoid giving specific investment advice or recommendations for specific financial products. " +
        "When uncertain, acknowledge limitations and suggest consulting with a professional financial advisor.",
      timestamp: Date.now(),
    };

    // Check if there's already a system message
    const hasSystemMessage = messages.some((msg) => msg.role === "system");

    if (!hasSystemMessage) {
      return [systemPrompt, ...messages];
    }

    return messages;
  }

  // Send a message to the AI model and get a response
  static async sendMessage(
    messages: ChatMessage[],
    model: ChatModel
  ): Promise<string> {
    try {
      const messagesWithSystem = this.addSystemPrompt(messages);
      // We only use OpenRouter models now
      const preparedMessages: {
        role: "user" | "assistant";
        content: string;
      }[] = [];

      if (model.provider === "openrouter") {
        // Use OpenRouter service for Grok and other OpenRouter models
        const openRouterService = OpenRouterService.getInstance();

        if (!model.model) {
          throw new Error(
            "Model identifier not specified for OpenRouter model"
          );
        }
        
        // Set the API key for this model in the service instance
        if (model.apiKey) {
          openRouterService.setApiKey(model.apiKey);
        }

        return await openRouterService.generateResponse(
          messagesWithSystem,
          model.model,
          model.apiKey
        );
      } else if (model.provider === "openai") {
        // Use OpenAI service
        const openaiService = OpenAIService.getInstance();

        // For demonstration purposes we're using the CSV parsing function
        // In a real app, we'd create a proper chat completion endpoint
        const response = await openaiService.parseCSVWithAI(
          JSON.stringify(preparedMessages),
          "chat_messages.json"
        );

        if (!response.success) {
          throw new Error(
            response.error || "Failed to get response from OpenAI"
          );
        }

        // This is a workaround - in a real implementation, we'd parse the proper response
        return (
          response.transactions?.[0]?.description ||
          "I apologize, but I couldn't generate a proper response."
        );
      } else {
        // Use LLM service for all other model types
        const response = await LLMService.generateResponse(
          preparedMessages,
          model.id
        );

        if (response.error) {
          throw new Error(response.error);
        }

        return response.content || "Sorry, I couldn't generate a response.";
      }
    } catch (error) {
      console.error("Error in AI service:", error);

      // Handle network errors more gracefully
      if (error instanceof Error) {
        if (error.message.includes("Network request failed")) {
          throw new Error(
            "Unable to connect to the AI service. Please check your internet connection and try again."
          );
        } else if (error.message.includes("timed out")) {
          throw new Error(
            "The request timed out. The AI service is taking too long to respond."
          );
        } else if (error.message.includes("Unknown model")) {
          throw new Error(
            "The selected AI model is not available. Please try a different model."
          );
        } else {
          throw new Error(error.message);
        }
      } else {
        throw new Error("Failed to get AI response");
      }
    }
  }

  // Stream a response from the AI model (for a more interactive experience)
  // Note: This is a simulated implementation since the actual streaming depends on your backend
  static async streamResponse(
    messages: ChatMessage[],
    model: ChatModel,
    onChunk: (chunk: string) => void,
    onError: (error: Error) => void,
    onComplete: () => void
  ): Promise<void> {
    try {
      // For OpenRouter models, use the OpenRouter service's streaming implementation
      if (model.provider === "openrouter" && model.model) {
        const openRouterService = OpenRouterService.getInstance();
        await openRouterService.streamResponse(
          messages,
          model.model,
          onChunk,
          onError,
          onComplete
        );
        return;
      }

      // For all other models, get the full response and simulate streaming
      const fullResponse = await this.sendMessage(messages, model);

      // Simulate streaming by breaking the response into chunks
      const chunks = fullResponse.split(" ");
      let index = 0;

      // Add a small delay before starting to simulate real-world behavior
      setTimeout(() => {
        // Use an interval to simulate streaming
        const interval = setInterval(() => {
          if (index < chunks.length) {
            onChunk(chunks[index] + " ");
            index++;
          } else {
            clearInterval(interval);
            onComplete();
          }
        }, 50); // Adjust timing as needed
      }, 300); // Small initial delay
    } catch (error) {
      // Improved error handling
      if (error instanceof Error) {
        if (error.message.includes("Network request failed")) {
          onError(
            new Error(
              "Connection to AI service failed. Please check your internet connection."
            )
          );
        } else if (error.message.includes("Unknown model")) {
          onError(
            new Error(
              "The selected AI model is currently unavailable. Please try a different model."
            )
          );
        } else {
          onError(error);
        }
      } else {
        onError(new Error("Unknown error in streaming response"));
      }
    }
  }
}
