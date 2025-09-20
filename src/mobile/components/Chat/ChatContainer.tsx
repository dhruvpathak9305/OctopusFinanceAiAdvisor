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

  const [showOptions, setShowOptions] = useState(false);
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
    setShowOptions(false);
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
          {/* Model selector with New Chat button */}
          <View
            style={[
              styles.selectorRow,
              {
                backgroundColor: colors.card,
                borderBottomColor: colors.border,
              },
            ]}
          >
            {/* New Chat button */}
            <TouchableOpacity
              style={[
                styles.newChatButton,
                { backgroundColor: colors.surface },
              ]}
              onPress={handleReset}
            >
              <Ionicons
                name="chatbubble-outline"
                size={20}
                color={colors.primary}
              />
            </TouchableOpacity>

            {/* Model selector takes up the rest of the space */}
            <View style={styles.modelSelectorContainerInHeader}>
              <ModelSelector
                models={getAvailableModels()}
                selectedModel={selectedModel}
                onSelectModel={changeModel}
                colors={colors}
              />
            </View>

            {/* Options button */}
            <TouchableOpacity
              style={[
                styles.optionsButton,
                { backgroundColor: colors.surface },
              ]}
              onPress={() => setShowOptions(!showOptions)}
            >
              <Ionicons
                name="ellipsis-horizontal"
                size={20}
                color={colors.text}
              />
            </TouchableOpacity>

            {/* Options menu */}
            {showOptions && (
              <View
                style={[
                  styles.optionsMenu,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    { borderBottomColor: colors.border },
                  ]}
                  onPress={handleReset}
                >
                  <Ionicons name="refresh" size={16} color={colors.text} />
                  <Text style={[styles.optionText, { color: colors.text }]}>
                    New Chat
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

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
  },
  selectorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  modelSelectorContainerInHeader: {
    flex: 1,
    marginHorizontal: 8,
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
  optionsMenu: {
    position: "absolute",
    top: 56,
    right: 16,
    minWidth: 160,
    borderRadius: 8,
    borderWidth: 1,
    zIndex: 1000,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
  },
  optionText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
  },
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
