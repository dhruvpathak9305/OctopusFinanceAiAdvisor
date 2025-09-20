import { useReducer, useCallback, useEffect, useRef } from "react";
import {
  ChatMessage,
  ChatModel,
  ChatState,
  ChatAction,
  ChatActionType,
} from "../types/chat";
import { AIService } from "../services/aiService";

// Initialize the chat state
const initialChatState: ChatState = {
  messages: [],
  isLoading: false,
  error: null,
  selectedModel: AIService.getDefaultModel(),
};

// Chat state reducer
function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case ChatActionType.ADD_MESSAGE:
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };
    case ChatActionType.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case ChatActionType.SET_ERROR:
      return {
        ...state,
        error: action.payload,
      };
    case ChatActionType.CLEAR_MESSAGES:
      return {
        ...state,
        messages: [],
        error: null,
      };
    case ChatActionType.CHANGE_MODEL:
      return {
        ...state,
        selectedModel: action.payload,
      };
    default:
      return state;
  }
}

// Hook for chat state management
export function useChat(initialMessages: ChatMessage[] = []) {
  const [state, dispatch] = useReducer(chatReducer, {
    ...initialChatState,
    messages: initialMessages,
  });

  // Keep track if the component is still mounted
  const isMounted = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Add a new message to the chat
  const addMessage = useCallback((message: ChatMessage) => {
    dispatch({
      type: ChatActionType.ADD_MESSAGE,
      payload: message,
    });
  }, []);

  // Set loading state
  const setLoading = useCallback((isLoading: boolean) => {
    if (isMounted.current) {
      dispatch({
        type: ChatActionType.SET_LOADING,
        payload: isLoading,
      });
    }
  }, []);

  // Set error state
  const setError = useCallback((error: string | null) => {
    if (isMounted.current) {
      dispatch({
        type: ChatActionType.SET_ERROR,
        payload: error,
      });
    }
  }, []);

  // Clear all messages
  const clearMessages = useCallback(() => {
    dispatch({ type: ChatActionType.CLEAR_MESSAGES });
  }, []);

  // Change the selected model
  const changeModel = useCallback((model: ChatModel) => {
    dispatch({
      type: ChatActionType.CHANGE_MODEL,
      payload: model,
    });
  }, []);

  // Get available AI models
  const getAvailableModels = useCallback(() => {
    return AIService.getAvailableModels();
  }, []);

  // Send a message and get a response from the AI
  const sendMessage = useCallback(
    async (content: string | ChatMessageContent[]) => {
      try {
        // Create a unique ID for the user message
        const userId = `user-${Date.now()}`;

        // Add the user message to the chat
        const userMessage: ChatMessage = {
          id: userId,
          role: "user",
          content,
          timestamp: Date.now(),
        };

        addMessage(userMessage);
        setLoading(true);
        setError(null);

        // Create a unique ID for the assistant's response
        const assistantId = `assistant-${Date.now()}`;

        // Get the messages including the new user message
        const messagesForAI = [...state.messages, userMessage];

        // Get the response from the AI
        const responseContent = await AIService.sendMessage(
          messagesForAI,
          state.selectedModel
        );

        // Create the assistant message
        const assistantMessage: ChatMessage = {
          id: assistantId,
          role: "assistant",
          content: responseContent,
          timestamp: Date.now(),
        };

        // Add the assistant message to the chat if the component is still mounted
        if (isMounted.current) {
          addMessage(assistantMessage);
        }

        return assistantMessage;
      } catch (error) {
        if (isMounted.current) {
          setError(
            error instanceof Error ? error.message : "Failed to get response"
          );
        }
        throw error;
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    },
    [state.messages, state.selectedModel, addMessage, setLoading, setError]
  );

  // Stream a response from the AI (for a more interactive experience)
  const streamMessage = useCallback(
    async (content: string) => {
      try {
        // Create a unique ID for the user message
        const userId = `user-${Date.now()}`;

        // Add the user message to the chat
        const userMessage: ChatMessage = {
          id: userId,
          role: "user",
          content,
          timestamp: Date.now(),
        };

        addMessage(userMessage);
        setLoading(true);
        setError(null);

        // Create a unique ID for the assistant's response
        const assistantId = `assistant-${Date.now()}`;

        // Create an empty assistant message
        const assistantMessage: ChatMessage = {
          id: assistantId,
          role: "assistant",
          content: "",
          timestamp: Date.now(),
        };

        // Add the empty assistant message
        addMessage(assistantMessage);

        // Get the messages including the new user message but not the empty assistant message
        const messagesForAI = [...state.messages, userMessage];

        // Initialize accumulated response
        let accumulatedResponse = "";

        // Use the streaming service
        await AIService.streamResponse(
          messagesForAI,
          state.selectedModel,
          (chunk) => {
            // Accumulate the response
            accumulatedResponse += chunk;

            // Update the assistant message with the accumulated response
            if (isMounted.current) {
              dispatch({
                type: ChatActionType.ADD_MESSAGE,
                payload: {
                  ...assistantMessage,
                  content: accumulatedResponse,
                },
              });
            }
          },
          (error) => {
            if (isMounted.current) {
              setError(error.message);
            }
          },
          () => {
            if (isMounted.current) {
              setLoading(false);
            }
          }
        );

        return {
          ...assistantMessage,
          content: accumulatedResponse,
        };
      } catch (error) {
        if (isMounted.current) {
          setError(
            error instanceof Error ? error.message : "Failed to stream response"
          );
          setLoading(false);
        }
        throw error;
      }
    },
    [state.messages, state.selectedModel, addMessage, setLoading, setError]
  );

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    selectedModel: state.selectedModel,
    sendMessage,
    streamMessage,
    addMessage,
    clearMessages,
    changeModel,
    getAvailableModels,
  };
}
