/**
 * API Keys Configuration
 *
 * IMPORTANT: In a production environment, these keys should be stored securely
 * using environment variables or a secure key management system.
 */

export const API_KEYS = {
  // OpenRouter API Keys for accessing various LLM models
  OPENROUTER_API_KEY_GROK:
    "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",

  OPENROUTER_API_KEY_DEEPSEEK:
    "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",

  OPENROUTER_API_KEY_GEMINI:
    "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",

  OPENROUTER_API_KEY_LLAMA:
    "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",

  // Site information for OpenRouter
  SITE_URL: "https://octopus-finance.ai",
  SITE_NAME: "Octopus Finance AI Advisor",
};

// OpenRouter API Configuration
export const OPENROUTER_CONFIG = {
  BASE_URL: "https://openrouter.ai/api/v1",
  HEADERS: {
    "HTTP-Referer": API_KEYS.SITE_URL,
    "X-Title": API_KEYS.SITE_NAME,
  },
};

// Model configurations
export const MODEL_CONFIGS = {
  GROK4: {
    id: "grok-4",
    name: "Grok 4",
    provider: "openrouter",
    model: "x-ai/grok-4-fast:free", // xAI model available on free tier
    description: "Powerful AI model from xAI",
    // We handle theme-specific logos in the ModelIcon component
    apiKey: API_KEYS.OPENROUTER_API_KEY_GROK,
    supportsImages: true,
  },
  DEEPSEEK: {
    id: "deepseek-chat",
    name: "DeepSeek Chat",
    provider: "openrouter",
    model: "deepseek/deepseek-chat-v3.1:free", // DeepSeek model on free tier
    description: "Advanced language model by DeepSeek",
    // We handle theme-specific logos in the ModelIcon component
    apiKey: API_KEYS.OPENROUTER_API_KEY_DEEPSEEK,
    supportsImages: false,
  },
  GEMINI: {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    provider: "openrouter",
    model: "google/gemini-2.0-flash-exp:free", // Google Gemini model on free tier
    description: "Google's advanced multimodal AI model",
    // We handle theme-specific logos in the ModelIcon component
    apiKey: API_KEYS.OPENROUTER_API_KEY_GEMINI,
    supportsImages: true,
  },
  LLAMA: {
    id: "llama-3.3-8b",
    name: "Llama 3.3 8B",
    provider: "openrouter",
    model: "meta-llama/llama-3.3-8b-instruct:free", // Meta Llama model on free tier
    description: "Meta's advanced open-source language model",
    // We handle theme-specific logos in the ModelIcon component
    apiKey: API_KEYS.OPENROUTER_API_KEY_LLAMA,
    supportsImages: false,
  },
};
