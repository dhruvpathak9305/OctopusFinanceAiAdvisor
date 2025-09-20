export interface ChatMessageContent {
  type: "text" | "image_url";
  text?: string;
  image_url?: {
    url: string;
  };
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string | ChatMessageContent[];
  timestamp: number;
}

export interface ChatModel {
  id: string;
  name: string;
  description?: string;
  provider: string;
  model?: string; // The model identifier to use with the provider's API
  avatarUrl?: string; // Deprecated: use logoPath instead
  logoPath?: string; // Path to the model's logo image
  apiKey?: string; // API key for the model provider
  disabled?: boolean; // Flag to indicate if the model is currently unavailable
  supportsImages?: boolean; // Flag to indicate if the model supports image inputs
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  selectedModel: ChatModel;
}

export enum ChatActionType {
  ADD_MESSAGE = "ADD_MESSAGE",
  SET_LOADING = "SET_LOADING",
  SET_ERROR = "SET_ERROR",
  CLEAR_MESSAGES = "CLEAR_MESSAGES",
  CHANGE_MODEL = "CHANGE_MODEL",
}

export type ChatAction =
  | { type: ChatActionType.ADD_MESSAGE; payload: ChatMessage }
  | { type: ChatActionType.SET_LOADING; payload: boolean }
  | { type: ChatActionType.SET_ERROR; payload: string | null }
  | { type: ChatActionType.CLEAR_MESSAGES }
  | { type: ChatActionType.CHANGE_MODEL; payload: ChatModel };
