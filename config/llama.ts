// LLAMA Configuration

/**
 * Configuration for the LLAMA model service
 */
export const LLAMA_CONFIG = {
  // Connection settings
  BASE_URL: "http://localhost:11434",
  MAX_TOKENS: 2048,
  TEMPERATURE: 0.7,

  // Performance settings
  TIMEOUT_MS: 30000, // 30 seconds
  MAX_RETRIES: 2,

  // UI settings
  ENABLE_STREAMING: true,
  SHOW_MODEL_DETAILS: true,
};

/**
 * Error messages for the LLAMA model service
 */
export const LLAMA_ERROR_MESSAGES = {
  CONNECTION_ERROR:
    "Unable to connect to AI service. Please check your network connection and try again.",
  TIMEOUT_ERROR:
    "Request timed out. The AI service is taking too long to respond.",
  VALIDATION_ERROR:
    "Invalid request format. Please try again with a valid query.",
  SERVER_ERROR:
    "The AI service encountered an internal error. Please try again later.",
  UNKNOWN_ERROR: "An unknown error occurred. Please try again.",
};
