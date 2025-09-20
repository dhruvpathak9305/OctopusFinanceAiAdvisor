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
    logoPath: "assets/grok-logo.webp", // Path to the logo image
    apiKey: API_KEYS.OPENROUTER_API_KEY_GROK,
    supportsImages: true,
  },
  DEEPSEEK: {
    id: "deepseek-chat",
    name: "DeepSeek Chat",
    provider: "openrouter",
    model: "deepseek/deepseek-chat-v3.1:free", // DeepSeek model on free tier
    description: "Advanced language model by DeepSeek",
    logoPath: "assets/deepseek-logo.png", // Placeholder for DeepSeek logo
    apiKey: API_KEYS.OPENROUTER_API_KEY_DEEPSEEK,
    supportsImages: false,
  }
};
