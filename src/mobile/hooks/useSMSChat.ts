import { useReducer, useCallback } from "react";
import {
  SMSMessage,
  SMSChatState,
  SMSAction,
  SMSActionType,
  SMSModel,
  SMSAnalysisResult,
} from "../types/sms";
import { SMSAnalysisService } from "../services/smsAnalysisService";

// Initial state
const initialState: SMSChatState = {
  messages: [],
  isLoading: false,
  error: null,
  selectedModel: SMSAnalysisService.getDefaultModel(),
};

// Reducer function
function smsReducer(state: SMSChatState, action: SMSAction): SMSChatState {
  switch (action.type) {
    case SMSActionType.ADD_MESSAGE:
      return {
        ...state,
        messages: [...state.messages, action.payload],
        error: null,
      };

    case SMSActionType.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case SMSActionType.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case SMSActionType.CLEAR_MESSAGES:
      return {
        ...state,
        messages: [],
        error: null,
        isLoading: false,
      };

    case SMSActionType.CHANGE_MODEL:
      return {
        ...state,
        selectedModel: action.payload,
        error: null,
      };

    default:
      return state;
  }
}

export function useSMSChat(initialMessages: SMSMessage[] = []) {
  const [state, dispatch] = useReducer(smsReducer, {
    ...initialState,
    messages: initialMessages,
  });

  // Add a message to the chat
  const addMessage = useCallback((message: SMSMessage) => {
    dispatch({ type: SMSActionType.ADD_MESSAGE, payload: message });
  }, []);

  // Set loading state
  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: SMSActionType.SET_LOADING, payload: loading });
  }, []);

  // Set error state
  const setError = useCallback((error: string | null) => {
    dispatch({ type: SMSActionType.SET_ERROR, payload: error });
  }, []);

  // Clear all messages
  const clearMessages = useCallback(() => {
    dispatch({ type: SMSActionType.CLEAR_MESSAGES });
  }, []);

  // Change the selected model
  const changeModel = useCallback((model: SMSModel) => {
    dispatch({ type: SMSActionType.CHANGE_MODEL, payload: model });
  }, []);

  // Get available models
  const getAvailableModels = useCallback(() => {
    return SMSAnalysisService.getAvailableModels();
  }, []);

  // Generate a unique message ID
  const generateMessageId = useCallback(() => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Analyze SMS message
  const analyzeSMS = useCallback(
    async (smsText: string) => {
      if (!smsText.trim()) {
        setError("Please enter an SMS message to analyze.");
        return;
      }

      setError(null);

      try {
        // Add user message first (like AI Advisor)
        const userMessage: SMSMessage = {
          id: generateMessageId(),
          type: "user",
          content: smsText,
          timestamp: Date.now(),
        };
        addMessage(userMessage);

        // Set loading AFTER adding user message (like AI Advisor)
        setLoading(true);
        console.log("SMS Analysis - Loading state set to TRUE");

        // Small delay to ensure thinking indicator shows
        await new Promise((resolve) => setTimeout(resolve, 200));

        // Analyze the SMS
        const analysisResult = await SMSAnalysisService.analyzeSMS(
          smsText,
          state.selectedModel
        );

        // Keep loading state a bit longer to ensure thinking shows
        console.log("Analysis complete, keeping loading for a moment...");

        // Add analysis result message
        const analysisMessage: SMSMessage = {
          id: generateMessageId(),
          type: "analysis",
          content: "Analysis complete",
          analysisResult: analysisResult,
          smsData: analysisResult.extractedData,
          timestamp: Date.now(),
        };
        addMessage(analysisMessage);

        // Add assistant response with insights
        const insights = analysisResult.insights.join("\n• ");
        const assistantContent = `📊 **SMS Analysis Results:**

**Transaction Details:**
• Amount: ₹${analysisResult.extractedData.amount || "N/A"}
• Type: ${analysisResult.extractedData.type || "N/A"}
• Category: ${analysisResult.extractedData.category || "N/A"}
${
  analysisResult.extractedData.merchant
    ? `• Merchant: ${analysisResult.extractedData.merchant}`
    : ""
}
${
  analysisResult.extractedData.balance
    ? `• Balance: ₹${analysisResult.extractedData.balance}`
    : ""
}

**Key Insights:**
• ${insights}

**Confidence Level:** ${analysisResult.confidence}%

${
  analysisResult.warnings && analysisResult.warnings.length > 0
    ? `⚠️ **Warnings:**\n• ${analysisResult.warnings.join("\n• ")}\n`
    : ""
}

${
  analysisResult.suggestions && analysisResult.suggestions.length > 0
    ? `💡 **Suggestions:**\n• ${analysisResult.suggestions.join("\n• ")}`
    : ""
}`;

        const assistantMessage: SMSMessage = {
          id: generateMessageId(),
          type: "assistant",
          content: assistantContent,
          timestamp: Date.now(),
        };
        addMessage(assistantMessage);
      } catch (error) {
        console.error("SMS analysis failed:", error);

        // Provide specific error messages based on error type
        let errorMessage = "Failed to analyze SMS. Please try again.";

        if (error instanceof Error) {
          if (
            error.message.includes("Authentication failed") ||
            error.message.includes("User not found")
          ) {
            errorMessage =
              "Authentication failed. Please check your API key or try a different model.";
          } else if (error.message.includes("could not be parsed")) {
            errorMessage =
              "AI response format error. Please try a different model.";
          } else if (error.message.includes("No response received")) {
            errorMessage =
              "No response from AI model. Please try again or switch models.";
          } else {
            errorMessage = error.message;
          }
        }

        setError(errorMessage);
      } finally {
        console.log("SMS Analysis - Loading state set to FALSE");
        setLoading(false);
      }
    },
    [state.selectedModel, addMessage, generateMessageId, setLoading, setError]
  );

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    selectedModel: state.selectedModel,
    analyzeSMS,
    clearMessages,
    changeModel,
    getAvailableModels,
  };
}
