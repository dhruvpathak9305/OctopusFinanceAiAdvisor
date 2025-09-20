import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Text,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useChat } from "../../hooks/useChat";
import { ChatMessageContent } from "../../types/chat";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ModelSelector from "./ModelSelector";
import ErrorBoundary from "./ErrorBoundary";
import { OpenRouterService } from "../../services/openRouterService";

interface ChatContainerProps {
  colors: {
    background: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    primary: string;
    surface: string;
    error: string;
  };
  isDark: boolean;
}

const ChatContainer: React.FC<ChatContainerProps> = ({ colors, isDark }) => {
  // Chat state and functionality from custom hook
  const {
    messages,
    isLoading,
    error,
    selectedModel,
    sendMessage,
    clearMessages,
    changeModel,
    getAvailableModels,
  } = useChat();

  // Options menu replaced with direct buttons
  const [apiConnectionTested, setApiConnectionTested] = useState(false);

  // Test API connection when component mounts or selected model changes
  useEffect(() => {
    const testApiConnection = async () => {
      if (selectedModel.provider === "openrouter") {
        try {
          const openRouterService = OpenRouterService.getInstance();
          const isConnected = await openRouterService.testConnection();

          if (!isConnected && !apiConnectionTested) {
            console.warn("OpenRouter API connection failed");
            Alert.alert(
              "API Connection Issue",
              "Unable to connect to the AI service. Please check your internet connection or try again later.",
              [{ text: "OK" }]
            );
          }

          setApiConnectionTested(true);
        } catch (error) {
          console.error("Error testing API connection:", error);
        }
      }
    };

    testApiConnection();
  }, [selectedModel.provider]);

  // Handle message submission
  const handleSendMessage = async (content: string | ChatMessageContent[]) => {
    try {
      await sendMessage(content);
    } catch (error) {
      console.error("Failed to send message:", error);

      // Show user-friendly error message for common API issues
      if (error instanceof Error) {
        const errorMessage = error.message || "";
        if (errorMessage.includes("credits") || errorMessage.includes("402")) {
          Alert.alert(
            "API Credit Limit",
            "The AI service has reached its free credit limit. Please try again later when credits have been replenished.",
            [{ text: "OK" }]
          );
        }
      }
      // Other errors already handled in the hook
    }
  };

  // Reset conversation
  const handleReset = () => {
    clearMessages();
  };

  // Test API connection
  const handleTestConnection = async () => {
    try {
      const openRouterService = OpenRouterService.getInstance();
      const isConnected = await openRouterService.testConnection(
        selectedModel.apiKey
      );

      Alert.alert(
        isConnected ? "Connection Successful" : "Connection Failed",
        isConnected
          ? "Successfully connected to the AI service."
          : "Could not connect to the AI service. Please check your API key and internet connection.",
        [{ text: "OK" }]
      );
    } catch (error) {
      Alert.alert(
        "Connection Error",
        "An error occurred while testing the connection.",
        [{ text: "OK" }]
      );
    }
  };

  return (
    <ErrorBoundary isDark={isDark}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View
          style={[styles.container, { backgroundColor: colors.background }]}
        >
          {/* App-themed Chat Header */}
          <View
            style={[
              styles.appThemedHeader,
              {
                backgroundColor: colors.background, // Match app's dark blue background
              },
            ]}
          >
            <View style={styles.headerContent}>
              {/* Model selector with app-consistent styling */}
              <View style={styles.modelSelectorContainerInHeader}>
                <ModelSelector
                  models={getAvailableModels()}
                  selectedModel={selectedModel}
                  onSelectModel={changeModel}
                  colors={colors}
                />
              </View>

              {/* Connection status indicator */}
              <TouchableOpacity
                style={[
                  styles.appIconButton,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    marginRight: 8,
                  },
                ]}
                onPress={handleTestConnection}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={apiConnectionTested ? "wifi" : "wifi-outline"}
                  size={22}
                  color={apiConnectionTested ? "#10B981" : colors.textSecondary}
                />
              </TouchableOpacity>

              {/* New chat button */}
              <TouchableOpacity
                style={[
                  styles.appIconButton,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
                onPress={handleReset}
                activeOpacity={0.7}
              >
                <Ionicons name="refresh" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Options menu removed - replaced with direct buttons */}

          {/* Display error message if any */}
          {error && (
            <View
              style={[
                styles.errorContainer,
                { backgroundColor: `${colors.error}20` },
              ]}
            >
              <Text style={[styles.errorText, { color: colors.error }]}>
                {error}
              </Text>
              <TouchableOpacity onPress={() => clearMessages()}>
                <Text style={[styles.errorAction, { color: colors.primary }]}>
                  Try Again
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Model selector is now in the header */}

          {/* Message list */}
          <View style={styles.messageListContainer}>
            <MessageList
              messages={messages}
              isLoading={isLoading}
              selectedModel={selectedModel}
              onSuggestedQuestionClick={handleSendMessage}
              colors={colors}
            />
          </View>

          {/* Message input */}
          <MessageInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            supportsImages={selectedModel.supportsImages}
            colors={colors}
          />
        </View>
      </KeyboardAvoidingView>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    paddingHorizontal: 0, // Remove all horizontal padding for maximum width
    marginHorizontal: 0, // Remove margins to use full available space
    width: "100%", // Ensure full width
    height: "100%", // Use full height of parent container
  },
  // App-themed header styles that match the rest of the application
  appThemedHeader: {
    paddingHorizontal: 8, // Reduced padding for more horizontal space
    paddingVertical: 12,
    marginBottom: 6,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4, // Minimal padding for better space utilization
  },
  modelSelectorContainerInHeader: {
    flex: 1,
    marginRight: 12,
    maxHeight: 46,
  },
  appIconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  // Keep old styles for reference
  enhancedHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  // Legacy styles kept for reference
  selectorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  newChatButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  optionsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  // Options menu styles removed - replaced with direct buttons
  errorContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    margin: 16,
    marginTop: 8,
    marginBottom: 4,
    borderRadius: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
  },
  errorAction: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  modelSelectorContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  messageListContainer: {
    flex: 1,
  },
});

export default ChatContainer;
